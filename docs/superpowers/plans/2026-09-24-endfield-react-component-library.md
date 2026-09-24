# Endfield 设计系统 — React 组件库实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `endfield/react/` 下建出与 HTML/CSS 层令牌同源的 React + TypeScript + Tailwind v4 组件库，含约 37 个组件与一个可运行的演示站。

**Architecture:** 令牌单一来源是 `../css/tokens.css`，由 `sync:tokens` 脚本复制进 `src/styles/tokens.css`，再经 Tailwind v4 的 `@theme` 块映射为 `--color-*`，使 `bg-surface`、`text-ink-muted` 等工具类可用。组件用 Tailwind 工具类实现样式，仅对切角、角括号、斜纹等无法用工具类表达的效果定义 `@utility`。所有组件为函数组件 + `forwardRef`，零运行时依赖。

**Tech Stack:** Vite 6 + React 18 + TypeScript 5（`strict`）+ Tailwind CSS v4（`@tailwindcss/vite` 插件）。

**Spec:** `docs/superpowers/specs/2026-09-24-endfield-design-system-design.md`

**前置依赖：** 本计划依赖 HTML/CSS 层计划的产物 —— `endfield/css/tokens.css` 必须已存在。先完成 `2026-09-24-endfield-html-css-design-system.md` 再执行本计划。

## Global Constraints

- 令牌唯一来源是 `../css/tokens.css`。禁止在 `react/` 下另写一份令牌定义；只能通过 `sync:tokens` 同步。
- 不引入任何运行时依赖：不用 `classnames`、`clsx`、`tailwind-merge`、`react-router-dom`、任何图表库或图标库。
- 图标一律内联 SVG 组件，放在 `src/components/icons.tsx`。
- 所有组件必须 `forwardRef` 并透传 `className`；`className` 总是追加在内置类之后，让使用方可以覆盖。
- 所有组件必须支持明暗两主题（依赖 `tokens.css`，不得硬编码颜色字面量）。
- `npx tsc --noEmit` 与 `npm run build` 必须都通过，且 `tsc` 在 `strict` 下零错误。
- 演示站不引入路由库，用 `useState` 切换展示区。
- 交互组件（Modal、Drawer、Dropdown、Tabs）必须键盘可达：`Esc` 关闭、焦点陷阱、`aria-*` 正确。

## Review Focus

以下 5 类条件，规格隐含要求但单任务的类型检查不会覆盖。每条都已在拥有该代码的任务里配了对应验证。

1. **`className` 覆盖失效** — 使用方传 `className="p-8"` 时，若内部用 `p-4` 且顺序在后，Tailwind 的层叠由 CSS 生成顺序而非 class 顺序决定，覆盖会静默失效。要求组件的 `className` 总是拼在最后，并在验证步骤里实测覆盖生效。
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
  - Tailwind `@utility`：`chamfer`、`chamfer-sm`、`corner-frame`、`corner-frame-all`、`hatch`、`scanline`、`grid-backdrop`、`industrial-shell`、`tier-strip`、`top-signal-strip`

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

  /* 字体 */
  --font-sans: var(--ef-font-sans);
  --font-mono: var(--ef-font-mono);
  --font-display: var(--ef-font-display);

  /* 圆角 */
  --radius-ef: var(--ef-radius);
  --radius-ef-sm: var(--ef-radius-sm);
  --radius-ef-lg: var(--ef-radius-lg);
}

/* ==========================================================================
   无法用工具类表达的原子效果
   ========================================================================== */

/* 切角矩形。注意 clip-path 会裁掉 border，需要描边时用 corner-frame。 */
@utility chamfer {
  --ef-chamfer-size: var(--ef-chamfer);
  clip-path: polygon(
    0 0,
    calc(100% - var(--ef-chamfer-size)) 0,
    100% var(--ef-chamfer-size),
    100% 100%,
    var(--ef-chamfer-size) 100%,
    0 calc(100% - var(--ef-chamfer-size))
  );
}

@utility chamfer-sm {
  --ef-chamfer-size: var(--ef-chamfer-sm);
  clip-path: polygon(
    0 0,
    calc(100% - var(--ef-chamfer-size)) 0,
    100% var(--ef-chamfer-size),
    100% 100%,
    var(--ef-chamfer-size) 100%,
    0 calc(100% - var(--ef-chamfer-size))
  );
}

/* 四角括号（完整四角） */
@utility corner-frame-all {
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

/* 斜纹，颜色继承 currentColor */
@utility hatch {
  background-image: repeating-linear-gradient(
    -45deg,
    currentColor 0 1px,
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

/* 分级条。等级色由 --ef-tier-color 提供，组件按 tier 设该变量。 */
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

/* ==========================================================================
   基础层
   ========================================================================== */

@layer base {
  html {
    scrollbar-gutter: stable;
  }

  body {
    margin: 0;
    font-family: var(--ef-font-sans);
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
    -webkit-font-smoothing: antialiased;
  }

  :focus-visible {
    outline: 2px solid var(--ef-info);
    outline-offset: 2px;
  }

  ::selection {
    background: var(--ef-accent);
    color: var(--ef-accent-fg);
  }

  /* 超长无断点文本必须能换行 */
  td,
  th {
    overflow-wrap: anywhere;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

- [ ] **Step 6: 写 cx 工具**

创建 `endfield/react/src/lib/cx.ts`：

```ts
/**
 * 拼接类名，过滤假值。
 * 不引入 classnames / clsx —— 本库保持零运行时依赖。
 * 注意：Tailwind 的层叠由生成顺序决定，故组件的 className 必须拼在最后，
 * 使用方才能覆盖内置样式。
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
- Consumes: `cx`（Task 1）
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
import type { SVGProps } from 'react';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  size?: number;
}

/** 统一的图标外壳：线性、currentColor、24 视窗。 */
function makeIcon(path: React.ReactNode, viewBox = '0 0 24 24') {
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

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-fg border-accent-strong font-semibold hover:bg-accent-strong hover:border-accent-strong',
  secondary:
    'bg-transparent text-ink border-border-strong hover:bg-surface-muted',
  ghost:
    'bg-transparent text-ink-muted border-transparent hover:bg-surface-muted hover:text-ink',
  danger:
    'bg-danger text-white border-danger hover:bg-danger/85 hover:border-danger/85',
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
          style={{ color: 'var(--ef-ink)' }}
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

export interface FieldWrapperProps {
  label?: string;
  hint?: string;
  id?: string;
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
  if (!label && !hint) {
    return <input ref={ref} id={id} className={cx(FIELD_BASE, className)} {...rest} />;
  }
  return (
    <Field label={label} hint={hint} id={id}>
      {(fieldId) => (
        <input ref={ref} id={fieldId} className={cx(FIELD_BASE, className)} {...rest} />
      )}
    </Field>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, hint, className, id, ...rest }, ref) {
    const control = (
      <textarea
        ref={ref}
        id={id}
        className={cx(FIELD_BASE, 'min-h-24 resize-y leading-normal', className)}
        {...rest}
      />
    );
    if (!label && !hint) return control;
    return (
      <Field label={label} hint={hint} id={id}>
        {(fieldId) => (
          <textarea
            ref={ref}
            id={fieldId}
            className={cx(FIELD_BASE, 'min-h-24 resize-y leading-normal', className)}
            {...rest}
          />
        )}
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
  const selectClass = cx(FIELD_BASE, 'cursor-pointer pr-8 appearance-none', className);
  const arrow = (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle"
    >
      ▾
    </span>
  );

  if (!label && !hint) {
    return (
      <span className="relative inline-flex w-full">
        <select ref={ref} id={id} className={selectClass} {...rest}>
          {children}
        </select>
        {arrow}
      </span>
    );
  }
  return (
    <Field label={label} hint={hint} id={id}>
      {(fieldId) => (
        <span className="relative inline-flex w-full">
          <select ref={ref} id={fieldId} className={selectClass} {...rest}>
            {children}
          </select>
          {arrow}
        </span>
      )}
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
  info: 'border-info text-info bg-info/12',
  success: 'border-success text-success bg-success/12',
  warn: 'border-warn text-warn bg-warn/12',
  danger: 'border-danger text-danger bg-danger/12',
  accent: 'border-accent-strong bg-accent text-accent-fg',
};

/** 分级色变量名，用于把 tier 变成 --ef-tier-color。 */
export const TIER_VAR: Record<Tier, string> = {
  1: 'var(--ef-tier-1)',
  2: 'var(--ef-tier-2)',
  3: 'var(--ef-tier-3)',
  4: 'var(--ef-tier-4)',
  5: 'var(--ef-tier-5)',
  6: 'var(--ef-tier-6)',
};

export function Badge({
  variant = 'default',
  tier,
  className,
  style,
  children,
  ...rest
}: BadgeProps) {
  const isTier = variant === 'tier' && tier !== undefined;
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-ef-sm border px-2 py-0.5',
        'font-mono text-[11px] leading-relaxed whitespace-nowrap tracking-wide',
        isTier
          ? 'border-[var(--ef-tier-color)] text-[var(--ef-tier-color)] bg-[color-mix(in_srgb,var(--ef-tier-color)_14%,transparent)]'
          : VARIANT[variant as Exclude<BadgeVariant, 'tier'>],
        className,
      )}
      style={isTier ? { ...style, ['--ef-tier-color' as string]: TIER_VAR[tier] } : style}
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
 * active 为受控；也可用 defaultPressed 走非受控。
 */
export function Chip({ active = false, className, children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cx(
        'inline-flex items-center gap-1.5 rounded-[6px] border px-2.5 py-1',
        'text-sm leading-tight cursor-pointer transition-colors duration-150',
        active
          ? 'border-accent-strong bg-accent text-accent-fg font-semibold hatch'
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

```tsx
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../lib/cx';

interface ToggleShellProps {
  id?: string;
  className?: string;
  children: ReactNode;
}

function ToggleShell({ id, className, children }: ToggleShellProps) {
  return (
    <label
      className={cx('inline-flex cursor-pointer items-center gap-2 text-sm select-none', className)}
    >
      {children}
      {id ? null : null}
    </label>
  );
}

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className, ...rest },
  ref,
) {
  return (
    <ToggleShell className={className}>
      <input
        ref={ref}
        type="checkbox"
        className={cx(
          'size-4 shrink-0 cursor-pointer appearance-none rounded-ef-sm',
          'border border-border-strong bg-surface-sunken',
          'checked:border-accent-strong checked:bg-accent',
          'checked:bg-[repeating-linear-gradient(-45deg,rgb(0_0_0/18%)_0_1px,transparent_1px_4px)]',
          'checked:bg-[image:url("data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2012%2012%27%3E%3Cpath%20d=%27M2%206.2l2.6%202.6L10%203.4%27%20fill=%27none%27%20stroke=%27%23111827%27%20stroke-width=%272%27/%3E%3C/svg%3E")]',
          'checked:bg-no-repeat checked:bg-center checked:bg-[length:100%]',
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
  { label, className, ...rest },
  ref,
) {
  return (
    <ToggleShell className={className}>
      <input
        ref={ref}
        type="radio"
        className={cx(
          'size-4 shrink-0 cursor-pointer appearance-none rounded-full',
          'border border-border-strong bg-surface-sunken',
          'checked:border-accent-strong checked:bg-accent',
          'checked:shadow-[inset_0_0_0_3px_var(--ef-accent-fg)]',
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
  { label, className, ...rest },
  ref,
) {
  return (
    <ToggleShell className={className}>
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        className={cx(
          'relative h-5 w-9 shrink-0 cursor-pointer appearance-none rounded-[6px]',
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

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../lib/cx';

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="加载中"
      className={cx(
        'inline-block size-5 animate-spin rounded-full border-2 border-border border-t-accent-ink',
        className,
      )}
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
        'block animate-pulse rounded-ef-sm bg-surface-muted',
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

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cx(
        'inline-block min-w-6 rounded-ef-sm border border-border border-b-2',
        'bg-surface-raised px-1.5 text-center font-mono text-[11px] leading-normal text-ink-muted',
        className,
      )}
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

export interface TooltipProps extends HTMLAttributes<HTMLSpanElement> {
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
export { Badge, TIER_VAR } from './components/Badge';
export type { BadgeProps, BadgeVariant, Tier } from './components/Badge';
export { Chip, ChipGroup } from './components/Chip';
export type { ChipProps, ChipGroupProps } from './components/Chip';
export { Checkbox, Radio, Switch } from './components/Toggle';
export type { CheckboxProps, RadioProps, SwitchProps } from './components/Toggle';
export { Spinner, Skeleton, Progress, EmptyState } from './components/Feedback';
export type { SkeletonProps, ProgressProps, EmptyStateProps } from './components/Feedback';
export { Divider, Kbd, Avatar, Tooltip } from './components/Misc';
export type { DividerProps, AvatarProps, AvatarSize, TooltipProps } from './components/Misc';
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

      {/* className 覆盖实测：这个按钮的内边距应被 p-8 覆盖 */}
      <Button variant="primary" className="p-8">覆盖内边距</Button>
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
- **最后一个「覆盖内边距」按钮的内边距明显大于其他按钮**（这验证 Review Focus 第 1 条：`className` 生效）。
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
- Consumes: Task 1（`cx`、Tailwind 工具类与 `@utility`）、Task 2（`Badge`、`TIER_VAR`、`Tier`、`Button`）
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
import type { HTMLAttributes, ReactNode } from 'react';
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

export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
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
import { TIER_VAR, type Tier } from './Badge';

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
  return <p className={cx('m-0 text-xs text-ink-subtle', className)} {...rest} />;
}

export interface ItemCardProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
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
      style={tier ? { ...style, ['--ef-tier-color' as string]: TIER_VAR[tier] } : style}
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

const VARIANT: Record<CalloutVariant, string> = {
  info: '[--ef-callout-color:var(--ef-info)]',
  warn: '[--ef-callout-color:var(--ef-warn)]',
  danger: '[--ef-callout-color:var(--ef-danger)]',
  success: '[--ef-callout-color:var(--ef-success)]',
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
        'border-l-[var(--ef-callout-color)]',
        'bg-[color-mix(in_srgb,var(--ef-callout-color)_7%,var(--ef-surface))]',
        VARIANT[variant],
        className,
      )}
      {...rest}
    >
      <div className="min-w-0">
        {title ? (
          <span className="mb-0.5 block font-mono text-xs uppercase tracking-[0.12em] text-[var(--ef-callout-color)]">
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
  ReactNode,
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

export function TR({ className, children, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cx('hover:bg-surface-muted', className)} {...rest}>
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
        'last:border-b-0',
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
import type { HTMLAttributes, ReactNode } from 'react';
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
        'before:absolute before:left-[-19px] before:top-[5px] before:size-2.5 before:chamfer-sm',
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

export function TimelineTitle({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={cx('font-semibold [overflow-wrap:anywhere]', className)} {...rest}>
      {children}
    </a>
  );
}
```

创建 `endfield/react/src/components/Accordion.tsx`：

```tsx
import type { ReactNode } from 'react';
import { cx } from '../lib/cx';

export interface AccordionProps {
  children: ReactNode;
  className?: string;
}

/** 用原生 <details>，无 JavaScript 时仍可展开。 */
export function Accordion({ children, className }: AccordionProps) {
  return <div className={cx('border border-border', className)}>{children}</div>;
}

export interface AccordionItemProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

export function AccordionItem({
  title,
  defaultOpen = false,
  children,
  className,
}: AccordionItemProps) {
  return (
    <details
      open={defaultOpen}
      className={cx(
        'border-b border-border last:border-b-0',
        className,
      )}
    >
      <summary
        className={cx(
          'flex cursor-pointer list-none items-center gap-2 px-4 py-3',
          'text-sm font-medium hover:bg-surface-muted',
          '[&::-webkit-details-marker]:hidden',
          'before:text-accent-ink before:content-["▾"] before:transition-transform before:duration-150',
          'open:before:rotate-0',
        )}
      >
        {title}
      </summary>
      <div className="px-4 pb-4 text-sm text-ink-muted">{children}</div>
    </details>
  );
}
```

注意：`open:before:rotate-0` 在关闭态需要 `-rotate-90`。Tailwind 无法直接选择「details 未打开」的伪元素，故在 `AccordionItem` 的 `<details>` 上加 `[&:not([open])>summary]:before:-rotate-90` 变体类。把 `<details>` 的 className 改为：

```tsx
className={cx(
  'border-b border-border last:border-b-0',
  '[&:not([open])>summary]:before:-rotate-90',
  className,
)}
```

并把 `summary` 的 `open:before:rotate-0` 去掉。

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

export interface PaginationProps extends HTMLAttributes<HTMLElement> {
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
    <nav aria-label={title} className={cx('text-sm', className)} {...rest}>
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
  - `useFocusTrap(active: boolean): RefObject<HTMLDivElement | null>`
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
 */
export function useFocusTrap(
  active: boolean,
  onEscape?: () => void,
): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement | null>(null);

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
          'relative flex max-h-[85vh] w-full max-w-lg flex-col',
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
          side === 'right'
            ? 'right-0 border-l animate-[ef-drawer-in-right_0.25s_var(--ef-ease-out-quint)_both]'
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

`Drawer` 用到了两个关键帧，需要加进 `src/styles/tailwind.css` 末尾（Tailwind v4 中自定义关键帧写在 `@theme` 内或用普通 `@keyframes`）：

```css
@keyframes ef-drawer-in-right {
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
                selected
                  ? 'border-b-accent-ink text-ink hatch [background-size:auto]'
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

const VARIANT: Record<ToastVariant, string> = {
  info: '[--ef-toast-color:var(--ef-info)]',
  success: '[--ef-toast-color:var(--ef-success)]',
  warn: '[--ef-toast-color:var(--ef-warn)]',
  danger: '[--ef-toast-color:var(--ef-danger)]',
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
        className="pointer-events-none fixed right-4 top-20 z-60 flex flex-col gap-2"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className={cx(
              'pointer-events-auto flex min-w-64 max-w-96 items-start gap-2',
              'border border-border border-l-[3px] border-l-[var(--ef-toast-color)]',
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

`Toast` 用到 `ef-rise-in` 关键帧与 `ef-corner-in`，加进 `src/styles/tailwind.css`：

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
          <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-56 shrink-0 overflow-y-auto border-r border-border pr-3 lg:block">
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

          <main className="min-w-0 flex-1">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
                  {'// Component Library'}
                </span>
                <h1 className="m-0 mt-1 font-display text-4xl font-bold">
                  Endfield React 组件库
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-ink-muted">
                  与 HTML/CSS 层令牌同源的 React 组件。全部组件为函数组件 + forwardRef，
                  零运行时依赖。
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
          className 覆盖（内边距应明显更大）
        </p>
        <Demo>
          <Button variant="primary">默认内边距</Button>
          <Button variant="primary" className="px-10 py-6">覆盖为 px-10 py-6</Button>
          <IconButton label="覆盖尺寸" className="size-12"><IconClose /></IconButton>
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
- **令牌章节**：色块直接反映当前主题；切换主题后所有色块**立即**变色。
- **排版章节**：10 档字号正确；大写拉丁标签字距明显。
- **原子章节**：全部组件渲染正常；6 个分级徽标颜色各异；条目卡分级条颜色随 tier 变化。
- **表单章节**：受控输入框输入有反应，下方提示文字实时更新。
- **结构章节**：4 种 Callout 左侧色条颜色正确；折叠面板可点击展开且箭头方向正确。
- **交互章节**：
  - 打开模态 → 焦点进入，`Tab` 循环，`Esc` 关闭，焦点归还。
  - 打开抽屉 → 从右滑入。
  - 下拉菜单可展开、点外部关闭、`Esc` 关闭。
  - 受控选项卡点击切换，下方「当前选中」文字同步更新。
  - 4 个 Toast 按钮各自弹出对应颜色的提示。
  - **className 覆盖区**：`px-10 py-6` 的按钮内边距**明显大于**默认按钮；`size-12` 的图标按钮明显更大。
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
5. **Tailwind 工具类** — 列出 `@theme` 映射出的颜色/字体工具类，以及 `chamfer`、`chamfer-sm`、`corner-frame-all`、`hatch`、`scanline`、`grid-backdrop`、`industrial-shell`、`top-signal-strip`、`tier-strip` 这些 `@utility`。
6. **主题** — `useTheme` 与 `ThemeToggle` 用法，`data-theme` 与 `localStorage` 键名 `ef-theme`。
7. **约定** — 组件均为 `forwardRef` 且 `className` 可覆盖；零运行时依赖；图标内联 SVG。
8. **可访问性** — 键盘可达、焦点陷阱、`aria-*`、`prefers-reduced-motion`。

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
| §8 组件同名同 API、`forwardRef`、零运行时依赖、内部 `cx()` | Task 2–4 全部 |
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

已检查：无 "TBD"、"TODO"、"待补"、"类似 Task N" 表述。Task 5 Step 7 的 README 以「包含以下 8 个小节」加每节要点的方式给出——这是文档提纲而非代码，提纲已具体到可逐条落地，不属于占位符。

**3. 类型与命名一致性**

已核对以下跨任务引用：

- `cx`：Task 1 定义（`ClassValue` 类型 + `cx` 函数），Task 2–5 全部消费，一致。
- `Tier` 与 `TIER_VAR`：Task 2 在 `Badge.tsx` 定义，Task 3 的 `Card.tsx` 与 `ItemCard` 消费，Task 5 演示站消费，一致。
- `IconButton` 的 `label` 为必填：Task 2 定义，Task 4 的 `Modal`/`Drawer` 与 Task 5 全部正确传入，一致。
- `useFocusTrap(active, onEscape)` 返回 `RefObject<HTMLDivElement | null>`：Task 4 Step 2 定义，`Modal` 与 `Drawer` 按此消费，一致。
- `useToast()` 返回 `(message, variant?) => void`：Task 4 Step 6 定义，Task 5 的 `InteractiveSection` 按此调用，一致。
- `Tabs` 的 `value`/`defaultValue`/`onChange`/`items`：Task 4 Step 5 定义，Task 5 以受控方式消费，一致。
- `Table` 的 `TH` 的 `onSort`/`sort`：Task 3 Step 3 定义，Task 5 的 `DataSection` 消费，一致。
- `Pagination` 的 `page`/`total`/`onChange`：Task 3 Step 4 定义，Task 5 消费，一致。
- `TimelineItem` 的 `time`/`dateTime`/`accent`：Task 3 Step 3 定义，Task 5 消费，一致。
- `StatCard` 的 `glow`：Task 3 Step 2 定义，Task 5 消费，一致。
- Tailwind 工具类名（`bg-surface-muted`、`text-ink-subtle`、`border-accent-strong` 等）：Task 1 Step 5 的 `@theme` 映射定义了它们，Task 2–5 全部消费，名称一致。
- `@utility` 名（`chamfer`、`chamfer-sm`、`corner-frame-all`、`hatch`、`scanline`、`grid-backdrop`、`industrial-shell`、`top-signal-strip`、`tier-strip`）：Task 1 Step 5 定义，Task 2–5 消费，一致。
- 关键帧 `ef-corner-in`、`ef-rise-in`、`ef-drawer-in-right`、`ef-drawer-in-left`：分别在 Task 4 Step 3 与 Step 6 定义于 `tailwind.css`，Task 4 组件消费，一致。

**4. Review Focus 覆盖**

| Review Focus 项 | 对应验证 |
|---|---|
| 1. `className` 覆盖失效 | Task 2 Step 9、Task 5 Step 6（`px-10 py-6` 与 `size-12` 实测） |
| 2. `tsc` strict 下 `forwardRef` 泛型 | Task 2 Step 8、Task 3 Step 6、Task 4 Step 8、Task 5 Step 5 |
| 3. 令牌同步漂移 | Task 1 Step 10（负向测试，证明 `--check` 会失败） |
| 4. 首帧主题闪烁 | Task 1 Step 7（`index.html` 内联脚本）、Task 5 Step 6（硬刷新核对） |
| 5. 受控与非受控混用 | Task 2 Step 10、Task 4 Step 9、Task 5 Step 6（受控 Tabs 与受控输入） |

5 项全部有对应验证。
