/**
 * 三态主题：light / dark / system。
 * system 时不写 data-theme，交给 CSS 媒体查询，避免与系统偏好脱节。
 */
(function () {
  'use strict';

  var KEY = 'ef-theme';
  var ORDER = ['system', 'light', 'dark'];
  var LABEL = { system: '跟随系统', light: '浅色', dark: '深色' };
  var listeners = [];

  function read() {
    try {
      var v = localStorage.getItem(KEY);
      return ORDER.indexOf(v) >= 0 ? v : 'system';
    } catch (e) {
      // 隐私模式下 localStorage 可能抛异常，回退到 system
      return 'system';
    }
  }

  function apply(value) {
    var root = document.documentElement;
    if (value === 'system') {
      root.removeAttribute('data-theme');
      root.style.colorScheme = '';
    } else {
      root.setAttribute('data-theme', value);
      root.style.colorScheme = value;
    }
    syncButtons(value);
    listeners.forEach(function (cb) {
      cb(value);
    });
  }

  function syncButtons(value) {
    var buttons = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < buttons.length; i++) {
      var next = ORDER[(ORDER.indexOf(value) + 1) % ORDER.length];
      buttons[i].setAttribute('aria-label', '主题：' + LABEL[value] + '，点击切换为' + LABEL[next]);
      buttons[i].setAttribute('title', '主题：' + LABEL[value]);
      buttons[i].setAttribute('data-theme-state', value);
    }
  }

  var EFTheme = {
    get: read,
    set: function (value) {
      if (ORDER.indexOf(value) < 0) return;
      try {
        localStorage.setItem(KEY, value);
      } catch (e) {
        /* 忽略写入失败，本次会话仍然生效 */
      }
      apply(value);
    },
    toggle: function () {
      var next = ORDER[(ORDER.indexOf(read()) + 1) % ORDER.length];
      EFTheme.set(next);
    },
    apply: function () {
      apply(read());
    },
    onChange: function (cb) {
      listeners.push(cb);
    },
    label: function (value) {
      return LABEL[value];
    },
  };

  window.EFTheme = EFTheme;

  // 首帧前应用，避免主题闪烁
  apply(read());

  document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-theme-toggle]');
      if (btn) EFTheme.toggle();
    });
    syncButtons(read());
  });
})();
