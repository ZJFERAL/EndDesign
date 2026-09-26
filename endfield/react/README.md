# @endfield/react

Endfield 设计系统的 React 组件层。**与 `../css/tokens.css` 同源** —— 令牌不是抄一份，而是由 `sync:tokens` 脚本从 CSS 层单向同步过来。零运行时依赖（除 React 自身），图标全部为内联 SVG。

演示站：`npm run dev` 后打开终端给出的地址，可逐章节查看全部组件。

---

## 1. 定位

本包是 Endfield 设计系统在 React 上的实现，与 `endfield/css` 是**同一个设计系统的两套渲染方式**：

| | CSS 层 | React 层 |
|---|---|---|
| 令牌 | `endfield/css/tokens.css`（**唯一真相源**） | `src/styles/tokens.css`（自动生成，勿手改） |
| 组件 | `.ef-*` 类名 | 同名同语义的 React 组件 |
| 主题 | `js/theme.js` | `useTheme` / `ThemeToggle` |

组件与 CSS 层同名同 API：CSS 层有 `.ef-btn`，React 层就有 `Button`；视觉表现一致（圆角、描边、斜纹、切角、分级色逐条对齐）。

技术栈：Vite + React 18 + TypeScript `strict` + Tailwind v4（CSS-first 配置，无 `tailwind.config.ts`）。

---

## 2. 安装与运行

```bash
cd endfield/react
npm install
```

| 命令 | 作用 |
|---|---|
| `npm run dev` | 同步令牌后启动开发服务器（演示站） |
| `npm run build` | `sync:tokens` + `tsc --noEmit` + `vite build` |
| `npm run typecheck` | 只跑 `tsc --noEmit` |
| `npm run sync:tokens` | 从 `../css/tokens.css` 同步令牌 |
| `npm run preview` | 预览 `dist/` 构建产物 |

要求 Node 18+。`npm run build` 是验收门槛：`tsc` 在 `strict`（含 `exactOptionalPropertyTypes`、`noUncheckedIndexedAccess`）下必须零错误。

---

## 3. 令牌同步

`scripts/sync-tokens.mjs` 把 `../../css/tokens.css` 原样抄到 `src/styles/tokens.css`，并在文件头加上「自动生成」声明。

- **不要手改 `src/styles/tokens.css`** —— 下次同步会被整份覆盖，改动无声消失。
- 要改令牌，改 `endfield/css/tokens.css`，然后 `npm run sync:tokens`。
- `npm run sync:tokens -- --check` 只校验不写入，两份不一致时**退出码非 0**，用于 CI 与验收。
- `npm run dev` 与 `npm run build` 都会先同步，所以本地一般无需手动执行。

令牌在 `src/styles/tailwind.css` 的 `@theme` 块里映射成 Tailwind 工具类（见下一节），组件只消费工具类，不直接写 `var(--ef-*)`。

---

## 4. 组件清单

### 基础

| 导出 | 说明 |
|---|---|
| `cx(...classes)` | 内部类名拼接，过滤假值；不引 `clsx`/`classnames` |

### 按钮

| 导出 | 说明 |
|---|---|
| `Button` | 按钮。`variant`: `primary`/`secondary`/`ghost`/`danger`；`size`: `sm`/`md`/`lg`；`loading`、`icon` |
| `IconButton` | 图标按钮，`label` **必填**（没有可见文字，必须提供无障碍名称） |

### 表单

| 导出 | 说明 |
|---|---|
| `Field` | 标签 + 控件 + 提示的包裹，负责用 `id` 关联 `label` 与控件 |
| `Input` | 单行输入，支持 `label`/`hint` |
| `Textarea` | 多行输入 |
| `Select` | 下拉选择，自带箭头 SVG |
| `SearchBar` | 搜索框，带放大镜图标与 `/` 快捷键提示 |

### 展示

| 导出 | 说明 |
|---|---|
| `Badge` | 徽标。`variant`: `default`/`info`/`success`/`warn`/`danger`/`accent`/`tier` |
| `Chip` / `ChipGroup` | 可选中标签与分组，`active` 为受控 |
| `Spinner` | 加载环 |
| `Skeleton` | 骨架屏，用扫光而非透明度脉冲 |
| `Progress` | 进度条，填充可叠加 hatch 斜纹 |
| `EmptyState` | 空状态，可带图标、描述与操作 |
| `Divider` | 分隔线，可带居中标签 |
| `Kbd` | 键位提示 |
| `Avatar` | 头像，`size`: `sm`/`md`/`lg`，无图时显示 `fallback` |
| `Tooltip` | 悬停/聚焦气泡，纯 CSS 驱动 |

### 开关

| 导出 | 说明 |
|---|---|
| `Checkbox` | 复选框，选中态为主色填充 + 斜纹 + 勾形（双层 `background-image`） |
| `Radio` | 单选框，选中态为 6px 圆点 |
| `Switch` | 开关，胶囊轨道 + 滑动圆钮 |

### 结构

| 导出 | 说明 |
|---|---|
| `Panel` / `PanelHeader` / `PanelTitle` / `PanelBody` / `PanelFooter` | 面板五件套，`cornerFrame` 加四角括号 |
| `SectionHeader` | 区块标题（眉标 + 标题 + 右侧操作区） |
| `Card` / `CardMedia` / `CardBody` / `CardTitle` / `CardMeta` | 内容卡 |
| `ItemCard` | 数据卡：图上编号 + 名称 + 副名 + 图标组 + 底部分级条 |
| `Stat` / `StatCard` | 统计数字与统计卡，`glow` 加内阴影辉光 |
| `Callout` | 提示块，`variant`: `info`/`success`/`warn`/`danger`，3px 左侧色条 |
| `Table` / `THead` / `TBody` / `TR` / `TH` / `TD` | 表格，`TH` 给 `onSort` 即为可排序表头（自动带箭头与 `aria-sort`） |
| `Timeline` / `TimelineItem` / `TimelineTitle` | 时间线，节点切角，`accent` 用主色 |
| `Accordion` / `AccordionItem` | 折叠面板，用原生 `<details>`，无 JS 时仍可展开 |

### 导航

| 导出 | 说明 |
|---|---|
| `Breadcrumb` | 面包屑 |
| `Pagination` | 分页，`page`/`total`/`onChange` 受控 |
| `FilterRow` | 筛选行（标签 + 内容） |
| `InfoGrid` | 键值信息网格 |
| `TOC` | 目录，`activeId` 高亮当前项 |

### 交互

| 导出 | 说明 |
|---|---|
| `Modal` | 模态，焦点陷阱 + `Esc` 关闭 + 关闭后归还焦点 |
| `Drawer` | 抽屉，`side`: `left`/`right` |
| `Dropdown` / `DropdownItem` / `DropdownSeparator` | 下拉菜单，点外部或 `Esc` 关闭，方向键可在菜单项间移动 |
| `Tabs` | 选项卡，支持受控（`value`+`onChange`）与非受控（`defaultValue`） |
| `ToastProvider` / `useToast` | Toast 容器与 `toast(message, variant?)`；`variant`: `info`/`success`/`warn`/`danger` |
| `ThemeToggle` | 三态主题切换按钮 |

### 图标

`IconSearch`、`IconMenu`、`IconSettings`、`IconUser`、`IconClose`、`IconChevronDown`、`IconChevronRight`、`IconPlus`、`IconMinus`、`IconCheck`、`IconInfo`、`IconWarn`、`IconDanger`、`IconSuccess`、`IconGrid`、`IconList`、`IconClock`、`IconDownload`、`IconRotate`、`IconExpand`、`IconSun`、`IconMoon`、`IconMonitor`、`IconLock`、`IconBell`、`IconTrend`、`IconActivity`、`IconFile`。

统一线性、`currentColor`、24 视窗，可用 `size` 与 `className` 覆盖。

---

## 5. Tailwind 工具类

`@theme` 映射出的颜色工具类（`bg-*` / `text-*` / `border-*` 前缀通用）：

- 表面：`surface-sunken`、`surface`、`surface-muted`、`surface-raised`、`surface-inverse`
- 文字：`ink`、`ink-muted`、`ink-subtle`、`ink-inverse`
- 描边：`border`、`border-strong`
- 主色：`accent`、`accent-strong`、`accent-soft`、`accent-fg`、`accent-glow`、`accent-ink`
- 信号色：`signal-yellow`、`signal-cyan`、`signal-magenta`
- 语义色：`system`、`success`、`warn`、`danger`、`info`
- 语义色 ink：`info-ink`、`success-ink`、`warn-ink`、`danger-ink`（tint 背景上的文字与描边**必须**用 ink，原色在其自身 tint 上亮色主题仅 1.92–4.01:1）
- 分级色：`tier-1`…`tier-6` 及其 ink `tier-1-ink`…`tier-6-ink`
- 浮层与代码：`tooltip`、`tooltip-fg`、`code-bg`、`code-fg`

字体：`font-sans`（中文无衬线栈）、`font-mono`（JetBrains Mono 回退栈，用于拉丁与数字）、`font-display`（标题）。

圆角：`rounded-ef`（4px）、`rounded-ef-sm`（2px）、`rounded-ef-lg`（8px）、`rounded-pill`（6px）、`rounded-ef-0`（0px）。

`@utility` 原子效果（Tailwind 无法用普通工具类表达的部分）：

| 类 | 作用 |
|---|---|
| `chamfer` / `chamfer-sm` | 切角矩形（`clip-path`，会裁掉 border）；尺寸可用 `[--ef-chamfer-size:3px]` 覆盖 |
| `corner-frame` | 两角括号（左上 + 右下），画在伪元素上 |
| `corner-frame-all` | 四角括号，画在 `::before` 上，不占用元素自身的 `background-image` |
| `hatch` | 斜纹，颜色继承 `currentColor` |
| `hatch-soft` | 淡斜纹（Chip 激活态） |
| `hatch-accent` | 主色斜纹（Tabs 激活态） |
| `scanline` | 扫描线 |
| `grid-backdrop` | 网格底纹 |
| `industrial-shell` | 工业底：网格 + 右上角主色辉光 |
| `top-signal-strip` | 顶部信号条（品红 → 主色 → 青） |
| `tier-strip` | 底部分级条，填充色从祖先的 `--ef-tier-color` 继承 |
| `skeleton-sweep` | 骨架屏扫光 |

关键帧：`ef-corner-in`、`ef-rise-in`、`ef-drawer-in`、`ef-drawer-in-left`、`ef-skeleton-sweep`。

---

## 6. 分级色约定

等级通过 **`data-tier` 属性**传递，**不是内联样式**（规格 §5.12）：

```tsx
<Badge variant="tier" tier={4}>4</Badge>
<ItemCard tier={4} name="条目名称四" />
```

`tailwind.css` 里的 `[data-tier="N"]` 规则同时产出两个变量：

- `--ef-tier-color` —— 填充（分级徽标的 14% tint、`.tier-strip` 的渐变填充）
- `--ef-tier-ink` —— 文字与描边（原色在其自身 tint 上对比度不足，必须用 ink）

子元素 `.tier-strip` 从祖先元素继承 `--ef-tier-color`，所以只要祖先挂了 `data-tier`，底部的分级条自动取到对应颜色 —— `tier-strip` 的回退值只写在 `var()` 里，绝不在本元素上声明该变量（否则会遮蔽祖先的值）。

---

## 7. 主题

三态：`system`（跟随系统）/ `light` / `dark`。

```tsx
import { useTheme, ThemeToggle, THEME_LABEL } from '@endfield/react';

function Example() {
  const { theme, setTheme, cycle } = useTheme();
  return (
    <>
      <span>当前：{THEME_LABEL[theme]}</span>
      <button onClick={cycle}>切换</button>
      <button onClick={() => setTheme('dark')}>钉为深色</button>
      {/* 或直接用现成的按钮 */}
      <ThemeToggle />
    </>
  );
}
```

- `system` 时**不写** `data-theme` 属性，交给 CSS 的 `prefers-color-scheme` 媒体查询；`light`/`dark` 时在 `<html>` 上写 `data-theme`，并同步设置 `style.colorScheme`（让原生控件与滚动条跟随）。
- 持久化键名 **`ef-theme`**（`localStorage`）。
- **首帧不闪烁**：`index.html` 里有一段内联脚本，在文档解析早期就读取 `ef-theme` 并写好 `data-theme`，因此硬刷新时首帧即为正确主题。`useTheme` 的初始状态也从 `localStorage` 同步读取，两者一致。
- 隐私模式下 `localStorage` 写入会抛错，已 `try/catch` 吞掉，本次会话仍然生效。

---

## 8. 约定

### `className` 覆盖规则（重要）

所有组件都透传 `className`，并**拼在内置类之后**。但这是**必要条件，不是充分条件**：

> 能否覆盖取决于 Tailwind v4 在 `@layer utilities` 内的**规范发射顺序**。同一个 CSS 属性上后发射的赢，而这个顺序使用方看不到、也控制不了。

因此同一个 class 在不同组件上结果可能**相反**，实测：

| 写法 | 结果 |
|---|---|
| `px-10 py-6`（`Button`） | **生效** → `24px / 40px` |
| `p-8`（`Button`） | **不生效** → 仍 `8px / 16px`（`p-8` 比内置的 `px-4 py-2` 先发射） |
| `size-12`（`Button`） | **生效** → `48×48`（按钮没有 `w-8/h-8` 与之竞争） |
| `size-12`（`IconButton`） | **不生效** → 仍 `32×32`（内置的 `w-8 h-8` 后发射） |
| `bg-danger`（`Button variant="primary"`） | 生效 |
| `bg-danger`（`Button variant="secondary"`/`ghost`、`Chip`） | **不生效**（被内置的 `bg-transparent` / `bg-surface-muted` 压掉） |
| `rounded-none`（`Button`） | 生效 |
| `rounded-none`（`Chip`） | **不生效**（被内置的 `rounded-pill` 压掉） |

**结论：拿不准就用 `!` 修饰符**（`bg-danger!`、`rounded-none!`、`p-8!`、`size-12!`）。它产出 `!important`，绕过发射顺序，上表所有「不生效」场景加 `!` 后全部实测生效（演示站「交互组件 → className 覆盖」一行即是这组对照）。

### 开关家族的 `className` 落在 label 上

`Checkbox` / `Radio` / `Switch` 渲染 `<label><input/></label>`，**`className` 落在包裹用的 `<label>` 上，不是方框本身**。

而且方框**根本无法**通过 `className` 拿到类：`className` 被解构后交给了 label，`...rest` 里已经不含它，只携带非 `className` 的原生属性（`style`、`disabled`、`name` 等）。所以方框的一次性外观覆盖要用 **`style`**：

```tsx
<Checkbox label="复选项" style={{ borderRadius: 0 }} />
```

三者默认圆角不同：`Switch` 是 `rounded-pill`（6px），`Checkbox` 是 `rounded-ef-sm`（2px），`Radio` 是 `rounded-full`。

### 其他

- 按钮与表单控件（`Button`/`IconButton`/`Input`/`Textarea`/`Select`/`SearchBar`/`Checkbox`/`Radio`/`Switch`）均为 `forwardRef`，`ref` 指向底层原生元素。
- `IconButton` 的 `label` 必填。
- **零运行时依赖**（除 React / React DOM）；图标内联 SVG，不引图标库。
- 语义色一律走令牌，不写字面量。少数已认可的例外是 CSS 层本就写死、React 层逐字节转写过来的：危险按钮的白色前景、Select 箭头与 Checkbox 勾形/斜纹数据 URI 内部的颜色（数据 URI 读不到 CSS 变量）、Dropdown 与 Toast 的阴影、以及 Modal/Drawer 的遮罩 `rgb(0 0 0 / 60%)` —— 遮罩是**刻意的与主题无关**的字面量，明暗两主题下都要压暗背景，取令牌反而会跟着主题变。
- 演示站不引 `react-router-dom`：用锚点导航 + `useState` 记录当前章节。

---

## 9. 可访问性

- **键盘可达**：全部交互组件可用键盘操作 —— 下拉菜单支持 `↑`/`↓`/`Home`/`End`，选项卡支持 `←`/`→`（roving tabindex），模态与抽屉支持 `Esc` 关闭。
- **焦点陷阱**：`useFocusTrap(active, onEscape)` 用于 `Modal` 与 `Drawer`，`Tab` 在面板内循环，关闭后焦点归还触发元素。多层叠放时一次 `Esc` 只关最上层。
- **`aria-*`**：`aria-modal`、`aria-labelledby`、`aria-haspopup`/`aria-expanded`、`aria-selected`/`aria-controls`（Tabs）、`aria-sort`（可排序表头）、`aria-current`（分页与目录）、`aria-pressed`（Chip）、`aria-busy`（载入态按钮）、`role="progressbar"` 与 `role="status"` 等齐备。
- **跳到主内容**：每页首个可聚焦元素是 `.ef-skip-link`，聚焦后从视口上方滑入，回车跳到 `#ef-main`。
- **`prefers-reduced-motion: reduce`**：全局把 `animation-duration` 与 `transition-duration` 压到 `0.001ms`。本层不产出「初始不可见、靠动画显现」的 `.ef-reveal` 类，全部动画的终态都是可见，因此**没有元素会停留在不可见状态**（实测：开启 reduced-motion 后全页扫描，唯一不可见的两个元素是 Tooltip 气泡，属设计如此，与未开启时完全一致）。
- **对比度**：继承 CSS 层令牌，语义色的 ink 变体（`*-ink`）专门用于 tint 背景上的文字与描边，天然满足 WCAG AA。
