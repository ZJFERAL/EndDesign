# Endfield 设计系统

工业军事科幻 HUD 风格的设计系统。**零构建、纯静态、无 npm 依赖** —— 双击 `index.html` 即可浏览全部令牌、组件与动效。

- 131 个设计令牌，明暗双主题
- 13 种标志性视觉手法
- 180+ 组件类（原子 + 结构）
- 1 个总览页 + 12 个页面模板
- 3 个自动校验脚本（令牌引用、WCAG 对比度、页面结构）

---

## 快速开始

**方式一：直接双击** `index.html`。全部资源用相对路径，`file://` 下功能完整（含主题切换、侧栏折叠、模态、选项卡、Toast）。

**方式二：起本地服务器**（若浏览器对 `file://` 的某些特性有限制）：

```bash
cd endfield
python -m http.server 8000
# 打开 http://127.0.0.1:8000/
```

---

## 目录结构

```
endfield/
├── index.html              # 设计系统总览：令牌色板 + 全部组件示例 + 实时调色
├── README.md               # 本文件
├── css/
│   ├── tokens.css          # 设计令牌（唯一真相源）
│   ├── base.css            # reset、排版基线、底纹、打印样式
│   ├── utilities.css       # 13 种视觉手法原子类
│   ├── layout.css          # 顶栏 / 侧栏 / 内容区 / 页脚 + 响应式
│   ├── components.css      # 原子组件 + 结构组件
│   └── brand.css           # 换肤覆盖层（示例，默认不被任何页面引入）
├── js/
│   ├── theme.js            # 三态主题（跟随系统 / 浅色 / 深色）
│   └── ui.js               # 侧栏、模态、选项卡、下拉、Toast、滚动揭示
├── pages/                  # 12 个页面模板
│   ├── home.html           # 首页：Hero + 指标卡 + 动态 + 分类入口
│   ├── list.html           # 列表页：多行筛选 + 卡片网格 + 分页
│   ├── detail.html         # 详情页：图片查看器 + 信息面板 + 选项卡表格
│   ├── article.html        # 文章页：正文 + 侧边目录 + 折叠面板
│   ├── index-page.html     # 分类索引：12 个分区
│   ├── changes.html        # 最近更改：时间线
│   ├── search.html         # 搜索页：结果列表 + 空结果态
│   ├── login.html          # 登录页：无侧栏居中布局
│   ├── settings.html       # 设置页：4 个选项卡分区
│   ├── dashboard.html      # 仪表盘：折线图 + 环形图 + 热力图 + 数据表
│   ├── error-404.html      # 404
│   └── error-500.html      # 500
└── tools/
    ├── check-tokens.mjs    # 令牌引用完整性
    ├── check-contrast.mjs  # WCAG 对比度
    └── check-pages.mjs     # 页面结构与资源可解析
```

---

## 设计令牌

全部令牌以 `--ef-` 为前缀，定义在 `css/tokens.css`。**这是唯一的真相源** —— 其他文件只消费，不定义。

### 表面与文字

| 令牌 | 浅色 | 深色 |
|---|---|---|
| `--ef-surface-sunken` | `#ebebeb` | `#121212` |
| `--ef-surface` | `#ffffff` | `#181818` |
| `--ef-surface-muted` | `#f5f5f5` | `#1f1f1f` |
| `--ef-surface-raised` | `#ffffff` | `#232323` |
| `--ef-surface-inverse` | `#000000` | `#f8fafc` |
| `--ef-ink` | `#000000` | `#eeeeee` |
| `--ef-ink-muted` | `#3a3a3a` | `#a8b0b7` |
| `--ef-ink-subtle` | `#606060` | `rgb(255 255 255 / 70%)` |
| `--ef-border` | `#bcbcbc` | `#2b3136` |
| `--ef-border-strong` | `#808080` | `#41484f` |

### 主色（两层结构）

| 令牌 | 浅色 | 深色 | 用途 |
|---|---|---|---|
| `--ef-accent` | `#f2cc00` | `#d8bf00` | **填充**：实底按钮、选中标签、进度条 |
| `--ef-accent-ink` | `#8a6d00` | `#d8bf00` | **文字与细图形**：文本、1–3px 竖条、图表描边 |
| `--ef-accent-strong` | `#d9ad00` | `#b99b00` | 悬停与描边 |
| `--ef-accent-soft` | `#fff1a6` | `#272302` | 浅底（如 `<mark>` 高亮） |
| `--ef-accent-glow` | `#ffd84a` | `#ecd548` | 辉光 |
| `--ef-accent-fg` | `#111827` | `#111827` | 主色块上的前景色 |

**为什么分两层**：浅色主题的 `#f2cc00` 在白底上对比度只有 **1.57:1**，做填充很醒目，做文字则完全不可读。因此分叉出更深的 `--ef-accent-ink`（白底 4.92:1）专供文字与细图形。深色主题的 `#d8bf00` 在 `#181818` 上已有 9.62:1，无需分叉。

**同样的分叉适用于语义色与分级色** —— 背景为自身低百分比 tint 时，原色做文字不达标（浅色主题下 `--ef-success` 仅 1.92:1）：

| 原色（填充） | ink（文字 / 描边）浅色 | ink 深色 |
|---|---|---|
| `--ef-info` `#248dff` | `--ef-info-ink` `#1960ae` | `#419cff` |
| `--ef-success` `#00c7bd` | `--ef-success-ink` `#006e69` | `#00c7bd` |
| `--ef-warn` `#d97706` | `--ef-warn-ink` `#914f04` | `#dd851f` |
| `--ef-danger` `#dc2626` | `--ef-danger-ink` `#b31f1f` | `#e76d6d` |
| `--ef-tier-1` … `--ef-tier-6` | `--ef-tier-1-ink` … `--ef-tier-6-ink` | 见 tokens.css |

### 分级色 1–6

`--ef-tier-1` `#94a0aa` · `--ef-tier-2` `#68b457` · `--ef-tier-3` `#009dd1` · `--ef-tier-4` `#9a7dff` · `--ef-tier-5` `#ed9a00` · `--ef-tier-6` `#ff503c`

由 `data-tier="1"…"6"` 属性驱动，同时写出 `--ef-tier-color`（填充）与 `--ef-tier-ink`（文字 / 描边）。
**`data-tier` 必须与分级徽标写在同一个元素上** —— 自定义属性只沿 DOM 向下继承，放在隔壁元素上徽标会静默退化成灰色。

### 信号色与装饰

| 令牌 | 值 |
|---|---|
| `--ef-signal-yellow` / `--ef-signal-cyan` / `--ef-signal-magenta` | `#fffa00` / `#00ffa2` / `#ff00f0` |
| `--ef-grid-line` | 网格底纹（浅 `#e0e0e0` / 深 `#ffffff0e`） |
| `--ef-scanline` | 扫描线 |
| `--ef-heat-ramp` | 热力图递增色（浅 `#8c5b00` / 深 `#d8bf00`） |
| `--ef-heading-bracket` / `--ef-heading-bar` / `--ef-heading-rule` | 标题装饰 |

### 排版

- 字体：`--ef-font-sans`（正文）、`--ef-font-mono`（等宽拉丁标签）、`--ef-font-display`（中文标题）
- 字号：`--ef-text-xs` `0.75rem` → `--ef-text-6xl` `3.75rem`，每档配 `--ef-text-<size>--lh` 行高
- 字距：`--ef-tracking-caps` `0.12em`、`--ef-tracking-caps-lg` `0.16em`、`--ef-tracking-caps-xl` `0.2em`
- 字重：`--ef-weight-normal/medium/semibold/bold`

### 形状、动效、层级

- 圆角：`--ef-radius-0` `0` / `--ef-radius-sm` `2px` / `--ef-radius` `4px` / `--ef-radius-pill` `6px`
- 切角：`--ef-chamfer` `9px` / `--ef-chamfer-sm` `6px`
- 缓动：`--ef-ease-out-quart` / `-quint` / `-expo`（三档，全部为减速曲线）
- 时长：`--ef-duration-fast` `0.15s` / `-base` `0.25s` / `-slow` `0.4s`
- 层级：`--ef-z-rail` `20` → `--ef-z-floating` `30` → `--ef-z-header`/`-scrim` `40` → `-overlay` `50` → `-menu` `60` → `-lightbox` `70` → `-tooltip` `80`。新组件只能复用这八档，不新增数值。

---

## 主题

三态：**跟随系统 / 浅色 / 深色**。`localStorage` 键名 `ef-theme`。

| 状态 | `data-theme` 属性 | 生效方式 |
|---|---|---|
| `system` | **不写** | CSS 媒体查询 `prefers-color-scheme` |
| `light` | `"light"` | 属性选择器 |
| `dark` | `"dark"` | 属性选择器 |

**`system` 下刻意不写属性** —— 写了会破坏打印样式表的级联（打印块依赖 `html:not([data-theme="light"])` 在同等优先级下胜出）。

深色令牌在 `tokens.css` 里**声明了两次**（`@media (prefers-color-scheme: dark)` 内的 `html:not([data-theme="light"])`，以及 `html[data-theme="dark"]`），两处必须完全一致。改一处就要同步另一处。

页面的 `<head>` 里需要一小段预置脚本，在首帧前应用主题，避免闪烁：

```html
<script>
  (function () {
    try {
      var v = localStorage.getItem('ef-theme');
      if (v === 'light' || v === 'dark') {
        document.documentElement.setAttribute('data-theme', v);
        document.documentElement.style.colorScheme = v;
      }
    } catch (e) {}
  })();
</script>
```

---

## 换肤

改主色只需覆盖五个变量。它们是「宿主覆盖点」，`tokens.css` 里通过 `var(--ef-user-accent, <默认值>)` 读取：

```css
:root {
  --ef-user-accent: #f2cc00;        /* 填充：按钮实底、选中态 */
  --ef-user-accent-strong: #d9ad00; /* 悬停与描边 */
  --ef-user-accent-soft: #fff1a6;   /* 浅底 */
  --ef-user-accent-glow: #ffd84a;   /* 辉光 */
  --ef-user-accent-ink: #8a6d00;    /* 文字与细图形（必须更深） */
}
```

`--ef-user-accent-ink` **必须比主色明显更深**：主色作为文字时在浅底上对比度不足，需要更深的同色相值才能达标。

`css/brand.css` 就是这份覆盖的示例，在任意页面的 `<head>` 里于 `tokens.css` 之后引入即可：

```html
<link rel="stylesheet" href="../css/brand.css">
```

它同时给出暗色主题的 `accent-ink` 覆盖（暗底上要更亮），并把「跟随系统」的分支正确包在媒体查询里。

需要更彻底换肤时，直接覆盖语义令牌（`--ef-surface`、`--ef-ink` 等），`brand.css` 末尾有注释掉的示例。

---

## 13 种视觉手法

| # | 类名 | 说明 |
|---|---|---|
| 1 | `.ef-chamfer` / `.ef-chamfer-sm` | 切角矩形，右上与左下被斜切（9px / 6px） |
| 2 | `.ef-corner-frame--all` / `.ef-corner-frame` | 四角 / 两角 L 形括号，画在 `::before` 上以可与 `background-image` 共存 |
| 3 | `.ef-grid-backdrop` | 24px 网格底纹 |
| 4 | `.ef-industrial-shell` | 网格 + 右上角主色辉光（工业底） |
| 5 | `.ef-scanline` | 横向扫描线，每 4px 一条 |
| 6 | `.ef-hatch` | −45° 斜纹，颜色继承 `currentColor` |
| 7 | `.ef-label-pair` | 中英双行标签（中文 + 等宽大写英文） |
| 8 | `.ef-bar-title` / `.ef-slash` / `.ef-bracket` / `.ef-eyebrow` | 竖条标题 / `//` 前缀 / 方括号 / 等宽小标签 |
| 9 | `.ef-h2-title` | 标题渐变条，多行时每行都重现（`box-decoration-break: clone`） |
| 10 | `.ef-signal-bars` | 信号波形条 |
| 11 | `.ef-top-signal-strip` | 顶部三色信号条 |
| 12 | `.ef-tier-strip` | 分级条，颜色由 `data-tier` 决定 |
| 13 | `.ef-boot-strip` / `.ef-boot-title` / `.ef-corner-in` / `.ef-rise-in` / `.ef-live` / `.ef-bar-grow` / `.ef-reveal` | 7 组入场与循环动效 |

最小用法：

```html
<!-- 切角 + 工业底 + 四角括号可以叠在同一个元素上 -->
<section class="ef-panel ef-industrial-shell ef-corner-frame--all">
  <span class="ef-eyebrow">// Archive</span>
  <h2 class="ef-h2-title">标题</h2>
  <div data-tier="4"><div class="ef-tier-strip"></div></div>
</section>
```

**两条硬性约束**：

1. **不要用 `background` 简写。** 它会重置 `background-image`，把同一元素上手法类设置的网格 / 扫描线 / 角括号一并清掉。用 `background-color`。
2. **`background-color: none` 是无效值**，浏览器会整条丢弃声明（不会清空背景）。要取消继承的背景，写 `background-color: transparent` + `background-image: none`。

---

## 组件索引

### 原子组件（`components.css` 前半）

| 类名 | 说明 |
|---|---|
| `.ef-btn` + `--primary` / `--secondary` / `--ghost` / `--danger`，`--sm` / `--lg` | 按钮；`.is-loading` 为载入态 |
| `.ef-icon-btn` | 方形切角图标按钮（需 `aria-label`） |
| `.ef-input` / `.ef-textarea` / `.ef-select` / `.ef-field` / `.ef-label` / `.ef-hint` | 表单控件 |
| `.ef-searchbar` | 带放大镜与 `/` 快捷键提示的搜索框 |
| `.ef-check` / `.ef-radio` / `.ef-switch` | 复选 / 单选 / 开关（选中态叠斜纹） |
| `.ef-badge` + `--info` / `--success` / `--warn` / `--danger` / `--accent` / `--tier` | 徽标 |
| `.ef-chip` / `.ef-chip-group` | 可选中标签（筛选行用） |
| `.ef-divider` / `.ef-divider--labeled` | 分隔线 |
| `.ef-kbd` | 键盘提示 |
| `.ef-avatar` + `--sm` / `--lg` | 方形切角头像 |
| `.ef-spinner` / `.ef-skeleton` / `.ef-progress` | 载入与进度 |
| `.ef-tooltip` / `.ef-tooltip__bubble` | 悬停提示 |

### 结构组件（`components.css` 后半）

| 类名 | 说明 |
|---|---|
| `.ef-panel` + `__header` / `__title` / `__body` / `__footer` | 面板 |
| `.ef-section-header` + `__eyebrow` / `__title` / `__actions` | 区块头（`//` 前缀 + 竖条标题） |
| `.ef-card` + `__media` / `__body` / `__title` / `__meta` | 内容卡 |
| `.ef-item-card` + `__media` / `__body` / `__name` / `__sub` / `__icons` | 数据卡（强制直角 + 底部分级条） |
| `.ef-stat` + `__value` / `__label` / `__sub` | 统计块 |
| `.ef-stat-card` + `__icon` / `__value` / `__label` | 指标卡；`.ef-entry-glow` 加内辉光 |
| `.ef-empty` + `__icon` / `__title` | 空状态 |
| `.ef-callout` + `--info` / `--warn` / `--danger` / `--success`，`__title` | 提示块 |
| `.ef-code` + `__head` | 代码块 |
| `.ef-table` / `.ef-table__sort` / `.ef-table-wrap` | 表格（表头凹陷底，可排序，窄屏可横滚） |
| `.ef-timeline` + `__item` / `__time` / `__body` / `__title` | 时间线 |
| `.ef-accordion` | 折叠面板（原生 `<details>`，无 JS 可用） |
| `.ef-tabs__list` / `__tab` / `__panel` | 选项卡（配 `[data-tabs]` 容器） |
| `.ef-dropdown` + `__menu` / `__item` / `__sep` | 下拉菜单 |
| `.ef-modal` + `__scrim` / `__panel` / `__header` / `__title` / `__body` / `__footer` | 模态 |
| `.ef-drawer` | 抽屉 |
| `.ef-toast` / `.ef-toast-stack` + `--success` / `--warn` / `--danger` | Toast |
| `.ef-pagination__link` | 分页 |
| `.ef-breadcrumb` | 面包屑 |
| `.ef-filter-row` + `__label` / `__options` | 筛选行 |
| `.ef-info-grid` + `__key` / `__value` | 信息网格（详情页信息面板） |
| `.ef-toc` + `__title` / `__list` | 侧边目录 |
| `.ef-viewer` + `__toolbar` / `__zoom` / `__stage` | 图片查看器 |
| `.ef-heatmap` | 活动热力图（`data-level="0"…"4"`） |
| `.ef-chart` + `__grid` / `__axis-label` / `__line` / `__area` / `__bar` / `__point` / `__donut-track` / `__donut-value`，`.ef-chart-legend` | 纯 SVG 图表 |
| `.ef-page-header` + `__row` / `__main` / `__title` / `__meta` / `__actions` | 页面标题区 |

### 布局与工具类

`.ef-app` · `.ef-topbar` + `__signal` / `__bar` / `__brand` / `__search` / `__actions` / `__user` · `.ef-sidebar` + `__section` / `__section-title` / `__item` / `__footer` · `.ef-main` · `.ef-content` · `.ef-footer` + `__inner` / `__links` / `__legal` · `.ef-scrim` · `.ef-grid--cards` / `--panels` / `--stats` · `.ef-row` / `--between` · `.ef-stack` · `.ef-spacer` · `.ef-muted` / `.ef-subtle` / `.ef-mono` · `.ef-sr-only` · `.ef-skip-link`

---

## 页面模板

| 页面 | 用途 |
|---|---|
| `index.html` | 设计系统总览：令牌色板、全部组件示例、动效演示、实时调色 |
| `pages/home.html` | 首页：Hero + 指标卡 + 最新动态 + 分类入口 |
| `pages/list.html` | 列表页：5 行筛选 + 18 张卡片 + 分页 |
| `pages/detail.html` | 详情页：图片查看器 + 信息面板 + 选项卡表格 |
| `pages/article.html` | 文章页：正文 + 侧边目录 + 代码块 + 折叠面板 + 脚注 |
| `pages/index-page.html` | 分类索引：12 个分区 |
| `pages/changes.html` | 最近更改：时间线 + 时间范围筛选 |
| `pages/search.html` | 搜索页：命中高亮 + 筛选侧栏 + 空结果态 |
| `pages/login.html` | 登录页：无侧栏居中布局（可复用的表单页模式） |
| `pages/settings.html` | 设置页：4 个选项卡分区，外观页与主题脚本联动 |
| `pages/dashboard.html` | 仪表盘：折线图 + 环形图 + 热力图 + 可排序数据表 |
| `pages/error-404.html` | 404：无侧栏居中 |
| `pages/error-500.html` | 500：无侧栏居中 + 危险提示块 |

所有页面共用同一骨架（顶栏 + 侧栏 + 主内容 + 页脚），只替换 `<title>`、描述、`aria-current` 与内容。

---

## 校验脚本

零依赖的 Node 脚本，用来把「肉眼难发现」的缺陷变成自动拦截：

```bash
cd endfield
node tools/check-tokens.mjs     # 令牌引用完整性
node tools/check-contrast.mjs   # WCAG 对比度
node tools/check-pages.mjs      # 页面结构与资源可解析
```

| 脚本 | 拦截什么 |
|---|---|
| `check-tokens.mjs` | 引用了未定义且无回退值的令牌（`var(--ef-typo)` 不会报错，只会静默失效）；只定义在主题块里的令牌（缺该主题时会失效）；注释里的假定义 |
| `check-contrast.mjs` | 正文 < 4.5:1、图形 < 3:1；并逐一断言全部语义 / 分级 ink 色在**四种表面**上、于自身 tint 背景中的对比度 |
| `check-pages.mjs` | 缺 doctype / lang / charset / viewport；缺跳转链接或 `<main id="ef-main">`；绝对路径（`file://` 下会 404）；引用不存在的文件；`<img>` 缺 `alt` |

三个脚本在**每次提交前**都应通过。

---

## 可访问性

- **跳转链接**：每页首个可聚焦元素为「跳到主内容」
- **语义 landmark**：`<header>` / `<nav>` / `<main>` / `<aside>` / `<footer>`，表格用真实 `<table>` + `<th scope>`
- **键盘可达**：全部交互元素可 Tab 到达；选项卡支持 `←` `→`；模态有焦点陷阱；下拉与抽屉支持 `Esc`
- **焦点可见**：`:focus-visible` 轮廓 `2px solid var(--ef-info)`
- **对比度**：正文 ≥ 4.5:1，图形 ≥ 3:1，由 `check-contrast.mjs` 断言（含四种表面 × 全部 ink 色）
- **`prefers-reduced-motion: reduce`**：全部动效压到 0.001ms 并停在终态；`.ef-reveal` 直接可见，不会留下不可见内容
- **无 JavaScript**：内容可读、`<details>` 可展开、主题跟随系统
- **打印**：白底黑字，侧栏与顶栏隐藏，含热力图在内的全部表面色被钉为浅色

---

## 设计原则

**工业 HUD 气质，而非通用 Web 应用。** 这套系统要传达的是「信息终端」的感觉，不是圆角卡片式的消费级界面。具体体现为：

- **单一主色**。工业黄承担全部强调职责；语义色只用于状态，分级色只用于分级。
- **切角而非圆角**。直角与斜切暗示机械加工，圆角暗示柔软。切角尺寸只有两档（9px / 6px）。
- **等宽拉丁标签**。所有拉丁文字（标签、编号、时间戳、数值）用等宽字体并加大字距，像仪表读数。
- **网格与扫描线**。背景的 24px 网格与扫描线提供「屏幕」质感，但透明度极低（5% 上下），不干扰阅读。
- **动效克制**。全部为减速曲线，时长 0.15–0.6s，入场动效只做一次。信息密度高的界面里，动效是噪音。
- **两层色值**。凡是「填充」与「文字」共用同一色相的地方，都分叉成原色与 ink 两个值 —— 这是这套系统里最重要的一条工程约束，也是 `check-contrast.mjs` 断言最多的一项。

---

## 已知边界

- **不是组件库**：没有打包产物、没有 npm 包、没有框架绑定。它是 CSS + 原生 JS，任何技术栈都可以复制 `css/` 使用。
- **示例内容为中性占位文案**，不含任何真实产品或游戏数据。
- **浏览器支持**：依赖 `color-mix()`、`clip-path`、`:focus-visible`、CSS 自定义属性、`IntersectionObserver`，面向现代浏览器（Chrome / Edge / Firefox / Safari 近两年版本）。
- **`--ef-corner-frame--all` 的角括号画在 `::before` 上**，因此该元素会多一个伪元素层；在带 `border` 的宿主上括号会内缩 1px（`inset: 0` 相对 padding box）。
