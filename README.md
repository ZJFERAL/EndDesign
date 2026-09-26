# EndDesign

工业军事科幻 HUD 风格的通用设计系统。视觉语言是 HUD 仪表盘那一套 —— 切角、角括号、网格底纹、
斜纹、分级色条、信号条 —— 但**不绑定任何具体题材**：品牌名、主色、字体都可通过令牌替换，
可直接接入别的项目。

同一套设计交付**两层**，令牌同源：

| 层 | 技术 | 怎么用 | 位置 |
|---|---|---|---|
| 设计真相源 | 原生 HTML + CSS（零构建、零依赖） | 双击 `index.html` 就能看 | `endfield/` |
| 组件库 | React 18 + TypeScript + Tailwind v4 + Vite | `npm run dev` / `npm run build` | `endfield/react/` |

两层不是"一个实现加一份拷贝"。`endfield/css/tokens.css` 是**唯一真相源**，React 层的
`src/styles/tokens.css` 由 `sync:tokens` 脚本单向同步，并有一条 `--check` 会在漂移时报错。
改令牌只改 CSS 层那一处。

---

## 快速开始

### CSS 层（零构建）

直接双击 `endfield/index.html`。全部资源用相对路径，`file://` 下功能完整（主题切换、侧栏折叠、
模态、选项卡、Toast 都能用）。共 13 个页面：1 个设计系统总览 + 12 个页面模板。

若浏览器对 `file://` 有限制，起个静态服务器：

```bash
cd endfield
python -m http.server 8000   # → http://127.0.0.1:8000/
```

### React 层

```bash
cd endfield/react
npm install
npm run dev          # 演示站，逐章节查看全部组件
npm run build        # sync:tokens → tsc --noEmit → vite build
npm run typecheck    # 仅类型检查
```

`npm run build` 会把令牌同步、`tsc --noEmit`（`strict`）和打包串成一条，任一环失败即中断。

---

## 目录结构

```
EndDesign/
├── LICENSE                     Apache-2.0
├── README.md                   本文件
├── docs/
│   └── superpowers/            设计规格与两份实施计划（决策依据，含逐条裁决记录）
└── endfield/                   设计系统本体
    ├── index.html              总览：令牌色板 + 全部组件示例 + 动效演示
    ├── README.md               CSS 层说明（组件索引、令牌表、设计原则）
    ├── css/
    │   ├── tokens.css          设计令牌（唯一真相源，131 个）
    │   ├── base.css            reset + 排版基线 + 工业底
    │   ├── utilities.css       13 种标志性视觉手法（切角/角括号/网格/斜纹/分级条…）
    │   ├── components.css      组件样式
    │   ├── layout.css          侧栏 + 顶栏 + 内容区 + 页脚
    │   └── brand.css           品牌覆盖层（可选，改主色/字体，默认不引入）
    ├── js/
    │   ├── theme.js            三态主题 + localStorage
    │   └── ui.js               侧栏折叠、模态、选项卡、下拉、筛选、Toast
    ├── pages/                  12 个页面模板
    ├── tools/                  3 个校验脚本
    └── react/                  React 组件库（独立包，与 CSS 层同源）
        └── src/
            ├── styles/         tokens.css（同步产物）+ tailwind.css（@theme/@utility）
            ├── components/     组件
            ├── hooks/          useTheme / useFocusTrap
            ├── demo/           演示站
            └── index.ts        统一导出
```

---

## 设计令牌

131 个 `--ef-*` 令牌，明暗双主题。主题是**三态**的：`system`（跟随系统）/ `light` / `dark`，
键名 `ef-theme`，存在 `localStorage`；`<head>` 内联脚本在首帧前写好 `data-theme`，不会闪一下白。

| 类别 | 令牌 |
|---|---|
| 表面 | `--ef-surface-sunken` / `--ef-surface` / `--ef-surface-muted` / `--ef-surface-raised` / `--ef-surface-inverse` |
| 文字 | `--ef-ink` / `--ef-ink-muted` / `--ef-ink-subtle` / `--ef-ink-inverse` |
| 描边 | `--ef-border` / `--ef-border-strong` |
| 主色 | `--ef-accent` / `--ef-accent-strong` / `--ef-accent-soft` / `--ef-accent-fg` / `--ef-accent-glow` / `--ef-accent-ink` |
| 信号色 | `--ef-signal-yellow` / `--ef-signal-cyan` / `--ef-signal-magenta` |
| 语义色 | `--ef-system` / `--ef-success` / `--ef-warn` / `--ef-danger` / `--ef-info` |
| 分级色 | `--ef-tier-1` … `--ef-tier-6`（通用"等级"，不只稀有度） |
| 装饰 | `--ef-grid-line` / `--ef-scanline` / `--ef-weave-line` / `--ef-heading-*` / `--ef-heatmap-*` |
| 排版 | `--ef-text-xs` … `--ef-text-6xl`（各带 `--lh` 行高）、`--ef-font-sans/mono/display`、字重、字距 |
| 形状动效 | `--ef-radius-*` / `--ef-chamfer*` / `--ef-ease-*` / `--ef-duration-*` / `--ef-z-*` |

### 一条必须遵守的规则：填充用原色，文字与细图形用 `*-ink`

亮色主题的主色 `#f2cc00` 在白底上只有 **1.57:1**，直接当文字或细线会看不清。所以每个需要"做文字"
的颜色都配了一个 `*-ink` 分叉值：

- **填充**（按钮实底、标签选中、进度条、分级条、顶部信号条）→ 用 `--ef-accent`
- **前景 / 细图形**（文字、图表描边、1–3px 竖条与下划线、图标、悬停描边）→ 用 `--ef-accent-ink`

语义色与分级色同理，都有 `*-ink`（如 `--ef-info-ink`、`--ef-tier-4-ink`）：在 tint 背景上，
原色做文字最低只有 1.92:1。`--ef-accent-ink` 在白底为 4.92:1，达标。

### 换肤

不需要构建，也不需要配置文件 —— 覆盖五个变量即可：

```css
:root {
  --ef-user-accent: #ff6a00;
  --ef-user-accent-strong: #e05c00;
  --ef-user-accent-soft: #fff0e0;
  --ef-user-accent-glow: #ff8c33;
  --ef-user-accent-ink: #8a3d00;   /* 亮色主题下必须一起给，否则文字不达标 */
  --ef-font-display: "Your Display Font", sans-serif;
}
```

`css/brand.css` 就是这份覆盖的落点。

---

## 13 种标志性视觉手法

这套系统的"指纹"，每一条都是 `utilities.css` 里的一个原子类：

| 类名 | 效果 |
|---|---|
| `.ef-chamfer` / `.ef-chamfer-sm` | 切角矩形（右上与左下，9px / 6px） |
| `.ef-corner-frame` / `.ef-corner-frame--all` | 两角 / 四角 L 形括号 |
| `.ef-grid-backdrop` | 24px 网格底纹 |
| `.ef-industrial-shell` | 工业底：网格 + 右上角主色辉光 |
| `.ef-scanline` | 扫描线 |
| `.ef-hatch` | −45° 斜纹（颜色继承 `currentColor`） |
| `.ef-label-pair` | 中英双行标签 |
| `.ef-bar-title` / `.ef-slash` / `.ef-bracket` / `.ef-eyebrow` | 竖条标题 / `//` 前缀 / 方括号 / 等宽小标签 |
| `.ef-h2-title` | 标题渐变条（多行时每行重现） |
| `.ef-signal-bars` | 信号波形条 |
| `.ef-top-signal-strip` | 顶部三色信号条 |
| `.ef-tier-strip` | 分级条（颜色由 `data-tier` 决定） |
| `.ef-boot-*` / `.ef-corner-in` / `.ef-rise-in` / `.ef-live` / `.ef-bar-grow` / `.ef-reveal` | 入场与循环动效 |

两条硬性约束，改样式时容易踩：

1. **不要用 `background` 简写** —— 它会重置 `background-image`，把同一元素上手法类设的网格、
   扫描线、角括号一并清掉。用 `background-color`。
2. **`background-color: none` 是无效值**，浏览器会整条丢弃（不会清空背景）。要取消背景写
   `background-color: transparent` + `background-image: none`。

---

## React 组件库

`endfield/react/`，约 37 个组件 + 一个可运行的演示站。与 CSS 层同名同语义：CSS 层有 `.ef-btn`，
React 层就有 `Button`，视觉表现逐条对齐。

- **零运行时依赖**（除 React 自身）：没有 `clsx`/`classnames`/`tailwind-merge`/路由库/图表库/图标库，
  图标全部内联 SVG。
- **全部 `forwardRef`**？不 —— **按钮与表单控件**用 `forwardRef`；展示型容器是普通函数组件，
  一律透传 `className` 与其余原生属性。
- **Tailwind v4 用 CSS-first 配置**，没有 `tailwind.config.ts`：令牌在 `@theme` 里映射成
  `--color-*`，于是 `bg-surface`、`text-ink-muted`、`border-accent-ink` 这些工具类才成立；
  切角、角括号、斜纹等无法用工具类表达的效果，另写成 `@utility`。

### `className` 覆盖规则（重要，容易踩）

把 `className` 拼在内置类之后是**必要条件，但不是充分条件**。Tailwind v4 在 `@layer utilities`
内按自己的规范顺序发射工具类；同一个 CSS 属性上，**后发射的那条赢**，而这个顺序使用方既看不到
也控制不了。所以同一个 class 在不同组件上结果可能相反：

| 用法 | 结果 |
|---|---|
| `Button variant="primary"` + `bg-danger` | 生效（红） |
| `Button variant="secondary"` + `bg-danger` | **不生效**（内置的 `bg-transparent` 后发射） |
| `Button` + `rounded-none` | 生效 |
| `Chip` + `rounded-none` | **不生效**（内置的 `rounded-pill` 后发射） |
| 任何按钮 + `p-8` | **不生效**（永远输给内置的 `px-4 py-2`） |

**结论：拿不准就用 `!` 修饰符**（`bg-danger!`、`rounded-none!`、`p-8!`），它产出 `!important`，
绕过发射顺序，以上全部场景都实测生效。

另有一条独立规则：Toggle 家族（`Checkbox`/`Radio`/`Switch`）的 `className` 落在包裹用的 `<label>`
上，**方框根本无法**通过 `className` 拿到类（`className` 被解构后交给 label，`...rest` 只剩非
`className` 的原生属性）。要给方框做一次性外观覆盖，用 `style`。

### 分级色用属性传递

等级走 `data-tier` **属性**，不是内联样式：

```tsx
<Badge variant="tier" tier={4}>4</Badge>
<ItemCard tier={4} name="…" />
```

`[data-tier="N"]` 规则同时产出 `--ef-tier-color`（填充）与 `--ef-tier-ink`（文字与描边），
子元素 `.tier-strip` 从祖先继承填充色。

---

## 校验脚本

CSS 层自带三个脚本，改样式后跑一遍（都在 `endfield/` 下，需要 Node）：

```bash
node tools/check-tokens.mjs     # 所有 var(--ef-*) 引用都有定义或回退值
node tools/check-contrast.mjs   # 配色对比度：正文 ≥ 4.5:1，图形 ≥ 3:1
node tools/check-pages.mjs      # 12 个页面模板结构完整、本地资源可解析
```

对比度脚本会对**四层表面**（主 / 次 / 浮起 / 凹陷）逐一断言，避免只测主表面时漏掉凹陷表面的失败。

React 层另有 `node scripts/sync-tokens.mjs --check`，在两份 `tokens.css` 漂移时报错退出。
注意它只比对文件内容一致，**不检查 `@theme` 是否覆盖了组件需要的令牌** —— 新增令牌时要顺手确认映射。

---

## 可访问性

- 语义化 landmark：`<header>` / `<nav>` / `<main>` / `<aside>` / `<footer>`；每页首个可聚焦元素是
  「跳到主内容」链接，指向 `<main id="ef-main">`。
- 所有交互元素可键盘操作，`:focus-visible` 焦点环可见（`2px solid var(--ef-info)`，偏移 `2px`）。
- 图标按钮必须有 `aria-label`；装饰性图标 `aria-hidden="true"`。
- 模态：`aria-modal="true"` + 焦点陷阱 + `Esc` 关闭 + 关闭后焦点归还触发元素。堆叠浮层只有最上层
  响应 `Esc`；触发元素若随浮层一起卸载，焦点退到主内容而不是掉到 `<body>`。
- `prefers-reduced-motion: reduce` 下关闭全部动效，且不会把元素停在不可见状态。
- 无 JS 时内容可读、`<details>` 折叠可用、主题跟随系统。
- `@media print` 强制白底黑字，并隐藏顶栏与侧栏。

对比度不是"大概达标"：`check-contrast.mjs` 逐条断言，正文 ≥ 4.5:1，图形 ≥ 3:1。

---

## 浏览器与环境

- CSS 层：现代浏览器（用到 `clip-path`、`color-mix()`、`@layer`）。零依赖，无构建步骤。
- React 层：Node 18+ / Vite 6 / React 18 / TypeScript 5（`strict`）。

---

## 许可证

Apache-2.0，见 [LICENSE](LICENSE)。
