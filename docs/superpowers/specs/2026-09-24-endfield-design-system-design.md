# Endfield 设计系统 — 设计规格

日期：2026-09-24
状态：待评审
参考站点：https://www.fz.wiki/

## 1. 目标与范围

`endfield/` 是一套**通用可复用**的工业军事科幻 HUD 设计系统。视觉语言忠实还原参考站点
（fz.wiki）的令牌、版式手法与动效，但**不绑定任何具体游戏主题**：品牌名、主色、内容均可
通过令牌与一份 brand 配置替换，可直接接入其他项目。

**交付两层：**

| 层 | 技术 | 作用 |
|---|---|---|
| 设计真相源 | 原生 HTML + CSS（零构建） | 令牌定义、全部组件示例、12 个页面模板 |
| 组件库 | React 18 + TS + Tailwind v4 + Vite | 组件化封装 + 演示站 |

**成功标准：**

- 打开 `endfield/index.html` 即可浏览完整设计系统，无构建步骤、无控制台报错。
- 12 个页面模板在 375 / 768 / 1440 三个断点下布局正确，明暗双主题均可用。
- React 层 `npm run build` 与 `tsc --noEmit` 均通过，演示站可运行。
- 关闭 JavaScript 后页面内容仍可读（主题回退到系统偏好）。

## 2. 目录结构

```
endfield/
├── index.html                  # 设计系统总览：令牌 + 全部组件示例
├── README.md                   # 使用说明、令牌表、设计原则
├── css/
│   ├── tokens.css              # 设计令牌（唯一真相源）
│   ├── brand.css               # 品牌覆盖层（可选引入，改主色/字体）
│   ├── base.css                # reset + 排版基线 + 背景底纹
│   ├── utilities.css           # 切角/角括号/hatch/eyebrow/reveal 等原子类
│   ├── components.css          # 组件样式
│   └── layout.css              # 侧栏 + 顶栏 + 内容区 + 页脚
├── js/
│   ├── theme.js                # 三态主题切换 + localStorage
│   └── ui.js                   # 侧栏折叠、模态、标签页、下拉、筛选、Toast
└── pages/                      # 12 个页面模板
    ├── home.html               # 首页：Hero + 统计 + 新闻 + 分类入口
    ├── list.html               # 列表/筛选页：多行筛选 + 卡片网格 + 分页
    ├── detail.html             # 详情页：图片查看器 + 信息面板 + 正文
    ├── article.html            # 文章页：信息框 + 侧边目录 + 脚注 + 悬停预览
    ├── index-page.html         # 分类索引：分区网格
    ├── changes.html            # 最近更改时间线
    ├── search.html             # 搜索结果页
    ├── login.html              # 登录 / 注册表单
    ├── dashboard.html          # 仪表盘：图表 + 数据表
    ├── settings.html           # 设置页：选项卡 + 表单 + 开关
    ├── error-404.html          # 404
    └── error-500.html          # 500 / 维护页

react/                          # 独立包，与上述 CSS 令牌同源
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html                  # 演示站入口
└── src/
    ├── styles/tokens.css       # 与 ../../css/tokens.css 内容一致
    ├── styles/base.css
    ├── demo/                   # 演示站（各组件展示页）
    ├── components/             # 见 §6
    └── index.ts                # 统一导出
```

`react/src/styles/tokens.css` 是 `css/tokens.css` 的副本，由 `npm run sync:tokens`
脚本同步，避免两份令牌漂移。

品牌定制不需要构建步骤，也不需要配置文件：只覆盖 §4 的四个
`--ef-user-accent*` 变量与 `--ef-font-*`，即得到一套换肤后的设计系统。
`css/brand.css` 就是这份覆盖的落点，作为示例默认不引入。

## 3. 设计令牌

所有令牌使用 `--ef-` 前缀，避免与宿主项目或 Tailwind 默认变量冲突。
参考站点的 `--color-*` 命名在括号中标注对应关系。

### 3.1 主色（accent）

| 令牌 | Dark | Light | 对应原站 |
|---|---|---|---|
| `--ef-accent` | `#d8bf00` | `#f2cc00` | `--color-accent` |
| `--ef-accent-strong` | `#b99b00` | `#d9ad00` | `--color-accent-strong` |
| `--ef-accent-soft` | `#272302` | `#fff1a6` | `--color-accent-soft` |
| `--ef-accent-fg` | `#111827` | `#111827` | `--color-accent-fg` |
| `--ef-accent-glow` | `#ecd548` | `#ffd84a` | `--color-accent-glow` |
| `--ef-accent-ink` | `#d8bf00` | `#8a6d00` | 新增，见下 |

`--ef-accent-fg` 是主色块上的前景色，两主题下都是深墨色（保证对比度 ≥ 4.5:1）。

`--ef-accent-ink` 是**新增令牌**，用于「主色作为文字或细图形」的场景（数值、图表线条、
激活态下划线、悬停描边等）。原因：亮色主题的 `#f2cc00` 在白底上对比度只有 **1.57:1**，
远低于图形所需的 3:1，直接用作文字或细线会看不清。`#8a6d00` 在白底为 **4.92:1**、
在 `#f5f5f5` 上为 **4.51:1**，达标。暗色主题的 `#d8bf00` 本身已有 9.62:1，无需分叉。

**使用规则**（务必遵守，否则亮色主题下会出现低对比度元素）：

- **填充**（按钮实底、标签选中、进度条、分级条、顶部信号条）→ 用 `--ef-accent`
- **前景/细图形**（文字、图表描边、1–3px 竖条与下划线、图标、悬停描边）→ 用 `--ef-accent-ink`

### 3.2 表面与文字

| 令牌 | Dark | Light |
|---|---|---|
| `--ef-surface-sunken` | `#121212` | `#ebebeb` |
| `--ef-surface` | `#181818` | `#ffffff` |
| `--ef-surface-muted` | `#1f1f1f` | `#f5f5f5` |
| `--ef-surface-raised` | `#232323` | `#ffffff` |
| `--ef-surface-inverse` | `#f8fafc` | `#000000` |
| `--ef-ink` | `#eeeeee` | `#000000` |
| `--ef-ink-muted` | `#a8b0b7` | `#3a3a3a` |
| `--ef-ink-subtle` | `rgb(255 255 255 / 70%)` | `#606060` |
| `--ef-ink-inverse` | `#111827` | `#ffffff` |
| `--ef-border` | `#2b3136` | `#bcbcbc` |
| `--ef-border-strong` | `#41484f` | `gray` |

`--ef-surface-sunken` 为新增层级，用于给凹陷区（代码块、表头、内嵌面板）增加深度。

### 3.3 信号色与语义色

| 令牌 | 值 | 用途 |
|---|---|---|
| `--ef-signal-yellow` | `#fffa00` | 卡片信号条、高亮 |
| `--ef-signal-cyan` | `#00ffa2` | 卡片信号条 |
| `--ef-signal-magenta` | `#ff00f0` | 顶部信号条、卡片信号条 |
| `--ef-system` | `#00c7bd` | 系统/在线状态 |
| `--ef-success` | `#00c7bd` | 成功 |
| `--ef-warn` | `#d97706` | 警告 |
| `--ef-danger` | `#dc2626` | 错误/危险 |
| `--ef-info` | `#248dff` | 信息/焦点环 |

**语义色与分级色同样需要 ink 分叉**（与 §3.1 主色的 `--ef-accent-ink` 同理）。
背景为该色低百分比 tint 时，直接用原色做文字会不达标：亮色主题下
`--ef-success` 在 12% tint 上仅 **1.92:1**，十个徽标变体全部低于 4.5:1。
因此每个语义色与分级色都配一个 `*-ink` 值，供「文字 / 边框 / 细图形」使用：

| 令牌 | Light ink | Dark ink |
|---|---|---|
| `--ef-info-ink` | `#1960ae` | `#3a98ff` |
| `--ef-success-ink` | `#006e69` | `#00c7bd` |
| `--ef-warn-ink` | `#914f04` | `#dc8119` |
| `--ef-danger-ink` | `#b31f1f` | `#e76a6a` |
| `--ef-tier-1-ink` | `#5b6268` | `#94a0aa` |
| `--ef-tier-2-ink` | `#3e6b34` | `#68b457` |
| `--ef-tier-3-ink` | `#006688` | `#16a5d5` |
| `--ef-tier-4-ink` | `#6451a6` | `#a287ff` |
| `--ef-tier-5-ink` | `#875700` | `#ed9a00` |
| `--ef-tier-6-ink` | `#a83528` | `#ff6654` |

全部数值经计算验证：在对应 tint 背景上、且在全部表面层级
（主表面 / 次表面 / 浮起表面 / 凹陷表面）上均 ≥ 4.5:1（计算模型中 ≥ 4.7:1，
留出余量吸收浏览器对背景通道取整带来的约 0.05 损耗）。
`check-contrast.mjs` 对这四层表面逐一断言，避免只测主表面时漏掉凹陷表面的失败。**使用规则与主色一致**：
tint 填充用原色，其中的文字、描边与细图形用 `*-ink`。

### 3.4 分级色（rarity / tier，6 档）

| 令牌 | 值 |
|---|---|
| `--ef-tier-1` | `#94a0aa` |
| `--ef-tier-2` | `#68b457` |
| `--ef-tier-3` | `#009dd1` |
| `--ef-tier-4` | `#9a7dff` |
| `--ef-tier-5` | `#ed9a00` |
| `--ef-tier-6` | `#ff503c` |

通用化为「分级」而非「稀有度」，任何需要 1–6 等级的场景（优先级、质量、难度）都可复用。

### 3.5 装饰色

| 令牌 | Dark | Light | 用途 |
|---|---|---|---|
| `--ef-grid-line` | `#ffffff0e` | `#e0e0e0` | 网格底纹 |
| `--ef-scanline` | `rgb(255 255 255 / 5%)` | `rgb(0 0 0 / 5%)` | 扫描线 |
| `--ef-weave-line` | `rgb(255 255 255 / 2.5%)` | `rgb(0 0 0 / 5%)` | 卡片织纹 |
| `--ef-heading-bracket` | `#8c8c8c` | `#797979` | 标题方括号 |
| `--ef-heading-bar` | `#5c5c5c` | `#c2c2c2` | 标题渐变条 |
| `--ef-heading-bar-fade` | `#5c5c5c26` | `#c2c2c226` | 标题渐变条末端 |
| `--ef-heading-rule` | `#6c6c6c` | `#adadad` | 标题下划线 |
| `--ef-heatmap-bg` | `#202020` | `#f4f5f7` | 热力图底 |
| `--ef-heatmap-empty` | `#2c2c2c` | `#e7e9ec` | 热力图空格 |

### 3.6 排版

| 令牌 | 值 |
|---|---|
| `--ef-font-sans` | `system-ui, -apple-system, "Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif` |
| `--ef-font-mono` | `"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace` |
| `--ef-font-display` | 中文游戏字体（本地可选）+ 中文字体回退栈 |

字号沿用参考站点的 Tailwind 尺度：`--ef-text-xs .75rem` → `--ef-text-6xl 3.75rem`，
每个字号配套 `--ef-text-<size>--lh` 行高令牌。

字距：`--ef-tracking-caps .12em`、`--ef-tracking-caps-lg .16em`、
`--ef-tracking-caps-xl .2em`、`--ef-tracking-tightest -.08em`。

### 3.7 形状、动效、层级

| 令牌 | 值 |
|---|---|
| `--ef-radius` | `4px` |
| `--ef-radius-0` | `0`（数据卡/物品卡强制直角） |
| `--ef-chamfer` | `9px` |
| `--ef-chamfer-sm` | `6px` |
| `--ef-ease-out-quart` | `cubic-bezier(.25, 1, .5, 1)` |
| `--ef-ease-out-quint` | `cubic-bezier(.22, 1, .36, 1)` |
| `--ef-ease-out-expo` | `cubic-bezier(.16, 1, .3, 1)` |
| `--ef-duration-fast` | `.15s` |
| `--ef-duration-base` | `.25s` |
| `--ef-duration-slow` | `.4s` |
| `--ef-z-rail` | `20` |
| `--ef-z-floating` | `30` |
| `--ef-z-header` / `--ef-z-scrim` | `40` |
| `--ef-z-overlay` | `50` |
| `--ef-z-menu` | `60` |
| `--ef-z-lightbox` | `70` |
| `--ef-z-tooltip` | `80` |
| `--ef-header-bar-h` | `56px` |
| `--ef-sidebar-w` | `214px` |

## 4. 主题架构

参考站点用的是**三态主题**，直接沿用：

```css
/* 默认（未显式指定）跟随系统 */
@media (prefers-color-scheme: light) { html:not([data-theme="dark"]) { /* light 令牌 */ } }
@media (prefers-color-scheme: dark)  { html:not([data-theme="light"]) { /* dark 令牌 */ } }
/* 显式覆盖 */
html[data-theme="light"] { /* light 令牌 */ }
html[data-theme="dark"]  { /* dark 令牌 */ }
```

`js/theme.js` 行为：

1. 读取 `localStorage['ef-theme']`，值为 `light` / `dark` / `system`。
2. 为 `system` 时不写 `data-theme`，交给媒体查询。
3. 在 `<head>` 内联一小段脚本，首帧前写入 `data-theme`，避免主题闪烁。
4. 切换按钮为三态循环，带 `aria-label` 与当前状态播报。

用户自定义主色：暴露 `--ef-user-accent`、`--ef-user-accent-strong`、
`--ef-user-accent-soft`、`--ef-user-accent-glow`、`--ef-user-accent-ink` 五个覆盖变量，
`--ef-accent` 定义为 `var(--ef-user-accent, <默认值>)`，这样宿主项目无需改令牌文件即可换色。

换肤时若只改 `--ef-user-accent` 而不改 `--ef-user-accent-ink`，亮色主题下的文字与细图形
可能不达标。`brand.css` 的示例因此同时给出这两个值。

`@media print` 下强制为高对比浅色（深墨主色、白底、黑字）。

## 5. 标志性视觉手法

这套系统的"指纹"。每一条都是 `utilities.css` 里的一个原子类。

### 5.1 切角矩形 `.ef-chamfer` / `.ef-chamfer-sm`

六边形切角，尺寸由 `--ef-chamfer-size` 控制：

```css
.ef-chamfer {
  --ef-chamfer-size: 9px;
  clip-path: polygon(
    0 0, calc(100% - var(--ef-chamfer-size)) 0,
    100% var(--ef-chamfer-size), 100% 100%,
    var(--ef-chamfer-size) 100%, 0 calc(100% - var(--ef-chamfer-size))
  );
}
```

切角在左上、右上、右下、左下四个角中取**右上与左下**。注意：切角与
`border` 不能共存（`clip-path` 会裁掉边框），需要描边时用内嵌的
`::before` 或改用 `CornerFrame`。

### 5.2 四角括号 `.ef-corner-frame`

面板四角的 L 形描边装饰，用 4 个伪元素或 4 个 span 实现，颜色取
`--ef-heading-bracket`，尺寸 `14px`，线宽 `1px`。

### 5.3 网格底纹 `.ef-grid-backdrop`

```css
background-image:
  linear-gradient(var(--ef-grid-line) 1px, transparent 1px),
  linear-gradient(90deg, var(--ef-grid-line) 1px, transparent 1px);
background-size: 24px 24px;
```

### 5.4 工业底 `.ef-industrial-shell`

页面主背景，等于「网格 + 右上角主色辉光 + 表面色」：

```css
.ef-industrial-shell {
  background:
    radial-gradient(circle at 81% 16%,
      color-mix(in srgb, var(--ef-accent) 18%, transparent), transparent 24rem),
    linear-gradient(var(--ef-grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--ef-grid-line) 1px, transparent 1px),
    var(--ef-surface);
}
```

### 5.5 扫描线 `.ef-scanline`

```css
background-image: repeating-linear-gradient(0deg,
  var(--ef-scanline) 0 1px, transparent 1px 4px);
```

### 5.6 斜纹 `.ef-hatch`

```css
background-image: repeating-linear-gradient(-45deg, currentColor 0 1px, transparent 1px 5px);
```

用于激活态、选中态的背景填充，颜色继承 `currentColor`。

### 5.7 中英双行标签 `.ef-label-pair`

```html
<span class="ef-label-pair"><b>干员</b><i>OPERATORS</i></span>
```

中文行用 `--ef-font-display`，英文行用 `--ef-font-mono` + 大写 +
`--ef-tracking-caps`，颜色 `--ef-ink-subtle`。

### 5.8 标题竖条与双斜杠

- 竖条：标题前 `▎`，用 `border-left: 3px solid var(--ef-accent)` + `padding-left`。
- 双斜杠：`//` 前缀，等宽字体、`--ef-ink-subtle`。
- 方括号：`[ 标题 ]`，`--ef-heading-bracket`。

### 5.9 标题渐变条 `.ef-h2-title`

参考站点的 `.wiki-h2-title`：底部同时叠一条 9px 渐变条（右端淡出）与一条 3px 实线。

```css
background-image:
  linear-gradient(to right, var(--ef-heading-bar) 0%, var(--ef-heading-bar) 55%, var(--ef-heading-bar-fade) 100%),
  linear-gradient(var(--ef-heading-rule), var(--ef-heading-rule));
background-position: 0 calc(100% - 3px), 0 100%;
background-repeat: no-repeat;
background-size: 100% 9px, 100% 3px;
box-decoration-break: clone;
```

### 5.10 信号波形条 `.ef-signal-bars`

底部装饰性等宽竖条阵列，高度为伪随机序列（固定数组，非真随机，保证可复现）。
激活竖条用 `--ef-accent`，其余用 `--ef-border-strong`。

### 5.11 顶部信号条 `.ef-top-signal-strip`

顶栏顶部 3px 渐变：品红 0–35% → 主色 35–82% → 系统青 82–100%。

### 5.12 分级条 `.ef-tier-strip`

卡片底部的 3px 横条，由两部分拼成：左侧为等级色渐变，右侧为三个信号色刻度。

```css
.ef-tier-strip {
  --ef-tier-color: var(--ef-tier-3);      /* 由 data-tier 决定 */
  background-image: linear-gradient(90deg,
    color-mix(in srgb, var(--ef-tier-color) 70%, transparent) 0 62%,
    var(--ef-signal-cyan) 62% 74%,
    var(--ef-signal-magenta) 74% 86%,
    var(--ef-signal-yellow) 86% 100%);
}
```

通过 `[data-tier="1"] … [data-tier="6"]` 设置 `--ef-tier-color`，不使用内联样式，
便于在 React 层用属性传递。

### 5.13 入场动效

| 类名 | 效果 | 时长/缓动 |
|---|---|---|
| `.ef-boot-strip` | `clip-path: inset(0 100% 0 0)` → `inset(0)` 横向扫入 | .45s `--ef-ease-out-expo` |
| `.ef-boot-title` | `clip-path` 左到右揭示 + 淡入 | .56s `--ef-ease-out-expo` |
| `.ef-corner-in` | `opacity 0` + `scale(.55)` → 正常 | .38s |
| `.ef-rise-in` | `translateY(6px)` + 淡入 | — |
| `.ef-reveal` | 滚动进入视口时 `translateY(26px)` → 0，延迟由 `--ef-reveal-delay` 控制 | .6s `--ef-ease-out-quint` |
| `.ef-live-pulse` | 透明度 1 → .4 → 1 循环 | 2.4s ease-in-out infinite |
| `.ef-bar-grow` | `scaleY(0)` → 1，`transform-origin: bottom`，延迟 `--ef-i * 18ms` | .38s `--ef-ease-out-quint` |

**强制要求**：`@media (prefers-reduced-motion: reduce)` 下所有动效关闭，
`.ef-reveal` 直接呈现终态（`opacity: 1`）。

## 6. 组件清单

`components.css` 提供样式，`react/src/components/` 提供同名 React 封装。
所有组件必须在明暗两主题下可用，并带 `:focus-visible` 焦点环
（`2px solid var(--ef-info)`，偏移 `2px`）。

### 6.1 原子

| 组件 | 变体 / 要点 |
|---|---|
| `Button` | `primary`（主色实底 + 深墨字）、`secondary`（描边）、`ghost`、`danger`；尺寸 `sm/md/lg`；支持 `icon` 插槽与 `loading` |
| `IconButton` | 方形，`chamfer-sm` 切角 |
| `Input` / `Textarea` | 直角或 4px 圆角、`--ef-surface-sunken` 底、聚焦时描边转主色 |
| `Select` | 原生 `<select>` 外观定制 + 自定义下拉两种 |
| `Checkbox` / `Radio` / `Switch` | 选中态用主色填充 + `ef-hatch` 纹理 |
| `Badge` | 状态徽标，语义色变体 |
| `Tag` / `Chip` | 可选中（筛选行用），选中态主色实底 |
| `Divider` | 1px `--ef-border`，支持带中心文字 |
| `Kbd` | 等宽、切角、`--ef-surface-raised` |
| `Avatar` | 方形切角，支持分级色描边 |
| `Spinner` / `Skeleton` | 骨架屏用 `ef-skeleton-sweep` 扫光 |
| `Progress` | 线性条 + 主色填充，可叠加 hatch |
| `Tooltip` | `--ef-tooltip` 深底浅字，等宽小字 |

### 6.2 结构

| 组件 | 要点 |
|---|---|
| `Panel` | 面板容器：`--ef-surface` 底 + `--ef-border` 描边 + 可选 `CornerFrame` |
| `SectionHeader` | eyebrow（`//` 前缀等宽大写）+ 中文大标题 + 右侧操作区 |
| `StatBlock` | 大号等宽数字 + 中文标签 + 英文大写副标签，用于统计 |
| `Card` | 基础卡片，支持 `header` / `body` / `footer` 三段 |
| `ItemCard` | 数据卡：图像区 + 名称 + 英文名 + 属性图标 + 底部分级条；直角（`--ef-radius-0`） |
| `StatCard` | 图标 + 数值 + 趋势，带 `ef-entry-glow` 可选辉光 |
| `EmptyState` | 图标 + 说明 + 行动按钮 |
| `Callout` | 提示块：`info` / `warn` / `danger` / `success`，左侧色条 |
| `CodeBlock` | 深底浅字，等宽，带复制按钮 |
| `Table` / `DataTable` | 表头 `--ef-surface-sunken`、行悬停高亮、可排序、可选中 |
| `Timeline` | 时间线，节点用切角方块 |
| `Accordion` | 折叠面板，用 `<details>` 保证无 JS 可用 |
| `Tabs` | 下划线式，激活态主色 + `ef-hatch` |
| `Dropdown` | 浮层，`--ef-z-menu` |
| `Modal` | 遮罩 `--ef-z-scrim` + 面板，`ef-corner-in` 入场，焦点陷阱 |
| `Drawer` | 侧滑，`drawer-panel-in` 动效 |
| `Toast` | 右上角堆叠，自动消失 |
| `Pagination` | 页码 + 上一页/下一页 |
| `Breadcrumb` | `>` 或 `/` 分隔，等宽 |
| `FilterRow` | 筛选行：中文标签 + 「全部」主色胶囊 + 选项列表（参考站点干员页形态） |
| `SearchBar` | 等宽占位符 + `/` 快捷键提示 + 图标 |
| `InfoGrid` | 详情页信息面板：2 列「标签 / 值」，标签小字等宽大写 |
| `TOC` | 文章侧边目录，滚动高亮当前章节 |
| `ImageViewer` | 图片查看器：缩放 100%、±、旋转、全屏 |
| `Heatmap` | 活动热力图，格子用 `--ef-heatmap-*` |
| `Chart` | 折线 / 柱状 / 环形，纯 SVG 手写，不引第三方图表库 |
| `TopBar` | 顶栏：Logo + 搜索 + 图标操作组 + 用户区，顶部信号条 |
| `Sidebar` | 侧栏：可折叠分组 + 中英双行导航项 + 激活态主色竖条 + 底部折叠按钮 |
| `Footer` | 页脚：链接分组 + 免责声明 + 版本号 |
| `PageHeader` | 页面标题区：面包屑 + 大标题 + 元信息（编辑时间等）+ 操作组 |

### 6.3 侧栏导航项激活态

参考站点用 `::before` 做 2px 主色竖条：

```css
.sidebar-marker::before {
  content: ""; position: absolute; left: 0; top: 30%; bottom: 30%;
  width: 2px; background: var(--ef-accent); border-radius: 999px;
  opacity: 0; transform: scaleY(.45);
  transition: opacity .15s, transform .15s;
}
.sidebar-marker:hover::before,
.sidebar-marker[aria-current]::before { opacity: 1; transform: scaleY(1); }
```

## 7. 页面模板

12 个模板共享同一套布局骨架（`layout.css`）：
`TopBar`（固定，56px + 3px 信号条）→ `Sidebar`（214px，可折叠为图标栏）→
内容区（`ef-industrial-shell` 背景）→ `Footer`。

| # | 文件 | 布局要点 |
|---|---|---|
| 1 | `home.html` | Hero 区（eyebrow + 大标题 + 副标题 + 双按钮 + 右上统计）→ 新闻区（大图 + 侧边列表）→ 分类入口网格 → 信号波形条装饰 |
| 2 | `list.html` | 页头（面包屑 + 标题 + 元信息）→ 筛选面板（6 行 `FilterRow`）→ `ItemCard` 网格（响应式 2/4/6 列）→ 分页 |
| 3 | `detail.html` | 左侧 `ImageViewer` + 右侧信息面板（大标题 + 英文名 + 图标组 + `InfoGrid` + 简介）→ 下方详情表格 |
| 4 | `article.html` | 双栏：正文（`.ef-h2-title` 标题 + `Callout` + 表格 + 脚注）+ 右侧 `TOC` + 顶部信息框 |
| 5 | `index-page.html` | 分区网格：每个分区一个标题 + 条目链接列表，多列自适应 |
| 6 | `changes.html` | `Timeline` 时间线，每条含条目链接、编辑者、摘要、时间戳、差异标记 |
| 7 | `search.html` | 搜索框 + 结果统计 + 结果列表（高亮命中词）+ 筛选侧栏 + 空结果态 |
| 8 | `login.html` | 居中卡片：Logo + 标题 + 表单（输入 + 记住我 + 提交）+ 第三方登录 + 切换注册/登录 |
| 9 | `dashboard.html` | 指标卡行（4 个 `StatCard`）→ 图表区（折线 + 环形）→ `DataTable` |
| 10 | `settings.html` | `Tabs` 分选项卡：个人资料 / 外观 / 通知 / 安全，每页表单 + `Switch` |
| 11 | `error-404.html` | 居中：`404` 徽标 + 大标题「页面不存在」+ 说明 + 双按钮 |
| 12 | `error-500.html` | 同上，`500` 徽标 + 「服务异常」+ 重试按钮 + 状态说明 |

`index.html` 是设计系统总览页：令牌色板（明暗并排）、排版尺度、全部组件示例、
动效演示。含一个「实时调色」控件，可改 `--ef-user-accent` 并即时预览。

所有页面为静态 HTML，共享 CSS/JS 相对路径引用，可直接双击打开。

## 8. React 层

- **栈**：Vite + React 18 + TypeScript（`strict`）+ Tailwind v4。
- **令牌**：Tailwind v4 不使用 `tailwind.config.ts`。令牌在 `styles/tailwind.css`
  里通过 `@theme` 块映射（`--color-surface: var(--ef-surface)` 等），
  使 `bg-surface`、`text-ink-muted`、`border-border` 等工具类可用；
  `@import "./tokens.css"` 保证令牌同源。
- **组件**：与 §6 同名同 API，全部为函数组件 + `forwardRef`，
  导出 `variant` / `size` 等受控属性；不引入运行时依赖（无 classnames 库，
  用内部 `cx()` 工具）。样式用 Tailwind 工具类 + 少量 `@utility` 定义
  切角、角括号等无法用工具类表达的原子。
- **演示站**：单页应用，左侧导航列出全部组件，右侧渲染实时示例与代码片段。
  用锚点或 `useState` 切换展示区，**不引入 `react-router-dom`**，减少依赖。
  演示站需能跑起来（`npm run dev`）且 `npm run build` 通过。
- **验证**：`tsc --noEmit` 与 `vite build` 均须通过。

## 9. 可访问性与健壮性

- 语义化 landmark：`<header>` / `<nav>` / `<main>` / `<aside>` / `<footer>`。
- 每页首个可聚焦元素为「跳到主内容」链接。
- 所有交互元素可键盘操作，`:focus-visible` 焦点环可见。
- 图标按钮必须有 `aria-label`；装饰性图标 `aria-hidden="true"`。
- 模态框：焦点陷阱 + `Esc` 关闭 + `aria-modal="true"`。
- 对比度：正文 ≥ 4.5:1，大字号与图形 ≥ 3:1。
- `prefers-reduced-motion: reduce` 下关闭全部动效。
- 无 JS 时：内容可读、`<details>` 折叠可用、主题跟随系统。
- 图片带 `alt`；纯装饰图用 `alt=""`。

## 10. 不在范围内

- 不做后端、不做数据接口、不做真实搜索。
- 不打包发布到 npm（仅本地可用的包结构）。
- 不引入第三方 UI 库、图表库、图标字体。图标用内联 SVG。
- 不包含参考站点的具体游戏内容（干员/武器/敌人等名词与图片）。
  示例内容使用中性占位文案与占位图形。

## 11. 验收方式

| 项 | 方式 |
|---|---|
| HTML 层无报错 | 用本地静态服务器打开每个页面，检查控制台无 error |
| 响应式 | 375 / 768 / 1440 三断点截图核对 |
| 双主题 | 明暗两主题逐页截图核对 |
| 动效 | 确认 `prefers-reduced-motion` 下动效关闭 |
| React 层 | `npx tsc --noEmit` 与 `npm run build` 通过 |
| 演示站 | `npm run dev` 启动后可访问并交互 |
| 令牌一致性 | `npm run sync:tokens` 后两份 `tokens.css` 无差异 |
