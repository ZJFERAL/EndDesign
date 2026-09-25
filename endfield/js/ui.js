/**
 * 交互行为：侧栏折叠/抽屉、模态、标签页、下拉、Toast、滚动揭示。
 * 全部为渐进增强：脚本缺席时页面内容仍可读。
 */
(function () {
  'use strict';

  var FOCUSABLE = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  var lastFocused = null;

  /* ---------- 侧栏 ---------- */
  function initSidebar(root) {
    var app = root.querySelector('.ef-app');
    if (!app) return;
    var sidebar = root.querySelector('.ef-sidebar');
    var scrim = root.querySelector('.ef-scrim');

    function isNarrow() {
      return window.matchMedia('(max-width: 900px)').matches;
    }

    var collapsed = false;
    try {
      collapsed = localStorage.getItem('ef-sidebar-collapsed') === '1';
    } catch (e) { /* 忽略 */ }
    if (collapsed && !isNarrow()) app.classList.add('is-collapsed');

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-sidebar-toggle]');
      if (!btn) return;
      if (isNarrow()) {
        var open = app.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(open));
        if (sidebar) sidebar.setAttribute('aria-hidden', String(!open));
      } else {
        var nowCollapsed = app.classList.toggle('is-collapsed');
        btn.setAttribute('aria-expanded', String(!nowCollapsed));
        try {
          localStorage.setItem('ef-sidebar-collapsed', nowCollapsed ? '1' : '0');
        } catch (err) { /* 忽略 */ }
      }
    });

    if (scrim) {
      scrim.addEventListener('click', function () {
        // 宽屏下 .ef-scrim 是 display:none，真实点击到不了它；
        // 但合成事件仍会触发，会把可见的侧栏错误标记为 aria-hidden。
        if (!isNarrow()) return;
        app.classList.remove('is-open');
        // 与点击/Esc 分支保持完全一致：只改 aria-expanded 会漏掉
        // sidebar 的 aria-hidden，抽屉视觉上关了但仍被读屏认为可交互。
        var btn = root.querySelector('[data-sidebar-toggle]');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        if (sidebar) sidebar.setAttribute('aria-hidden', 'true');
      });
    }

    // 根因修复：抽屉的两种残留状态必须分别清理，不能只清理其一。
    //   (a) 窄屏打开抽屉后拉宽窗口 → .is-open 残留；
    //   (b) 窄屏关闭抽屉后拉宽窗口 → 关闭路径写下的 aria-hidden="true" 残留。
    // (b) 与 .is-open 无关：三条关闭路径都会独立设置 aria-hidden="true"，
    // 所以早退条件只检查 is-open 会漏掉它，让「可见的」宽屏侧栏被读屏整块跳过。
    // 因此这里不做提前返回，而是无条件把状态归一化到宽屏应有的样子。
    function clearDrawerState() {
      app.classList.remove('is-open');
      var toggle = root.querySelector('[data-sidebar-toggle]');
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
      // 宽屏侧栏始终可见，必须移除 aria-hidden，而不是设成 "true"
      if (sidebar) sidebar.removeAttribute('aria-hidden');
    }

    window.addEventListener('resize', function () {
      if (!isNarrow()) clearDrawerState();
    });

    document.addEventListener('keydown', function (e) {
      // 与遮罩分支对称：宽屏下抽屉概念不成立，不该改动侧栏的 ARIA
      if (e.key === 'Escape' && app.classList.contains('is-open') && isNarrow()) {
        app.classList.remove('is-open');
        // 必须与点击/遮罩分支一样同步 ARIA，否则抽屉视觉上关了、
        // 但 aria-expanded 仍为 true、sidebar 的 aria-hidden 仍为 false，
        // 屏幕阅读器会认为抽屉还开着。
        var toggle = root.querySelector('[data-sidebar-toggle]');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
        if (sidebar) sidebar.setAttribute('aria-hidden', 'true');
      }
    });
  }

  /* ---------- 模态 ---------- */
  function openModal(id) {
    var modal = document.getElementById(id);
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.hidden = false;
    var panel = modal.querySelector('.ef-modal__panel') || modal;
    var focusables = panel.querySelectorAll(FOCUSABLE);
    (focusables[0] || panel).focus();
    document.body.style.overflow = 'hidden';
  }

  function closeModal(id) {
    var modal = document.getElementById(id);
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function initModals(root) {
    document.addEventListener('click', function (e) {
      var opener = e.target.closest('[data-modal-open]');
      if (opener) {
        openModal(opener.getAttribute('data-modal-open'));
        return;
      }
      var closer = e.target.closest('[data-modal-close]');
      if (closer) {
        var modal = closer.closest('.ef-modal');
        if (modal) closeModal(modal.id);
      }
    });

    // 焦点陷阱 + Esc
    document.addEventListener('keydown', function (e) {
      var open = root.querySelector('.ef-modal:not([hidden])');
      if (!open) return;
      if (e.key === 'Escape') {
        closeModal(open.id);
        return;
      }
      if (e.key !== 'Tab') return;
      var panel = open.querySelector('.ef-modal__panel') || open;
      var items = Array.prototype.filter.call(
        panel.querySelectorAll(FOCUSABLE),
        function (el) { return el.offsetParent !== null; }
      );
      if (items.length === 0) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ---------- 标签页 ---------- */
  function initTabs(root) {
    var groups = root.querySelectorAll('[data-tabs]');
    Array.prototype.forEach.call(groups, function (group) {
      var tabs = group.querySelectorAll('[role="tab"]');
      var panels = group.querySelectorAll('[role="tabpanel"]');
      if (!tabs.length) return;

      function select(index) {
        Array.prototype.forEach.call(tabs, function (tab, i) {
          var on = i === index;
          tab.setAttribute('aria-selected', String(on));
          tab.tabIndex = on ? 0 : -1;
        });
        Array.prototype.forEach.call(panels, function (panel, i) {
          panel.hidden = i !== index;
        });
      }

      Array.prototype.forEach.call(tabs, function (tab, i) {
        tab.addEventListener('click', function () { select(i); });
        tab.addEventListener('keydown', function (e) {
          var delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (!delta) return;
          e.preventDefault();
          var next = (i + delta + tabs.length) % tabs.length;
          select(next);
          tabs[next].focus();
        });
      });

      // 初始：优先尊重已有 aria-selected，否则选第一个
      var initial = 0;
      Array.prototype.forEach.call(tabs, function (tab, i) {
        if (tab.getAttribute('aria-selected') === 'true') initial = i;
      });
      select(initial);
    });
  }

  /* ---------- 下拉 ---------- */
  function initDropdowns(root) {
    var toggles = root.querySelectorAll('[data-dropdown-toggle]');
    Array.prototype.forEach.call(toggles, function (btn) {
      var menu = document.getElementById(btn.getAttribute('data-dropdown-toggle'));
      if (!menu) return;
      btn.setAttribute('aria-haspopup', 'true');
      btn.setAttribute('aria-expanded', 'false');

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = menu.hidden;
        menu.hidden = !open;
        btn.setAttribute('aria-expanded', String(open));
      });

      menu.addEventListener('click', function () {
        menu.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', function () {
      var menus = root.querySelectorAll('.ef-dropdown__menu');
      Array.prototype.forEach.call(menus, function (menu) {
        if (!menu.hidden) {
          menu.hidden = true;
          var btn = root.querySelector('[data-dropdown-toggle="' + menu.id + '"]');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        }
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var menus = root.querySelectorAll('.ef-dropdown__menu');
      Array.prototype.forEach.call(menus, function (menu) {
        menu.hidden = true;
        // 与外部点击路径一致：关闭菜单时必须同步触发器的 aria-expanded，
        // 否则菜单已隐藏但 aria-expanded 仍为 true，读屏会认为它还开着。
        var btn = root.querySelector('[data-dropdown-toggle="' + menu.id + '"]');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Toast ---------- */
  function toast(message, variant) {
    var stack = document.querySelector('.ef-toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'ef-toast-stack';
      stack.setAttribute('role', 'status');
      stack.setAttribute('aria-live', 'polite');
      document.body.appendChild(stack);
    }
    var el = document.createElement('div');
    el.className = 'ef-toast' + (variant ? ' ef-toast--' + variant : '');
    el.textContent = message;
    stack.appendChild(el);
    setTimeout(function () {
      el.remove();
    }, 4000);
  }

  /* ---------- 滚动揭示 ---------- */
  function initReveal(root) {
    var items = root.querySelectorAll('.ef-reveal');
    if (!items.length) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(items, function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px' });

    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  }

  /* ---------- 目录高亮 ---------- */
  function initToc(root) {
    var toc = root.querySelector('.ef-toc');
    if (!toc || !('IntersectionObserver' in window)) return;
    var links = toc.querySelectorAll('a[href^="#"]');
    if (!links.length) return;

    var map = {};
    Array.prototype.forEach.call(links, function (link) {
      var id = link.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (target) map[id] = link;
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = map[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          Array.prototype.forEach.call(links, function (l) {
            l.classList.remove('is-active');
          });
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });

    Object.keys(map).forEach(function (id) {
      io.observe(document.getElementById(id));
    });
  }

  /* ---------- 搜索快捷键 ---------- */
  function initSearchHotkey(root) {
    document.addEventListener('keydown', function (e) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      var tag = (document.activeElement && document.activeElement.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      var input = root.querySelector('.ef-searchbar > input, [data-search-input]');
      if (!input) return;
      e.preventDefault();
      input.focus();
    });
  }

  function init(root) {
    root = root || document;
    initSidebar(root);
    initModals(root);
    initTabs(root);
    initDropdowns(root);
    initReveal(root);
    initToc(root);
    initSearchHotkey(root);
  }

  window.EFUI = {
    init: init,
    toast: toast,
    openModal: openModal,
    closeModal: closeModal,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }
})();
