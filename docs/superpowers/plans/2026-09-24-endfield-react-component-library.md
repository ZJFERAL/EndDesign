# Endfield 设计系统 — React 组件库实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `endfield/react/` 下建出与 HTML/CSS 层令牌同源的 React + TypeScript + Tailwind v4 组件库，含约 37 个组件与一个可运行的演示站。

**Architecture:** 令牌单一来源是 `../css/tokens.css`，由 `sync:tokens` 脚本复制进 `src/styles/tokens.css`，再经 Tailwind v4 的 `@theme` 块映射为 `--color-*`，使 `bg-surface`、`text-ink-muted` 等工具类可用。组件用 Tailwind 工具类实现样式，仅对切角、角括号、斜纹等无法用工具类表达的效果定义 `@utility`。按钮与表单控件用 `forwardRef` 暴露 ref，所有组件（含展示型容器）都透传 `className` 与其余原生属性，零运行时依赖。

**Tech Stack:** Vite 6 + React 18 + TypeScript 5（`strict`）+ Tailwind CSS v4（`@tailwindcss/vite` 插件）。

**Spec:** `docs/superpowers/specs/2026-09-24-endfield-design-system-design.md`

**前置依赖：** 本计划依赖 HTML/CSS 层计划的产物 —— `endfield/css/tokens.css` 必须已存在。先完成 `2026-09-24-endfield-html-css-design-system.md` 再执行本计划。

## Global Constraints

- 令牌唯一来源是 `../css/tokens.css`。禁止在 `react/` 下另写一份令牌定义；只能通过 `sync:tokens` 同步。
- 不引入任何运行时依赖：不用 `classnames`、`clsx`、`tailwind-merge`、`react-router-dom`、任何图表库或图标库。
- 图标一律内联 SVG 组件，放在 `src/components/icons.tsx`。
- 所有**按钮与表单控件**（Button、IconButton、Input、Textarea、Select、SearchBar、Checkbox、Radio、Switch）必须 `forwardRef` 并透传 `className`。
- 所有组件（含展示型容器）必须透传 `className` 与其余原生属性；`className` 总是追加在内置类之后 —— 但这是必要条件而非充分条件：能否覆盖取决于 Tailwind 在同一 CSS 属性上的规范发射顺序，使用方看不到也控制不了，**拿不准就用 `!` 修饰符**（`bg-danger!`、`rounded-none!`、`p-8!`）。详见 Review Focus 第 1 条。展示型 / 容器型组件（面板、卡片、表格、导航、时间线、折叠面板、提示块、统计块等一切无用户输入状态的纯展示与布局组件）一律是普通函数组件，不套 `forwardRef` —— React 18 无 ref-as-prop，给它们套 `forwardRef` 只增加代码量而没有消费方。判断标准：需要暴露 DOM ref 给使用方操作的交互控件才用 `forwardRef`（见上一条），其余都是普通函数组件。
- 所有组件必须支持明暗两主题（依赖 `tokens.css`，不得硬编码颜色字面量）。例外：Modal / Drawer 的遮罩层必须用固定的 `rgb(0 0 0 / 60%)`（与 css/components.css:1371 一致）—— 遮罩的职责是在明暗两主题下都压暗背景，不能随主题变化，故不用令牌。
- `npx tsc --noEmit` 与 `npm run build` 必须都通过，且 `tsc` 在 `strict` 下零错误。
- 演示站不引入路由库，用 `useState` 切换展示区。
- 交互组件（Modal、Drawer、Dropdown、Tabs）必须键盘可达：`Esc` 关闭、焦点陷阱、`aria-*` 正确。

## Review Focus

以下 5 类条件，规格隐含要求但单任务的类型检查不会覆盖。每条都已在拥有该代码的任务里配了对应验证。

1. **`className` 覆盖失效** — 把 `className` 拼在内置类之后是**必要条件，但不是充分条件**。Tailwind v4 在 `@layer utilities` 内按自己的规范顺序发射工具类；同一个 CSS 属性上，**后发射的那条赢**，而发射顺序由 Tailwind 的排序规则决定，使用方既看不到也控制不了。因此「追加在最后」只保证参与竞争，不保证获胜：`p-8` 永远输给内置的 `px-4`/`py-2`，`bg-danger` 在 `Button variant="primary"` 上赢（`bg-accent` 先发射）却在 `Button variant="secondary"`/`variant="ghost"`（`bg-transparent` 后发射）和 `Chip`（`bg-surface-muted` 后发射）上输，`rounded-none` 在 `Button` 上赢（`rounded-ef` 先发射）却在 `Chip` 上输（`rounded-pill` 后发射）。结论：**拿不准就用 `!` 修饰符**（`bg-danger!`、`rounded-none!`、`p-8!`），它产出 `!important`，绕过发射顺序，在以上全部场景都实测生效。要求组件把 `className` 拼在最后，验证步骤实测「不加 `!` 会输」与「加 `!` 会赢」两类用例，README 里说明拿不准就用 `!`。注意 Toggle 家族（Checkbox/Radio/Switch）不适用上面这组例子：它们的 `className` 落在包裹用的 `<label>` 上，且方框根本拿不到 `className`（`...rest` 只携带非 `className` 的原生属性），所以方框圆角与 `className` 无关 —— 顺带一提，三者圆角并不相同：只有 `Switch` 的方框是 `rounded-pill`，`Checkbox` 是 `rounded-ef-sm`（2px），`Radio` 是 `rounded-full`（见 Task 2 Step 5）。
2. **`tsc` 在 `strict` 下的 `forwardRef` 泛型** — `forwardRef` 与泛型、联合类型 props 组合时容易推出 `any`。要求 `tsc --noEmit` 零错误，且不使用 `as any` 绕过。
3. **令牌同步漂移** — 改了 `../css/tokens.css` 却忘记跑 `sync:tokens`，React 层配色与 HTML 层不一致且无任何报错。要求有一个校验步骤比对两份文件。
4. **SSR / 首次渲染的主题闪烁** — 演示站若在 `useEffect` 里才读 `localStorage` 并设主题，首帧会是错误的主题。要求主题读取在渲染前完成。
5. **受控与非受控混用** — `Tabs`、`Switch`、`Input` 等组件若同时接受 `value` 与 `defaultValue` 却处理不当，会出现「点了没反应」或「无法输入」。要求受控模式实测可用。

---

## File Structure

| 文件 | 职责 |
|---|---|
| `endfield/react/package.json` | 依赖与脚本（含 `sync:tokens`、`typecheck`、`build`） |
| `endfield/react/tsconfig.json` | TS 配置，`strict: true` |
| `endfield/react/vite.config.ts` | Vite + React + Tailwind 插件 |
| `endfield/react/index.html` | 演示站入口 |
| `endfield/react/scripts/sync-tokens.mjs` | 从 `../css/tokens.css` 同步令牌并校验一致性 |
| `endfield/react/src/styles/tokens.css` | 同步产物（不要手改） |
| `endfield/react/src/styles/tailwind.css` | `@import` 令牌 + `@theme` 映射 + `@utility` 定义 |
| `endfield/react/src/lib/cx.ts` | 类名拼接工具 |
| `endfield/react/src/components/icons.tsx` | 内联 SVG 图标组件 |
| `endfield/react/src/components/*.tsx` | 各组件，一个文件一个组件族 |
| `endfield/react/src/index.ts` | 统一导出 |
| `endfield/react/src/demo/*.tsx` | 演示站各章节 |

---

### Task 1: 脚手架、令牌同步与 Tailwind 映射

**Files:**
- Create: `endfield/react/package.json`
- Create: `endfield/react/tsconfig.json`
- Create: `endfield/react/tsconfig.node.json`
- Create: `endfield/react/vite.config.ts`
- Create: `endfield/react/scripts/sync-tokens.mjs`
- Create: `endfield/react/src/styles/tailwind.css`
- Create: `endfield/react/src/lib/cx.ts`
- Create: `endfield/react/index.html`
- Create: `endfield/react/src/main.tsx`（占位，Task 5 填充）
- Create: `endfield/react/src/index.ts`（占位，Task 2 起填充）
- Test: `endfield/react/scripts/sync-tokens.mjs`

**Interfaces:**
- Consumes: `endfield/css/tokens.css`（来自 HTML/CSS 层计划 Task 1）
- Produces:
  - `cx(...classes: Array<string | false | null | undefined>): string`
  - Tailwind 颜色工具类：`bg-surface`、`bg-surface-muted`、`bg-surface-raised`、`bg-surface-sunken`、`bg-surface-inverse`、`text-ink`、`text-ink-muted`、`text-ink-subtle`、`text-ink-inverse`、`border-border`、`border-border-strong`、`bg-accent`、`text-accent-ink`、`text-accent-fg`、`border-accent-ink`、`bg-accent-soft`、`bg-signal-yellow`、`bg-signal-cyan`、`bg-signal-magenta`、`bg-system`、`bg-success`、`bg-warn`、`bg-danger`、`bg-info`、`bg-tier-1`…`bg-tier-6`、`font-mono`、`font-display`
  - Tailwind 颜色工具类（语义色与分级色的 ink 分叉、浮层与代码、胶囊圆角）：`border-info-ink`、`text-info-ink`、`border-success-ink`、`text-success-ink`、`border-warn-ink`、`text-warn-ink`、`border-danger-ink`、`text-danger-ink`、`text-tier-1-ink`…`text-tier-6-ink`、`bg-tooltip`、`text-tooltip-fg`、`bg-code-bg`、`text-code-fg`、`rounded-pill`
  - Tailwind `@utility`：`chamfer`、`chamfer-sm`、`corner-frame`、`corner-frame-all`、`hatch`、`hatch-soft`、`hatch-accent`、`scanline`、`grid-backdrop`、`industrial-shell`、`tier-strip`、`top-signal-strip`、`skeleton-sweep`
  - 属性映射与关键帧：`[data-tier="1"]`…`[data-tier="6"]`（同时产出 `--ef-tier-color` 与 `--ef-tier-ink`，对齐 css/utilities.css:286-291）；`ef-corner-in`、`ef-rise-in`、`ef-drawer-in`、`ef-drawer-in-left`、`ef-skeleton-sweep`

- [ ] **Step 1: 确认前置令牌存在**

```bash
cd "F:/AiWorkspace/KimiCode/public"
test -f endfield/css/tokens.css && echo "令牌已就绪" || echo "缺少 endfield/css/tokens.css，请先完成 HTML/CSS 层计划"
```

Expected: 输出「令牌已就绪」。若不是，停下，先执行 HTML/CSS 层计划。

- [ ] **Step 2: 写 package.json**

创建 `endfield/react/package.json`：

```json
{
  "name": "@endfield/react",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "Endfield 设计系统 React 组件库",
  "scripts": {
    "sync:tokens": "node scripts/sync-tokens.mjs",
    "dev": "npm run sync:tokens && vite",
    "build": "npm run sync:tokens && tsc --noEmit && vite build",
    "typecheck": "tsc --noEmit",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.2",
    "vite": "^6.0.5"
  }
}
```

- [ ] **Step 3: 写 TS 与 Vite 配置**

创建 `endfield/react/tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["vite/client"]
  },
  "include": ["src", "vite.config.ts"]
}
```

> `exactOptionalPropertyTypes: true` 的含义：`label?: string` 表示「可以没有这个属性」，
> 但**不接受显式的 `undefined`**；要允许 `label={maybeUndefined}` 这样的写法，必须写成
> `label?: string | undefined`。本库的 `FieldWrapperProps`（`Input.tsx`）与
> `ToggleShellProps`（`Toggle.tsx`）正是因为这个原因把可选属性写成 `| undefined`，
> 不是笔误。同理，`HTMLAttributes` 把 `content` 声明成 `string`，所以 `TooltipProps`
> 必须 `Omit<…, 'content'>` 才能把 `content` 重新声明为 `ReactNode`。

创建 `endfield/react/vite.config.ts`：

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

- [ ] **Step 4: 写令牌同步脚本**

创建 `endfield/react/scripts/sync-tokens.mjs`：

```js
#!/usr/bin/env node
/**
 * 把 ../css/tokens.css 同步到 src/styles/tokens.css。
 * 令牌唯一来源是 HTML/CSS 层；本脚本保证 React 层不会与之漂移。
 * 传 --check 时只校验一致性，不写入（用于 CI / 验收）。
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, '..', '..', 'css', 'tokens.css');
const targetDir = join(here, '..', 'src', 'styles');
const target = join(targetDir, 'tokens.css');
const checkOnly = process.argv.includes('--check');

if (!existsSync(source)) {
  console.error(`错误：找不到令牌源文件 ${source}`);
  console.error('请先完成 HTML/CSS 层计划，创建 endfield/css/tokens.css。');
  process.exit(1);
}

const banner = [
  '/* ------------------------------------------------------------------',
  '   本文件由 scripts/sync-tokens.mjs 自动同步，请勿手改。',
  '   令牌唯一来源：endfield/css/tokens.css',
  '   修改后运行：npm run sync:tokens',
  '   ------------------------------------------------------------------ */',
  '',
].join('\n');

const content = banner + readFileSync(source, 'utf8');

if (checkOnly) {
  if (!existsSync(target)) {
    console.error('错误：src/styles/tokens.css 不存在，请运行 npm run sync:tokens');
    process.exit(1);
  }
  const current = readFileSync(target, 'utf8');
  if (current !== content) {
    console.error('错误：令牌已漂移。src/styles/tokens.css 与 ../css/tokens.css 不一致。');
    console.error('请运行：npm run sync:tokens');
    process.exit(1);
  }
  console.log('通过：React 层令牌与源文件一致。');
  process.exit(0);
}

mkdirSync(targetDir, { recursive: true });
writeFileSync(target, content, 'utf8');
console.log(`已同步令牌：${source} → ${target}`);
```

- [ ] **Step 5: 写 Tailwind 样式入口**

创建 `endfield/react/src/styles/tailwind.css`：

```css
@import "./tokens.css";

@import "tailwindcss";

/* ==========================================================================
   令牌 → Tailwind 主题映射
   Tailwind v4 用 CSS-first 配置，不使用 tailwind.config.ts。
   映射后即可用 bg-surface / text-ink-muted / border-border 等工具类。
   ========================================================================== */

@theme {
  /* 表面 */
  --color-surface-sunken: var(--ef-surface-sunken);
  --color-surface: var(--ef-surface);
  --color-surface-muted: var(--ef-surface-muted);
  --color-surface-raised: var(--ef-surface-raised);
  --color-surface-inverse: var(--ef-surface-inverse);

  /* 文字 */
  --color-ink: var(--ef-ink);
  --color-ink-muted: var(--ef-ink-muted);
  --color-ink-subtle: var(--ef-ink-subtle);
  --color-ink-inverse: var(--ef-ink-inverse);

  /* 描边 */
  --color-border: var(--ef-border);
  --color-border-strong: var(--ef-border-strong);

  /* 主色 */
  --color-accent: var(--ef-accent);
  --color-accent-strong: var(--ef-accent-strong);
  --color-accent-soft: var(--ef-accent-soft);
  --color-accent-fg: var(--ef-accent-fg);
  --color-accent-glow: var(--ef-accent-glow);
  --color-accent-ink: var(--ef-accent-ink);

  /* 信号色 */
  --color-signal-yellow: var(--ef-signal-yellow);
  --color-signal-cyan: var(--ef-signal-cyan);
  --color-signal-magenta: var(--ef-signal-magenta);

  /* 语义色 */
  --color-system: var(--ef-system);
  --color-success: var(--ef-success);
  --color-warn: var(--ef-warn);
  --color-danger: var(--ef-danger);
  --color-info: var(--ef-info);

  /* 分级色 */
  --color-tier-1: var(--ef-tier-1);
  --color-tier-2: var(--ef-tier-2);
  --color-tier-3: var(--ef-tier-3);
  --color-tier-4: var(--ef-tier-4);
  --color-tier-5: var(--ef-tier-5);
  --color-tier-6: var(--ef-tier-6);

  /* 语义色 ink：tint 填充用原色，其中的文字与描边必须用 ink。
     原色在自身 12% tint 上亮色主题仅 1.92–4.01:1，低于 4.5:1。 */
  --color-info-ink: var(--ef-info-ink);
  --color-success-ink: var(--ef-success-ink);
  --color-warn-ink: var(--ef-warn-ink);
  --color-danger-ink: var(--ef-danger-ink);

  /* 分级色 ink */
  --color-tier-1-ink: var(--ef-tier-1-ink);
  --color-tier-2-ink: var(--ef-tier-2-ink);
  --color-tier-3-ink: var(--ef-tier-3-ink);
  --color-tier-4-ink: var(--ef-tier-4-ink);
  --color-tier-5-ink: var(--ef-tier-5-ink);
  --color-tier-6-ink: var(--ef-tier-6-ink);

  /* 浮层与代码 */
  --color-tooltip: var(--ef-tooltip);
  --color-tooltip-fg: var(--ef-tooltip-fg);
  --color-code-bg: var(--ef-code-bg);
  --color-code-fg: var(--ef-code-fg);

  /* 字体 */
  --font-sans: var(--ef-font-sans);
  --font-mono: var(--ef-font-mono);
  --font-display: var(--ef-font-display);

  /* 圆角 */
  --radius-ef: var(--ef-radius);
  --radius-ef-sm: var(--ef-radius-sm);
  --radius-ef-lg: var(--ef-radius-lg);
  --radius-pill: var(--ef-radius-pill);
  --radius-ef-0: var(--ef-radius-0);
}

/* ==========================================================================
   无法用工具类表达的原子效果
   ========================================================================== */

/* 切角矩形。注意 clip-path 会裁掉 border，需要描边时用 corner-frame。
   尺寸回退写在 var() 里而非直接赋值，这样调用方可用
   `[--ef-chamfer-size:3px]` 覆盖（见 Timeline 节点，components.css:1172）。 */
@utility chamfer {
  clip-path: polygon(
    0 0,
    calc(100% - var(--ef-chamfer-size, var(--ef-chamfer))) 0,
    100% var(--ef-chamfer-size, var(--ef-chamfer)),
    100% 100%,
    var(--ef-chamfer-size, var(--ef-chamfer)) 100%,
    0 calc(100% - var(--ef-chamfer-size, var(--ef-chamfer)))
  );
}

@utility chamfer-sm {
  clip-path: polygon(
    0 0,
    calc(100% - var(--ef-chamfer-size, var(--ef-chamfer-sm))) 0,
    100% var(--ef-chamfer-size, var(--ef-chamfer-sm)),
    100% 100%,
    var(--ef-chamfer-size, var(--ef-chamfer-sm)) 100%,
    0 calc(100% - var(--ef-chamfer-size, var(--ef-chamfer-sm)))
  );
}

/* 两角括号（左上 + 右下），画在伪元素上。对齐 css/utilities.css:34-60。 */
@utility corner-frame {
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: -1px;
    left: -1px;
    width: 14px;
    height: 14px;
    border: 1px solid var(--ef-heading-bracket);
    border-right: 0;
    border-bottom: 0;
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -1px;
    right: -1px;
    width: 14px;
    height: 14px;
    border: 1px solid var(--ef-heading-bracket);
    border-left: 0;
    border-top: 0;
    pointer-events: none;
  }
}

/* 四角括号（完整四角）。必须画在 ::before 上，不占用元素自身的
   background-image，否则与 industrial-shell / grid-backdrop / hatch
   叠在同一元素上时会互相清掉。对齐 css/utilities.css:65-105。 */
@utility corner-frame-all {
  position: relative;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    /* 同时挂上 corner-frame 时，用它来抵消那个 14×14 描边盒 */
    width: auto;
    height: auto;
    border: 0;
    background-image:
      linear-gradient(var(--ef-heading-bracket), var(--ef-heading-bracket)),
      linear-gradient(var(--ef-heading-bracket), var(--ef-heading-bracket)),
      linear-gradient(var(--ef-heading-bracket), var(--ef-heading-bracket)),
      linear-gradient(var(--ef-heading-bracket), var(--ef-heading-bracket)),
      linear-gradient(var(--ef-heading-bracket), var(--ef-heading-bracket)),
      linear-gradient(var(--ef-heading-bracket), var(--ef-heading-bracket)),
      linear-gradient(var(--ef-heading-bracket), var(--ef-heading-bracket)),
      linear-gradient(var(--ef-heading-bracket), var(--ef-heading-bracket));
    background-repeat: no-repeat;
    /* 左上横 / 左上竖 / 右上横 / 右上竖 / 左下横 / 左下竖 / 右下横 / 右下竖 */
    background-size:
      14px 1px, 1px 14px,
      14px 1px, 1px 14px,
      14px 1px, 1px 14px,
      14px 1px, 1px 14px;
    background-position:
      left top, left top,
      right top, right top,
      left bottom, left bottom,
      right bottom, right bottom;
  }

  /* ::before 已改为角括号层，这里只需抑制 corner-frame 的右下角，
     避免两个类同时使用时重复画角。对齐 css/utilities.css:101-105。 */
  &::after {
    display: none;
  }
}

/* 斜纹，颜色继承 currentColor */
@utility hatch {
  background-image: repeating-linear-gradient(
    -45deg,
    currentColor 0 1px,
    transparent 1px 5px
  );
}

/* 淡斜纹：Chip 激活态用。对齐 css/components.css:473-477。 */
@utility hatch-soft {
  background-image: repeating-linear-gradient(
    -45deg,
    rgb(0 0 0 / 12%) 0 1px,
    transparent 1px 5px
  );
}

/* 主色斜纹：Tabs 激活态用。对齐 css/components.css:1287-1291。 */
@utility hatch-accent {
  background-image: repeating-linear-gradient(
    -45deg,
    color-mix(in srgb, var(--ef-accent) 22%, transparent) 0 1px,
    transparent 1px 5px
  );
}

/* 扫描线 */
@utility scanline {
  background-image: repeating-linear-gradient(
    0deg,
    var(--ef-scanline) 0 1px,
    transparent 1px 4px
  );
}

/* 网格底纹 */
@utility grid-backdrop {
  background-image:
    linear-gradient(var(--ef-grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--ef-grid-line) 1px, transparent 1px);
  background-size: var(--ef-grid-size) var(--ef-grid-size);
}

/* 工业底：网格 + 右上角主色辉光 */
@utility industrial-shell {
  background-image:
    radial-gradient(
      circle at 81% 16%,
      color-mix(in srgb, var(--ef-accent) 18%, transparent),
      transparent 24rem
    ),
    linear-gradient(var(--ef-grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--ef-grid-line) 1px, transparent 1px);
  background-size: auto, var(--ef-grid-size) var(--ef-grid-size),
    var(--ef-grid-size) var(--ef-grid-size);
  background-color: var(--ef-surface);
}

/* 顶部信号条 */
@utility top-signal-strip {
  height: var(--ef-header-signal-h);
  background-image: linear-gradient(
    90deg,
    var(--ef-signal-magenta) 0 35%,
    var(--ef-accent) 35% 82%,
    var(--ef-system) 82% 100%
  );
}

/* 分级条。等级色由祖先 [data-tier="N"] 提供的 --ef-tier-color 决定；
   回退只写在 var() 里，不能在本元素上直接声明该变量，否则会遮蔽祖先的值。 */
@utility tier-strip {
  height: 3px;
  background-image: linear-gradient(
    90deg,
    color-mix(in srgb, var(--ef-tier-color, var(--ef-tier-3)) 70%, transparent) 0 62%,
    var(--ef-signal-cyan) 62% 74%,
    var(--ef-signal-magenta) 74% 86%,
    var(--ef-signal-yellow) 86% 100%
  );
}

/* 骨架屏扫光。对齐 css/components.css:585-603。 */
@utility skeleton-sweep {
  background-image: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--ef-ink) 8%, transparent),
    transparent
  );
  background-size: 200% 100%;
  animation: ef-skeleton-sweep 1.4s ease-in-out infinite;
}

/* ==========================================================================
   分级色属性映射
   与 css/utilities.css:286-291 等价：同时产出填充色与 ink 色。
   组件通过 data-tier="N" 传递等级，不使用内联样式（规格 §5.12）。
   ========================================================================== */

[data-tier="1"] { --ef-tier-color: var(--ef-tier-1); --ef-tier-ink: var(--ef-tier-1-ink); }
[data-tier="2"] { --ef-tier-color: var(--ef-tier-2); --ef-tier-ink: var(--ef-tier-2-ink); }
[data-tier="3"] { --ef-tier-color: var(--ef-tier-3); --ef-tier-ink: var(--ef-tier-3-ink); }
[data-tier="4"] { --ef-tier-color: var(--ef-tier-4); --ef-tier-ink: var(--ef-tier-4-ink); }
[data-tier="5"] { --ef-tier-color: var(--ef-tier-5); --ef-tier-ink: var(--ef-tier-5-ink); }
[data-tier="6"] { --ef-tier-color: var(--ef-tier-6); --ef-tier-ink: var(--ef-tier-6-ink); }

/* ==========================================================================
   关键帧
   值锚定到 css/utilities.css:304/309 与 css/components.css:1432，改一处须同步。
   ========================================================================== */

@keyframes ef-corner-in {
  from { opacity: 0; transform: scale(0.55); }
  to   { opacity: 1; transform: none; }
}

@keyframes ef-rise-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: none; }
}

/* 右侧抽屉。CSS 层的 .ef-drawer 只有这一条（components.css:1429-1435）。 */
@keyframes ef-drawer-in {
  from { transform: translateX(100%); }
  to   { transform: none; }
}

/* 左侧抽屉。CSS 层没有对应实现（.ef-drawer 只做右侧），此处为 React 层补充。 */
@keyframes ef-drawer-in-left {
  from { transform: translateX(-100%); }
  to   { transform: none; }
}

/* 骨架屏扫光。对齐 css/components.css:600-603。 */
@keyframes ef-skeleton-sweep {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}

/* ==========================================================================
   基础层
   ========================================================================== */

@layer base {
  html {
    -webkit-text-size-adjust: 100%;
    scrollbar-gutter: stable;
  }

  body {
    margin: 0;
    min-height: 100vh;
    font-family: var(--ef-font-sans);
    font-size: var(--ef-text-base);
    line-height: var(--ef-text-base--lh);
    color: var(--ef-ink);
    background-color: var(--ef-surface);
    background-image:
      radial-gradient(
        circle at 81% 16%,
        color-mix(in srgb, var(--ef-accent) 18%, transparent),
        transparent 24rem
      ),
      linear-gradient(var(--ef-grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--ef-grid-line) 1px, transparent 1px);
    background-size: auto, var(--ef-grid-size) var(--ef-grid-size),
      var(--ef-grid-size) var(--ef-grid-size);
    background-attachment: fixed;
    text-rendering: optimizeLegibility;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0;
    font-family: var(--ef-font-display);
    font-weight: var(--ef-weight-bold);
    line-height: var(--ef-leading-tight);
    text-wrap: balance;
  }

  h1 { font-size: var(--ef-text-4xl); }
  h2 { font-size: var(--ef-text-3xl); }
  h3 { font-size: var(--ef-text-2xl); }
  h4 { font-size: var(--ef-text-xl); }
  h5 { font-size: var(--ef-text-lg); }
  h6 { font-size: var(--ef-text-base); }

  /* 以下元素重置逐条对齐 css/base.css:62-147。Tailwind preflight 不能替代：
     它在 p 的底边距、a 的下划线、ul/ol 缩进、code/pre 外观、hr、table 宽度上
     都与本设计系统不一致（见各条注释）。 */

  p {
    margin: 0 0 var(--ef-space-4);
    text-wrap: pretty;
  }

  a {
    color: inherit;
    /* preflight 把 a 的 text-decoration 设成 inherit，会连 UA 的下划线一起去掉；
       css/base.css 只调下划线的颜色与偏移、依赖下划线本身存在，故必须显式恢复，
       否则 React 层的裸 <a>（如 TimelineTitle）没有下划线，与 HTML 层不一致。 */
    text-decoration-line: underline;
    text-decoration-color: color-mix(in srgb, currentColor 40%, transparent);
    text-underline-offset: 3px;
  }

  a:hover {
    text-decoration-color: currentColor;
  }

  ul,
  ol {
    margin: 0 0 var(--ef-space-4);
    padding-left: 1.25em;
    /* preflight 设了 ol,ul,menu { list-style: none }，抹掉 UA 的符号；
       css/base.css 不设 list-style、依赖 UA 默认（ul 为 disc、ol 为 decimal），
       故用 revert 归还各元素各自的 UA 默认值，而不是硬编码成同一个值。 */
    list-style: revert;
  }

  /* img/video 的 max-width 与 height 由 preflight 提供，但 svg 不在其中，
     故整条照搬以保证三个元素一致。
     另需归还 display：preflight 把 img/svg/video 等替换元素设成 display: block，
     而 css/base.css 依赖它们默认为行内级（其 vertical-align: middle 只在行内级
     盒子上生效，被 block 化后即为死声明）。实测 300px 宽容器内「文字 + 24px 图片
     + 文字」的段落高度：HTML 层 25.67px、React 层 72px（图片被单独拆到一行）。
     用 revert 而非 inline —— 归还各元素各自的 UA 默认显示类型。 */
  img,
  svg,
  video {
    display: revert;
    max-width: 100%;
    height: auto;
    vertical-align: middle;
  }

  /* preflight 给的是 1em，本系统要求 0.9em，故必须覆写。 */
  code,
  kbd,
  pre,
  samp {
    font-family: var(--ef-font-mono);
    font-size: 0.9em;
  }

  code {
    padding: 0.1em 0.35em;
    border: 1px solid var(--ef-border);
    border-radius: var(--ef-radius-sm);
    /* 用 background-color 而非简写：简写会重置 background-image，
       抹掉可能叠加在同一元素上的手法类底纹。 */
    background-color: var(--ef-code-bg);
    color: var(--ef-code-fg);
    /* 行内代码常含无空格的长标识符；不换行会把窄屏页面撑出横向滚动条
       （实测 375px 下 scrollWidth 429 vs clientWidth 360）。 */
    overflow-wrap: anywhere;
  }

  pre {
    margin: 0 0 var(--ef-space-4);
    padding: var(--ef-space-4);
    overflow-x: auto;
    border: 1px solid var(--ef-border);
    border-radius: var(--ef-radius);
    background: var(--ef-code-bg);
    color: var(--ef-code-fg);
    line-height: var(--ef-leading-relaxed);
  }

  pre code {
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
  }

  /* preflight 只给了 height/color/border-top-width，缺本系统的外边距与描边，
     不补齐会让 Divider 这类组件与浏览器默认样式互相打架。 */
  hr {
    margin: var(--ef-space-6) 0;
    border: 0;
    border-top: 1px solid var(--ef-border);
  }

  /* preflight 有 border-collapse，但没有 width: 100%。 */
  table {
    border-collapse: collapse;
    width: 100%;
  }

  :focus-visible {
    outline: 2px solid var(--ef-info);
    outline-offset: 2px;
  }

  ::selection {
    background: var(--ef-accent);
    color: var(--ef-accent-fg);
  }

  /* 跳到主内容。spec §9 要求每页首个可聚焦元素是它。 */
  .ef-skip-link {
    position: absolute;
    left: var(--ef-space-4);
    top: -100px;
    z-index: 999;
    padding: var(--ef-space-2) var(--ef-space-4);
    border: 1px solid var(--ef-accent-ink);
    border-radius: var(--ef-radius);
    background: var(--ef-surface-raised);
    color: var(--ef-ink);
    font-family: var(--ef-font-mono);
    font-size: var(--ef-text-sm);
    text-decoration: none;
    transition: top var(--ef-duration-fast) var(--ef-ease-out);
  }

  .ef-skip-link:focus {
    top: var(--ef-space-4);
  }

  /* 超长无断点文本必须能换行 */
  td,
  th {
    overflow-wrap: anywhere;
  }
}

/* reduced-motion：本层不产出 .ef-reveal 类，全部动画由上面的 * 规则统一停掉，
   故无需额外的终态规则。 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}

/* ==========================================================================
   打印：强制白底黑字。逐字移植 css/base.css:188-246，改一处须同步。
   ========================================================================== */
@media print {
  /* 必须包含 html:not([data-theme="light"])：默认（跟随系统）时不写 data-theme，
     而 tokens.css 的暗色块正是 html:not([data-theme="light"])（优先级 0,1,1），
     仅靠 :root（0,1,0）压不住它，会导致打印出来是深底深字。 */
  :root,
  html:not([data-theme="light"]),
  html[data-theme="dark"],
  html[data-theme="light"] {
    --ef-surface-sunken: #ffffff;
    --ef-surface: #ffffff;
    --ef-surface-muted: #ffffff;
    --ef-surface-raised: #ffffff;
    --ef-surface-inverse: #000000;
    --ef-ink: #000000;
    --ef-ink-muted: #333333;
    --ef-ink-subtle: #555555;
    --ef-ink-inverse: #ffffff;
    --ef-border: #999999;
    --ef-border-strong: #666666;
    --ef-accent: #e6e6e6;
    --ef-accent-strong: #cccccc;
    --ef-accent-soft: #f2f2f2;
    --ef-accent-fg: #000000;
    --ef-accent-glow: #e6e6e6;
    /* 打印强制白底，暗色主题的 #d8bf00 在白底仅 1.85:1，必须钉成深灰 */
    --ef-accent-ink: #555555;
    /* 语义/分级 ink 的暗色值在白底上偏浅，打印统一钉深 */
    --ef-info-ink: #1c4f8a;
    --ef-success-ink: #00574f;
    --ef-warn-ink: #6f3d02;
    --ef-danger-ink: #8c1a1a;
    --ef-tier-1-ink: #4a5055;
    --ef-tier-2-ink: #2f5427;
    --ef-tier-3-ink: #004f6a;
    --ef-tier-4-ink: #4e3f82;
    --ef-tier-5-ink: #6a4500;
    --ef-tier-6-ink: #83281e;
    /* 热力图若不钉，暗色主题打印会输出深色块（.ef-heatmap 是这三个令牌的
       首个消费者，原 print 块未覆盖它们） */
    --ef-heatmap-bg: #ffffff;
    --ef-heatmap-empty: #e7e9ec;
    --ef-heat-ramp: #6b4500;
    --ef-grid-line: transparent;
    --ef-scanline: transparent;
    --ef-weave-line: transparent;
    --ef-code-bg: #f5f5f5;
    --ef-code-fg: #000000;
  }

  body {
    background-image: none;
  }

  .ef-no-print,
  .ef-sidebar,
  .ef-topbar {
    display: none !important;
  }
}
```

- [ ] **Step 6: 写 cx 工具**

创建 `endfield/react/src/lib/cx.ts`：

```ts
/**
 * 拼接类名，过滤假值。
 * 不引入 classnames / clsx —— 本库保持零运行时依赖。
 * 注意：组件的 className 必须拼在最后，但这是必要条件而非充分条件 ——
 * Tailwind v4 在 @layer utilities 内按自己的规范顺序发射，同一个 CSS 属性上
 * 后发射的赢，而这个顺序使用方看不到也控制不了。同一个 class 在不同组件上
 * 结果可能相反（bg-danger 在 Button primary 上生效，在 secondary/ghost/Chip
 * 上被内置的 bg-transparent/bg-surface-muted 压掉）。拿不准就用 Tailwind 的
 * ! 修饰符（bg-danger!、rounded-none!、p-8!），它产出 !important，绕过发射顺序。
 * 详见实施计划的 Review Focus 第 1 条。
 */
export type ClassValue = string | false | null | undefined;

export function cx(...classes: ClassValue[]): string {
  let out = '';
  for (const c of classes) {
    if (!c) continue;
    out = out ? `${out} ${c}` : c;
  }
  return out;
}
```

- [ ] **Step 7: 写入口文件与演示站骨架**

创建 `endfield/react/index.html`：

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Endfield 设计系统 · React 组件库</title>
<!-- 内联 data: favicon：冷启动的 Chrome 会请求 /favicon.ico，缺它会记一条 404
     到控制台，让「零错误」的验证结论只在热缓存下成立。用 data: URI 避免引入二进制资产。 -->
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' fill='%23111827'/%3E%3Cpath d='M3 3h10v2H3zM3 7h7v2H3zM3 11h10v2H3z' fill='%23f2cc00'/%3E%3C/svg%3E">
<script>
  /* 首帧前应用主题，避免闪烁 */
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
</head>
<body>
<div id="root"></div>
<script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

创建 `endfield/react/src/main.tsx`（Task 5 会替换为完整演示站）：

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tailwind.css';

function Placeholder() {
  return <main className="p-8 text-ink">Endfield React 组件库</main>;
}

const container = document.getElementById('root');
if (!container) throw new Error('找不到 #root 容器');

createRoot(container).render(
  <StrictMode>
    <Placeholder />
  </StrictMode>,
);
```

创建 `endfield/react/src/index.ts`（Task 2 起追加导出）：

```ts
export { cx } from './lib/cx';
export type { ClassValue } from './lib/cx';
```

- [ ] **Step 8: 安装依赖并同步令牌**

```bash
cd "F:/AiWorkspace/KimiCode/public/endfield/react"
npm install
npm run sync:tokens
```

Expected: 安装成功；输出「已同步令牌：…」，且 `src/styles/tokens.css` 已生成。

- [ ] **Step 9: 验证构建与类型检查**

Run: `cd endfield/react && npm run build`
Expected: `tsc --noEmit` 无错误，`vite build` 成功产出 `dist/`，退出码 0。

- [ ] **Step 10: 验证令牌漂移会被抓到（负向测试）**

```bash
cd "F:/AiWorkspace/KimiCode/public/endfield/react"
printf '\n.ef-drift-test { color: red; }\n' >> src/styles/tokens.css
node scripts/sync-tokens.mjs --check; echo "退出码=$?"
```

Expected: 输出「错误：令牌已漂移。」且 `退出码=1`。这一步证明校验真的会失败，不是永远通过的假检查。

恢复一致状态：

```bash
npm run sync:tokens
node scripts/sync-tokens.mjs --check; echo "退出码=$?"
```

Expected: 输出「通过：React 层令牌与源文件一致。」且 `退出码=0`。

- [ ] **Step 11: 提交**

```bash
cd "F:/AiWorkspace/KimiCode/public"
git add endfield/react/package.json endfield/react/package-lock.json \
  endfield/react/tsconfig.json endfield/react/vite.config.ts \
  endfield/react/scripts/sync-tokens.mjs endfield/react/src/styles/tailwind.css \
  endfield/react/src/styles/tokens.css endfield/react/src/lib/cx.ts \
  endfield/react/index.html endfield/react/src/main.tsx endfield/react/src/index.ts
git commit -m "feat(endfield-react): 搭建 Vite+TS+Tailwind 脚手架与令牌同步"
```

`.gitignore` 需忽略 `node_modules` 与 `dist`。HTML/CSS 层计划创建的 `endfield/.gitignore` 已含这两项，此处确认即可。

---

### Task 2: 图标与原子组件

**Files:**
- Create: `endfield/react/src/components/icons.tsx`
- Create: `endfield/react/src/components/Button.tsx`
- Create: `endfield/react/src/components/Input.tsx`
- Create: `endfield/react/src/components/Badge.tsx`
- Create: `endfield/react/src/components/Chip.tsx`
- Create: `endfield/react/src/components/Toggle.tsx`（Checkbox / Radio / Switch）
- Create: `endfield/react/src/components/Feedback.tsx`（Spinner / Skeleton / Progress / EmptyState）
- Create: `endfield/react/src/components/Misc.tsx`（Divider / Kbd / Avatar / Tooltip）
- Modify: `endfield/react/src/index.ts`
- Test: 在 `src/main.tsx` 里临时渲染各组件，由 `tsc` 与浏览器核对

**Interfaces:**
- Consumes: Task 1 的
  - `cx`（`src/lib/cx.ts`）
  - Tailwind `@theme` 映射出的颜色与圆角工具类（`bg-surface-muted`、`text-ink-muted`、`border-border-strong`、`bg-accent`、`text-accent-fg`、`border-accent-ink`、`text-info-ink`…`text-danger-ink`、`bg-info/12`、`rounded-ef`、`rounded-ef-sm`、`rounded-pill` 等）
  - `@utility` 集合：`chamfer`、`chamfer-sm`、`corner-frame`、`corner-frame-all`、`hatch`、`hatch-soft`、`hatch-accent`、`scanline`、`grid-backdrop`、`industrial-shell`、`top-signal-strip`、`tier-strip`、`skeleton-sweep`
  - `[data-tier="1"]`…`[data-tier="6"]` 属性映射（产出 `--ef-tier-color` 与 `--ef-tier-ink`）
- Produces:
  - `Icon` 组件族：`IconSearch`、`IconMenu`、`IconSettings`、`IconUser`、`IconClose`、`IconChevronDown`、`IconChevronRight`、`IconPlus`、`IconMinus`、`IconCheck`、`IconInfo`、`IconWarn`、`IconDanger`、`IconSuccess`、`IconGrid`、`IconList`、`IconClock`、`IconDownload`、`IconRotate`、`IconExpand`、`IconSun`、`IconMoon`、`IconMonitor`、`IconLock`、`IconBell`、`IconTrend`、`IconActivity`、`IconFile`。每个接受 `{ className?: string; size?: number }`
  - `ButtonProps`: `{ variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg'; loading?: boolean; icon?: ReactNode; children?: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>`
  - `IconButtonProps`: `{ label: string } & ButtonHTMLAttributes<HTMLButtonElement>`
  - `InputProps`、`TextareaProps`、`SelectProps`、`FieldProps`: `{ label?: string; hint?: string; id?: string }`
  - `BadgeProps`: `{ variant?: 'default' | 'info' | 'success' | 'warn' | 'danger' | 'accent' | 'tier'; tier?: 1|2|3|4|5|6 }`
  - `ChipProps`: `{ active?: boolean }`
  - `CheckboxProps`、`RadioProps`、`SwitchProps`
  - `Spinner`、`Skeleton`、`Progress`（`{ value: number }`）、`EmptyState`（`{ icon?: ReactNode; title: string; description?: string; action?: ReactNode }`）
  - `Divider`（`{ label?: string }`）、`Kbd`、`Avatar`（`{ size?: 'sm'|'md'|'lg'; src?: string; alt?: string; fallback?: string }`）、`Tooltip`（`{ content: ReactNode }`）

- [ ] **Step 1: 写图标组件**

创建 `endfield/react/src/components/icons.tsx`：

```tsx
import type { ReactNode, SVGProps } from 'react';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  size?: number;
}

/** 统一的图标外壳：线性、currentColor、24 视窗。 */
function makeIcon(path: ReactNode, viewBox = '0 0 24 24') {
  return function Icon({ size = 16, className, ...rest }: IconProps) {
    return (
      <svg
        viewBox={viewBox}
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        className={className}
        {...rest}
      >
        {path}
      </svg>
    );
  };
}

export const IconSearch = makeIcon(
  <>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5 21 21" />
  </>,
);

export const IconMenu = makeIcon(
  <>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </>,
);

export const IconSettings = makeIcon(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
  </>,
);

export const IconUser = makeIcon(
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </>,
);

export const IconClose = makeIcon(<path d="M6 6l12 12M18 6 6 18" />);

export const IconChevronDown = makeIcon(<path d="M5 8l7 7 7-7" />);

export const IconChevronRight = makeIcon(<path d="M9 5l7 7-7 7" />);

export const IconPlus = makeIcon(<path d="M12 5v14M5 12h14" />);

export const IconMinus = makeIcon(<path d="M5 12h14" />);

export const IconCheck = makeIcon(<path d="M4 12.5 9.5 18 20 6.5" />);

export const IconInfo = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v6M12 7.5v.5" />
  </>,
);

export const IconWarn = makeIcon(
  <>
    <path d="M12 3.5 21.5 20h-19L12 3.5Z" />
    <path d="M12 10v4M12 17v.5" />
  </>,
);

export const IconDanger = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" />
  </>,
);

export const IconSuccess = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.5l2.8 2.8L16 9.5" />
  </>,
);

export const IconGrid = makeIcon(
  <>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </>,
);

export const IconList = makeIcon(
  <>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </>,
);

export const IconClock = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.5l3.5 2" />
  </>,
);

export const IconDownload = makeIcon(
  <>
    <path d="M12 3v12M7.5 10.5 12 15l4.5-4.5" />
    <path d="M4 19h16" />
  </>,
);

export const IconRotate = makeIcon(
  <>
    <path d="M20 12a8 8 0 1 1-2.3-5.6" />
    <path d="M20 4v5h-5" />
  </>,
);

export const IconExpand = makeIcon(
  <>
    <path d="M4 9V4h5M20 15v5h-5M20 9V4h-5M4 15v5h5" />
  </>,
);

export const IconSun = makeIcon(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
  </>,
);

export const IconMoon = makeIcon(<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />);

export const IconMonitor = makeIcon(
  <>
    <rect x="3" y="4" width="18" height="12" />
    <path d="M8 20h8M12 16v4" />
  </>,
);

export const IconLock = makeIcon(
  <>
    <rect x="4" y="10" width="16" height="11" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </>,
);

export const IconBell = makeIcon(
  <>
    <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </>,
);

export const IconTrend = makeIcon(<path d="M3 17l6-6 4 4 8-8M15 7h6v6" />);

export const IconActivity = makeIcon(<path d="M3 12h4l3-7 4 14 3-7h4" />);

export const IconFile = makeIcon(
  <>
    <path d="M6 3h8l4 4v14H6z" />
    <path d="M14 3v4h4" />
  </>,
);
```

- [ ] **Step 2: 写 Button 与 IconButton**

创建 `endfield/react/src/components/Button.tsx`：

```tsx
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../lib/cx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
}

/* 每个变体同时给出 --ef-btn-fg：载入态的旋转环读它取色，否则环会画成
   按钮文字的继承色（对齐 css/components.css:135 的 color: var(--ef-btn-fg)）。 */
const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-fg border-accent-strong font-semibold hover:bg-accent-strong hover:border-accent-strong [--ef-btn-fg:var(--ef-accent-fg)]',
  secondary:
    'bg-transparent text-ink border-border-strong hover:bg-surface-muted [--ef-btn-fg:var(--ef-ink)]',
  ghost:
    'bg-transparent text-ink-muted border-transparent hover:bg-surface-muted hover:text-ink [--ef-btn-fg:var(--ef-ink-muted)]',
  /* 危险按钮：hover 压暗而非变淡（对齐 css/components.css:97-105）。
     前景硬编码 #ffffff 与层一致 —— 白字在 #dc2626 上对比度达标。 */
  danger:
    'bg-danger text-white border-danger hover:bg-[color-mix(in_srgb,var(--ef-danger)_82%,#000000)] hover:border-[color-mix(in_srgb,var(--ef-danger)_82%,#000000)] [--ef-btn-fg:#ffffff]',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', loading = false, icon, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        'relative inline-flex items-center justify-center gap-2 rounded-ef border font-medium leading-tight whitespace-nowrap',
        'transition-colors duration-150 cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT[variant],
        SIZE[size],
        loading && 'text-transparent pointer-events-none',
        className,
      )}
      {...rest}
    >
      {icon ? <span className="shrink-0 inline-flex">{icon}</span> : null}
      {children}
      {loading ? (
        <span
          aria-hidden="true"
          className="absolute inset-0 m-auto h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          /* 环色取按钮自身前景，与层一致（css/components.css:125-137）。
             不能写成 var(--ef-ink)：那会在红色危险按钮上画出黑环。 */
          style={{ color: 'var(--ef-btn-fg)' }}
        />
      ) : null}
    </button>
  );
});

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 必填：图标按钮没有可见文字，必须提供无障碍名称。 */
  label: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ label, className, children, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        title={label}
        className={cx(
          'chamfer-sm inline-flex h-8 w-8 shrink-0 items-center justify-center',
          'border border-border bg-surface-muted text-ink-muted cursor-pointer',
          'transition-colors duration-150 hover:bg-accent hover:text-accent-fg',
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
```

- [ ] **Step 3: 写表单组件**

创建 `endfield/react/src/components/Input.tsx`：

```tsx
import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cx } from '../lib/cx';

const FIELD_BASE = cx(
  'w-full rounded-ef border border-border bg-surface-sunken px-3 py-2 text-sm text-ink',
  'transition-colors duration-150 placeholder:text-ink-subtle',
  'hover:border-border-strong',
  'focus:outline-none focus:border-accent-ink focus:bg-surface',
  'focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--ef-accent)_30%,transparent)]',
);

/* 三个属性都写成 `| undefined`：本工程开了 exactOptionalPropertyTypes，
   而这里是必包控件的入口，label/hint/id 都可能显式传 undefined。 */
export interface FieldWrapperProps {
  label?: string | undefined;
  hint?: string | undefined;
  id?: string | undefined;
  children: (id: string) => ReactNode;
}

/** 标签 + 控件 + 提示的通用包裹，负责把 label 与控件用 id 关联。 */
export function Field({ label, hint, id, children }: FieldWrapperProps) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <div className="mb-4 flex flex-col gap-1">
      {label ? (
        <label
          htmlFor={fieldId}
          className="font-mono text-xs uppercase tracking-[0.12em] text-ink-muted"
        >
          {label}
        </label>
      ) : null}
      {children(fieldId)}
      {hint ? <span className="text-xs text-ink-subtle">{hint}</span> : null}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, className, id, ...rest },
  ref,
) {
  const auto = useId();
  const fieldId = id ?? auto;
  const control = (
    <input ref={ref} id={fieldId} className={cx(FIELD_BASE, className)} {...rest} />
  );
  if (!label && !hint) return control;
  return (
    <Field label={label} hint={hint} id={fieldId}>
      {() => control}
    </Field>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, hint, className, id, ...rest }, ref) {
    const auto = useId();
    const fieldId = id ?? auto;
    const control = (
      <textarea
        ref={ref}
        id={fieldId}
        className={cx(FIELD_BASE, 'min-h-24 resize-y leading-normal', className)}
        {...rest}
      />
    );
    if (!label && !hint) return control;
    return (
      <Field label={label} hint={hint} id={fieldId}>
        {() => control}
      </Field>
    );
  },
);

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, className, id, children, ...rest },
  ref,
) {
  const auto = useId();
  const fieldId = id ?? auto;
  const selectClass = cx(FIELD_BASE, 'cursor-pointer pr-8 appearance-none', className);
  /* CSS 层用内联 SVG 数据 URI 画下拉箭头（css/components.css:249）：
     12×8 的折线，stroke-width 1.6，定位 right 0.75rem center。
     数据 URI 读不到 CSS 变量，故层里把颜色写死成 #808080；
     这里改用 --ef-border-strong —— 它在亮色主题下正是 #808080
     （css/tokens.css:164），并随主题变化，属有意改进而非漂移。 */
  const arrow = (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
    >
      <svg viewBox="0 0 12 8" width={12} height={8} fill="none" aria-hidden="true">
        <path d="M1 1l5 5 5-5" stroke="var(--ef-border-strong)" strokeWidth={1.6} />
      </svg>
    </span>
  );
  const control = (
    <span className="relative inline-flex w-full">
      <select ref={ref} id={fieldId} className={selectClass} {...rest}>
        {children}
      </select>
      {arrow}
    </span>
  );

  if (!label && !hint) return control;
  return (
    <Field label={label} hint={hint} id={fieldId}>
      {() => control}
    </Field>
  );
});

export interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  shortcut?: string;
}

/** 带放大镜图标与快捷键提示的搜索框。 */
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  function SearchBar({ className, shortcut = '/', ...rest }, ref) {
    return (
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-3 text-ink-subtle">
          <svg
            viewBox="0 0 16 16"
            width={16}
            height={16}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            aria-hidden="true"
          >
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11l4 4" />
          </svg>
        </span>
        <input
          ref={ref}
          type="search"
          className={cx(FIELD_BASE, 'pl-9 pr-10', className)}
          {...rest}
        />
        {shortcut ? (
          <kbd className="pointer-events-none absolute right-2 rounded-ef-sm border border-border border-b-2 bg-surface-raised px-1.5 font-mono text-[11px] text-ink-muted">
            {shortcut}
          </kbd>
        ) : null}
      </div>
    );
  },
);
```

- [ ] **Step 4: 写 Badge 与 Chip**

创建 `endfield/react/src/components/Badge.tsx`：

```tsx
import type { HTMLAttributes } from 'react';
import { cx } from '../lib/cx';

export type BadgeVariant =
  | 'default'
  | 'info'
  | 'success'
  | 'warn'
  | 'danger'
  | 'accent'
  | 'tier';

export type Tier = 1 | 2 | 3 | 4 | 5 | 6;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /** variant="tier" 时生效，1–6。 */
  tier?: Tier;
}

const VARIANT: Record<Exclude<BadgeVariant, 'tier'>, string> = {
  default: 'border-border bg-surface-muted text-ink-muted',
  info: 'border-info-ink text-info-ink bg-info/12',
  success: 'border-success-ink text-success-ink bg-success/12',
  warn: 'border-warn-ink text-warn-ink bg-warn/12',
  danger: 'border-danger-ink text-danger-ink bg-danger/12',
  accent: 'border-accent-strong bg-accent text-accent-fg',
};

/**
 * 徽标。
 * tint 填充用语义原色，其中的文字与描边必须用 *-ink —— 原色在自身 12% tint 上
 * 亮色主题仅 1.92–4.01:1，低于 4.5:1（对齐 css/components.css:419-424）。
 * 分级徽标同样分叉：文字与描边用 --ef-tier-ink，tint 填充用 --ef-tier-color
 * （对齐 css/components.css:427-433）。
 * 等级通过 data-tier 属性传递，由 tailwind.css 的 [data-tier="N"] 规则同时
 * 产出 --ef-tier-color 与 --ef-tier-ink；不用内联样式（规格 §5.12）。
 */
export function Badge({ variant = 'default', tier, className, children, ...rest }: BadgeProps) {
  const isTier = variant === 'tier';
  return (
    <span
      {...(isTier && tier !== undefined ? { 'data-tier': String(tier) } : {})}
      className={cx(
        'inline-flex items-center gap-1 rounded-ef-sm border px-2 py-0.5',
        'font-mono text-[11px] leading-relaxed whitespace-nowrap tracking-wide',
        isTier
          ? 'border-[var(--ef-tier-ink,var(--ef-border))] text-[var(--ef-tier-ink,var(--ef-ink-muted))] bg-[color-mix(in_srgb,var(--ef-tier-color,transparent)_14%,transparent)]'
          : VARIANT[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
```

创建 `endfield/react/src/components/Chip.tsx`：

```tsx
import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';
import { cx } from '../lib/cx';

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

/**
 * 可选中标签，用于筛选行。
 * active 为受控：由使用方传入，本组件不持有内部状态，仅把它映射为 aria-pressed。
 * 不提供 defaultPressed 之类的非受控入口 —— 它既不是合法 DOM 属性，
 * 又会经 ...rest 漏到 DOM 上并触发 React 警告。
 */
export function Chip({ active = false, className, children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cx(
        // rounded-pill 映射自 --ef-radius-pill（对齐 css/components.css:449）。
        'inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1',
        'text-sm leading-tight cursor-pointer transition-colors duration-150',
        // 激活态斜纹用 hatch-soft 而非 hatch：hatch 取 currentColor，而此处文字是
        // text-accent-fg（#111827），会画出近黑斜纹。层里是固定 rgb(0 0 0 / 12%)
        // 5px 间距（css/components.css:473-477）。
        active
          ? 'border-accent-strong bg-accent text-accent-fg font-semibold hatch-soft'
          : 'border-border bg-surface-muted text-ink-muted hover:border-border-strong hover:text-ink',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export interface ChipGroupProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export function ChipGroup({ label, className, children, ...rest }: ChipGroupProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cx('flex flex-wrap items-center gap-2', className)}
      {...rest}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 5: 写开关类组件**

创建 `endfield/react/src/components/Toggle.tsx`：

> **`className` 落在包裹用的 `<label>` 上**，不是 `<input>` 上（对齐 HTML/CSS 层：
> `.ef-check` 是 label，输入框由 `.ef-check input` 选中）。因此
> `<Checkbox className="size-8" />` 放大的是整行标签，而不是那个方框。
>
> **方框不可能通过 `className` 拿到类**：`className` 被解构出来交给 `ToggleShell`，
> 而 `...rest` 里已经没有它了 —— 所以「给方框加类」这条路根本不存在（实测：
> `<Checkbox className="rounded-none" />` 之后 `<input>` 仍是 2px 圆角）。
> `...rest` 只能携带**非 `className`** 的原生属性（如 `style`、`disabled`、`name`）。
> 要做一次性的方框外观覆盖，用 `style`，例如
> `<Checkbox style={{ borderRadius: 0 }} />`。
>
> 顺带纠正圆角归属：三者并不相同 —— `Switch` 的方框才是 `rounded-pill`；
> `Checkbox` 是 `rounded-ef-sm`（2px），`Radio` 是 `rounded-full`。所以
> 「`className` 不会碰到方框的 `rounded-pill`」这句话只对 `Switch` 成立。

```tsx
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../lib/cx';

interface ToggleShellProps {
  htmlFor?: string | undefined;
  className?: string | undefined;
  children: ReactNode;
}

function ToggleShell({ htmlFor, className, children }: ToggleShellProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cx('inline-flex cursor-pointer items-center gap-2 text-sm select-none', className)}
    >
      {children}
    </label>
  );
}

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className, id, ...rest },
  ref,
) {
  const auto = useId();
  const controlId = id ?? auto;
  return (
    <ToggleShell htmlFor={controlId} className={className}>
      <input
        ref={ref}
        id={controlId}
        type="checkbox"
        className={cx(
          'size-4 shrink-0 cursor-pointer appearance-none rounded-ef-sm',
          'border border-border-strong bg-surface-sunken',
          'checked:border-accent-strong checked:bg-accent',
          // 斜纹与勾形是同一 background-image 的两层，避免其中一个静默覆盖另一个。
          // 斜纹对齐 css/components.css:321-325，勾形对齐 :328-338。
          // 数据 URI 内读不到 CSS 变量，故勾形描边 #111827 与斜纹 rgb(0 0 0 / 18%)
          // 是写死的颜色字面量 —— 与 CSS 层逐字节一致，属已认可的例外（同 Select
          // 箭头）。斜纹与勾形都必须保留，缺一即与 CSS 层不一致。
          'checked:bg-[image:url("data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2012%2012%27%3E%3Cpath%20d=%27M2%206.2l2.6%202.6L10%203.4%27%20fill=%27none%27%20stroke=%27%23111827%27%20stroke-width=%272%27/%3E%3C/svg%3E"),repeating-linear-gradient(-45deg,rgb(0_0_0/18%)_0_1px,transparent_1px_4px)]',
          'checked:bg-[length:100%,auto] checked:bg-[position:center,0_0] checked:bg-no-repeat',
        )}
        {...rest}
      />
      {label ? <span>{label}</span> : null}
    </ToggleShell>
  );
});

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, className, id, ...rest },
  ref,
) {
  const auto = useId();
  const controlId = id ?? auto;
  return (
    <ToggleShell htmlFor={controlId} className={className}>
      <input
        ref={ref}
        id={controlId}
        type="radio"
        className={cx(
          'size-4 shrink-0 cursor-pointer appearance-none rounded-full',
          'border border-border-strong bg-surface-sunken',
          'checked:border-accent-strong checked:bg-accent',
          // 选中圆点为 6px（对齐 css/components.css:341-348），用背景图而非
          // inset shadow —— 后者画的是 3px 内环，与层里的小圆点不符。
          'checked:bg-[image:radial-gradient(circle,var(--ef-accent-fg)_0_3px,transparent_3px)]',
        )}
        {...rest}
      />
      {label ? <span>{label}</span> : null}
    </ToggleShell>
  );
});

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, className, id, ...rest },
  ref,
) {
  const auto = useId();
  const controlId = id ?? auto;
  return (
    <ToggleShell htmlFor={controlId} className={className}>
      <input
        ref={ref}
        id={controlId}
        type="checkbox"
        role="switch"
        className={cx(
          // 胶囊圆角对齐 css/components.css:367 的 --ef-radius-pill。
          'relative h-5 w-9 shrink-0 cursor-pointer appearance-none rounded-pill',
          'border border-border-strong bg-surface-sunken',
          'transition-colors duration-250',
          'after:absolute after:left-0.5 after:top-0.5 after:size-3.5 after:rounded-full',
          'after:bg-ink-subtle after:transition-transform after:duration-250',
          'checked:border-accent-strong checked:bg-accent',
          'checked:after:translate-x-4 checked:after:bg-accent-fg',
        )}
        {...rest}
      />
      {label ? <span>{label}</span> : null}
    </ToggleShell>
  );
});
```

- [ ] **Step 6: 写反馈与杂项组件**

创建 `endfield/react/src/components/Feedback.tsx`：

> `Skeleton` 用到的 `skeleton-sweep` `@utility` 与 `ef-skeleton-sweep` 关键帧**已在 Task 1 Step 5 声明在 `src/styles/tailwind.css`**，此处只需确认它们存在，**不要在本任务里重复声明**。

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../lib/cx';

export type SpinnerProps = HTMLAttributes<HTMLSpanElement>;

export function Spinner({ className, ...rest }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="加载中"
      className={cx(
        'inline-block size-5 animate-spin rounded-full border-2 border-border border-t-accent-ink',
        className,
      )}
      {...rest}
    />
  );
}

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
}

export function Skeleton({ width, height, className, style, ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cx(
        // 用扫光而非 Tailwind 的透明度脉冲：对齐 css/components.css:585-603 与 spec §6.1。
        'block skeleton-sweep rounded-ef-sm bg-surface-muted',
        className,
      )}
      style={{ width, height, ...style }}
      {...rest}
    />
  );
}

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** 0–100。 */
  value: number;
  label?: string;
}

export function Progress({ value, label, className, ...rest }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cx(
        'relative h-1.5 overflow-hidden rounded-ef-sm border border-border bg-surface-sunken',
        className,
      )}
      {...rest}
    >
      <div
        /* 进度条填充用 background-color 而非任何 background 简写，否则会重置
           background-image，静默抹掉叠加上来的 hatch 斜纹（spec §6.1 要求
           进度条「可叠加 hatch」；对齐 css/components.css:616-623）。 */
        className="h-full bg-accent transition-[width] duration-400"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...rest
}: EmptyStateProps) {
  return (
    <div
      className={cx(
        'flex flex-col items-center gap-3 px-6 py-12 text-center text-ink-muted',
        className,
      )}
      {...rest}
    >
      {icon ? <span className="text-border-strong">{icon}</span> : null}
      <p className="m-0 text-lg font-semibold text-ink">{title}</p>
      {description ? <p className="m-0 max-w-md text-sm">{description}</p> : null}
      {action}
    </div>
  );
}
```

创建 `endfield/react/src/components/Misc.tsx`：

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../lib/cx';

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export function Divider({ label, className, ...rest }: DividerProps) {
  if (!label) {
    return <hr className={cx('my-4 h-px border-0 bg-border', className)} {...rest} />;
  }
  return (
    <div
      role="separator"
      className={cx(
        'my-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle',
        'before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border',
        className,
      )}
      {...rest}
    >
      {label}
    </div>
  );
}

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export function Kbd({ children, className, ...rest }: KbdProps) {
  return (
    <kbd
      className={cx(
        'inline-block min-w-6 rounded-ef-sm border border-border border-b-2',
        'bg-surface-raised px-1.5 text-center font-mono text-[11px] leading-normal text-ink-muted',
        className,
      )}
      {...rest}
    >
      {children}
    </kbd>
  );
}

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  size?: AvatarSize;
  src?: string;
  alt?: string;
  /** 无图时显示的文字，通常取名字首字。 */
  fallback?: string;
}

const AVATAR_SIZE: Record<AvatarSize, string> = {
  sm: 'size-6.5 text-xs',
  md: 'size-9 text-sm',
  lg: 'size-13 text-lg',
};

export function Avatar({ size = 'md', src, alt, fallback, className, ...rest }: AvatarProps) {
  return (
    <span
      className={cx(
        'chamfer-sm inline-flex shrink-0 items-center justify-center overflow-hidden',
        'border border-border bg-surface-muted font-mono font-semibold text-ink-muted',
        AVATAR_SIZE[size],
        className,
      )}
      {...rest}
    >
      {src ? (
        <img src={src} alt={alt ?? ''} className="size-full object-cover" />
      ) : (
        fallback ?? null
      )}
    </span>
  );
}

/* 必须剔除 content：React 的 HTMLAttributes 已把它声明成 string（meta 的
   属性），气泡内容要收 ReactNode，不做 Omit 会是接口冲突而非可赋值问题。 */
export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'content'> {
  content: ReactNode;
}

/** 悬停 / 聚焦显示的气泡提示，纯 CSS 驱动。 */
export function Tooltip({ content, className, children, ...rest }: TooltipProps) {
  return (
    <span className={cx('group relative inline-flex', className)} {...rest}>
      {children}
      <span
        role="tooltip"
        className={cx(
          'pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-80',
          '-translate-x-1/2 whitespace-nowrap rounded-ef-sm px-2 py-1',
          'bg-[var(--ef-tooltip)] font-mono text-xs text-[var(--ef-tooltip-fg)]',
          'invisible opacity-0 transition-opacity duration-150',
          'group-hover:visible group-hover:opacity-100',
          'group-focus-within:visible group-focus-within:opacity-100',
        )}
      >
        {content}
      </span>
    </span>
  );
}
```

- [ ] **Step 7: 更新导出**

把 `endfield/react/src/index.ts` 替换为：

```ts
export { cx } from './lib/cx';
export type { ClassValue } from './lib/cx';

export * from './components/icons';
export { Button, IconButton } from './components/Button';
export type { ButtonProps, ButtonVariant, ButtonSize, IconButtonProps } from './components/Button';
export { Field, Input, Textarea, Select, SearchBar } from './components/Input';
export type {
  FieldWrapperProps,
  InputProps,
  TextareaProps,
  SelectProps,
  SearchBarProps,
} from './components/Input';
export { Badge } from './components/Badge';
export type { BadgeProps, BadgeVariant, Tier } from './components/Badge';
export { Chip, ChipGroup } from './components/Chip';
export type { ChipProps, ChipGroupProps } from './components/Chip';
export { Checkbox, Radio, Switch } from './components/Toggle';
export type { CheckboxProps, RadioProps, SwitchProps } from './components/Toggle';
export { Spinner, Skeleton, Progress, EmptyState } from './components/Feedback';
export type { SpinnerProps, SkeletonProps, ProgressProps, EmptyStateProps } from './components/Feedback';
export { Divider, Kbd, Avatar, Tooltip } from './components/Misc';
export type { DividerProps, KbdProps, AvatarProps, AvatarSize, TooltipProps } from './components/Misc';
```

- [ ] **Step 8: 类型检查**

Run: `cd endfield/react && npx tsc --noEmit`
Expected: 零错误。若有 `forwardRef` 泛型相关的推断问题，显式标注泛型参数，**不得用 `as any` 绕过**。

- [ ] **Step 9: 临时页面实测组件与 className 覆盖**

把 `endfield/react/src/main.tsx` 临时替换为：

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tailwind.css';
import {
  Button, IconButton, Input, Textarea, Select, SearchBar,
  Badge, Chip, ChipGroup, Checkbox, Radio, Switch,
  Spinner, Skeleton, Progress, EmptyState,
  Divider, Kbd, Avatar, Tooltip,
  IconSearch, IconSettings, IconCheck, IconFile,
} from './index';

function Probe() {
  return (
    <main className="grid gap-6 p-8">
      <div className="flex flex-wrap gap-2">
        <Button variant="primary">主按钮</Button>
        <Button variant="secondary">次按钮</Button>
        <Button variant="ghost">幽灵</Button>
        <Button variant="danger">危险</Button>
        <Button variant="primary" size="sm">小</Button>
        <Button variant="primary" size="lg">大</Button>
        <Button variant="primary" loading>载入中</Button>
        <Button variant="primary" icon={<IconCheck />}>带图标</Button>
        <IconButton label="设置"><IconSettings /></IconButton>
      </div>

      <div className="max-w-md">
        <Input label="用户名" placeholder="请输入" hint="必填项" />
        <Textarea label="简介" placeholder="多行文本" />
        <Select label="语言" defaultValue="zh">
          <option value="zh">简体中文</option>
          <option value="en">English</option>
        </Select>
        <SearchBar placeholder="搜索…" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge>默认</Badge>
        <Badge variant="info">信息</Badge>
        <Badge variant="success">成功</Badge>
        <Badge variant="warn">警告</Badge>
        <Badge variant="danger">错误</Badge>
        <Badge variant="accent">强调</Badge>
        <Badge variant="tier" tier={1}>1</Badge>
        <Badge variant="tier" tier={4}>4</Badge>
        <Badge variant="tier" tier={6}>6</Badge>
      </div>

      <ChipGroup label="筛选">
        <Chip active>全部</Chip>
        <Chip>选项一</Chip>
        <Chip>选项二</Chip>
      </ChipGroup>

      <div className="flex flex-wrap items-center gap-4">
        <Checkbox label="复选" defaultChecked />
        <Radio label="单选" name="r" defaultChecked />
        <Radio label="单选二" name="r" />
        <Switch label="开关" defaultChecked />
      </div>

      <div className="flex items-center gap-4">
        <Spinner />
        <div className="w-40"><Skeleton height="1rem" /></div>
        <div className="w-40"><Progress value={45} label="进度" /></div>
        <Kbd>/</Kbd>
        <Avatar fallback="AB" />
        <Avatar size="lg" fallback="CD" />
        <Tooltip content="提示文本"><Button>悬停我</Button></Tooltip>
        <IconSearch />
        <IconFile size={24} />
      </div>

      <Divider label="分隔" />
      <EmptyState icon={<IconFile size={48} />} title="暂无内容" description="试试别的关键词" action={<Button variant="primary">返回</Button>} />

      {/* className 覆盖实测（Review Focus 第 1 条）：
          className 拼在内置类之后只是必要条件 —— 同一个 CSS 属性上，Tailwind
          按自己的规范顺序发射，后发射的赢，而这个顺序使用方看不到也控制不了。
          所以同一个 class 在不同组件上结果可能相反，拿不准就用 ! 修饰符。 */}
      <Button variant="primary" className="rounded-none">覆盖圆角（primary，应生效）</Button>
      <Button variant="primary" className="bg-danger">覆盖底色（primary，应生效）</Button>
      {/* 对照：同一个 bg-danger 在 secondary / ghost / Chip 上会被内置的
          bg-transparent / bg-surface-muted 压掉（它们发射更晚）。 */}
      <Button variant="secondary" className="bg-danger">覆盖底色（secondary，预期不生效）</Button>
      <Button variant="ghost" className="bg-danger">覆盖底色（ghost，预期不生效）</Button>
      <Chip className="bg-danger">覆盖底色（Chip，预期不生效）</Chip>
      <Chip className="rounded-none">覆盖圆角（Chip，预期不生效）</Chip>
      <Button variant="primary" className="p-8">覆盖内边距（无 !，预期不生效）</Button>
      {/* 加 ! 后全部生效：!important 绕过发射顺序。 */}
      <Button variant="primary" className="p-8!">覆盖内边距（!，应生效）</Button>
      <Button variant="secondary" className="bg-danger!">覆盖底色（secondary + !，应生效）</Button>
      <Chip className="bg-danger!">覆盖底色（Chip + !，应生效）</Chip>
      <Chip className="rounded-none!">覆盖圆角（Chip + !，应生效）</Chip>
    </main>
  );
}

const container = document.getElementById('root');
if (!container) throw new Error('找不到 #root 容器');
createRoot(container).render(<StrictMode><Probe /></StrictMode>);
```

Run: `cd endfield/react && npm run dev`
Expected: 浏览器打开后逐项核对：

- 4 种按钮变体外观正确；主按钮为主色底 + 深墨字。
- 载入态按钮文字消失、出现旋转环。
- 图标按钮右上与左下被切角。
- 输入框聚焦时描边变主色并有一圈淡光晕。
- 三个分级徽标颜色依次为灰蓝、紫、红。
- 激活的 Chip 为主色实底 + 斜纹。
- 复选/单选/开关选中为主色。
- **className 覆盖区**（验证 Review Focus 第 1 条）：拼在最后只是必要条件，能否覆盖取决于 Tailwind 的发射顺序，拿不准就用 `!`。
  - 不加 `!` 且**生效**：`primary` + `rounded-none` → 圆角 `0px`（内置 `rounded-ef` 是 `4px`）；`primary` + `bg-danger` → `rgb(220, 38, 38)`（内置 `bg-accent` 是 `rgb(242, 204, 0)`）。
  - 不加 `!` 且**不生效**（同一个 class，换个组件就输）：`secondary`/`ghost` + `bg-danger` → 仍是透明（`bg-transparent` 后发射）；`Chip` + `bg-danger` → 仍是 `rgb(245, 245, 245)`（`bg-surface-muted` 后发射）；`Chip` + `rounded-none` → 仍是 `6px`（`rounded-pill` 后发射）；`primary` + `p-8` → 内边距仍是 `8px/16px`（`px-4`/`py-2` 后发射）。
  - 加 `!` 后**全部生效**：`p-8!` → `32px`；`secondary` + `bg-danger!` → `rgb(220, 38, 38)`；`Chip` + `bg-danger!` → `rgb(220, 38, 38)`；`Chip` + `rounded-none!` → `0px`。
  - 以上不生效的用例是 Tailwind 规范发射顺序的预期结果，**不是缺陷**；这正是「拿不准就用 `!`」的原因。
- 切换系统深色模式，全部组件配色正确。

- [ ] **Step 10: 验证受控模式可用**

在探针里把 `Checkbox`、`Switch`、`Input` 各加一个受控版本（用 `useState` 驱动 `checked` / `value` 与 `onChange`），确认点击与输入都有反应、状态同步更新。这一步覆盖 Review Focus 第 5 条。核对后删除受控测试代码。

- [ ] **Step 11: 构建验证并提交**

Run: `cd endfield/react && npm run build`
Expected: `tsc --noEmit` 与 `vite build` 均通过。

```bash
cd "F:/AiWorkspace/KimiCode/public"
git add endfield/react/src/components endfield/react/src/index.ts endfield/react/src/main.tsx
git commit -m "feat(endfield-react): 加入图标与原子组件（按钮/表单/徽标/开关等）"
```

---

### Task 3: 结构组件

**Files:**
- Create: `endfield/react/src/components/Panel.tsx`
- Create: `endfield/react/src/components/SectionHeader.tsx`
- Create: `endfield/react/src/components/Card.tsx`（Card / ItemCard / StatCard / Stat）
- Create: `endfield/react/src/components/Callout.tsx`
- Create: `endfield/react/src/components/Table.tsx`
- Create: `endfield/react/src/components/Timeline.tsx`
- Create: `endfield/react/src/components/Accordion.tsx`
- Create: `endfield/react/src/components/Nav.tsx`（Breadcrumb / Pagination / FilterRow / InfoGrid / TOC）
- Modify: `endfield/react/src/index.ts`

**Interfaces:**
- Consumes: Task 1（`cx`；`@theme` 颜色与圆角工具类；`@utility`：`chamfer`、`chamfer-sm`、`corner-frame`、`corner-frame-all`、`hatch`、`hatch-soft`、`hatch-accent`、`scanline`、`grid-backdrop`、`industrial-shell`、`top-signal-strip`、`tier-strip`、`skeleton-sweep`；以及 `[data-tier="1"]`…`[data-tier="6"]` 属性映射）、Task 2（`Badge`、`Tier`、`Button`）
- Produces:
  - `Panel`、`PanelHeader`、`PanelTitle`、`PanelBody`、`PanelFooter`
  - `SectionHeader`（`{ eyebrow?: string; title: ReactNode; actions?: ReactNode }`）
  - `Card`、`CardMedia`、`CardBody`、`CardTitle`、`CardMeta`
  - `ItemCard`（`{ tier?: Tier; index?: string; name: string; sub?: string; icons?: ReactNode; media?: ReactNode; href?: string }`）
  - `Stat`（`{ value: ReactNode; label: string; sub?: string }`）
  - `StatCard`（`{ icon?: ReactNode; value: ReactNode; label: string; glow?: boolean }`）
  - `Callout`（`{ variant?: 'info'|'warn'|'danger'|'success'; title?: string }`）
  - `Table`、`THead`、`TBody`、`TR`、`TH`（`{ sort?: 'asc'|'desc'; onSort?: () => void }`）、`TD`
  - `Timeline`、`TimelineItem`（`{ time: string; dateTime?: string; accent?: boolean }`）
  - `Accordion`、`AccordionItem`（`{ title: string; defaultOpen?: boolean }`）
  - `Breadcrumb`（`{ items: Array<{ label: string; href?: string }> }`）
  - `Pagination`（`{ page: number; total: number; onChange?: (p: number) => void }`）
  - `FilterRow`（`{ label: string; children: ReactNode }`）
  - `InfoGrid`（`{ items: Array<{ key: string; value: ReactNode }> }`）
  - `TOC`（`{ items: Array<{ id: string; label: string; sub?: boolean }>; activeId?: string }`）

- [ ] **Step 1: 写 Panel 与 SectionHeader**

创建 `endfield/react/src/components/Panel.tsx`：

```tsx
import type { HTMLAttributes } from 'react';
import { cx } from '../lib/cx';

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  /** 加四角括号装饰。 */
  cornerFrame?: boolean;
}

export function Panel({ cornerFrame = false, className, children, ...rest }: PanelProps) {
  return (
    <div
      className={cx(
        'border border-border bg-surface',
        cornerFrame && 'corner-frame-all',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function PanelHeader({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'flex items-center gap-3 border-b border-border bg-surface-muted px-4 py-3',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function PanelTitle({ className, children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cx('m-0 font-display text-base font-semibold', className)} {...rest}>
      {children}
    </h2>
  );
}

export function PanelBody({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx('p-4', className)} {...rest}>
      {children}
    </div>
  );
}

export function PanelFooter({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'flex items-center gap-2 border-t border-border bg-surface-muted px-4 py-3',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
```

创建 `endfield/react/src/components/SectionHeader.tsx`：

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../lib/cx';

/* Omit 掉 `title`：`HTMLAttributes` 的 `title?: string`（原生提示文本）与这里的
   `title: ReactNode`（区块标题）同名不同义，不 Omit 会 TS2430。 */
export interface SectionHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  eyebrow?: string;
  title: ReactNode;
  actions?: ReactNode;
}

export function SectionHeader({
  eyebrow,
  title,
  actions,
  className,
  ...rest
}: SectionHeaderProps) {
  return (
    <div
      className={cx(
        'mb-4 flex flex-wrap items-end gap-4 border-b border-border pb-3',
        className,
      )}
      {...rest}
    >
      <div className="min-w-0 flex-1">
        {eyebrow ? (
          <span className="mb-0.5 block font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
            {'// '}
            {eyebrow}
          </span>
        ) : null}
        <h2 className="m-0 flex items-center gap-3 font-display text-xl font-bold">
          <span aria-hidden="true" className="h-[1.1em] w-[3px] shrink-0 bg-accent-ink" />
          {title}
        </h2>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
```

- [ ] **Step 2: 写卡片族**

创建 `endfield/react/src/components/Card.tsx`：

```tsx
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../lib/cx';
import type { Tier } from './Badge';

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx('flex flex-col overflow-hidden border border-border bg-surface-raised', className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardMedia({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx('aspect-video overflow-hidden bg-surface-muted', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx('flex min-w-0 flex-col gap-1 px-4 pb-4 pt-3', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cx('m-0 text-base font-semibold [overflow-wrap:anywhere]', className)} {...rest}>
      {children}
    </h3>
  );
}

export function CardMeta({ className, children, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cx('m-0 text-xs text-ink-subtle', className)} {...rest}>
      {children}
    </p>
  );
}

/* 同时 Omit 掉 children 与 media：`AnchorHTMLAttributes` 已声明
   `media?: string`（媒体查询描述符），与本卡片的 `media?: ReactNode`（图上内容）
   同名不同义，不 Omit 会 TS2430。 */
export interface ItemCardProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'media'> {
  name: string;
  sub?: string;
  /** 图上角的水印编号，如 "01"。 */
  index?: string;
  tier?: Tier;
  icons?: ReactNode;
  media?: ReactNode;
}

/** 数据卡：图像 + 名称 + 英文副名 + 图标组 + 底部分级条。强制直角。 */
export function ItemCard({
  name,
  sub,
  index,
  tier,
  icons,
  media,
  className,
  style,
  ...rest
}: ItemCardProps) {
  return (
    <a
      className={cx(
        'flex flex-col overflow-hidden rounded-none border border-border bg-surface-raised',
        'text-inherit no-underline transition duration-150',
        'hover:-translate-y-0.5 hover:border-accent-ink',
        className,
      )}
      /* 等级用 data-tier 属性而非内联样式（规格 §5.12）：属性由 tailwind.css 的
         [data-tier="N"] 规则产出 --ef-tier-color 与 --ef-tier-ink，
         子元素 .tier-strip 从祖先继承前者。 */
      data-tier={tier !== undefined ? String(tier) : undefined}
      style={style}
      {...rest}
    >
      <div className="relative aspect-square overflow-hidden bg-surface-muted">
        {index ? (
          <span className="absolute left-2 top-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-subtle">
            # {index}
          </span>
        ) : null}
        {media}
      </div>
      <div className="flex min-w-0 items-center gap-2 px-3 py-2">
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold [overflow-wrap:anywhere]">{name}</span>
          {sub ? (
            <span className="block font-mono text-[10px] tracking-wide text-ink-subtle [overflow-wrap:anywhere]">
              {sub}
            </span>
          ) : null}
        </span>
        {icons ? <span className="flex shrink-0 items-center gap-1">{icons}</span> : null}
      </div>
      <div className="tier-strip mt-auto" />
    </a>
  );
}

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  value: ReactNode;
  label: string;
  sub?: string;
}

export function Stat({ value, label, sub, className, ...rest }: StatProps) {
  return (
    <div className={cx('flex flex-col items-center gap-0.5 text-center', className)} {...rest}>
      <span className="font-mono text-3xl font-bold leading-none tabular-nums text-accent-ink">
        {value}
      </span>
      <span className="text-sm font-medium text-ink">{label}</span>
      {sub ? (
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-subtle">
          {sub}
        </span>
      ) : null}
    </div>
  );
}

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  value: ReactNode;
  label: string;
  /** 加内阴影辉光。 */
  glow?: boolean;
}

export function StatCard({
  icon,
  value,
  label,
  glow = false,
  className,
  ...rest
}: StatCardProps) {
  return (
    <div
      className={cx(
        'flex items-center gap-3 border border-border bg-surface-raised p-4',
        glow && 'shadow-[inset_0_0_20px_-4px_color-mix(in_srgb,var(--ef-accent-glow)_60%,transparent)]',
        className,
      )}
      {...rest}
    >
      {icon ? (
        <span className="chamfer-sm inline-flex size-10 shrink-0 items-center justify-center bg-surface-muted text-accent-ink">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0">
        <span className="block font-mono text-2xl font-bold leading-tight tabular-nums">
          {value}
        </span>
        <span className="block text-xs text-ink-muted">{label}</span>
      </span>
    </div>
  );
}
```

- [ ] **Step 3: 写 Callout、Table、Timeline、Accordion**

创建 `endfield/react/src/components/Callout.tsx`：

```tsx
import type { HTMLAttributes } from 'react';
import { cx } from '../lib/cx';

export type CalloutVariant = 'info' | 'warn' | 'danger' | 'success';

export interface CalloutProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CalloutVariant;
  title?: string;
}

/* 每个变体同时给出原色与 ink 色（对齐 css/components.css:1014-1041）：
   7% tint 背景用原色，3px 左边框与标题文字必须用 ink ——
   原色做文字在其自身 tint 上亮色主题仅 2.00–4.34:1。 */
const VARIANT: Record<CalloutVariant, string> = {
  info: '[--ef-callout-color:var(--ef-info)] [--ef-callout-ink:var(--ef-info-ink)]',
  warn: '[--ef-callout-color:var(--ef-warn)] [--ef-callout-ink:var(--ef-warn-ink)]',
  danger: '[--ef-callout-color:var(--ef-danger)] [--ef-callout-ink:var(--ef-danger-ink)]',
  success: '[--ef-callout-color:var(--ef-success)] [--ef-callout-ink:var(--ef-success-ink)]',
};

export function Callout({
  variant = 'info',
  title,
  className,
  children,
  ...rest
}: CalloutProps) {
  return (
    <div
      className={cx(
        'my-4 flex gap-3 border border-border border-l-[3px] px-4 py-3 text-sm',
        'border-l-[var(--ef-callout-ink,var(--ef-callout-color))]',
        'bg-[color-mix(in_srgb,var(--ef-callout-color)_7%,var(--ef-surface))]',
        VARIANT[variant],
        className,
      )}
      {...rest}
    >
      <div className="min-w-0">
        {title ? (
          <span className="mb-0.5 block font-mono text-xs uppercase tracking-[0.12em] text-[var(--ef-callout-ink,var(--ef-callout-color))]">
            {title}
          </span>
        ) : null}
        {children}
      </div>
    </div>
  );
}
```

创建 `endfield/react/src/components/Table.tsx`：

```tsx
import type {
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react';
import { cx } from '../lib/cx';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /** 外层包一层可横向滚动的容器，宽表在窄屏可用。 */
  scrollable?: boolean;
}

export function Table({ scrollable = true, className, children, ...rest }: TableProps) {
  const table = (
    <table
      className={cx('w-full border border-border text-sm', className)}
      {...rest}
    >
      {children}
    </table>
  );
  if (!scrollable) return table;
  return <div className="overflow-x-auto">{table}</div>;
}

export function THead({ className, children, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={className} {...rest}>
      {children}
    </thead>
  );
}

export function TBody({ className, children, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={className} {...rest}>
      {children}
    </tbody>
  );
}

/* 悬停底色只给表体行（对齐 css/components.css:1105 的 `.ef-table tbody tr:hover`）：
   表头行也是 <tr>，不加 tbody 限定会连表头一起高亮。
   最后一行的单元格去掉下边框（对齐 css/components.css:1101 的
   `.ef-table tbody tr:last-child td`）—— 不能用 `last:border-b-0`，
   那个 `:last-child` 落在「每行的最后一个单元格」上，会把每一行最右列的
   分隔线都抹掉。 */
export function TR({ className, children, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cx('[tbody_&]:hover:bg-surface-muted', '[&:last-child>td]:border-b-0', className)}
      {...rest}
    >
      {children}
    </tr>
  );
}

export interface THProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /** 提供 onSort 时渲染为可排序按钮，并设置 aria-sort。 */
  onSort?: () => void;
  sort?: 'asc' | 'desc';
}

export function TH({ onSort, sort, className, children, ...rest }: THProps) {
  const base = cx(
    'border-b border-border bg-surface-sunken px-3 py-2 text-left',
    'font-mono text-xs font-medium uppercase tracking-[0.12em] text-ink-muted whitespace-nowrap',
    className,
  );
  if (!onSort) {
    return (
      <th scope="col" className={base} {...rest}>
        {children}
      </th>
    );
  }
  return (
    <th
      scope="col"
      aria-sort={sort === 'asc' ? 'ascending' : sort === 'desc' ? 'descending' : 'none'}
      className={base}
      {...rest}
    >
      <button
        type="button"
        onClick={onSort}
        className={cx(
          'inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0',
          'font-[inherit] tracking-[inherit] uppercase',
          'hover:text-ink',
          sort && 'after:text-accent-ink',
          sort === 'asc' && 'after:content-["▲"]',
          sort === 'desc' && 'after:content-["▼"]',
        )}
      >
        {children}
      </button>
    </th>
  );
}

export function TD({ className, children, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cx(
        'border-b border-border px-3 py-2 [overflow-wrap:anywhere]',
        className,
      )}
      {...rest}
    >
      {children}
    </td>
  );
}
```

创建 `endfield/react/src/components/Timeline.tsx`：

```tsx
import type { AnchorHTMLAttributes, HTMLAttributes } from 'react';
import { cx } from '../lib/cx';

export function Timeline({ className, children, ...rest }: HTMLAttributes<HTMLOListElement>) {
  return (
    <ol
      className={cx(
        'relative m-0 list-none pl-6',
        'before:absolute before:bottom-1.5 before:left-[5px] before:top-1.5 before:w-px before:bg-border',
        className,
      )}
      {...rest}
    >
      {children}
    </ol>
  );
}

export interface TimelineItemProps extends HTMLAttributes<HTMLLIElement> {
  time: string;
  dateTime?: string;
  /** 重点修订：节点用主色。 */
  accent?: boolean;
}

export function TimelineItem({
  time,
  dateTime,
  accent = false,
  className,
  children,
  ...rest
}: TimelineItemProps) {
  return (
    <li
      className={cx(
        'relative pb-5',
        // 节点为 9×9、切角 3px、位置 left: calc(-1 * var(--ef-space-6) + 1px)、top: 5px
        // （对齐 css/components.css:1166-1182）。chamfer 的尺寸回退写在 var() 里，
        // 故可用 [--ef-chamfer-size:3px] 覆盖。
        'before:absolute before:left-[calc(-1*var(--ef-space-6)+1px)] before:top-[5px]',
        'before:size-[9px] before:chamfer before:[--ef-chamfer-size:3px]',
        accent ? 'before:bg-accent-ink' : 'before:bg-border-strong',
        className,
      )}
      {...rest}
    >
      <time
        dateTime={dateTime}
        className="mb-0.5 block font-mono text-xs text-ink-subtle"
      >
        {time}
      </time>
      <div className="text-sm">{children}</div>
    </li>
  );
}

/* TimelineTitle 渲染的是 <a>，props 必须用 AnchorHTMLAttributes 才能接受 href。
   HTMLAttributes<HTMLAnchorElement> 里没有 href，DataSection 的
   `<TimelineTitle href="#data">` 会报 TS2322。 */
export function TimelineTitle({
  className,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={cx('font-semibold [overflow-wrap:anywhere]', className)} {...rest}>
      {children}
    </a>
  );
}
```

创建 `endfield/react/src/components/Accordion.tsx`：

```tsx
import type { DetailsHTMLAttributes, HTMLAttributes } from 'react';
import { cx } from '../lib/cx';

/* 两个组件都透传原生属性与 className（全局约束）：Accordion 的 props 是
   HTMLAttributes<HTMLDivElement> 类型别名，AccordionItem 渲染 <details>，
   故 extends 元素专用的 DetailsHTMLAttributes —— 它比 HTMLAttributes 多出
   open / onToggle / name（原生独占分组）。与库内其余组件的惯例一致
   （ButtonHTMLAttributes、InputHTMLAttributes、TableHTMLAttributes 等）。
   注意 title 这里是 `string`，与原生 `title?: string` 兼容（string 可赋给
   string | undefined），故无需 Omit —— 与 SectionHeader 的 `title: ReactNode`
   不同，后者不 Omit 会 TS2430。 */
export type AccordionProps = HTMLAttributes<HTMLDivElement>;

/** 用原生 <details>，无 JavaScript 时仍可展开。 */
export function Accordion({ className, children, ...rest }: AccordionProps) {
  return (
    <div className={cx('border border-border', className)} {...rest}>
      {children}
    </div>
  );
}

export interface AccordionItemProps extends DetailsHTMLAttributes<HTMLDetailsElement> {
  title: string;
  defaultOpen?: boolean;
}

export function AccordionItem({
  title,
  defaultOpen = false,
  className,
  children,
  ...rest
}: AccordionItemProps) {
  return (
    <details
      open={defaultOpen}
      className={cx(
        'border-b border-border last:border-b-0',
        '[&:not([open])>summary]:before:-rotate-90',
        className,
      )}
      {...rest}
    >
      <summary
        className={cx(
          'flex cursor-pointer list-none items-center gap-2 px-4 py-3',
          'text-sm font-medium hover:bg-surface-muted',
          '[&::-webkit-details-marker]:hidden',
          'before:text-accent-ink before:content-["▾"] before:transition-transform before:duration-150',
        )}
      >
        {title}
      </summary>
      <div className="px-4 pb-4 text-sm text-ink-muted">{children}</div>
    </details>
  );
}
```

注意：`AccordionItem` 用 `DetailsHTMLAttributes<HTMLDetailsElement>` 而非
`HTMLAttributes<HTMLDetailsElement>`。后者缺 `open`、`onToggle`、`name` 三个
`<details>` 专有属性，用它做基底会让使用方无法传 `onToggle`（观察展开状态的
惯用方式）或 `name`（原生独占分组）。用元素专用接口是本库的既有惯例。

`title: string` 与原生 `title?: string` 兼容（`string` 可赋给 `string | undefined`），
故这里**无需 `Omit`** —— 与 `SectionHeader` 的情况不同：那个组件的
`title: ReactNode` 不能赋给 `string | undefined`，不 `Omit` 才会 TS2430。

关闭态箭头需要 `-rotate-90`。Tailwind 无法直接选择「details 未打开」的伪元素，
故在 `<details>` 上挂 `[&:not([open])>summary]:before:-rotate-90` 变体类
（已含在上面的代码块里），`summary` 上不再写 `open:before:rotate-0`。

- [ ] **Step 4: 写导航类组件**

创建 `endfield/react/src/components/Nav.tsx`：

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../lib/cx';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items, className, ...rest }: BreadcrumbProps) {
  return (
    <nav aria-label="面包屑" className={className} {...rest}>
      <ol className="m-0 mb-2 flex list-none flex-wrap items-center gap-2 p-0 font-mono text-xs text-ink-subtle">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-2">
            {i > 0 ? <span aria-hidden="true" className="text-border-strong">/</span> : null}
            {item.href ? (
              <a href={item.href} className="text-ink-muted no-underline hover:text-accent-ink">
                {item.label}
              </a>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* Omit 掉 `onChange`：`HTMLAttributes` 的 `onChange?: FormEventHandler`（原生事件）
   与这里的 `onChange?: (page: number) => void`（页码回调）签名不兼容，不 Omit 会 TS2430。 */
export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  page: number;
  total: number;
  onChange?: (page: number) => void;
  /** 两侧各显示多少页。 */
  siblings?: number;
}

export function Pagination({
  page,
  total,
  onChange,
  siblings = 1,
  className,
  ...rest
}: PaginationProps) {
  const pages: number[] = [];
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - page) <= siblings) pages.push(p);
  }

  const linkClass = cx(
    'inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-none',
    'border border-border bg-surface-raised px-2 font-mono text-sm tabular-nums text-ink-muted',
    'hover:border-border-strong hover:text-ink',
    'aria-[current=page]:border-accent-strong aria-[current=page]:bg-accent',
    'aria-[current=page]:font-semibold aria-[current=page]:text-accent-fg',
    'disabled:pointer-events-none disabled:opacity-40',
  );

  let last = 0;

  return (
    <nav aria-label="分页" className={cx('mt-6 flex flex-wrap items-center gap-1', className)} {...rest}>
      <button
        type="button"
        className={linkClass}
        disabled={page <= 1}
        onClick={() => onChange?.(page - 1)}
      >
        上一页
      </button>

      {pages.map((p) => {
        const gap = p - last > 1 && last !== 0;
        last = p;
        return (
          <span key={p} className="flex items-center gap-1">
            {gap ? <span className="px-1 text-ink-subtle">…</span> : null}
            <button
              type="button"
              aria-current={p === page ? 'page' : undefined}
              className={linkClass}
              onClick={() => onChange?.(p)}
            >
              {p}
            </button>
          </span>
        );
      })}

      <button
        type="button"
        className={linkClass}
        disabled={page >= total}
        onClick={() => onChange?.(page + 1)}
      >
        下一页
      </button>
    </nav>
  );
}

export interface FilterRowProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
}

export function FilterRow({ label, className, children, ...rest }: FilterRowProps) {
  return (
    <div
      className={cx(
        'flex flex-col gap-2 border-b border-border py-2 last:border-b-0',
        'sm:flex-row sm:items-start sm:gap-4',
        className,
      )}
      {...rest}
    >
      <span className="shrink-0 pt-1 text-sm text-ink-muted sm:w-22">{label}</span>
      <div className="flex min-w-0 flex-1 flex-wrap gap-2">{children}</div>
    </div>
  );
}

export interface InfoGridItem {
  key: string;
  value: ReactNode;
}

export interface InfoGridProps extends HTMLAttributes<HTMLDListElement> {
  items: InfoGridItem[];
}

export function InfoGrid({ items, className, ...rest }: InfoGridProps) {
  return (
    <dl
      className={cx('grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3 text-sm', className)}
      {...rest}
    >
      {items.map((item) => (
        <div key={item.key} className="contents">
          <dt className="m-0 font-mono text-xs tracking-wide text-ink-subtle">{item.key}</dt>
          <dd className="m-0 font-semibold [overflow-wrap:anywhere]">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export interface TOCItem {
  id: string;
  label: string;
  /** 二级条目，缩进显示。 */
  sub?: boolean;
}

export interface TOCProps extends HTMLAttributes<HTMLElement> {
  items: TOCItem[];
  activeId?: string;
  title?: string;
}

export function TOC({ items, activeId, title = '本页目录', className, ...rest }: TOCProps) {
  return (
    /* sticky 与偏移对齐 css/components.css:1643-1645 的 .ef-toc
       （top = header-bar-h + space-4 = 56px + 16px = 72px）。 */
    <nav
      aria-label={title}
      className={cx('sticky top-[calc(var(--ef-header-bar-h)+var(--ef-space-4))] text-sm', className)}
      {...rest}
    >
      <p className="m-0 mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
        {title}
      </p>
      <ul className="m-0 list-none border-l border-border p-0">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={item.id === activeId ? 'location' : undefined}
              className={cx(
                'block border-l-2 border-transparent py-1 no-underline',
                item.sub ? 'pl-6 text-xs' : 'pl-3',
                item.id === activeId
                  ? 'border-l-accent-ink font-medium text-ink'
                  : 'text-ink-muted hover:text-ink',
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 5: 更新导出**

把 `endfield/react/src/index.ts` 追加（保留 Task 2 的内容）：

```ts
export { Panel, PanelHeader, PanelTitle, PanelBody, PanelFooter } from './components/Panel';
export type { PanelProps } from './components/Panel';
export { SectionHeader } from './components/SectionHeader';
export type { SectionHeaderProps } from './components/SectionHeader';
export { Card, CardMedia, CardBody, CardTitle, CardMeta, ItemCard, Stat, StatCard } from './components/Card';
export type { ItemCardProps, StatProps, StatCardProps } from './components/Card';
export { Callout } from './components/Callout';
export type { CalloutProps, CalloutVariant } from './components/Callout';
export { Table, THead, TBody, TR, TH, TD } from './components/Table';
export type { TableProps, THProps } from './components/Table';
export { Timeline, TimelineItem, TimelineTitle } from './components/Timeline';
export type { TimelineItemProps } from './components/Timeline';
export { Accordion, AccordionItem } from './components/Accordion';
export type { AccordionProps, AccordionItemProps } from './components/Accordion';
export { Breadcrumb, Pagination, FilterRow, InfoGrid, TOC } from './components/Nav';
export type {
  BreadcrumbProps,
  BreadcrumbItem,
  PaginationProps,
  FilterRowProps,
  InfoGridProps,
  InfoGridItem,
  TOCProps,
  TOCItem,
} from './components/Nav';
```

- [ ] **Step 6: 类型检查**

Run: `cd endfield/react && npx tsc --noEmit`
Expected: 零错误。

- [ ] **Step 7: 临时页面实测**

把 `endfield/react/src/main.tsx` 临时替换为渲染 Task 3 全部组件的探针（`Panel` + `PanelHeader` + `PanelBody`、`SectionHeader`、`Card`、6 张不同 tier 的 `ItemCard`、`Stat` 组、4 个 `StatCard`（其一带 `glow`）、4 种 `Callout`、`Table`（含一个 `onSort` 表头）、`Timeline`（5 项，其一 `accent`）、`Accordion`（3 项）、`Breadcrumb`、`Pagination`（`page={3} total={10}`）、`FilterRow` + `ChipGroup`、`InfoGrid`（6 项）、`TOC`（5 项，其一带 `sub` 且 `activeId` 命中）。

Run: `cd endfield/react && npm run dev`
Expected: 核对：

- 区块头 eyebrow 以 `//` 开头，标题左侧有主色竖条。
- 6 张条目卡的底部分级条颜色随 `tier` 变化；悬停上浮且描边变主色。
- `Stat` 数值为主色等宽大字；带 `glow` 的 `StatCard` 有内阴影。
- 4 种 `Callout` 的左侧色条与标题色依次为蓝、橙、红、青。
- 表格表头为凹陷底 + 等宽大写小字；可排序表头显示箭头且 `aria-sort` 正确。
- 时间线节点为切角小方块，`accent` 项为主色。
- 折叠面板用 `<details>`，**点击可展开**；关闭态箭头指向右，展开态指向下。
- `Pagination` 当前页为主色实底；点「下一页」时 `onChange` 触发（在探针里用 `useState` 接住并打印）。
- `TOC` 的 `activeId` 项有主色左边框。
- 切换深色模式配色正确。

- [ ] **Step 8: 构建验证并提交**

Run: `cd endfield/react && npm run build`
Expected: 通过。

```bash
cd "F:/AiWorkspace/KimiCode/public"
git add endfield/react/src/components endfield/react/src/index.ts endfield/react/src/main.tsx
git commit -m "feat(endfield-react): 加入结构组件（面板/卡片/表格/时间线/导航等）"
```

---

### Task 4: 交互组件

**Files:**
- Create: `endfield/react/src/components/Modal.tsx`
- Create: `endfield/react/src/components/Drawer.tsx`
- Create: `endfield/react/src/components/Dropdown.tsx`
- Create: `endfield/react/src/components/Tabs.tsx`
- Create: `endfield/react/src/components/Toast.tsx`
- Create: `endfield/react/src/components/ThemeToggle.tsx`
- Create: `endfield/react/src/hooks/useTheme.ts`
- Create: `endfield/react/src/hooks/useFocusTrap.ts`
- Modify: `endfield/react/src/index.ts`

**Interfaces:**
- Consumes: Task 1–3
- Produces:
  - `useTheme(): { theme: 'light'|'dark'|'system'; setTheme(t): void; cycle(): void }`
  - `useFocusTrap(active: boolean): RefObject<HTMLDivElement>`
  - `ThemeToggle`（无 props，自包含三态循环按钮）
  - `Modal`（`{ open: boolean; onClose: () => void; title: string; footer?: ReactNode; children: ReactNode }`）
  - `Drawer`（`{ open: boolean; onClose: () => void; title: string; children: ReactNode; side?: 'left'|'right' }`）
  - `Dropdown`（`{ trigger: ReactNode; children: ReactNode; align?: 'left'|'right' }`）、`DropdownItem`
  - `Tabs`（`{ items: Array<{ id: string; label: string; content: ReactNode }>; value?: string; onChange?: (id: string) => void; defaultValue?: string }`）
  - `ToastProvider`、`useToast(): (message: string, variant?: 'info'|'success'|'warn'|'danger') => void`

- [ ] **Step 1: 写主题 hook 与切换按钮**

创建 `endfield/react/src/hooks/useTheme.ts`：

```ts
import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

const KEY = 'ef-theme';
const ORDER: Theme[] = ['system', 'light', 'dark'];

function read(): Theme {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
  } catch {
    return 'system';
  }
}

/**
 * 三态主题。system 时不写 data-theme，交给 CSS 媒体查询。
 * 首帧读取在 useState 初始化里完成，避免闪烁。
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(read);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      root.removeAttribute('data-theme');
      root.style.colorScheme = '';
    } else {
      root.setAttribute('data-theme', theme);
      root.style.colorScheme = theme;
    }
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* 隐私模式下写入失败，本次会话仍然生效 */
    }
  }, [theme]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);

  const cycle = useCallback(() => {
    setThemeState((prev) => {
      const next = ORDER[(ORDER.indexOf(prev) + 1) % ORDER.length];
      return next ?? 'system';
    });
  }, []);

  return { theme, setTheme, cycle };
}

export const THEME_LABEL: Record<Theme, string> = {
  system: '跟随系统',
  light: '浅色',
  dark: '深色',
};
```

创建 `endfield/react/src/components/ThemeToggle.tsx`：

```tsx
import { IconMonitor, IconMoon, IconSun } from './icons';
import { IconButton } from './Button';
import { THEME_LABEL, useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { theme, cycle } = useTheme();
  const Icon = theme === 'light' ? IconSun : theme === 'dark' ? IconMoon : IconMonitor;
  const next = theme === 'system' ? '浅色' : theme === 'light' ? '深色' : '跟随系统';

  return (
    <IconButton label={`主题：${THEME_LABEL[theme]}，点击切换为${next}`} onClick={cycle}>
      <Icon />
    </IconButton>
  );
}
```

- [ ] **Step 2: 写焦点陷阱 hook**

创建 `endfield/react/src/hooks/useFocusTrap.ts`：

```ts
import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * 在容器内循环焦点，并支持 Esc 关闭。
 * 激活时把焦点移入容器，退出时归还给此前聚焦的元素。
 *
 * 返回 `RefObject<HTMLDivElement>`（不是 `RefObject<HTMLDivElement | null>`）：
 * `@types/react` 18.3 里 `ref` prop 要的是 `LegacyRef<T>`，其中的 `RefObject<T>`
 * 是 `readonly current: T | null`。显式把 null 写进类型实参会得到
 * `RefObject<HTMLDivElement | null>`，与 `RefObject<HTMLDivElement>` 不兼容，
 * 传给 `ref` 会报 TS2322。`useRef<HTMLDivElement>(null)` 已经隐含 `| null`，
 * 无需再写；运行时逻辑完全不变（`ref.current` 仍可能为 null，下方已判空）。
 */
export function useFocusTrap(
  active: boolean,
  onEscape?: () => void,
): RefObject<HTMLDivElement> {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;

    const previous = document.activeElement as HTMLElement | null;
    const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null,
    );
    (items[0] ?? container).focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }
      if (e.key !== 'Tab') return;

      const list = Array.from(container!.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );
      if (list.length === 0) return;
      const first = list[0]!;
      const last = list[list.length - 1]!;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      previous?.focus?.();
    };
  }, [active, onEscape]);

  return ref;
}
```

- [ ] **Step 3: 写 Modal 与 Drawer**

创建 `endfield/react/src/components/Modal.tsx`：

> 本步骤用到的 `corner-frame-all` `@utility` 与 `ef-corner-in`、`ef-drawer-in`、`ef-drawer-in-left` 关键帧**均已在 Task 1 Step 5 声明在 `src/styles/tailwind.css`**，此处只消费，**不要重复声明**（关键帧形状见本步骤末尾）。

```tsx
import { useCallback, useId, type ReactNode } from 'react';
import { cx } from '../lib/cx';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { IconButton } from './Button';
import { IconClose } from './icons';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, footer, children, className }: ModalProps) {
  const close = useCallback(() => onClose(), [onClose]);
  const panelRef = useFocusTrap(open, close);
  const titleId = useId();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 遮罩是明暗两主题下都要压暗背景，不随主题变化，故用固定 rgb(0 0 0 / 60%)
          （对齐 css/components.css:1371）—— 它是本库唯一的**与主题无关**的颜色字面量。
          库中另有几处字面量，都只在 CSS 层本身就写死的地方出现，且各自就近注释：
          危险按钮的白色前景（css/components.css:99）、Select 箭头 SVG 的描边色
          （css/components.css:249，数据 URI 读不到 CSS 变量），以及 Checkbox 选中态
          数据 URI 里的勾形描边 #111827 与斜纹 rgb(0 0 0 / 18%)
          （css/components.css:321-338）—— 后两者同样因为处在数据 URI 内而无法引用
          CSS 变量，且与 CSS 层逐字节一致，属同一类已认可的例外。 */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={close}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cx(
          // 面板宽度与四角括号对齐 css/components.css:1377 与 index.html:1461。
          'corner-frame-all relative flex max-h-[85vh] w-full max-w-[34rem] flex-col',
          'border border-border bg-surface-raised',
          'animate-[ef-corner-in_0.25s_var(--ef-ease-out-quint)_both]',
          className,
        )}
      >
        <div className="flex items-center gap-3 border-b border-border bg-surface-muted px-4 py-3">
          <h2 id={titleId} className="m-0 flex-1 font-display text-lg font-semibold">
            {title}
          </h2>
          <IconButton label="关闭" onClick={close}>
            <IconClose />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer ? (
          <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
```

创建 `endfield/react/src/components/Drawer.tsx`：

```tsx
import { useCallback, useId, type ReactNode } from 'react';
import { cx } from '../lib/cx';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { IconButton } from './Button';
import { IconClose } from './icons';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: 'left' | 'right';
  children: ReactNode;
  className?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  side = 'right',
  children,
  className,
}: DrawerProps) {
  const close = useCallback(() => onClose(), [onClose]);
  const panelRef = useFocusTrap(open, close);
  const titleId = useId();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* 遮罩固定 rgb(0 0 0 / 60%)，与主题无关（对齐 css/components.css:1371）。 */}
      <div className="absolute inset-0 bg-black/60" onClick={close} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cx(
          'absolute inset-y-0 flex w-[min(24rem,92vw)] flex-col',
          'border-border bg-surface-raised',
          // 右侧抽屉的关键帧对齐 css/components.css:1429-1435。
          // 左侧抽屉 CSS 层没有实现（.ef-drawer 只做右侧），
          // ef-drawer-in-left 由 tailwind.css 为 React 层补充声明。
          side === 'right'
            ? 'right-0 border-l animate-[ef-drawer-in_0.25s_var(--ef-ease-out-quint)_both]'
            : 'left-0 border-r animate-[ef-drawer-in-left_0.25s_var(--ef-ease-out-quint)_both]',
          className,
        )}
      >
        <div className="flex items-center gap-3 border-b border-border bg-surface-muted px-4 py-3">
          <h2 id={titleId} className="m-0 flex-1 font-display text-lg font-semibold">
            {title}
          </h2>
          <IconButton label="关闭" onClick={close}>
            <IconClose />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
```

`Drawer` 用到的两个关键帧**已在 Task 1 Step 5 声明在 `src/styles/tailwind.css`**（`ef-drawer-in` 与 `ef-drawer-in-left`），此处只需确认它们存在，**不要重复声明**。应已存在的形状如下：

```css
@keyframes ef-drawer-in {
  from { transform: translateX(100%); }
  to   { transform: none; }
}

@keyframes ef-drawer-in-left {
  from { transform: translateX(-100%); }
  to   { transform: none; }
}
```

- [ ] **Step 4: 写 Dropdown**

创建 `endfield/react/src/components/Dropdown.tsx`：

```tsx
import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cx } from '../lib/cx';

export interface DropdownProps {
  /** 触发器元素，会被注入 onClick / aria-expanded。 */
  trigger: ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, children, align = 'right', className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const triggerWithProps = isValidElement(trigger)
    ? cloneElement(trigger, {
        onClick: () => setOpen((v) => !v),
        'aria-haspopup': 'true',
        'aria-expanded': open,
      })
    : trigger;

  return (
    <div ref={rootRef} className={cx('relative inline-block', className)}>
      {triggerWithProps}
      {open ? (
        <div
          role="menu"
          className={cx(
            'absolute top-[calc(100%+4px)] z-60 min-w-48 border border-border',
            'bg-surface-raised p-1 shadow-[0_6px_20px_rgb(0_0_0/25%)]',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export interface DropdownItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
}

export function DropdownItem({ icon, className, children, ...rest }: DropdownItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cx(
        'flex w-full cursor-pointer items-center gap-2 border-0 bg-transparent',
        'px-3 py-2 text-left text-sm text-ink-muted',
        'hover:bg-surface-muted hover:text-ink focus-visible:bg-surface-muted focus-visible:text-ink',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div role="separator" className="my-1 h-px bg-border" />;
}
```

- [ ] **Step 5: 写 Tabs**

创建 `endfield/react/src/components/Tabs.tsx`：

```tsx
import { useId, useRef, useState, type ReactNode } from 'react';
import { cx } from '../lib/cx';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  /** 受控：当前选中项 id。 */
  value?: string;
  /** 非受控：初始选中项 id，默认第一项。 */
  defaultValue?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export function Tabs({ items, value, defaultValue, onChange, className }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.id ?? '');
  const current = value ?? internal;
  const baseId = useId();
  const listRef = useRef<HTMLDivElement | null>(null);

  function select(id: string, focus = false) {
    if (value === undefined) setInternal(id);
    onChange?.(id);
    if (focus) {
      const index = items.findIndex((it) => it.id === id);
      const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      buttons?.[index]?.focus();
    }
  }

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + items.length) % items.length;
    const target = items[next];
    if (target) select(target.id, true);
  }

  return (
    <div className={className}>
      <div
        ref={listRef}
        role="tablist"
        className="flex flex-wrap gap-1 border-b border-border"
      >
        {items.map((item, i) => {
          const selected = item.id === current;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-controls={`${baseId}-panel-${item.id}`}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(item.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cx(
                'cursor-pointer border-0 border-b-2 border-transparent bg-transparent',
                'px-4 py-2 font-mono text-xs uppercase tracking-[0.12em]',
                'transition-colors duration-150',
                // 激活态斜纹用 hatch-accent（主色 22% 斜纹，对齐 css/components.css:1285-1291）。
                // 不用 hatch：它取 currentColor，而此处文字是 text-ink（亮色主题 #000000），
                // 会画出近黑斜纹，与层里的主色斜纹相反。
                selected
                  ? 'border-b-accent-ink text-ink hatch-accent'
                  : 'text-ink-muted hover:text-ink',
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${baseId}-panel-${item.id}`}
          aria-labelledby={`${baseId}-tab-${item.id}`}
          hidden={item.id !== current}
          className="pt-4"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: 写 Toast**

创建 `endfield/react/src/components/Toast.tsx`：

```tsx
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { cx } from '../lib/cx';

export type ToastVariant = 'info' | 'success' | 'warn' | 'danger';

interface ToastRecord {
  id: number;
  message: string;
  variant: ToastVariant;
}

type Push = (message: string, variant?: ToastVariant) => void;

const ToastContext = createContext<Push | null>(null);

/* 与 Callout 同样的 ink 分叉（对齐 css/components.css:1453-1474）：
   3px 左边框用 ink，原色只用于语义标识。
   注意一处有意的分歧：CSS 层没有 --info toast 变体 —— 它的默认 toast 是中性的
   （--ef-toast-color: var(--ef-border-strong)、--ef-toast-ink: var(--ef-ink-muted)，
   css/components.css:1454-1455），而默认 Callout 是信息蓝。React 层把 info 映射到
   信息蓝，以与 Callout 及 4 变体 API 保持一致。这是裁决，不是疏漏。 */
const VARIANT: Record<ToastVariant, string> = {
  info: '[--ef-toast-color:var(--ef-info)] [--ef-toast-ink:var(--ef-info-ink)]',
  success: '[--ef-toast-color:var(--ef-success)] [--ef-toast-ink:var(--ef-success-ink)]',
  warn: '[--ef-toast-color:var(--ef-warn)] [--ef-toast-ink:var(--ef-warn-ink)]',
  danger: '[--ef-toast-color:var(--ef-danger)] [--ef-toast-ink:var(--ef-danger-ink)]',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastRecord[]>([]);

  const push = useCallback<Push>((message, variant = 'info') => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        // 堆叠位置对齐 css/components.css:1442：
        // top = var(--ef-header-bar-h) + var(--ef-space-4) = 56px + 16px = 72px。
        className="pointer-events-none fixed right-4 top-[calc(var(--ef-header-bar-h)+var(--ef-space-4))] z-60 flex flex-col gap-2"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className={cx(
              'pointer-events-auto flex min-w-64 max-w-96 items-start gap-2',
              'border border-border border-l-[3px] border-l-[var(--ef-toast-ink,var(--ef-toast-color))]',
              'bg-surface-raised px-4 py-3 text-sm shadow-[0_6px_20px_rgb(0_0_0/25%)]',
              'animate-[ef-rise-in_0.25s_var(--ef-ease-out-quint)_both]',
              VARIANT[t.variant],
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** 在 ToastProvider 内调用，取得推送提示的函数。 */
export function useToast(): Push {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast 必须在 <ToastProvider> 内使用');
  return ctx;
}
```

`Toast` 用到 `ef-rise-in` 与 `ef-corner-in` 两个关键帧，**它们已在 Task 1 Step 5 声明在 `src/styles/tailwind.css`**，此处只需确认存在，**不要重复声明**。应已存在的形状如下：

```css
@keyframes ef-rise-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: none; }
}

@keyframes ef-corner-in {
  from { opacity: 0; transform: scale(0.55); }
  to   { opacity: 1; transform: none; }
}
```

- [ ] **Step 7: 更新导出**

把 `endfield/react/src/index.ts` 追加：

```ts
export { Modal } from './components/Modal';
export type { ModalProps } from './components/Modal';
export { Drawer } from './components/Drawer';
export type { DrawerProps } from './components/Drawer';
export { Dropdown, DropdownItem, DropdownSeparator } from './components/Dropdown';
export type { DropdownProps, DropdownItemProps } from './components/Dropdown';
export { Tabs } from './components/Tabs';
export type { TabsProps, TabItem } from './components/Tabs';
export { ToastProvider, useToast } from './components/Toast';
export type { ToastVariant } from './components/Toast';
export { ThemeToggle } from './components/ThemeToggle';
export { useTheme, THEME_LABEL } from './hooks/useTheme';
export type { Theme } from './hooks/useTheme';
export { useFocusTrap } from './hooks/useFocusTrap';
```

- [ ] **Step 8: 类型检查**

Run: `cd endfield/react && npx tsc --noEmit`
Expected: 零错误。

- [ ] **Step 9: 临时页面实测交互**

把 `endfield/react/src/main.tsx` 临时替换为包在 `ToastProvider` 内的交互探针，包含：一个 `ThemeToggle`、一个打开 `Modal` 的按钮（含 footer 两个按钮）、一个打开 `Drawer` 的按钮、一个 `Dropdown`、一个 3 项 `Tabs`、一个触发 toast 的按钮。

Run: `cd endfield/react && npm run dev`
Expected: 逐项核对：

- 点 `ThemeToggle` 在「跟随系统 → 浅色 → 深色」循环，图标随之变化；**刷新后保持**。
- 打开 `Modal`：焦点自动进入；`Tab` 在面板内循环不逃逸；`Esc` 关闭；关闭后焦点回到触发按钮；遮罩点击关闭。
- 打开 `Drawer`：从右侧滑入；`Esc` 关闭。
- `Dropdown`：点击展开；点外部关闭；`Esc` 关闭；触发器 `aria-expanded` 正确。
- `Tabs`：点击切换；`←`/`→` 键切换并移动焦点；非选中面板 `hidden`。
- Toast：点按钮后右上角出现提示，4 秒后消失。
- **受控 Tabs 实测**：在探针里给 `Tabs` 传 `value` + `onChange`（用 `useState` 驱动），确认点击能切换。这一步覆盖 Review Focus 第 5 条。

- [ ] **Step 10: 构建验证并提交**

Run: `cd endfield/react && npm run build`
Expected: 通过。

```bash
cd "F:/AiWorkspace/KimiCode/public"
git add endfield/react/src/components endfield/react/src/hooks \
  endfield/react/src/index.ts endfield/react/src/main.tsx \
  endfield/react/src/styles/tailwind.css
git commit -m "feat(endfield-react): 加入交互组件（模态/抽屉/下拉/选项卡/Toast）"
```

---

### Task 5: 演示站与最终验收

**Files:**
- Create: `endfield/react/src/demo/App.tsx`
- Create: `endfield/react/src/demo/Section.tsx`
- Create: `endfield/react/src/demo/sections/*.tsx`（若干章节文件）
- Modify: `endfield/react/src/main.tsx`
- Create: `endfield/react/README.md`

**Interfaces:**
- Consumes: Task 1–4 全部
- Produces: 可运行的演示站与包说明

- [ ] **Step 1: 写演示站外壳**

创建 `endfield/react/src/demo/Section.tsx`：

```tsx
import type { ReactNode } from 'react';
import { SectionHeader } from '../components/SectionHeader';

export interface SectionProps {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function Section({ id, eyebrow, title, description, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-20">
      <SectionHeader eyebrow={eyebrow} title={title} />
      {description ? <p className="mb-4 max-w-3xl text-sm text-ink-muted">{description}</p> : null}
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}

export function Demo({ children }: { children: ReactNode }) {
  return (
    <div className="border border-dashed border-border bg-surface-muted/40 p-4">
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}
```

创建 `endfield/react/src/demo/App.tsx`：

> 这里用到的 `.ef-skip-link` 基础层样式（Task 1 Step 5 的 `@layer base`）与 `top-signal-strip` `@utility` 同样**已在 Task 1 Step 5 定义**，本任务只消费，不要重复声明。

```tsx
import { useState } from 'react';
import { ToastProvider } from '../components/Toast';
import { ThemeToggle } from '../components/ThemeToggle';
import { Button, IconButton } from '../components/Button';
import { SearchBar } from '../components/Input';
import { IconGrid, IconList, IconSettings, IconUser } from '../components/icons';
import { cx } from '../lib/cx';

import { TokensSection } from './sections/TokensSection';
import { TypographySection } from './sections/TypographySection';
import { AtomsSection } from './sections/AtomsSection';
import { FormsSection } from './sections/FormsSection';
import { StructureSection } from './sections/StructureSection';
import { InteractiveSection } from './sections/InteractiveSection';
import { DataSection } from './sections/DataSection';

const NAV = [
  { id: 'tokens', label: '设计令牌', sub: 'Tokens' },
  { id: 'typography', label: '排版尺度', sub: 'Typography' },
  { id: 'atoms', label: '原子组件', sub: 'Atoms' },
  { id: 'forms', label: '表单控件', sub: 'Forms' },
  { id: 'structure', label: '结构组件', sub: 'Structure' },
  { id: 'interactive', label: '交互组件', sub: 'Interactive' },
  { id: 'data', label: '数据展示', sub: 'Data' },
] as const;

export function App() {
  const [active, setActive] = useState<string>('tokens');

  return (
    <ToastProvider>
      <div className="min-h-screen">
        {/* 跳到主内容：spec §9 要求每页首个可聚焦元素是它。 */}
        <a className="ef-skip-link" href="#ef-main">跳到主内容</a>
        <header className="sticky top-0 z-40 border-b border-border bg-surface">
          <div className="top-signal-strip" />
          <div className="flex h-14 items-center gap-4 px-4">
            <span className="font-display text-lg font-bold">◈ Endfield React</span>
            <div className="max-w-lg flex-1">
              <SearchBar placeholder="搜索组件…" aria-label="搜索组件" />
            </div>
            <div className="ml-auto flex items-center gap-1">
              <ThemeToggle />
              <IconButton label="设置"><IconSettings /></IconButton>
              <IconButton label="账户"><IconUser /></IconButton>
            </div>
          </div>
        </header>

        <div className="mx-auto flex max-w-[90rem] gap-6 px-4 py-6">
          {/* 侧栏紧贴顶栏下方：top = var(--ef-header-bar-h) + var(--ef-header-signal-h)
              = 56px + 3px = 59px（对齐 css/layout.css:87）；
              高度取视口减去这 59px 再留 1.5rem 余量，保证不溢出视口。 */}
          <aside className="sticky top-[59px] hidden h-[calc(100vh-59px-1.5rem)] w-56 shrink-0 overflow-y-auto border-r border-border pr-3 lg:block">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-subtle">
              ◆ 章节
            </p>
            <nav aria-label="章节导航">
              {NAV.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setActive(item.id)}
                  aria-current={active === item.id ? 'true' : undefined}
                  className={cx(
                    'relative block rounded-ef-sm px-3 py-2 no-underline transition-colors',
                    active === item.id
                      ? 'bg-surface-muted text-ink'
                      : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
                    active === item.id &&
                      'before:absolute before:inset-y-[30%] before:left-0 before:w-0.5 before:rounded-full before:bg-accent-ink',
                  )}
                >
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-subtle">
                    {item.sub}
                  </span>
                </a>
              ))}
            </nav>
            <p className="mb-2 mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-subtle">
              ◆ 布局
            </p>
            <div className="flex gap-1">
              <IconButton label="网格视图"><IconGrid /></IconButton>
              <IconButton label="列表视图"><IconList /></IconButton>
            </div>
          </aside>

          <main id="ef-main" tabIndex={-1} className="min-w-0 flex-1">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
                  {'// Component Library'}
                </span>
                <h1 className="m-0 mt-1 font-display text-4xl font-bold">
                  Endfield React 组件库
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-ink-muted">
                  与 HTML/CSS 层令牌同源的 React 组件。按钮与表单控件为函数组件 + forwardRef，
                  展示型容器透传 className 与原生属性；零运行时依赖。
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="primary">主要操作</Button>
                <Button>次要操作</Button>
              </div>
            </div>

            <div className="flex flex-col gap-12">
              <TokensSection />
              <TypographySection />
              <AtomsSection />
              <FormsSection />
              <StructureSection />
              <InteractiveSection />
              <DataSection />
            </div>
          </main>
        </div>

        <footer className="border-t border-border bg-surface px-6 py-8 text-sm text-ink-muted">
          <div className="mx-auto max-w-[90rem]">
            <p className="m-0 text-xs text-ink-subtle">
              Endfield 设计系统 · React 组件库演示站。全部内容为中性占位文案。
            </p>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}
```

- [ ] **Step 2: 写令牌与排版章节**

创建 `endfield/react/src/demo/sections/TokensSection.tsx`：

```tsx
import { Section, Demo } from '../Section';

const SURFACES = [
  ['surface-sunken', '--ef-surface-sunken'],
  ['surface', '--ef-surface'],
  ['surface-muted', '--ef-surface-muted'],
  ['surface-raised', '--ef-surface-raised'],
  ['surface-inverse', '--ef-surface-inverse'],
] as const;

const INKS = [
  ['ink', '--ef-ink'],
  ['ink-muted', '--ef-ink-muted'],
  ['ink-subtle', '--ef-ink-subtle'],
] as const;

const SEMANTIC = [
  ['accent', '--ef-accent'],
  ['accent-strong', '--ef-accent-strong'],
  ['accent-soft', '--ef-accent-soft'],
  ['signal-yellow', '--ef-signal-yellow'],
  ['signal-cyan', '--ef-signal-cyan'],
  ['signal-magenta', '--ef-signal-magenta'],
  ['system', '--ef-system'],
  ['success', '--ef-success'],
  ['warn', '--ef-warn'],
  ['danger', '--ef-danger'],
  ['info', '--ef-info'],
] as const;

const TIERS = [1, 2, 3, 4, 5, 6] as const;

function Swatches({
  items,
  title,
}: {
  items: ReadonlyArray<readonly [string, string]>;
  title: string;
}) {
  return (
    <div>
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">{title}</p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3">
        {items.map(([name, token]) => (
          <div key={name} className="border border-border bg-surface-raised">
            <div className="h-12" style={{ background: `var(${token})` }} />
            <div className="px-2 py-1.5">
              <span className="block text-xs font-semibold">{name}</span>
              <span className="block font-mono text-[10px] text-ink-subtle">{token}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TokensSection() {
  return (
    <Section
      id="tokens"
      eyebrow="Design Tokens"
      title="设计令牌"
      description="令牌唯一来源是 endfield/css/tokens.css，经 sync:tokens 同步到本包。切换右上角主题按钮可对比明暗两套值。"
    >
      <Swatches items={SURFACES} title="表面层级" />
      <Swatches items={INKS} title="文字" />
      <Swatches items={SEMANTIC} title="主色 / 信号色 / 语义色" />
      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
          分级色 1–6
        </p>
        <div className="grid grid-cols-6 gap-3">
          {TIERS.map((t) => (
            <div key={t} className="border border-border bg-surface-raised">
              <div className="h-12" style={{ background: `var(--ef-tier-${t})` }} />
              <div className="px-2 py-1.5 font-mono text-[10px] text-ink-subtle">
                tier-{t}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Demo>
        <span className="text-sm text-ink-muted">
          以上色块直接读取 CSS 变量，未硬编码任何颜色字面量。
        </span>
      </Demo>
    </Section>
  );
}
```

创建 `endfield/react/src/demo/sections/TypographySection.tsx`：

```tsx
import { Section, Demo } from '../Section';
import { Divider } from '../../components/Misc';

const SCALE = [
  ['text-6xl', 'var(--ef-text-6xl)'],
  ['text-5xl', 'var(--ef-text-5xl)'],
  ['text-4xl', 'var(--ef-text-4xl)'],
  ['text-3xl', 'var(--ef-text-3xl)'],
  ['text-2xl', 'var(--ef-text-2xl)'],
  ['text-xl', 'var(--ef-text-xl)'],
  ['text-lg', 'var(--ef-text-lg)'],
  ['text-base', 'var(--ef-text-base)'],
  ['text-sm', 'var(--ef-text-sm)'],
  ['text-xs', 'var(--ef-text-xs)'],
] as const;

export function TypographySection() {
  return (
    <Section
      id="typography"
      eyebrow="Typography"
      title="排版尺度"
      description="拉丁与数字用等宽字体（JetBrains Mono 回退栈），中文用无衬线栈。大写拉丁标签一律加字距。"
    >
      <div className="flex flex-col gap-3">
        {SCALE.map(([name, token]) => (
          <div key={name} className="flex items-baseline gap-4 border-b border-border pb-2">
            <span className="w-24 shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-subtle">
              {name}
            </span>
            <span
              className="font-display font-bold"
              style={{ fontSize: `var(${token})`, lineHeight: 1.15 }}
            >
              档案库 Archive
            </span>
          </div>
        ))}
      </div>

      <Divider label="字距" />

      <Demo>
        <span className="font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
          tracking-caps .12em
        </span>
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-ink-subtle">
          tracking-caps-lg .16em
        </span>
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink-subtle">
          tracking-caps-xl .2em
        </span>
      </Demo>
    </Section>
  );
}
```

- [ ] **Step 3: 写原子、表单、结构、交互、数据章节**

创建 `endfield/react/src/demo/sections/AtomsSection.tsx`：

```tsx
import { Section, Demo } from '../Section';
import { Button, IconButton } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Chip, ChipGroup } from '../../components/Chip';
import { Checkbox, Radio, Switch } from '../../components/Toggle';
import { Spinner, Skeleton, Progress, EmptyState } from '../../components/Feedback';
import { Avatar, Divider, Kbd, Tooltip } from '../../components/Misc';
import { IconCheck, IconClose, IconDownload, IconFile, IconSettings } from '../../components/icons';

export function AtomsSection() {
  return (
    <Section
      id="atoms"
      eyebrow="Atoms"
      title="原子组件"
      description="按钮、徽标、标签、开关、反馈与杂项。全部支持明暗双主题与键盘操作。"
    >
      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">按钮</p>
        <Demo>
          <Button variant="primary">主按钮</Button>
          <Button variant="secondary">次按钮</Button>
          <Button variant="ghost">幽灵</Button>
          <Button variant="danger">危险</Button>
          <Button variant="primary" size="sm">小号</Button>
          <Button variant="primary" size="lg">大号</Button>
          <Button variant="primary" loading>载入中</Button>
          <Button variant="primary" icon={<IconDownload />}>带图标</Button>
          <Button variant="primary" disabled>禁用</Button>
          <IconButton label="设置"><IconSettings /></IconButton>
          <IconButton label="关闭"><IconClose /></IconButton>
        </Demo>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">徽标</p>
        <Demo>
          <Badge>默认</Badge>
          <Badge variant="info">信息</Badge>
          <Badge variant="success">成功</Badge>
          <Badge variant="warn">警告</Badge>
          <Badge variant="danger">错误</Badge>
          <Badge variant="accent">强调</Badge>
          <Badge variant="tier" tier={1}>1</Badge>
          <Badge variant="tier" tier={2}>2</Badge>
          <Badge variant="tier" tier={3}>3</Badge>
          <Badge variant="tier" tier={4}>4</Badge>
          <Badge variant="tier" tier={5}>5</Badge>
          <Badge variant="tier" tier={6}>6</Badge>
        </Demo>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">标签</p>
        <Demo>
          <ChipGroup label="筛选示例">
            <Chip active>全部</Chip>
            <Chip>选项一</Chip>
            <Chip>选项二</Chip>
            <Chip>选项三</Chip>
          </ChipGroup>
        </Demo>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
          复选 / 单选 / 开关
        </p>
        <Demo>
          <Checkbox label="复选项" defaultChecked />
          <Checkbox label="未选中" />
          <Radio label="单选项一" name="demo-radio" defaultChecked />
          <Radio label="单选项二" name="demo-radio" />
          <Switch label="开关（开）" defaultChecked />
          <Switch label="开关（关）" />
        </Demo>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
          反馈与杂项
        </p>
        <Demo>
          <Spinner />
          <div className="w-40"><Skeleton height="1rem" /></div>
          <div className="w-40"><Progress value={62} label="完成度" /></div>
          <Kbd>/</Kbd>
          <Avatar fallback="AB" />
          <Avatar size="lg" fallback="CD" />
          <Tooltip content="提示文本"><Button>悬停查看提示</Button></Tooltip>
          <Tooltip content="带图标">
            <IconButton label="确认"><IconCheck /></IconButton>
          </Tooltip>
        </Demo>
      </div>

      <Divider label="空状态" />

      <EmptyState
        icon={<IconFile size={48} />}
        title="暂无内容"
        description="这里还没有任何条目。试试创建第一条，或调整筛选条件。"
        action={<Button variant="primary">创建条目</Button>}
      />
    </Section>
  );
}
```

创建 `endfield/react/src/demo/sections/FormsSection.tsx`：

```tsx
import { useState } from 'react';
import { Section, Demo } from '../Section';
import { Input, Select, Textarea, SearchBar } from '../../components/Input';
import { Button } from '../../components/Button';

export function FormsSection() {
  const [keyword, setKeyword] = useState('');

  return (
    <Section
      id="forms"
      eyebrow="Forms"
      title="表单控件"
      description="输入框、下拉、文本域与搜索框。全部支持受控与非受控两种用法。"
    >
      <div className="grid max-w-2xl gap-0">
        <Input label="用户名" placeholder="请输入用户名" hint="必填，4–20 个字符" />
        <Input label="邮箱" type="email" placeholder="you@example.com" />
        <Input label="禁用状态" defaultValue="不可编辑" disabled />
        <Select label="语言" defaultValue="zh">
          <option value="zh">简体中文</option>
          <option value="en">English</option>
          <option value="ja">日本語</option>
        </Select>
        <Textarea label="个人简介" placeholder="写点什么…" hint="最多 200 字" />
        <Input
          label="受控输入"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="输入试试"
          hint={`当前值：${keyword || '（空）'}`}
        />
      </div>

      <Divider />

      <Demo>
        <div className="w-96 max-w-full">
          <SearchBar
            placeholder="搜索组件…"
            aria-label="搜索"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <Button variant="primary">搜索</Button>
        <Button>重置</Button>
      </Demo>
    </Section>
  );
}
```

`FormsSection` 用到了 `Divider`，在文件顶部导入：

```tsx
import { Divider } from '../../components/Misc';
```

创建 `endfield/react/src/demo/sections/StructureSection.tsx`：

```tsx
import { Section } from '../Section';
import { Panel, PanelHeader, PanelTitle, PanelBody, PanelFooter } from '../../components/Panel';
import { Card, CardMedia, CardBody, CardTitle, CardMeta, ItemCard, Stat, StatCard } from '../../components/Card';
import { Callout } from '../../components/Callout';
import { Accordion, AccordionItem } from '../../components/Accordion';
import { Breadcrumb, FilterRow, InfoGrid } from '../../components/Nav';
import { Chip, ChipGroup } from '../../components/Chip';
import { Badge, type Tier } from '../../components/Badge';
import { Button } from '../../components/Button';
import { IconActivity, IconFile, IconTrend, IconUser } from '../../components/icons';

const TIERS: Tier[] = [1, 2, 3, 4, 5, 6];

export function StructureSection() {
  return (
    <Section
      id="structure"
      eyebrow="Structure"
      title="结构组件"
      description="面板、卡片、提示块、折叠面板与导航元素。这些是页面级组合的基本单元。"
    >
      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">面板</p>
        <Panel>
          <PanelHeader>
            <PanelTitle>面板标题</PanelTitle>
            <Badge variant="info">3</Badge>
          </PanelHeader>
          <PanelBody>
            <p className="m-0 text-sm text-ink-muted">面板主体内容。</p>
          </PanelBody>
          <PanelFooter>
            <Button size="sm">取消</Button>
            <Button size="sm" variant="primary">保存</Button>
          </PanelFooter>
        </Panel>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">统计</p>
        <div className="flex flex-wrap items-center gap-10 border border-border bg-surface-raised p-6">
          <Stat value="7,256" label="条目" sub="Articles" />
          <Stat value="63,593" label="次修订" sub="Revisions" />
          <Stat value="18" label="位编辑者" sub="Editors" />
        </div>
        <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-3">
          <StatCard icon={<IconFile />} value="7,256" label="总条目" />
          <StatCard icon={<IconTrend />} value="+128" label="本周新增" glow />
          <StatCard icon={<IconActivity />} value="63,593" label="总修订" />
          <StatCard icon={<IconUser />} value="18" label="活跃编辑者" />
        </div>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
          条目卡（分级条随 tier 变化）
        </p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3">
          {TIERS.map((t, i) => (
            <ItemCard
              key={t}
              href="#structure"
              tier={t}
              index={String(i + 1).padStart(2, '0')}
              name={`条目名称${t}`}
              sub={`// Item ${t}`}
              icons={<Badge variant="tier" tier={t}>{t}</Badge>}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">内容卡</p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-4">
          <Card>
            <CardMedia className="flex items-center justify-center text-sm text-ink-subtle">
              封面占位
            </CardMedia>
            <CardBody>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-subtle">
                2026.09.24
              </span>
              <CardTitle>卡片标题</CardTitle>
              <CardMeta>示例摘要文本，用于演示卡片布局。</CardMeta>
            </CardBody>
          </Card>
        </div>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">提示块</p>
        <Callout variant="info" title="提示">
          这是一条信息提示，用于补充说明。
        </Callout>
        <Callout variant="success" title="成功">
          操作已成功完成。
        </Callout>
        <Callout variant="warn" title="注意">
          请确认后再继续，此操作可能影响其他数据。
        </Callout>
        <Callout variant="danger" title="错误">
          请求失败，请稍后重试。
        </Callout>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">折叠面板</p>
        <Accordion>
          <AccordionItem title="第一项（默认展开）" defaultOpen>
            折叠内容一。使用原生 details 元素，无 JavaScript 时仍可展开。
          </AccordionItem>
          <AccordionItem title="第二项">折叠内容二。</AccordionItem>
          <AccordionItem title="第三项">折叠内容三。</AccordionItem>
        </Accordion>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">导航元素</p>
        <Breadcrumb
          items={[
            { label: '首页', href: '#structure' },
            { label: '条目列表', href: '#structure' },
            { label: '条目名称一' },
          ]}
        />
        <div className="border border-border bg-surface-raised p-4">
          <FilterRow label="类别">
            <ChipGroup>
              <Chip active>全部</Chip>
              <Chip>类别一</Chip>
              <Chip>类别二</Chip>
            </ChipGroup>
          </FilterRow>
          <FilterRow label="等级">
            <ChipGroup>
              <Chip active>全部</Chip>
              {TIERS.map((t) => (
                <Chip key={t}>{t} 级</Chip>
              ))}
            </ChipGroup>
          </FilterRow>
        </div>
        <div className="mt-3 border border-border bg-surface-raised p-4">
          <InfoGrid
            items={[
              { key: '类别', value: '类别一' },
              { key: '等级', value: '4' },
              { key: '属性', value: '示例属性' },
              { key: '状态', value: '可用' },
              { key: '更新', value: '2026.09.24' },
              { key: '编辑者', value: '示例编辑者' },
            ]}
          />
        </div>
      </div>
    </Section>
  );
}
```

创建 `endfield/react/src/demo/sections/InteractiveSection.tsx`：

```tsx
import { useState } from 'react';
import { Section, Demo } from '../Section';
import { Button, IconButton } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Drawer } from '../../components/Drawer';
import { Dropdown, DropdownItem, DropdownSeparator } from '../../components/Dropdown';
import { Tabs } from '../../components/Tabs';
import { useToast } from '../../components/Toast';
import { Input } from '../../components/Input';
import { Chip } from '../../components/Chip';
import { IconSettings, IconUser, IconClose, IconFile } from '../../components/icons';

export function InteractiveSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tab, setTab] = useState('one');
  const toast = useToast();

  return (
    <Section
      id="interactive"
      eyebrow="Interactive"
      title="交互组件"
      description="模态、抽屉、下拉、选项卡与 Toast。全部支持键盘操作与焦点管理。"
    >
      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
          模态与抽屉
        </p>
        <Demo>
          <Button variant="primary" onClick={() => setModalOpen(true)}>打开模态</Button>
          <Button onClick={() => setDrawerOpen(true)}>打开抽屉</Button>
        </Demo>

        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="模态标题"
          footer={
            <>
              <Button onClick={() => setModalOpen(false)}>取消</Button>
              <Button
                variant="primary"
                onClick={() => {
                  setModalOpen(false);
                  toast('已保存', 'success');
                }}
              >
                确定
              </Button>
            </>
          }
        >
          <p className="m-0 mb-4 text-sm text-ink-muted">
            焦点已进入面板。按 Tab 应在面板内循环，按 Esc 关闭，关闭后焦点回到触发按钮。
          </p>
          <Input label="示例字段" placeholder="输入点东西" />
        </Modal>

        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="抽屉标题">
          <p className="m-0 mb-4 text-sm text-ink-muted">从右侧滑入的面板，Esc 可关闭。</p>
          <Button variant="primary" onClick={() => setDrawerOpen(false)}>关闭</Button>
        </Drawer>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">下拉菜单</p>
        <Demo>
          <Dropdown
            trigger={<Button icon={<IconSettings />}>操作</Button>}
          >
            <DropdownItem icon={<IconUser />}>个人资料</DropdownItem>
            <DropdownItem icon={<IconFile />}>导出数据</DropdownItem>
            <DropdownSeparator />
            <DropdownItem>退出登录</DropdownItem>
          </Dropdown>
          <Dropdown
            trigger={<IconButton label="更多"><IconSettings /></IconButton>}
          >
            <DropdownItem>菜单项一</DropdownItem>
            <DropdownItem>菜单项二</DropdownItem>
          </Dropdown>
        </Demo>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
          选项卡（受控）
        </p>
        <div className="border border-border bg-surface-raised p-4">
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { id: 'one', label: '选项卡一', content: <p className="m-0 text-sm text-ink-muted">第一个面板的内容。</p> },
              { id: 'two', label: '选项卡二', content: <p className="m-0 text-sm text-ink-muted">第二个面板的内容。</p> },
              { id: 'three', label: '选项卡三', content: <p className="m-0 text-sm text-ink-muted">第三个面板的内容。</p> },
            ]}
          />
          <p className="mb-0 mt-3 font-mono text-xs text-ink-subtle">当前选中：{tab}</p>
        </div>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">Toast</p>
        <Demo>
          <Button onClick={() => toast('这是一条信息提示', 'info')}>信息</Button>
          <Button onClick={() => toast('操作已成功完成', 'success')}>成功</Button>
          <Button onClick={() => toast('请注意检查输入', 'warn')}>警告</Button>
          <Button onClick={() => toast('请求失败，请重试', 'danger')}>错误</Button>
        </Demo>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
          className 覆盖（拿不准就用 !）
        </p>
        <Demo>
          <Button variant="primary">默认内边距</Button>
          <Button variant="primary" className="px-10 py-6">覆盖为 px-10 py-6</Button>
          <Button variant="primary" className="p-8">无 ! 覆盖 p-8（不生效）</Button>
          <Button variant="primary" className="p-8!">加 ! 覆盖 p-8!</Button>
          <Button variant="secondary" className="bg-danger!">secondary + bg-danger!</Button>
          <Chip className="rounded-none!">Chip + rounded-none!</Chip>
          {/* size-12 在 IconButton 上不生效（内置 w-8/h-8 后发射），在 Button 上却生效
              （按钮没有 w-8/h-8 与之竞争）—— 同一个 class 换个组件结果相反。
              两个 48px 宽的按钮只放短标签，避免文字溢出干扰肉眼核对。 */}
          <IconButton label="尺寸无 !（不生效）" className="size-12"><IconClose /></IconButton>
          <Button variant="primary" className="size-12">尺寸</Button>
          <IconButton label="尺寸加 !" className="size-12!"><IconClose /></IconButton>
        </Demo>
      </div>
    </Section>
  );
}
```

创建 `endfield/react/src/demo/sections/DataSection.tsx`：

```tsx
import { Section } from '../Section';
import { Table, THead, TBody, TR, TH, TD } from '../../components/Table';
import { Timeline, TimelineItem, TimelineTitle } from '../../components/Timeline';
import { TOC } from '../../components/Nav';
import { Badge } from '../../components/Badge';
import { Pagination } from '../../components/Nav';
import { useState } from 'react';

const ROWS = [
  ['条目名称一', '类别一', 6, 128, '2026.09.24'],
  ['条目名称二', '类别二', 5, 96, '2026.09.23'],
  ['条目名称三', '类别一', 4, 74, '2026.09.22'],
  ['条目名称四', '类别三', 3, 52, '2026.09.21'],
  ['条目名称五', '类别二', 2, 31, '2026.09.20'],
] as const;

export function DataSection() {
  const [page, setPage] = useState(3);

  return (
    <Section
      id="data"
      eyebrow="Data"
      title="数据展示"
      description="表格、时间线、目录与分页。表格在窄屏可横向滚动。"
    >
      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
          表格（可排序表头）
        </p>
        <Table>
          <THead>
            <TR>
              <TH>条目</TH>
              <TH>类别</TH>
              <TH>等级</TH>
              <TH onSort={() => {}} sort="desc">修订数</TH>
              <TH>最近更新</TH>
            </TR>
          </THead>
          <TBody>
            {ROWS.map((row) => (
              <TR key={row[0]}>
                <TD className="font-semibold">{row[0]}</TD>
                <TD>{row[1]}</TD>
                <TD>
                  <Badge variant="tier" tier={row[2] as 3 | 4 | 5 | 6}>{row[2]}</Badge>
                </TD>
                <TD className="font-mono tabular-nums">{row[3]}</TD>
                <TD className="font-mono text-xs text-ink-subtle">{row[4]}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_14rem]">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
            时间线
          </p>
          <Timeline>
            <TimelineItem time="2026/9/24 11:35:14" dateTime="2026-09-24T11:35:14" accent>
              <TimelineTitle href="#data">条目名称一</TimelineTitle>{' '}
              <Badge variant="success">+128</Badge> <Badge variant="danger">−42</Badge>
              <p className="m-0 mt-0.5 text-xs text-ink-subtle">
                编辑：示例编辑者 · 摘要：更新条目档案
              </p>
            </TimelineItem>
            <TimelineItem time="2026/9/24 09:12:03" dateTime="2026-09-24T09:12:03">
              <TimelineTitle href="#data">条目名称二</TimelineTitle>{' '}
              <Badge variant="success">+64</Badge>
              <p className="m-0 mt-0.5 text-xs text-ink-subtle">
                编辑：示例编辑者 · 摘要：修正数值
              </p>
            </TimelineItem>
            <TimelineItem time="2026/9/23 18:40:55" dateTime="2026-09-23T18:40:55">
              <TimelineTitle href="#data">条目名称三</TimelineTitle>{' '}
              <Badge variant="warn">±0</Badge>
              <p className="m-0 mt-0.5 text-xs text-ink-subtle">
                编辑：示例编辑者 · 摘要：调整格式
              </p>
            </TimelineItem>
          </Timeline>
        </div>

        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">目录</p>
          <TOC
            title="本页目录"
            activeId="data"
            items={[
              { id: 'tokens', label: '设计令牌' },
              { id: 'typography', label: '排版尺度' },
              { id: 'atoms', label: '原子组件' },
              { id: 'structure', label: '结构组件' },
              { id: 'data', label: '数据展示' },
              { id: 'data-sub', label: '表格', sub: true },
            ]}
          />
        </div>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
          分页（受控，当前第 {page} 页）
        </p>
        <Pagination page={page} total={10} onChange={setPage} />
      </div>
    </Section>
  );
}
```

- [ ] **Step 4: 替换入口**

把 `endfield/react/src/main.tsx` 替换为：

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tailwind.css';
import { App } from './demo/App';

const container = document.getElementById('root');
if (!container) throw new Error('找不到 #root 容器');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 5: 类型检查与构建**

Run: `cd endfield/react && npm run build`
Expected: `tsc --noEmit` 零错误，`vite build` 成功。

- [ ] **Step 6: 浏览器全量走查**

Run: `cd endfield/react && npm run dev`

在浏览器中逐项核对：

- 顶栏有 3px 信号条（品红→主色→青），左侧品牌名，中间搜索框，右侧主题按钮与图标按钮。
- 侧栏 7 个章节锚点，点击可跳转且当前项有主色左竖条。
- 「跳到主内容」链接在页面首次 `Tab` 时出现，聚焦后跳到 `#ef-main`。
- **令牌章节**：色块直接反映当前主题；切换主题后所有色块**立即**变色。
- **排版章节**：10 档字号正确；大写拉丁标签字距明显。
- **原子章节**：全部组件渲染正常；6 个分级徽标颜色各异；条目卡分级条颜色随 tier 变化。
- **表单章节**：受控输入框输入有反应，下方提示文字实时更新。
- 选中态复选框同时可见主色填充、斜纹与勾形（验证 Task 2 Step 5 的双层 `background-image`）。
- **结构章节**：4 种 Callout 左侧色条颜色正确；折叠面板可点击展开且箭头方向正确。
- **交互章节**：
  - 打开模态 → 焦点进入，`Tab` 循环，`Esc` 关闭，焦点归还。
  - 打开抽屉 → 从右滑入。
  - 下拉菜单可展开、点外部关闭、`Esc` 关闭。
  - 受控选项卡点击切换，下方「当前选中」文字同步更新。
  - 4 个 Toast 按钮各自弹出对应颜色的提示。
  - **className 覆盖区**（验证 Review Focus 第 1 条）：拼在最后只是必要条件，能否覆盖取决于 Tailwind 的发射顺序，拿不准就用 `!`。不加 `!` 时：`px-10 py-6` 的按钮内边距 `24px/40px`（生效），但 `p-8` 仍为 `8px/16px`（不生效，`px-4`/`py-2` 后发射）；`size-12` 在 `IconButton` 上仍为 `32×32`（不生效，内置 `w-8`/`h-8` 后发射），但在 `Button` 上**生效**为 `48×48`（按钮没有 `w-8`/`h-8` 与之竞争）—— 同一个 class 换个组件结果相反，这正是「拿不准就用 `!`」的由来。加 `!` 后全部生效：`p-8!` → `32px`，`secondary` + `bg-danger!` → `rgb(220, 38, 38)`，`Chip` + `rounded-none!` → `0px`，`size-12!` 的图标按钮 → `48×48`（默认 `32×32`）。
- **数据章节**：表格可排序表头有箭头与 `aria-sort`；时间线节点切角且首项为主色；目录当前项有主色左边框；分页点击可切换页且当前页高亮更新。
- 375px 宽度下：侧栏隐藏（`lg:block` 生效），内容单列，无横向滚动。
- **首帧无主题闪烁**：在深色系统偏好下硬刷新，首帧即为深色。
- 控制台**无 error**。

- [ ] **Step 7: 写 README**

创建 `endfield/react/README.md`，包含：

1. **定位** — 与 `../css/tokens.css` 同源的 React 组件库。
2. **安装与运行** — `npm install`、`npm run dev`、`npm run build`、`npm run typecheck`。
3. **令牌同步** — 说明 `sync:tokens` 的作用与 `--check` 用法；强调不要手改 `src/styles/tokens.css`。
4. **组件清单** — 按类别列出全部导出名，每条一句话。
5. **Tailwind 工具类** — 列出 `@theme` 映射出的颜色/字体工具类，以及 `chamfer`、`chamfer-sm`、`corner-frame`、`corner-frame-all`、`hatch`、`hatch-soft`、`hatch-accent`、`scanline`、`grid-backdrop`、`industrial-shell`、`top-signal-strip`、`tier-strip`、`skeleton-sweep` 这些 `@utility`。
6. **分级色约定** — 说明等级通过 `data-tier` **属性**传递（`Badge variant="tier" tier={n}`、`ItemCard tier={n}`），不是内联样式；`[data-tier="N"]` 规则同时产出 `--ef-tier-color`（填充）与 `--ef-tier-ink`（文字与描边），子元素 `.tier-strip` 从祖先继承填充色。
7. **主题** — `useTheme` 与 `ThemeToggle` 用法，`data-theme` 与 `localStorage` 键名 `ef-theme`。
8. **约定** — 按钮与表单控件均为 `forwardRef`，所有组件都透传 `className` 并拼在内置类之后。**`className` 覆盖规则**：拼在最后只是必要条件 —— 能否覆盖取决于 Tailwind v4 在 `@layer utilities` 内的规范发射顺序，同一个 CSS 属性上后发射的赢，而这个顺序使用方看不到也控制不了。因此同一个 class 在不同组件上结果可能相反：`bg-danger` 在 `Button variant="primary"` 上生效，在 `Button variant="secondary"`/`ghost` 与 `Chip` 上却被内置的 `bg-transparent`/`bg-surface-muted` 压掉；`rounded-none` 在 `Button` 上生效，在 `Chip` 上却被 `rounded-pill` 压掉；`p-8` 永远输给内置的 `px-4 py-2`。**结论：拿不准就用 `!` 修饰符**（`bg-danger!`、`rounded-none!`、`p-8!`），它产出 `!important`，上述全部场景都实测生效。另有一条独立的规则要写清：Toggle 家族（Checkbox/Radio/Switch）的 `className` 落在包裹用的 `<label>` 上，不是方框本身；而且方框**根本无法**通过 `className` 拿到类 —— `className` 被解构后交给 label，`...rest` 里已不含它，只携带非 `className` 的原生属性（如 `style`、`disabled`、`name`），所以方框的一次性外观覆盖要用 `style`。方框圆角三者不同：`Switch` 是 `rounded-pill`，`Checkbox` 是 `rounded-ef-sm`（2px），`Radio` 是 `rounded-full`。零运行时依赖；图标内联 SVG。
9. **可访问性** — 键盘可达、焦点陷阱、`aria-*`、`prefers-reduced-motion`。

- [ ] **Step 8: 最终验收**

Run: `cd endfield/react && npm run sync:tokens -- --check && npx tsc --noEmit && npm run build`
Expected: 令牌一致、类型零错误、构建成功，全部退出码 0。

再验证一次 reduced-motion：开启「模拟 prefers-reduced-motion: reduce」，刷新演示站，确认动画停止且**没有元素停留在不可见状态**。

- [ ] **Step 9: 提交**

```bash
cd "F:/AiWorkspace/KimiCode/public"
git add endfield/react/src/demo endfield/react/src/main.tsx endfield/react/README.md
git commit -m "feat(endfield-react): 加入演示站与组件库说明"
```

---

## Self-Review

**1. 规格覆盖**

| 规格小节 | 覆盖任务 |
|---|---|
| §2 目录结构（react/ 部分） | Task 1 |
| §8 技术栈（Vite + React 18 + TS strict + Tailwind v4） | Task 1 Step 2–3 |
| §8 令牌经 `@theme` 映射 | Task 1 Step 5 |
| §8 令牌同源与 `sync:tokens` | Task 1 Step 4、Step 10 |
| §8 组件同名同 API、`forwardRef`（按钮与表单控件）、零运行时依赖、内部 `cx()` | Task 2–4 全部 |
| §8 演示站不引 `react-router-dom`，用 `useState` 切换 | Task 5 Step 1 |
| §8 `tsc --noEmit` 与 `vite build` 须通过 | Task 1 Step 9、Task 5 Step 5/8 |
| §6.1 原子组件（13 类） | Task 2 |
| §6.2 结构组件（24 类） | Task 3 |
| §6.2 中需交互的部分（Modal/Drawer/Dropdown/Tabs/Toast） | Task 4 |
| §6.3 侧栏激活态 | Task 5 Step 1（章节导航用同样的 `::before` 手法） |
| §4 主题三态 + `data-theme` + `ef-theme` 键 | Task 4 Step 1（`useTheme`） |
| §9 可访问性（焦点陷阱、`aria-*`、键盘、reduced-motion） | Task 2、Task 4、Task 5 Step 6/8 |
| §9 对比度（继承 CSS 层令牌，天然满足） | Task 1（令牌同步） |
| §11 验收方式（React 层） | Task 5 Step 8 |

无遗漏。

**2. 占位符扫描**

已检查：无 "TBD"、"TODO"、"待补"、"类似 Task N" 表述。Task 5 Step 7 的 README 以「包含以下 9 个小节」加每节要点的方式给出——这是文档提纲而非代码，提纲已具体到可逐条落地，不属于占位符。

**3. 类型与命名一致性**

已核对以下跨任务引用：

- `cx`：Task 1 定义（`ClassValue` 类型 + `cx` 函数），Task 2–5 全部消费，一致。
- `Tier`：Task 2 在 `Badge.tsx` 定义，Task 3 的 `Card.tsx` 与 `ItemCard` 消费，Task 5 演示站消费，一致。（分级色不经内联样式传递，改用 `data-tier` 属性，见 `tailwind.css` 的 `[data-tier="N"]` 映射。）
- `IconButton` 的 `label` 为必填：Task 2 定义，Task 4 的 `Modal`/`Drawer` 与 Task 5 全部正确传入，一致。
- `useFocusTrap(active, onEscape)` 返回 `RefObject<HTMLDivElement>`（`useRef<HTMLDivElement>(null)` 已隐含 `current: HTMLDivElement | null`，但类型实参不带 `| null`，否则与 `ref` prop 要的 `LegacyRef<T>` 不兼容）：Task 4 Step 2 定义，`Modal` 与 `Drawer` 按此消费，一致。
- `useToast()` 返回 `(message, variant?) => void`：Task 4 Step 6 定义，Task 5 的 `InteractiveSection` 按此调用，一致。
- `Tabs` 的 `value`/`defaultValue`/`onChange`/`items`：Task 4 Step 5 定义，Task 5 以受控方式消费，一致。
- `Table` 的 `TH` 的 `onSort`/`sort`：Task 3 Step 3 定义，Task 5 的 `DataSection` 消费，一致。
- `Pagination` 的 `page`/`total`/`onChange`：Task 3 Step 4 定义，Task 5 消费，一致。
- `TimelineItem` 的 `time`/`dateTime`/`accent`：Task 3 Step 3 定义，Task 5 消费，一致。
- `StatCard` 的 `glow`：Task 3 Step 2 定义，Task 5 消费，一致。
- Tailwind 工具类名（`bg-surface-muted`、`text-ink-subtle`、`border-accent-strong` 等）：Task 1 Step 5 的 `@theme` 映射定义了它们，Task 2–5 全部消费，名称一致。
- `@utility` 名（`chamfer`、`chamfer-sm`、`corner-frame`、`corner-frame-all`、`hatch`、`hatch-soft`、`hatch-accent`、`scanline`、`grid-backdrop`、`industrial-shell`、`top-signal-strip`、`tier-strip`、`skeleton-sweep`）与 `[data-tier="1"]`…`[data-tier="6"]` 属性映射：Task 1 Step 5 定义，Task 2–5 消费，一致。
- 关键帧 `ef-corner-in`、`ef-rise-in`、`ef-drawer-in`、`ef-drawer-in-left`、`ef-skeleton-sweep`：全部在 Task 1 Step 5 定义于 `tailwind.css`，Task 2/4 组件消费，一致。

**4. Review Focus 覆盖**

| Review Focus 项 | 对应验证 |
|---|---|
| 1. `className` 覆盖失效 | Task 2 Step 9、Task 5 Step 6（不加 `!` 时 `rounded-none`/`bg-danger` 在 `Button primary` 上实测生效、在 `secondary`/`ghost`/`Chip` 上实测不生效，`p-8` 实测不生效；加 `!` 后 `p-8!`/`bg-danger!`/`rounded-none!`/`size-12!` 全部实测生效） |
| 2. `tsc` strict 下 `forwardRef` 泛型 | Task 2 Step 8、Task 3 Step 6、Task 4 Step 8、Task 5 Step 5 |
| 3. 令牌同步漂移 | Task 1 Step 10（负向测试，证明 `--check` 会失败） |
| 4. 首帧主题闪烁 | Task 1 Step 7（`index.html` 内联脚本）、Task 5 Step 6（硬刷新核对） |
| 5. 受控与非受控混用 | Task 2 Step 10、Task 4 Step 9、Task 5 Step 6（受控 Tabs 与受控输入） |

5 项全部有对应验证。
