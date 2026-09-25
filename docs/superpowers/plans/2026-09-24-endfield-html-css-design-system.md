# Endfield 设计系统 — HTML/CSS 层实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `endfield/` 下建出一套零构建、可直接双击打开的工业军事科幻 HUD 设计系统：完整令牌、13 种标志性视觉手法、约 37 类组件样式、1 个总览页与 12 个页面模板，明暗双主题。

**Architecture:** 令牌层（`tokens.css`）是唯一真相源，其余样式文件只消费 `var(--ef-*)`。主题用三态架构（`light` 为 `:root` 默认，`dark` 由 `[data-theme="dark"]` 与 `prefers-color-scheme` 双触发）。样式按职责分层：`base.css`（reset/排版/底纹）→ `utilities.css`（视觉手法原子类）→ `layout.css`（骨架）→ `components.css`（组件）。12 个页面共享同一骨架，只替换内容区。正确性由三个 Node 校验脚本保证：令牌引用完整性、WCAG 对比度、页面结构完整性。

**Tech Stack:** 原生 HTML5 + CSS（无预处理器）+ 原生 ES modules JavaScript + Node 22（仅用于校验脚本，无运行时依赖）。无 npm 依赖、无构建步骤。

**Spec:** `docs/superpowers/specs/2026-09-24-endfield-design-system-design.md`

## Global Constraints

- 所有 CSS 自定义属性必须以 `--ef-` 为前缀，禁止裸 `--color-*` 等通用名。
- 全部文件为纯静态资源，路径一律用**相对路径**，必须支持 `file://` 直接双击打开。
- 零 npm 依赖、零构建步骤。`endfield/` 根目录下不得出现 `package.json`。
- 无 JavaScript 时页面内容仍可读，主题回退到系统偏好。
- 所有动效必须被 `@media (prefers-reduced-motion: reduce)` 关闭；`.ef-reveal` 在该模式下必须直接呈现终态（`opacity: 1`），不得停留在 `opacity: 0`。
- 焦点可见：所有可交互元素有 `:focus-visible` 样式，轮廓 `2px solid var(--ef-info)`，`outline-offset: 2px`。
- 图标一律内联 SVG，禁止图标字体与第三方图标库。
- 正文对比度 ≥ 4.5:1，图形与大字 ≥ 3:1。
- 每个页面必须含 `<a class="ef-skip-link" href="#ef-main">跳到主内容</a>` 与 `<main id="ef-main">`。
- 分级色只有 6 档，令牌名 `--ef-tier-1` … `--ef-tier-6`。
- 示例内容使用中性占位文案，不得出现参考站点的游戏专有名词（干员/武器/终末地等）与图片。

## Review Focus

以下 7 类输入或条件，规格隐含要求但任何单任务的测试都不会自动覆盖。每一条都已在拥有该代码的任务里配了对应测试。

1. **`file://` 直接双击打开** — 用绝对路径（`/css/tokens.css`）时本地打开会 404，样式全丢。要求所有 `href`/`src` 为相对路径，且内联主题脚本不依赖网络。
2. **拼错的令牌名** — `var(--ef-acent)` 不会报错，只会静默失效并渲染成透明或继承值，肉眼极难发现。要求令牌校验脚本报错。
3. **超长无断点文本** — 长中文标题、长英文标识符（如 `VeryLongUnbrokenIdentifier`）在表格单元格与卡片标题里必须换行或截断，不得撑破容器导致横向滚动。
4. **375px 窄屏** — 侧栏固定 214px，窄屏下必须收起为抽屉或图标栏，否则内容区被压到不可用。
5. **`prefers-reduced-motion: reduce`** — 动效必须关闭，且 `.ef-reveal` 必须可见（该类的初始态是 `opacity: 0`，处理不当会导致内容永久隐形）。
6. **打印** — `@media print` 必须输出白底黑字，不得深底浅字（默认深色主题会浪费大量墨水且难以阅读）。
7. **无 JavaScript** — 主题须回退系统偏好，`<details>` 折叠须可用，标签页不得因缺 JS 而隐藏内容。

---

## File Structure

| 文件 | 职责 |
|---|---|
| `endfield/css/tokens.css` | 全部设计令牌。唯一真相源，其他样式只消费不定义 |
| `endfield/css/base.css` | reset、盒模型、排版基线、`body` 底纹、跳转链接、打印样式 |
| `endfield/css/utilities.css` | 13 种视觉手法原子类（切角/角括号/网格/扫描线/斜纹/标签/波形条等）与动效 |
| `endfield/css/layout.css` | 顶栏、侧栏、内容区、页脚、响应式断点 |
| `endfield/css/components.css` | 原子组件（13 类）与结构组件（24 类）样式 |
| `endfield/css/brand.css` | 换肤覆盖层示例，默认不被任何页面引入 |
| `endfield/js/theme.js` | 三态主题读写与切换 |
| `endfield/js/ui.js` | 侧栏折叠、模态、标签页、下拉、筛选、Toast |
| `endfield/tools/check-tokens.mjs` | 校验所有 `var(--ef-*)` 引用都有定义或有回退 |
| `endfield/tools/check-contrast.mjs` | 校验令牌配色的 WCAG 对比度 |
| `endfield/tools/check-pages.mjs` | 校验页面结构、相对路径可解析、必需 landmark |
| `endfield/index.html` | 设计系统总览：色板、排版、全部组件、动效、实时调色 |
| `endfield/pages/*.html` | 12 个页面模板 |
| `endfield/README.md` | 使用说明、令牌表、设计原则 |
| `endfield/.gitignore` | 忽略系统与编辑器垃圾文件 |

---

### Task 1: 项目骨架与设计令牌

建立目录结构、写全部设计令牌、写令牌校验脚本。这是后续所有任务的地基。

**Files:**
- Create: `endfield/.gitignore`
- Create: `endfield/css/tokens.css`
- Create: `endfield/tools/check-tokens.mjs`
- Test: `endfield/tools/check-tokens.mjs`（脚本自身即测试，退出码即断言）

**Interfaces:**
- Consumes: 无
- Produces: 全部 `--ef-*` 令牌名，供后续所有任务消费。关键名：`--ef-surface`、`--ef-surface-muted`、`--ef-surface-raised`、`--ef-surface-sunken`、`--ef-surface-inverse`、`--ef-ink`、`--ef-ink-muted`、`--ef-ink-subtle`、`--ef-ink-inverse`、`--ef-border`、`--ef-border-strong`、`--ef-accent`、`--ef-accent-strong`、`--ef-accent-soft`、`--ef-accent-fg`、`--ef-accent-glow`、`--ef-accent-ink`、`--ef-signal-yellow`、`--ef-signal-cyan`、`--ef-signal-magenta`、`--ef-system`、`--ef-success`、`--ef-warn`、`--ef-danger`、`--ef-info`、`--ef-tier-1`…`--ef-tier-6`、`--ef-grid-line`、`--ef-scanline`、`--ef-weave-line`、`--ef-heading-bracket`、`--ef-heading-bar`、`--ef-heading-bar-fade`、`--ef-heading-rule`、`--ef-heatmap-bg`、`--ef-heatmap-empty`、`--ef-font-sans`、`--ef-font-mono`、`--ef-font-display`、`--ef-text-xs`…`--ef-text-6xl`、`--ef-tracking-caps`、`--ef-tracking-caps-lg`、`--ef-tracking-caps-xl`、`--ef-tracking-tightest`、`--ef-radius`、`--ef-radius-0`、`--ef-chamfer`、`--ef-chamfer-sm`、`--ef-ease-out-quart`、`--ef-ease-out-quint`、`--ef-ease-out-expo`、`--ef-duration-fast`、`--ef-duration-base`、`--ef-duration-slow`、`--ef-z-rail`、`--ef-z-floating`、`--ef-z-header`、`--ef-z-scrim`、`--ef-z-overlay`、`--ef-z-menu`、`--ef-z-lightbox`、`--ef-z-tooltip`、`--ef-header-bar-h`、`--ef-sidebar-w`、`--ef-sidebar-w-collapsed`、`--ef-user-accent`、`--ef-user-accent-strong`、`--ef-user-accent-soft`、`--ef-user-accent-glow`、`--ef-user-accent-ink`

- [ ] **Step 1: 建目录与 .gitignore**

```bash
cd "F:/AiWorkspace/KimiCode/public"
mkdir -p endfield/css endfield/js endfield/tools endfield/pages
```

创建 `endfield/.gitignore`：

```gitignore
.DS_Store
Thumbs.db
desktop.ini
*.log
node_modules/
dist/
.vscode/
.idea/
```

- [ ] **Step 2: 写令牌文件**

创建 `endfield/css/tokens.css`。这是全系统唯一的令牌定义处，后续文件只消费。

```css
/* ==========================================================================
   Endfield 设计系统 — 设计令牌
   唯一真相源。其他样式文件只消费 var(--ef-*)，不得再定义令牌。
   主题三态：light 为 :root 默认；dark 由 [data-theme="dark"]
   与 prefers-color-scheme: dark 双触发。
   ========================================================================== */

:root {
  /* ---------- 字体 ---------- */
  --ef-font-sans: system-ui, -apple-system, "Segoe UI", "Microsoft YaHei",
    "PingFang SC", "Hiragino Sans GB", sans-serif;
  --ef-font-mono: "JetBrains Mono", "IBM Plex Mono", ui-monospace,
    SFMono-Regular, Menlo, Consolas, monospace;
  --ef-font-display: var(--ef-font-sans);

  /* ---------- 字号与行高 ---------- */
  --ef-text-xs: 0.75rem;
  --ef-text-xs--lh: 1.3333;
  --ef-text-sm: 0.875rem;
  --ef-text-sm--lh: 1.4286;
  --ef-text-base: 1rem;
  --ef-text-base--lh: 1.5;
  --ef-text-lg: 1.125rem;
  --ef-text-lg--lh: 1.5556;
  --ef-text-xl: 1.25rem;
  --ef-text-xl--lh: 1.4;
  --ef-text-2xl: 1.5rem;
  --ef-text-2xl--lh: 1.3333;
  --ef-text-3xl: 1.875rem;
  --ef-text-3xl--lh: 1.2;
  --ef-text-4xl: 2.25rem;
  --ef-text-4xl--lh: 1.1111;
  --ef-text-5xl: 3rem;
  --ef-text-5xl--lh: 1;
  --ef-text-6xl: 3.75rem;
  --ef-text-6xl--lh: 1;

  /* ---------- 字重 ---------- */
  --ef-weight-normal: 400;
  --ef-weight-medium: 500;
  --ef-weight-semibold: 600;
  --ef-weight-bold: 700;

  /* ---------- 字距 ---------- */
  --ef-tracking-tightest: -0.08em;
  --ef-tracking-tight: -0.025em;
  --ef-tracking-normal: 0em;
  --ef-tracking-wide: 0.025em;
  --ef-tracking-caps: 0.12em;
  --ef-tracking-caps-lg: 0.16em;
  --ef-tracking-caps-xl: 0.2em;

  /* ---------- 行高 ---------- */
  --ef-leading-tight: 1.25;
  --ef-leading-snug: 1.375;
  --ef-leading-normal: 1.5;
  --ef-leading-relaxed: 1.625;

  /* ---------- 间距 ---------- */
  --ef-space-1: 0.25rem;
  --ef-space-2: 0.5rem;
  --ef-space-3: 0.75rem;
  --ef-space-4: 1rem;
  --ef-space-5: 1.25rem;
  --ef-space-6: 1.5rem;
  --ef-space-8: 2rem;
  --ef-space-10: 2.5rem;
  --ef-space-12: 3rem;
  --ef-space-16: 4rem;

  /* ---------- 圆角 ---------- */
  --ef-radius-0: 0px;
  --ef-radius-sm: 2px;
  --ef-radius: 4px;
  --ef-radius-lg: 8px;
  --ef-radius-pill: 6px;

  /* ---------- 切角 ---------- */
  --ef-chamfer: 9px;
  --ef-chamfer-sm: 6px;

  /* ---------- 缓动 ---------- */
  --ef-ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ef-ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
  --ef-ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);
  --ef-ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ef-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

  /* ---------- 时长 ---------- */
  --ef-duration-fast: 0.15s;
  --ef-duration-base: 0.25s;
  --ef-duration-slow: 0.4s;

  /* ---------- 层级 ---------- */
  --ef-z-rail: 20;
  --ef-z-floating: 30;
  --ef-z-header: 40;
  --ef-z-scrim: 40;
  --ef-z-overlay: 50;
  --ef-z-menu: 60;
  --ef-z-lightbox: 70;
  --ef-z-tooltip: 80;

  /* ---------- 骨架尺寸 ---------- */
  --ef-header-bar-h: 56px;
  --ef-header-signal-h: 3px;
  --ef-sidebar-w: 214px;
  --ef-sidebar-w-collapsed: 56px;
  --ef-grid-size: 24px;

  /* ---------- 信号色（与主题无关） ---------- */
  --ef-signal-yellow: #fffa00;
  --ef-signal-cyan: #00ffa2;
  --ef-signal-magenta: #ff00f0;

  /* ---------- 语义色（与主题无关） ---------- */
  --ef-system: #00c7bd;
  --ef-success: #00c7bd;
  --ef-warn: #d97706;
  --ef-danger: #dc2626;
  --ef-info: #248dff;

  /* ---------- 语义色 ink：语义色本身做文字时在 tint 背景上不达标 ---------- */
  --ef-info-ink: #1960ae;
  --ef-success-ink: #006e69;
  --ef-warn-ink: #914f04;
  --ef-danger-ink: #b31f1f;

  /* ---------- 分级色 1–6（与主题无关） ---------- */
  --ef-tier-1: #94a0aa;
  --ef-tier-2: #68b457;
  --ef-tier-3: #009dd1;
  --ef-tier-4: #9a7dff;
  --ef-tier-5: #ed9a00;
  --ef-tier-6: #ff503c;

  /* ---------- 分级色 ink ---------- */
  --ef-tier-1-ink: #5b6268;
  --ef-tier-2-ink: #3e6b34;
  --ef-tier-3-ink: #006688;
  --ef-tier-4-ink: #6451a6;
  --ef-tier-5-ink: #875700;
  --ef-tier-6-ink: #a83528;

  /* ======================================================================
     Light 主题（默认）
     ====================================================================== */

  /* ---------- 表面 ---------- */
  --ef-surface-sunken: #ebebeb;
  --ef-surface: #ffffff;
  --ef-surface-muted: #f5f5f5;
  --ef-surface-raised: #ffffff;
  --ef-surface-inverse: #000000;

  /* ---------- 文字 ---------- */
  --ef-ink: #000000;
  --ef-ink-muted: #3a3a3a;
  --ef-ink-subtle: #606060;
  --ef-ink-inverse: #ffffff;

  /* ---------- 描边 ---------- */
  --ef-border: #bcbcbc;
  --ef-border-strong: #808080;

  /* ---------- 主色 ---------- */
  --ef-accent: var(--ef-user-accent, #f2cc00);
  --ef-accent-strong: var(--ef-user-accent-strong, #d9ad00);
  --ef-accent-soft: var(--ef-user-accent-soft, #fff1a6);
  --ef-accent-fg: #111827;
  --ef-accent-glow: var(--ef-user-accent-glow, #ffd84a);
  /* 主色作为文字/细图形时使用。亮色主题下 #f2cc00 在白底仅 1.57:1，
     不达标，故分叉为深黄 #8a6d00（白底 4.92:1，次表面 4.51:1）。 */
  --ef-accent-ink: var(--ef-user-accent-ink, #8a6d00);

  /* ---------- 装饰 ---------- */
  --ef-grid-line: #e0e0e0;
  --ef-scanline: rgb(0 0 0 / 5%);
  --ef-weave-line: rgb(0 0 0 / 5%);
  --ef-heading-bracket: #797979;
  --ef-heading-bar: #c2c2c2;
  --ef-heading-bar-fade: #c2c2c226;
  --ef-heading-rule: #adadad;
  --ef-heatmap-bg: #f4f5f7;
  --ef-heatmap-empty: #e7e9ec;
  /* 热力图递增色：亮色下用深黄才能拉开亮度差（见 .ef-heatmap 注释） */
  --ef-heat-ramp: #8c5b00;

  /* ---------- 浮层与代码 ---------- */
  --ef-tooltip: #18181b;
  --ef-tooltip-fg: #fafafa;
  --ef-code-bg: #f5f5f5;
  --ef-code-fg: #111827;
}

/* ==========================================================================
   Dark 主题
   两处触发条件必须给出完全相同的值，改一处必须同步改另一处。
   ========================================================================== */

@media (prefers-color-scheme: dark) {
  html:not([data-theme="light"]) {
    --ef-surface-sunken: #121212;
    --ef-surface: #181818;
    --ef-surface-muted: #1f1f1f;
    --ef-surface-raised: #232323;
    --ef-surface-inverse: #f8fafc;

    --ef-ink: #eeeeee;
    --ef-ink-muted: #a8b0b7;
    --ef-ink-subtle: rgb(255 255 255 / 70%);
    --ef-ink-inverse: #111827;

    --ef-border: #2b3136;
    --ef-border-strong: #41484f;

    --ef-accent: var(--ef-user-accent, #d8bf00);
    --ef-accent-strong: var(--ef-user-accent-strong, #b99b00);
    --ef-accent-soft: var(--ef-user-accent-soft, #272302);
    --ef-accent-fg: #111827;
    --ef-accent-glow: var(--ef-user-accent-glow, #ecd548);
    /* 暗色主题的 #d8bf00 在 #181818 上已有 9.62:1，无需分叉 */
    --ef-accent-ink: var(--ef-user-accent-ink, #d8bf00);
    /* 语义色/分级色 ink 的暗色值：亮色值在深底上会太暗 */
    --ef-info-ink: #419cff;
    --ef-success-ink: #00c7bd;
    --ef-warn-ink: #dd851f;
    --ef-danger-ink: #e76d6d;
    --ef-tier-1-ink: #96a2ab;
    --ef-tier-2-ink: #68b457;
    --ef-tier-3-ink: #1da8d6;
    --ef-tier-4-ink: #a68cff;
    --ef-tier-5-ink: #ed9a00;
    --ef-tier-6-ink: #ff6a58;

    --ef-grid-line: #ffffff0e;
    --ef-scanline: rgb(255 255 255 / 5%);
    --ef-weave-line: rgb(255 255 255 / 2.5%);
    --ef-heading-bracket: #8c8c8c;
    --ef-heading-bar: #5c5c5c;
    --ef-heading-bar-fade: #5c5c5c26;
    --ef-heading-rule: #6c6c6c;
    --ef-heatmap-bg: #202020;
    --ef-heatmap-empty: #2c2c2c;
    --ef-heat-ramp: #d8bf00;

    --ef-tooltip: #f4f4f5;
    --ef-tooltip-fg: #18181b;
    --ef-code-bg: #101013;
    --ef-code-fg: #e6e8eb;
  }
}

html[data-theme="dark"] {
  --ef-surface-sunken: #121212;
  --ef-surface: #181818;
  --ef-surface-muted: #1f1f1f;
  --ef-surface-raised: #232323;
  --ef-surface-inverse: #f8fafc;

  --ef-ink: #eeeeee;
  --ef-ink-muted: #a8b0b7;
  --ef-ink-subtle: rgb(255 255 255 / 70%);
  --ef-ink-inverse: #111827;

  --ef-border: #2b3136;
  --ef-border-strong: #41484f;

  --ef-accent: var(--ef-user-accent, #d8bf00);
  --ef-accent-strong: var(--ef-user-accent-strong, #b99b00);
  --ef-accent-soft: var(--ef-user-accent-soft, #272302);
  --ef-accent-fg: #111827;
  --ef-accent-glow: var(--ef-user-accent-glow, #ecd548);
  /* 暗色主题的 #d8bf00 在 #181818 上已有 9.62:1，无需分叉 */
  --ef-accent-ink: var(--ef-user-accent-ink, #d8bf00);
  /* 语义色/分级色 ink 的暗色值：亮色值在深底上会太暗 */
  --ef-info-ink: #419cff;
  --ef-success-ink: #00c7bd;
  --ef-warn-ink: #dd851f;
  --ef-danger-ink: #e76d6d;
  --ef-tier-1-ink: #96a2ab;
  --ef-tier-2-ink: #68b457;
  --ef-tier-3-ink: #1da8d6;
  --ef-tier-4-ink: #a68cff;
  --ef-tier-5-ink: #ed9a00;
  --ef-tier-6-ink: #ff6a58;

  --ef-grid-line: #ffffff0e;
  --ef-scanline: rgb(255 255 255 / 5%);
  --ef-weave-line: rgb(255 255 255 / 2.5%);
  --ef-heading-bracket: #8c8c8c;
  --ef-heading-bar: #5c5c5c;
  --ef-heading-bar-fade: #5c5c5c26;
  --ef-heading-rule: #6c6c6c;
  --ef-heatmap-bg: #202020;
  --ef-heatmap-empty: #2c2c2c;
  --ef-heat-ramp: #d8bf00;

  --ef-tooltip: #f4f4f5;
  --ef-tooltip-fg: #18181b;
  --ef-code-bg: #101013;
  --ef-code-fg: #e6e8eb;
}
```

- [ ] **Step 3: 写令牌校验脚本**

创建 `endfield/tools/check-tokens.mjs`：

```js
#!/usr/bin/env node
/**
 * 校验所有 var(--ef-*) 引用在 css/ 下有定义，或自带回退值。
 * 无定义的引用会静默失效（渲染成透明或继承），肉眼极难发现，故用脚本拦截。
 * 退出码 1 表示存在无定义且无回退的引用。
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cssDir = join(root, 'css');

const defined = new Set();
const used = [];

for (const file of readdirSync(cssDir).filter((f) => f.endsWith('.css'))) {
  const src = readFileSync(join(cssDir, file), 'utf8');
  for (const m of src.matchAll(/(--ef-[\w-]+)\s*:/g)) defined.add(m[1]);
  for (const m of src.matchAll(/var\(\s*(--ef-[\w-]+)\s*(,)?/g)) {
    used.push({ name: m[1], file, hasFallback: Boolean(m[2]) });
  }
}

const missing = used.filter((u) => !defined.has(u.name) && !u.hasFallback);
const fallbackOnly = used.filter((u) => !defined.has(u.name) && u.hasFallback);

console.log(`已定义令牌 ${defined.size} 个，引用 ${used.length} 处。`);

if (fallbackOnly.length > 0) {
  const names = [...new Set(fallbackOnly.map((u) => u.name))].sort();
  console.log(`\n仅有回退值（可接受，通常为宿主覆盖点）：\n  ${names.join('\n  ')}`);
}

if (missing.length > 0) {
  console.error(`\n错误：以下 ${missing.length} 处引用既无定义也无回退值：`);
  for (const u of missing) console.error(`  ${u.name}  ← ${u.file}`);
  process.exit(1);
}

console.log('\n通过：所有令牌引用都有定义或回退值。');
```

- [ ] **Step 4: 运行脚本确认通过**

Run: `cd endfield && node tools/check-tokens.mjs`
Expected: 输出「通过：所有令牌引用都有定义或回退值。」且退出码为 0。

- [ ] **Step 5: 验证脚本真能抓错（负向测试）**

临时在 `endfield/css/tokens.css` 末尾追加一行错误引用：

```css
.ef-negative-test { color: var(--ef-does-not-exist); }
```

Run: `cd endfield && node tools/check-tokens.mjs; echo "退出码=$?"`
Expected: 输出 `错误：以下 1 处引用既无定义也无回退值：` 与 `--ef-does-not-exist`，`退出码=1`。

确认后**删除该行**，再次运行确认恢复通过。这一步证明脚本不是永远通过的假测试。

- [ ] **Step 6: 提交**

```bash
cd "F:/AiWorkspace/KimiCode/public"
git add endfield/.gitignore endfield/css/tokens.css endfield/tools/check-tokens.mjs
git commit -m "feat(endfield): 加入设计令牌与令牌引用校验脚本"
```

---

### Task 2: 对比度校验与排版基线

为令牌配色加 WCAG 对比度断言，并建立 reset、排版基线与打印样式。

**Files:**
- Create: `endfield/tools/check-contrast.mjs`
- Create: `endfield/css/base.css`
- Test: `endfield/tools/check-contrast.mjs`

**Interfaces:**
- Consumes: Task 1 的 `tokens.css` 全部颜色令牌
- Produces: `base.css` 中的全局元素样式、`.ef-skip-link`、`@media print` 规则。后续所有页面依赖 `base.css` 已引入 `tokens.css`

- [ ] **Step 1: 写对比度校验脚本**

创建 `endfield/tools/check-contrast.mjs`。脚本从 `tokens.css` 抽出 light 与 dark 两套令牌值，做 alpha 合成后按 WCAG 2.1 公式算对比度。

```js
#!/usr/bin/env node
/**
 * 校验令牌配色的 WCAG 2.1 对比度。
 * 正文要求 >= 4.5:1，大字与图形要求 >= 3:1。
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'css', 'tokens.css'), 'utf8');

/** 截取一个选择器块（从 `sel {` 到配对的 `}`），做括号配平以支持嵌套。 */
function block(sel) {
  const i = src.indexOf(sel);
  if (i < 0) throw new Error(`找不到选择器：${sel}`);
  const start = src.indexOf('{', i);
  let depth = 0;
  for (let j = start; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') {
      depth--;
      if (depth === 0) return src.slice(start + 1, j);
    }
  }
  throw new Error(`选择器未闭合：${sel}`);
}

/**
 * 从 CSS 文本里抽出 --ef-x: 值 的映射，只保留颜色字面量。
 * 主色令牌写作 var(--ef-user-accent, #f2cc00) —— 宿主覆盖点，
 * 必须取其回退字面量，否则 --ef-accent 等会被误判为「未定义」。
 */
function tokens(text) {
  const out = {};
  for (const m of text.matchAll(/(--ef-[\w-]+)\s*:\s*([^;]+);/g)) {
    let v = m[2].trim();
    const hostOverride = v.match(/^var\(\s*[^,)]+\s*,\s*([\s\S]+?)\s*\)$/);
    if (hostOverride) v = hostOverride[1].trim();
    if (/^#[0-9a-f]{3,8}$/i.test(v) || /^rgb/i.test(v)) out[m[1]] = v;
  }
  return out;
}

function parseColor(value) {
  if (value.startsWith('#')) {
    let h = value.slice(1);
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    if (h.length === 6) h += 'ff';
    return [0, 2, 4, 6].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  }
  const m = value.match(/rgba?\(([^)]+)\)/i);
  if (!m) throw new Error(`无法解析颜色：${value}`);
  const parts = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  const [r, g, b] = parts;
  const a = parts.length > 3 ? parts[3] : 1;
  return [r / 255, g / 255, b / 255, a];
}

/** 把带 alpha 的前景色合成到背景色上。 */
function composite(fg, bg) {
  const a = fg[3] ?? 1;
  return [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a));
}

function luminance([r, g, b]) {
  const f = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function ratio(fg, bg) {
  const l1 = luminance(composite(parseColor(fg), parseColor(bg)));
  const l2 = luminance(parseColor(bg));
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

const PAIRS = [
  ['--ef-ink', '--ef-surface', 4.5, '正文 / 主表面'],
  ['--ef-ink', '--ef-surface-muted', 4.5, '正文 / 次表面'],
  ['--ef-ink', '--ef-surface-raised', 4.5, '正文 / 浮起表面'],
  ['--ef-ink', '--ef-surface-sunken', 4.5, '正文 / 凹陷表面'],
  ['--ef-ink-muted', '--ef-surface', 4.5, '次要文字 / 主表面'],
  ['--ef-ink-muted', '--ef-surface-muted', 4.5, '次要文字 / 次表面'],
  ['--ef-accent-fg', '--ef-accent', 4.5, '主色块前景'],
  ['--ef-accent-ink', '--ef-surface', 3, '主色文字/图形 / 主表面'],
  ['--ef-accent-ink', '--ef-surface-muted', 3, '主色文字/图形 / 次表面'],
  ['--ef-ink', '--ef-border-strong', 3, '描边可见度'],
];

const baseTokens = tokens(block(':root {'));

/**
 * 语义色与分级色是「与主题无关」的：原色（--ef-info、--ef-tier-N 等）只在
 * :root 定义一次，暗色块不重复声明。但本检查要按主题取 ink 与表面，
 * 所以原色列必须回退到 :root 解析；ink 与表面则严格取当前主题块，
 * 这样「暗色缺少 ink 覆盖」会立刻报错而不是静默通过。
 */
const resolveBase = (t, name) => t[name] ?? baseTokens[name];

/**
 * 语义色与分级色的 ink 分叉：原色做文字/边框时，在「自身低百分比 tint 叠加
 * 表面」的背景上会不达标（亮色主题下 success 仅 1.92:1）。这里用同一套
 * 合成逻辑重算，把这类缺陷变成自动拦截，而不是靠肉眼看。
 * 格式： [ink 令牌, 原色令牌, 表面令牌, tint 比例, 最低比, 说明]
 */
const INK_PAIRS = [
  ['--ef-info-ink', '--ef-info', '--ef-surface', 0.12, 4.5, 'info 徽标文字'],
  ['--ef-success-ink', '--ef-success', '--ef-surface', 0.12, 4.5, 'success 徽标文字'],
  ['--ef-warn-ink', '--ef-warn', '--ef-surface', 0.12, 4.5, 'warn 徽标文字'],
  ['--ef-danger-ink', '--ef-danger', '--ef-surface', 0.12, 4.5, 'danger 徽标文字'],
  ['--ef-tier-1-ink', '--ef-tier-1', '--ef-surface', 0.14, 4.5, 'tier-1 徽标文字'],
  ['--ef-tier-2-ink', '--ef-tier-2', '--ef-surface', 0.14, 4.5, 'tier-2 徽标文字'],
  ['--ef-tier-3-ink', '--ef-tier-3', '--ef-surface', 0.14, 4.5, 'tier-3 徽标文字'],
  ['--ef-tier-4-ink', '--ef-tier-4', '--ef-surface', 0.14, 4.5, 'tier-4 徽标文字'],
  ['--ef-tier-5-ink', '--ef-tier-5', '--ef-surface', 0.14, 4.5, 'tier-5 徽标文字'],
  ['--ef-tier-6-ink', '--ef-tier-6', '--ef-surface', 0.14, 4.5, 'tier-6 徽标文字'],
  // 3px 左边框属图形，阈值 3:1；背景同样是 tint
  ['--ef-info-ink', '--ef-info', '--ef-surface', 0.07, 3, 'info 提示块边框'],
  ['--ef-success-ink', '--ef-success', '--ef-surface', 0.07, 3, 'success 提示块边框'],
  ['--ef-warn-ink', '--ef-warn', '--ef-surface', 0.07, 3, 'warn 提示块边框'],
  ['--ef-danger-ink', '--ef-danger', '--ef-surface', 0.07, 3, 'danger 提示块边框'],
];

const themes = {
  light: tokens(block(':root {')),
  dark: tokens(block('html[data-theme="dark"] {')),
};

let failed = 0;

for (const [name, t] of Object.entries(themes)) {
  console.log(`\n[${name}]`);
  for (const [fg, bg, min, label] of PAIRS) {
    if (!t[fg] || !t[bg]) {
      console.error(`  缺失   ${label}：${fg} 或 ${bg} 未定义`);
      failed++;
      continue;
    }
    const r = ratio(t[fg], t[bg]);
    const ok = r >= min;
    if (!ok) failed++;
    console.log(
      `  ${ok ? '通过' : '失败'}   ${r.toFixed(2)}:1  (需 >= ${min})  ${label}`,
    );
  }

  // ink 对「原色 tint 叠表面」的背景做检查。
  // 四种表面都要查：徽标不只出现在主表面上，也会出现在次表面/凹陷表面
  // （例如表格表头用 sunken），凹陷表面上 tint 双层叠加后对比度最低。
  // 暗色下浮起表面 (#232323) 与主表面 (#181818) 不同，是最紧的未断言组合，故一并列入。
  const INK_SURFACES = [
    '--ef-surface',
    '--ef-surface-muted',
    '--ef-surface-raised',
    '--ef-surface-sunken',
  ];
  for (const [inkTok, rawTok, , tintA, min, label] of INK_PAIRS) {
    for (const surfTok of INK_SURFACES) {
      if (!t[inkTok] || !resolveBase(t, rawTok) || !t[surfTok]) {
        console.error(`  缺失   ${label}：${inkTok} / ${rawTok} / ${surfTok} 未定义`);
        failed++;
        continue;
      }
      // 背景 = 原色以 tintA 的比例混到表面上。
      // 注意不能用 composite()：它取的是「前景」的 alpha，而这里 tint 比例来自
      // 原色（背景成分），必须显式加权求和，否则等于拿 ink 直接和原色比。
      // 原色回退到 :root（与主题无关）；ink 与表面取当前主题
      const rawRgb = parseColor(resolveBase(t, rawTok));
      const surfRgb = parseColor(t[surfTok]);
      const bgRgb = [0, 1, 2].map((i) => rawRgb[i] * tintA + surfRgb[i] * (1 - tintA));
      const bgHex =
        '#' +
        bgRgb.map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
      const r = ratio(t[inkTok], bgHex);
      const ok = r >= min;
      if (!ok) failed++;
      console.log(
        `  ${ok ? '通过' : '失败'}   ${r.toFixed(2)}:1  (需 >= ${min})  ${label} · ${surfTok}`,
      );
    }
  }
}

if (failed > 0) {
  console.error(`\n错误：${failed} 项对比度不达标。`);
  process.exit(1);
}
console.log('\n通过：所有配色对比度达标。');
```

- [ ] **Step 2: 运行确认通过**

Run: `cd endfield && node tools/check-contrast.mjs`
Expected: 两个主题共 18 行全部「通过」，退出码 0。

若某项失败，说明 Task 1 的令牌值需要调整。不要降低阈值来迁就颜色，改颜色。

- [ ] **Step 3: 写排版基线与打印样式**

创建 `endfield/css/base.css`：

```css
/* ==========================================================================
   Endfield 设计系统 — 基础层
   reset、排版基线、底纹、跳转链接、打印样式。
   ========================================================================== */

@import url("tokens.css");

*,
*::before,
*::after {
  box-sizing: border-box;
}

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
  /* 工业底：网格 + 右上角主色辉光 + 表面色 */
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

p {
  margin: 0 0 var(--ef-space-4);
  text-wrap: pretty;
}

a {
  color: inherit;
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
}

img,
svg,
video {
  max-width: 100%;
  height: auto;
  vertical-align: middle;
}

button,
input,
select,
textarea {
  font: inherit;
  color: inherit;
}

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
  background: var(--ef-code-bg);
  color: var(--ef-code-fg);
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

hr {
  margin: var(--ef-space-6) 0;
  border: 0;
  border-top: 1px solid var(--ef-border);
}

table {
  border-collapse: collapse;
  width: 100%;
}

/* 超长无断点文本必须能换行，否则会撑破容器 */
td,
th,
.ef-break-anywhere {
  overflow-wrap: anywhere;
}

:focus-visible {
  outline: 2px solid var(--ef-info);
  outline-offset: 2px;
}

::selection {
  background: var(--ef-accent);
  color: var(--ef-accent-fg);
}

/* ---------- 跳到主内容 ---------- */
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

/* ---------- 打印：强制白底黑字 ---------- */
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
    /* 热力图若不钉，暗色主题打印会输出深色块（.ef-heatmap 是这两个令牌的
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

- [ ] **Step 4: 写一个临时页面验证基线**

创建 `endfield/tools/_probe.html`（临时验证用，Step 6 删除）：

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>基线探针</title>
<link rel="stylesheet" href="../css/base.css">
</head>
<body>
<main id="ef-main" style="padding:2rem">
<h1>标题一</h1>
<h2>标题二</h2>
<p>正文段落，含 <a href="#">链接</a> 与 <code>行内代码</code>。</p>
<table><thead><tr><th>列</th></tr></thead><tbody><tr><td>VeryLongUnbrokenIdentifierWithoutAnySpacesAtAll0123456789</td></tr></tbody></table>
<pre><code>const x = 1;</code></pre>
</main>
</body>
</html>
```

Run: `cd endfield && node tools/check-tokens.mjs`
Expected: 通过（确认 `base.css` 里的令牌引用都有定义）。

- [ ] **Step 5: 在浏览器里核对基线**

用浏览器打开 `endfield/tools/_probe.html`，逐项确认：

- 背景有 24px 网格与右上角淡黄色辉光（浅色主题下）。
- 标题字体比正文粗且更紧，中文渲染正常。
- 表格里那串长标识符**在单元格内换行**，页面**没有**横向滚动条。
- `pre` 块有深色（浅色主题下为浅灰）背景与边框。
- 键盘按 `Tab` 时焦点轮廓可见。

用系统深色模式再打开一次，确认配色整体切换且文字清晰可读。

- [ ] **Step 6: 删除探针并提交**

```bash
cd "F:/AiWorkspace/KimiCode/public"
rm endfield/tools/_probe.html
git add endfield/css/base.css endfield/tools/check-contrast.mjs
git commit -m "feat(endfield): 加入对比度校验与排版基线层"
```

---

### Task 3: 视觉手法原子类

实现规格 §5 的 13 种标志性手法。这是这套设计系统的"指纹"，也是它区别于普通暗色主题的地方。

**Files:**
- Create: `endfield/css/utilities.css`
- Test: `endfield/tools/_probe.html`（临时，Step 5 删除）

**Interfaces:**
- Consumes: Task 1 令牌
- Produces: 以下类名，后续 layout/components/pages 全部依赖：`.ef-chamfer`、`.ef-chamfer-sm`、`.ef-corner-frame`、`.ef-grid-backdrop`、`.ef-industrial-shell`、`.ef-scanline`、`.ef-hatch`、`.ef-label-pair`、`.ef-bar-title`、`.ef-slash`、`.ef-bracket`、`.ef-h2-title`、`.ef-signal-bars`、`.ef-top-signal-strip`、`.ef-tier-strip`、`.ef-boot-strip`、`.ef-boot-title`、`.ef-corner-in`、`.ef-rise-in`、`.ef-reveal`、`.ef-live`、`.ef-bar-grow`、`.ef-eyebrow`

- [ ] **Step 1: 写切角与角括号**

创建 `endfield/css/utilities.css`，先写形状类：

```css
/* ==========================================================================
   Endfield 设计系统 — 视觉手法原子类
   13 种标志性手法的实现。这些类是本设计系统的视觉指纹。
   ========================================================================== */

/* ---------- 1. 切角矩形 ---------- */
/* 注意：clip-path 会裁掉 border，需要描边时改用 .ef-corner-frame 或内嵌伪元素。 */
.ef-chamfer {
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

.ef-chamfer-sm {
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

/* ---------- 2. 四角括号 ---------- */
/* 用 4 个伪元素不可行（每元素只有 2 个），改用 background 四角定位。 */
.ef-corner-frame {
  position: relative;
}

.ef-corner-frame::before,
.ef-corner-frame::after {
  content: "";
  position: absolute;
  width: 14px;
  height: 14px;
  border: 1px solid var(--ef-heading-bracket);
  pointer-events: none;
}

.ef-corner-frame::before {
  top: -1px;
  left: -1px;
  border-right: 0;
  border-bottom: 0;
}

.ef-corner-frame::after {
  bottom: -1px;
  right: -1px;
  border-left: 0;
  border-top: 0;
}

/* 完整四角：角括号必须画在伪元素层，不能占用元素自身的 background-image，
   否则与 .ef-industrial-shell / .ef-grid-backdrop 等同样使用 background-image
   的手法类无法叠加在同一个元素上（后出现的那条规则会整体胜出）。
   ::after 保持 display:none —— 同时挂 .ef-corner-frame 与 .ef-corner-frame--all 时，
   这里的 8 条渐变已包含右下角，::after 再画一次会重复。 */
.ef-corner-frame--all {
  position: relative;
}

.ef-corner-frame--all::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  /* 覆盖 .ef-corner-frame::before 的 14px 方框，否则角括号层会缩成 14×14 */
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

.ef-corner-frame--all::after {
  display: none;
}

/* ---------- 3. 网格底纹 ---------- */
.ef-grid-backdrop {
  background-image:
    linear-gradient(var(--ef-grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--ef-grid-line) 1px, transparent 1px);
  background-size: var(--ef-grid-size) var(--ef-grid-size);
}

/* ---------- 4. 工业底 ---------- */
/* 注意：这些手法类只能声明 background-image / background-size 等长写属性，
   不能用 background 简写 —— 简写会重置 background-image，从而清掉同一元素上
   由其他手法类设置的底纹（例如 .ef-panel 的 background 会抹掉网格与角括号）。
   底色的赋值放到底层（base.css 的 body / .ef-panel 等），不在这里重复。 */
.ef-industrial-shell {
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
}

/* ---------- 5. 扫描线 ---------- */
.ef-scanline {
  background-image: repeating-linear-gradient(
    0deg,
    var(--ef-scanline) 0 1px,
    transparent 1px 4px
  );
}

/* ---------- 6. 斜纹 ---------- */
/* 颜色继承 currentColor，用于激活态与选中态填充。 */
.ef-hatch {
  background-image: repeating-linear-gradient(
    -45deg,
    currentColor 0 1px,
    transparent 1px 5px
  );
}

/* ---------- 7. 中英双行标签 ---------- */
.ef-label-pair {
  display: inline-flex;
  flex-direction: column;
  gap: 1px;
  line-height: 1.15;
}

.ef-label-pair > b {
  font-family: var(--ef-font-display);
  font-size: var(--ef-text-sm);
  font-weight: var(--ef-weight-semibold);
}

.ef-label-pair > i {
  font-family: var(--ef-font-mono);
  font-size: 0.625rem;
  font-style: normal;
  letter-spacing: var(--ef-tracking-caps);
  text-transform: uppercase;
  color: var(--ef-ink-subtle);
}

/* ---------- 8. 标题竖条 / 双斜杠 / 方括号 ---------- */
.ef-bar-title {
  display: flex;
  align-items: center;
  gap: var(--ef-space-3);
  font-family: var(--ef-font-display);
  font-size: var(--ef-text-xl);
  font-weight: var(--ef-weight-bold);
}

.ef-bar-title::before {
  content: "";
  flex: none;
  width: 3px;
  height: 1.1em;
  background: var(--ef-accent-ink);
}

.ef-slash::before {
  content: "// ";
  font-family: var(--ef-font-mono);
  color: var(--ef-ink-subtle);
}

.ef-bracket::before {
  content: "[ ";
  color: var(--ef-heading-bracket);
}

.ef-bracket::after {
  content: " ]";
  color: var(--ef-heading-bracket);
}

.ef-eyebrow {
  font-family: var(--ef-font-mono);
  font-size: var(--ef-text-xs);
  letter-spacing: var(--ef-tracking-caps);
  text-transform: uppercase;
  color: var(--ef-ink-subtle);
}

/* ---------- 9. 标题渐变条 ---------- */
.ef-h2-title {
  display: inline;
  padding-bottom: 0.12em;
  background-image:
    linear-gradient(
      to right,
      var(--ef-heading-bar) 0%,
      var(--ef-heading-bar) 55%,
      var(--ef-heading-bar-fade) 100%
    ),
    linear-gradient(var(--ef-heading-rule), var(--ef-heading-rule));
  background-repeat: no-repeat;
  background-position: 0 calc(100% - 3px), 0 100%;
  background-size: 100% 9px, 100% 3px;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

/* ---------- 10. 信号波形条 ---------- */
.ef-signal-bars {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 26px;
}

.ef-signal-bars > i {
  display: block;
  width: 4px;
  background: var(--ef-border-strong);
}

/* 高度序列固定，保证可复现，不用随机数 */
.ef-signal-bars > i:nth-child(4n + 1) { height: 30%; }
.ef-signal-bars > i:nth-child(4n + 2) { height: 70%; }
.ef-signal-bars > i:nth-child(4n + 3) { height: 45%; }
.ef-signal-bars > i:nth-child(4n + 4) { height: 100%; }

.ef-signal-bars > i.is-active {
  background: var(--ef-accent-ink);
}

/* ---------- 11. 顶部信号条 ---------- */
.ef-top-signal-strip {
  height: var(--ef-header-signal-h);
  background-image: linear-gradient(
    90deg,
    var(--ef-signal-magenta) 0 35%,
    var(--ef-accent) 35% 82%,
    var(--ef-system) 82% 100%
  );
}

/* ---------- 12. 分级条 ---------- */
.ef-tier-strip {
  /* 回退只写在 var() 里，不能写成 `--ef-tier-color: var(--ef-tier-3)`：
     那样会在本元素上直接声明该变量，从而遮蔽祖先 [data-tier] 的值，
     导致所有条都渲染成 tier-3。 */
  height: 3px;
  background-image: linear-gradient(
    90deg,
    color-mix(in srgb, var(--ef-tier-color, var(--ef-tier-3)) 70%, transparent) 0 62%,
    var(--ef-signal-cyan) 62% 74%,
    var(--ef-signal-magenta) 74% 86%,
    var(--ef-signal-yellow) 86% 100%
  );
}

[data-tier="1"] { --ef-tier-color: var(--ef-tier-1); --ef-tier-ink: var(--ef-tier-1-ink); }
[data-tier="2"] { --ef-tier-color: var(--ef-tier-2); --ef-tier-ink: var(--ef-tier-2-ink); }
[data-tier="3"] { --ef-tier-color: var(--ef-tier-3); --ef-tier-ink: var(--ef-tier-3-ink); }
[data-tier="4"] { --ef-tier-color: var(--ef-tier-4); --ef-tier-ink: var(--ef-tier-4-ink); }
[data-tier="5"] { --ef-tier-color: var(--ef-tier-5); --ef-tier-ink: var(--ef-tier-5-ink); }
[data-tier="6"] { --ef-tier-color: var(--ef-tier-6); --ef-tier-ink: var(--ef-tier-6-ink); }

/* ---------- 13. 入场动效 ---------- */
@keyframes ef-boot-wipe {
  from { clip-path: inset(0 100% 0 0); }
  to   { clip-path: inset(0); }
}

@keyframes ef-title-print {
  from { clip-path: inset(-0.3em 100% -0.3em 0); opacity: 0; }
  to   { clip-path: inset(-0.3em 0); opacity: 1; }
}

@keyframes ef-corner-in {
  from { opacity: 0; transform: scale(0.55); }
  to   { opacity: 1; transform: none; }
}

@keyframes ef-rise-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: none; }
}

@keyframes ef-live-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}

@keyframes ef-bar-grow {
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
}

.ef-boot-strip {
  animation: ef-boot-wipe 0.45s var(--ef-ease-out-expo) both;
}

.ef-boot-title {
  animation: ef-title-print 0.56s var(--ef-ease-out-expo) both;
}

.ef-corner-in {
  animation: ef-corner-in 0.38s var(--ef-ease-out-quint) both;
}

.ef-rise-in {
  animation: ef-rise-in 0.4s var(--ef-ease-out-quint) both;
}

.ef-live {
  animation: ef-live-pulse 2.4s ease-in-out infinite;
}

.ef-bar-grow {
  transform-origin: bottom;
  animation: ef-bar-grow 0.38s var(--ef-ease-out-quint) both;
  animation-delay: calc(var(--ef-i, 0) * 18ms);
}

/* 滚动进入视口时揭示。初始 opacity: 0，故 reduced-motion 下必须强制终态。 */
.ef-reveal {
  opacity: 0;
  transform: translateY(26px);
  transition:
    opacity 0.6s var(--ef-ease-out-quint),
    transform 0.6s var(--ef-ease-out-quint);
  transition-delay: var(--ef-reveal-delay, 0s);
  will-change: opacity, transform;
}

.ef-reveal.is-visible {
  opacity: 1;
  transform: none;
}

/* 降低动效偏好：关闭全部动效，并让 .ef-reveal 直接可见 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }

  .ef-reveal {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
```

- [ ] **Step 2: 建手法演示探针**

创建 `endfield/tools/_probe.html`：

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>视觉手法探针</title>
<link rel="stylesheet" href="../css/base.css">
<link rel="stylesheet" href="../css/utilities.css">
<style>
  body { padding: 2rem; display: grid; gap: 2rem; }
  .cell { padding: 1.25rem; border: 1px solid var(--ef-border);
          background: var(--ef-surface-raised); }
</style>
</head>
<body>
<div class="ef-top-signal-strip"></div>

<div class="cell ef-chamfer" style="background:var(--ef-accent);color:var(--ef-accent-fg)">
  切角 9px
</div>
<div class="cell ef-chamfer-sm" style="background:var(--ef-surface-muted)">切角 6px</div>
<div class="cell ef-corner-frame--all">四角括号</div>
<div class="cell ef-grid-backdrop">网格底纹</div>
<div class="cell ef-industrial-shell">工业底</div>
<div class="cell ef-scanline">扫描线</div>
<div class="cell" style="color:var(--ef-accent)"><span class="ef-hatch">斜纹（继承 currentColor）</span></div>

<div class="cell">
  <span class="ef-label-pair"><b>列表</b><i>Listing</i></span>
</div>
<div class="cell"><h3 class="ef-bar-title">竖条标题</h3></div>
<div class="cell"><span class="ef-eyebrow ef-slash">Archive Index</span></div>
<div class="cell"><span class="ef-bracket">方括号</span></div>
<div class="cell"><h2 class="ef-h2-title">标题渐变条</h2></div>

<div class="cell">
  <div class="ef-signal-bars">
    <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
    <i class="is-active"></i><i></i><i></i><i></i>
  </div>
</div>

<div class="cell" data-tier="1">分级条 1<div class="ef-tier-strip"></div></div>
<div class="cell" data-tier="4">分级条 4<div class="ef-tier-strip"></div></div>
<div class="cell" data-tier="6">分级条 6<div class="ef-tier-strip"></div></div>

<div class="cell ef-boot-title">扫入标题</div>
<div class="cell ef-corner-in">角入</div>
<div class="cell ef-rise-in">升起</div>
<div class="cell"><span class="ef-live">● 实时脉冲</span></div>
<div class="cell">
  <div class="ef-signal-bars">
    <i class="ef-bar-grow" style="--ef-i:0"></i>
    <i class="ef-bar-grow" style="--ef-i:1"></i>
    <i class="ef-bar-grow" style="--ef-i:2"></i>
    <i class="ef-bar-grow" style="--ef-i:3"></i>
    <i class="ef-bar-grow" style="--ef-i:4"></i>
  </div>
</div>
<div class="cell ef-reveal is-visible">揭示（终态）</div>
</body>
</html>
```

- [ ] **Step 3: 运行令牌校验**

Run: `cd endfield && node tools/check-tokens.mjs`
Expected: 通过，无未定义引用。

- [ ] **Step 4: 浏览器逐项核对**

打开 `endfield/tools/_probe.html`，确认：

- 顶部信号条为「品红 → 主色 → 青」三段渐变，高 3px。
- 第一个方块**右上角与左下角**被斜切，不是四角圆角。
- 四角括号块的四个角都有 L 形短线。
- 网格块显示 24px 方格；工业底块有网格加右上角辉光。
- 斜纹块的斜纹颜色是主色（跟随 `currentColor`）。
- 双行标签上行中文较粗、下行英文小号大写且字距明显拉开。
- 竖条标题左侧有 3px 主色竖条；eyebrow 行以 `//` 开头。
- 标题渐变条下方有一条右端淡出的粗条与一条细实线。
- 波形条高度呈高低起伏，其中一根为主色。
- 三个分级条的左段颜色分别为灰蓝、紫、红，右段有三色刻度。
- 标题以从左到右扫入的动画出现；脉冲点持续明暗呼吸。

- [ ] **Step 5: 验证 reduced-motion 不会让内容隐形**

这一步针对 Review Focus 第 5 条。在浏览器开发者工具中开启「模拟 prefers-reduced-motion: reduce」（Chrome：Rendering 面板 → Emulate CSS media feature prefers-reduced-motion → reduce），刷新页面，确认：

- 所有动画停止，元素**立即**处于终态（不残留 `opacity: 0`）。
- 最后一个 `.ef-reveal` 块**可见**。

再临时把探针里 `ef-reveal is-visible` 的 `is-visible` 去掉（模拟未触发滚动揭示），在 reduced-motion 下刷新，确认该块**仍然可见**——这证明 CSS 的 reduced-motion 兜底生效，不依赖 JS。核对后把 `is-visible` 加回。

- [ ] **Step 6: 删除探针并提交**

```bash
cd "F:/AiWorkspace/KimiCode/public"
rm endfield/tools/_probe.html
git add endfield/css/utilities.css
git commit -m "feat(endfield): 实现 13 种标志性视觉手法原子类"
```

---

### Task 4: 布局骨架

实现顶栏、侧栏、内容区、页脚与响应式断点。

**Files:**
- Create: `endfield/css/layout.css`
- Test: `endfield/tools/_probe.html`（临时，Step 5 删除）

**Interfaces:**
- Consumes: Task 1 令牌、Task 3 的 `.ef-top-signal-strip`、`.ef-label-pair`、`.ef-industrial-shell`
- Produces: 以下类名与 DOM 契约，12 个页面模板全部依赖：
  - `.ef-app`（根容器）、`.ef-topbar`、`.ef-topbar__brand`、`.ef-topbar__search`、`.ef-topbar__actions`、`.ef-topbar__user`
  - `.ef-sidebar`、`.ef-sidebar__section`、`.ef-sidebar__section-title`、`.ef-sidebar__item`、`.ef-sidebar__footer`
  - `.ef-main`、`.ef-content`、`.ef-footer`
  - `.ef-sidebar-toggle`（按钮，`aria-expanded` / `aria-controls="ef-sidebar"`）
  - 状态类：`.is-collapsed`（挂 `.ef-app` 上表示侧栏收起）、`.is-open`（窄屏抽屉展开）
  - CSS 变量：`--ef-sidebar-current-w`

- [ ] **Step 1: 写布局样式**

创建 `endfield/css/layout.css`：

```css
/* ==========================================================================
   Endfield 设计系统 — 布局骨架
   顶栏（固定 56px + 3px 信号条）+ 侧栏（214px，可收起）+ 内容区 + 页脚。
   ========================================================================== */

.ef-app {
  --ef-sidebar-current-w: var(--ef-sidebar-w);
  min-height: 100vh;
  display: grid;
  grid-template-columns: var(--ef-sidebar-current-w) minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr) auto;
  grid-template-areas:
    "topbar topbar"
    "sidebar main"
    "footer footer";
}

.ef-app.is-collapsed {
  --ef-sidebar-current-w: var(--ef-sidebar-w-collapsed);
}

/* ---------- 顶栏 ---------- */
.ef-topbar {
  grid-area: topbar;
  position: sticky;
  top: 0;
  z-index: var(--ef-z-header);
  background-color: var(--ef-surface);
  border-bottom: 1px solid var(--ef-border);
}

.ef-topbar__signal {
  height: var(--ef-header-signal-h);
  background-image: linear-gradient(
    90deg,
    var(--ef-signal-magenta) 0 35%,
    var(--ef-accent) 35% 82%,
    var(--ef-system) 82% 100%
  );
}

.ef-topbar__bar {
  height: var(--ef-header-bar-h);
  display: flex;
  align-items: center;
  gap: var(--ef-space-4);
  padding: 0 var(--ef-space-4);
}

.ef-topbar__brand {
  display: flex;
  align-items: center;
  gap: var(--ef-space-3);
  font-family: var(--ef-font-display);
  font-size: var(--ef-text-lg);
  font-weight: var(--ef-weight-bold);
  text-decoration: none;
  white-space: nowrap;
}

.ef-topbar__search {
  flex: 1 1 auto;
  min-width: 0;
  max-width: 42rem;
}

.ef-topbar__actions {
  display: flex;
  align-items: center;
  gap: var(--ef-space-1);
  margin-left: auto;
}

.ef-topbar__user {
  display: flex;
  align-items: center;
  gap: var(--ef-space-2);
  padding-left: var(--ef-space-3);
  border-left: 1px solid var(--ef-border);
  white-space: nowrap;
}

/* ---------- 侧栏 ---------- */
.ef-sidebar {
  grid-area: sidebar;
  position: sticky;
  top: calc(var(--ef-header-bar-h) + var(--ef-header-signal-h));
  /* 必须 stretch 且只设 max-height：若写死 height 为视口高，侧栏会把整个
     grid 行撑高（内容高 + 侧栏高），页面永远比视口高，页脚被推到视口外，
     滚到底还会被 sticky 侧栏盖住。 */
  align-self: stretch;
  height: auto;
  max-height: calc(100vh - var(--ef-header-bar-h) - var(--ef-header-signal-h));
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: var(--ef-space-3) 0;
  background-color: var(--ef-surface);
  border-right: 1px solid var(--ef-border);
}

.ef-sidebar__section {
  padding: var(--ef-space-2) var(--ef-space-3);
}

.ef-sidebar__section-title {
  display: flex;
  align-items: center;
  gap: var(--ef-space-2);
  padding: var(--ef-space-2) var(--ef-space-2);
  font-family: var(--ef-font-mono);
  font-size: 0.625rem;
  letter-spacing: var(--ef-tracking-caps);
  text-transform: uppercase;
  color: var(--ef-ink-subtle);
}

.ef-sidebar__section-title::before {
  content: "◆";
  font-size: 0.5rem;
  color: var(--ef-accent-ink);
}

.ef-sidebar__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--ef-space-3);
  padding: var(--ef-space-2) var(--ef-space-3);
  border-radius: var(--ef-radius-sm);
  color: var(--ef-ink-muted);
  text-decoration: none;
  transition:
    background-color var(--ef-duration-fast) var(--ef-ease-out),
    color var(--ef-duration-fast) var(--ef-ease-out);
}

/* 激活态 2px 主色竖条 */
.ef-sidebar__item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 30%;
  bottom: 30%;
  width: 2px;
  border-radius: 999px;
  background-color: var(--ef-accent-ink);
  opacity: 0;
  transform: scaleY(0.45);
  transition:
    opacity var(--ef-duration-fast) var(--ef-ease-out),
    transform var(--ef-duration-fast) var(--ef-ease-out);
  pointer-events: none;
}

.ef-sidebar__item:hover,
.ef-sidebar__item:focus-visible {
  background-color: var(--ef-surface-muted);
  color: var(--ef-ink);
}

.ef-sidebar__item:hover::before,
.ef-sidebar__item:focus-visible::before {
  opacity: 1;
  transform: scaleY(1);
}

.ef-sidebar__item[aria-current="page"] {
  background-color: var(--ef-surface-muted);
  color: var(--ef-ink);
}

.ef-sidebar__item[aria-current="page"]::before {
  opacity: 1;
  transform: scaleY(1);
}

.ef-sidebar__item svg {
  flex: none;
  width: 18px;
  height: 18px;
}

/* 收起态：只留图标，隐藏文字 */
.is-collapsed .ef-sidebar__section-title,
.is-collapsed .ef-sidebar__item > .ef-label-pair {
  display: none;
}

.is-collapsed .ef-sidebar__item {
  justify-content: center;
  padding-inline: 0;
}

.ef-sidebar__footer {
  margin-top: var(--ef-space-4);
  padding: var(--ef-space-3);
  border-top: 1px solid var(--ef-border);
}

/* ---------- 主内容区 ---------- */
.ef-main {
  grid-area: main;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.ef-content {
  flex: 1 1 auto;
  min-width: 0;
  width: 100%;
  max-width: 80rem;
  margin-inline: auto;
  padding: var(--ef-space-6) var(--ef-space-6) var(--ef-space-12);
}

/* ---------- 页脚 ---------- */
.ef-footer {
  grid-area: footer;
  border-top: 1px solid var(--ef-border);
  background-color: var(--ef-surface);
  padding: var(--ef-space-8) var(--ef-space-6);
  font-size: var(--ef-text-sm);
  color: var(--ef-ink-muted);
  /* 建立层叠上下文并压过 sticky 侧栏：长页面滚到底时，侧栏（sticky，
     z-index 自动）会盖住页脚左侧 214px，导致前两个页脚链接点不中。
     实测无此行时 elementFromPoint 返回 ASIDE.ef-sidebar，加上后返回链接本身。 */
  position: relative;
  z-index: 1;
}

.ef-footer__inner {
  max-width: 80rem;
  margin-inline: auto;
  display: grid;
  gap: var(--ef-space-6);
}

.ef-footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ef-space-2) var(--ef-space-5);
  list-style: none;
  margin: 0;
  padding: 0;
}

.ef-footer__legal {
  color: var(--ef-ink-subtle);
  font-size: var(--ef-text-xs);
  line-height: var(--ef-leading-relaxed);
}

/* ---------- 响应式 ---------- */

/* 窄屏：侧栏变抽屉，从左侧滑出，用 .is-open 控制 */
@media (max-width: 900px) {
  .ef-app {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      "topbar"
      "main"
      "footer";
  }

  .ef-sidebar {
    position: fixed;
    top: calc(var(--ef-header-bar-h) + var(--ef-header-signal-h));
    bottom: 0;
    left: 0;
    z-index: var(--ef-z-overlay);
    width: min(280px, 85vw);
    height: auto;
    transform: translateX(-100%);
    transition: transform var(--ef-duration-base) var(--ef-ease-out-quint);
    box-shadow: 0 0 0 1px var(--ef-border);
  }

  .ef-app.is-open .ef-sidebar {
    transform: none;
  }

  .ef-content {
    padding: var(--ef-space-4) var(--ef-space-4) var(--ef-space-10);
  }
}

/* 抽屉打开时的遮罩。显示规则是后代选择器 .ef-app.is-open .ef-scrim，
   所以标记里 .ef-scrim 必须是 .ef-app 的子元素，放在它外面永远不显示。 */
.ef-scrim {
  position: fixed;
  inset: 0;
  z-index: var(--ef-z-scrim);
  background-color: rgb(0 0 0 / 50%);
  opacity: 0;
  visibility: hidden;
  transition:
    opacity var(--ef-duration-base) var(--ef-ease-out),
    visibility var(--ef-duration-base);
}

@media (max-width: 900px) {
  .ef-app.is-open .ef-scrim {
    opacity: 1;
    visibility: visible;
  }
}

@media (min-width: 901px) {
  .ef-scrim {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ef-sidebar {
    transition: none;
  }
}
```

- [ ] **Step 2: 建骨架探针**

创建 `endfield/tools/_probe.html`：

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>布局探针</title>
<link rel="stylesheet" href="../css/base.css">
<link rel="stylesheet" href="../css/utilities.css">
<link rel="stylesheet" href="../css/layout.css">
</head>
<body>
<a class="ef-skip-link" href="#ef-main">跳到主内容</a>

<div class="ef-app">
  <header class="ef-topbar">
    <div class="ef-topbar__signal"></div>
    <div class="ef-topbar__bar">
      <a class="ef-topbar__brand" href="#">◈ 档案库 <span class="ef-eyebrow">BETA</span></a>
      <div class="ef-topbar__search">
        <input type="search" placeholder="搜索条目…" aria-label="搜索"
               style="width:100%;padding:.5rem .75rem;border:1px solid var(--ef-border);background:var(--ef-surface-muted)">
      </div>
      <div class="ef-topbar__actions">
        <button type="button" aria-label="偏好设置"
                style="width:32px;height:32px;border:1px solid var(--ef-border);background:var(--ef-surface-muted)">⚙</button>
      </div>
      <div class="ef-topbar__user"><span class="ef-eyebrow">未登录</span></div>
    </div>
  </header>

  <aside class="ef-sidebar" id="ef-sidebar">
    <nav class="ef-sidebar__section" aria-label="浏览">
      <div class="ef-sidebar__section-title">浏览</div>
      <a class="ef-sidebar__item" href="#" aria-current="page">
        <span class="ef-label-pair"><b>首页</b><i>Home</i></span>
      </a>
      <a class="ef-sidebar__item" href="#">
        <span class="ef-label-pair"><b>分类索引</b><i>Index</i></span>
      </a>
    </nav>
    <nav class="ef-sidebar__section" aria-label="内容分类">
      <div class="ef-sidebar__section-title">内容分类</div>
      <a class="ef-sidebar__item" href="#">
        <span class="ef-label-pair"><b>条目列表</b><i>Listing</i></span>
      </a>
    </nav>
    <div class="ef-sidebar__footer">
      <button type="button" class="ef-sidebar-toggle" aria-expanded="true" aria-controls="ef-sidebar"
              style="width:100%;padding:.4rem;border:1px solid var(--ef-border);background:var(--ef-surface-muted)">
        收起侧栏
      </button>
    </div>
  </aside>

  <main class="ef-main" id="ef-main">
    <div class="ef-content">
      <h1>骨架验证</h1>
      <p>内容区应随窗口缩放，且不产生横向滚动条。</p>
      <p class="ef-break-anywhere">VeryLongUnbrokenIdentifierWithoutAnySpacesAtAll0123456789</p>
    </div>
  </main>

  <footer class="ef-footer">
    <div class="ef-footer__inner">
      <ul class="ef-footer__links">
        <li><a href="#">关于本站</a></li>
        <li><a href="#">隐私政策</a></li>
        <li><a href="#">使用条款</a></li>
      </ul>
      <p class="ef-footer__legal">示例内容，仅用于设计系统演示。</p>
    </div>
  </footer>

  <!-- 遮罩必须是 .ef-app 的子元素：显示规则是后代选择器 .ef-app.is-open .ef-scrim -->
  <div class="ef-scrim"></div>
</div>
</body>
</html>
```

- [ ] **Step 3: 运行令牌校验**

Run: `cd endfield && node tools/check-tokens.mjs`
Expected: 通过。

- [ ] **Step 4: 三断点核对**

在浏览器打开探针，用设备模拟器逐档核对：

- **1440px**：侧栏在左且固定宽 214px，顶栏吸顶，页脚在底部，内容区最大宽 1280px 居中。
- **768px**：侧栏仍在左侧，内容区收窄，无横向滚动。
- **375px**：侧栏**不可见**（滑出屏外），内容区占满宽度；顶栏不换行；那串长标识符在容器内换行；**页面无横向滚动条**。

在 375px 下确认侧栏默认不可见——这一步覆盖 Review Focus 第 4 条。

- [ ] **Step 5: 删除探针并提交**

```bash
cd "F:/AiWorkspace/KimiCode/public"
rm endfield/tools/_probe.html
git add endfield/css/layout.css
git commit -m "feat(endfield): 实现顶栏/侧栏/内容区/页脚布局骨架与响应式断点"
```

---

### Task 5: 原子组件样式

实现规格 §6.1 的 13 类原子组件。

**Files:**
- Create: `endfield/css/components.css`（本任务只写原子部分）
- Test: `endfield/tools/_probe.html`（临时，Step 4 删除）

**Interfaces:**
- Consumes: Task 1 令牌、Task 3 的 `.ef-chamfer-sm`、`.ef-hatch`、`.ef-tier-strip`
- Produces: 以下类名，Task 6 与页面模板依赖：
  - `.ef-btn` + `.ef-btn--primary` / `--secondary` / `--ghost` / `--danger`，尺寸 `.ef-btn--sm` / `--lg`，状态 `.is-loading`
  - `.ef-icon-btn`
  - `.ef-input`、`.ef-textarea`、`.ef-select`、`.ef-field`、`.ef-label`、`.ef-hint`
  - `.ef-check`、`.ef-radio`、`.ef-switch`
  - `.ef-badge` + `--info` / `--success` / `--warn` / `--danger` / `--tier`
  - `.ef-chip`、`.ef-chip-group`
  - `.ef-divider`、`.ef-divider--labeled`
  - `.ef-kbd`
  - `.ef-avatar` + `--sm` / `--lg`
  - `.ef-spinner`、`.ef-skeleton`
  - `.ef-progress`、`.ef-progress__bar`
  - `.ef-tooltip`

- [ ] **Step 1: 写按钮与图标按钮**

创建 `endfield/css/components.css`：

```css
/* ==========================================================================
   Endfield 设计系统 — 组件样式
   原子组件（本文件前半）与结构组件（本文件后半）。
   ========================================================================== */

/* ==========================================================================
   按钮
   ========================================================================== */

.ef-btn {
  --ef-btn-bg: var(--ef-surface-muted);
  --ef-btn-fg: var(--ef-ink);
  --ef-btn-border: var(--ef-border);
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--ef-space-2);
  padding: 0.55rem 1rem;
  border: 1px solid var(--ef-btn-border);
  border-radius: var(--ef-radius);
  background-color: var(--ef-btn-bg);
  color: var(--ef-btn-fg);
  font-family: var(--ef-font-sans);
  font-size: var(--ef-text-sm);
  font-weight: var(--ef-weight-medium);
  line-height: 1.2;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color var(--ef-duration-fast) var(--ef-ease-out),
    border-color var(--ef-duration-fast) var(--ef-ease-out),
    color var(--ef-duration-fast) var(--ef-ease-out);
}

.ef-btn:hover {
  border-color: var(--ef-border-strong);
  background-color: color-mix(in srgb, var(--ef-btn-bg) 88%, var(--ef-ink) 12%);
}

.ef-btn:active {
  transform: translateY(1px);
}

.ef-btn[disabled],
.ef-btn[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.ef-btn svg {
  flex: none;
  width: 1em;
  height: 1em;
}

/* 主按钮：主色实底 + 深墨字 */
.ef-btn--primary {
  --ef-btn-bg: var(--ef-accent);
  --ef-btn-fg: var(--ef-accent-fg);
  --ef-btn-border: var(--ef-accent-strong);
  font-weight: var(--ef-weight-semibold);
}

.ef-btn--primary:hover {
  background-color: var(--ef-accent-strong);
  border-color: var(--ef-accent-strong);
}

/* 次按钮：透明底 + 描边 */
.ef-btn--secondary {
  --ef-btn-bg: transparent;
  --ef-btn-fg: var(--ef-ink);
  --ef-btn-border: var(--ef-border-strong);
}

.ef-btn--secondary:hover {
  background-color: var(--ef-surface-muted);
}

/* 幽灵按钮 */
.ef-btn--ghost {
  --ef-btn-bg: transparent;
  --ef-btn-fg: var(--ef-ink-muted);
  --ef-btn-border: transparent;
}

.ef-btn--ghost:hover {
  background-color: var(--ef-surface-muted);
  border-color: transparent;
  color: var(--ef-ink);
}

/* 危险按钮 */
.ef-btn--danger {
  --ef-btn-bg: var(--ef-danger);
  --ef-btn-fg: #ffffff;
  --ef-btn-border: var(--ef-danger);
}

.ef-btn--danger:hover {
  background-color: color-mix(in srgb, var(--ef-danger) 82%, #000000);
  border-color: color-mix(in srgb, var(--ef-danger) 82%, #000000);
}

/* 尺寸 */
.ef-btn--sm {
  padding: 0.3rem 0.6rem;
  font-size: var(--ef-text-xs);
}

.ef-btn--lg {
  padding: 0.8rem 1.5rem;
  font-size: var(--ef-text-base);
}

/* 载入态：文字降透明度，叠一个旋转指示器 */
.ef-btn.is-loading {
  color: transparent;
  pointer-events: none;
}

.ef-btn.is-loading::after {
  content: "";
  position: absolute;
  inset: 0;
  margin: auto;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  color: var(--ef-btn-fg);
  animation: ef-spin 0.7s linear infinite;
}

@keyframes ef-spin {
  to { transform: rotate(360deg); }
}

/* 图标按钮：方形切角 */
.ef-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--ef-border);
  background-color: var(--ef-surface-muted);
  color: var(--ef-ink-muted);
  cursor: pointer;
  --ef-chamfer-size: var(--ef-chamfer-sm);
  clip-path: polygon(
    0 0,
    calc(100% - var(--ef-chamfer-size)) 0,
    100% var(--ef-chamfer-size),
    100% 100%,
    var(--ef-chamfer-size) 100%,
    0 calc(100% - var(--ef-chamfer-size))
  );
  transition:
    background-color var(--ef-duration-fast) var(--ef-ease-out),
    color var(--ef-duration-fast) var(--ef-ease-out);
}

.ef-icon-btn:hover {
  background-color: var(--ef-accent);
  color: var(--ef-accent-fg);
}

.ef-icon-btn svg {
  width: 16px;
  height: 16px;
}
```

- [ ] **Step 2: 写表单控件**

追加到 `endfield/css/components.css`：

```css
/* ==========================================================================
   表单控件
   ========================================================================== */

.ef-field {
  display: flex;
  flex-direction: column;
  gap: var(--ef-space-1);
  margin-bottom: var(--ef-space-4);
}

.ef-label {
  font-family: var(--ef-font-mono);
  font-size: var(--ef-text-xs);
  letter-spacing: var(--ef-tracking-caps);
  text-transform: uppercase;
  color: var(--ef-ink-muted);
}

.ef-hint {
  font-size: var(--ef-text-xs);
  color: var(--ef-ink-subtle);
}

.ef-input,
.ef-textarea,
.ef-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--ef-border);
  border-radius: var(--ef-radius);
  background-color: var(--ef-surface-sunken);
  color: var(--ef-ink);
  font-family: var(--ef-font-sans);
  font-size: var(--ef-text-sm);
  transition:
    border-color var(--ef-duration-fast) var(--ef-ease-out),
    background-color var(--ef-duration-fast) var(--ef-ease-out);
}

.ef-input::placeholder,
.ef-textarea::placeholder {
  color: var(--ef-ink-subtle);
}

.ef-input:hover,
.ef-textarea:hover,
.ef-select:hover {
  border-color: var(--ef-border-strong);
}

.ef-input:focus,
.ef-textarea:focus,
.ef-select:focus {
  outline: none;
  border-color: var(--ef-accent-ink);
  background-color: var(--ef-surface);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--ef-accent) 30%, transparent);
}

.ef-textarea {
  min-height: 6rem;
  resize: vertical;
  line-height: var(--ef-leading-normal);
}

.ef-select {
  appearance: none;
  padding-right: 2rem;
  /* 下拉箭头用内联 SVG 数据 URI，避免额外请求 */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%23808080' stroke-width='1.6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 12px 8px;
  cursor: pointer;
}

/* 带图标的输入框 */
.ef-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.ef-input-group > svg {
  position: absolute;
  left: 0.65rem;
  width: 16px;
  height: 16px;
  color: var(--ef-ink-subtle);
  pointer-events: none;
}

.ef-input-group > .ef-input {
  padding-left: 2.1rem;
}

.ef-input-group > kbd {
  position: absolute;
  right: 0.5rem;
}

/* ---------- 复选 / 单选 / 开关 ---------- */

.ef-check,
.ef-radio {
  display: inline-flex;
  align-items: center;
  gap: var(--ef-space-2);
  font-size: var(--ef-text-sm);
  cursor: pointer;
  user-select: none;
}

.ef-check input,
.ef-radio input {
  appearance: none;
  flex: none;
  width: 1rem;
  height: 1rem;
  margin: 0;
  border: 1px solid var(--ef-border-strong);
  background-color: var(--ef-surface-sunken);
  cursor: pointer;
  transition:
    background-color var(--ef-duration-fast) var(--ef-ease-out),
    border-color var(--ef-duration-fast) var(--ef-ease-out);
}

.ef-radio input {
  border-radius: 50%;
}

.ef-check input {
  border-radius: var(--ef-radius-sm);
}

.ef-check input:checked,
.ef-radio input:checked {
  border-color: var(--ef-accent-strong);
  background-color: var(--ef-accent);
  /* 选中态叠斜纹纹理 */
  background-image: repeating-linear-gradient(
    -45deg,
    rgb(0 0 0 / 18%) 0 1px,
    transparent 1px 4px
  );
}

.ef-check input:checked::after {
  content: "";
  display: block;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M2 6.2l2.6 2.6L10 3.4' fill='none' stroke='%23111827' stroke-width='2'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100%;
}

.ef-radio input:checked::after {
  content: "";
  display: block;
  width: 6px;
  height: 6px;
  margin: 4px auto;
  border-radius: 50%;
  background-color: var(--ef-accent-fg);
}

/* 开关 */
.ef-switch {
  display: inline-flex;
  align-items: center;
  gap: var(--ef-space-2);
  font-size: var(--ef-text-sm);
  cursor: pointer;
  user-select: none;
}

.ef-switch input {
  appearance: none;
  position: relative;
  flex: none;
  width: 2.25rem;
  height: 1.25rem;
  margin: 0;
  border: 1px solid var(--ef-border-strong);
  border-radius: var(--ef-radius-pill);
  background-color: var(--ef-surface-sunken);
  cursor: pointer;
  transition:
    background-color var(--ef-duration-base) var(--ef-ease-out),
    border-color var(--ef-duration-base) var(--ef-ease-out);
}

.ef-switch input::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: calc(1.25rem - 6px);
  height: calc(1.25rem - 6px);
  border-radius: 50%;
  background-color: var(--ef-ink-subtle);
  transition:
    transform var(--ef-duration-base) var(--ef-ease-out-quint),
    background-color var(--ef-duration-base) var(--ef-ease-out);
}

.ef-switch input:checked {
  border-color: var(--ef-accent-strong);
  background-color: var(--ef-accent);
}

.ef-switch input:checked::after {
  transform: translateX(1rem);
  background-color: var(--ef-accent-fg);
}
```

- [ ] **Step 3: 写徽标、标签、分隔线、Kbd、头像、载入、进度、提示**

追加到 `endfield/css/components.css`：

```css
/* ==========================================================================
   徽标 / 标签 / 分隔线 / 键盘提示 / 头像 / 载入 / 进度 / 提示气泡
   ========================================================================== */

.ef-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  padding: 0.1em 0.5em;
  border: 1px solid var(--ef-border);
  border-radius: var(--ef-radius-sm);
  background-color: var(--ef-surface-muted);
  color: var(--ef-ink-muted);
  font-family: var(--ef-font-mono);
  font-size: 0.6875rem;
  letter-spacing: var(--ef-tracking-wide);
  line-height: 1.6;
  white-space: nowrap;
}

/* tint 填充用原色；其中文字与描边必须用 *-ink —— 原色在自身 12% tint 上
   亮色主题仅 1.92–4.01:1，全部低于 4.5:1。 */
.ef-badge--info    { border-color: var(--ef-info-ink);    color: var(--ef-info-ink);    background-color: color-mix(in srgb, var(--ef-info) 12%, transparent); }
.ef-badge--success { border-color: var(--ef-success-ink); color: var(--ef-success-ink); background-color: color-mix(in srgb, var(--ef-success) 12%, transparent); }
.ef-badge--warn    { border-color: var(--ef-warn-ink);    color: var(--ef-warn-ink);    background-color: color-mix(in srgb, var(--ef-warn) 12%, transparent); }
.ef-badge--danger  { border-color: var(--ef-danger-ink);  color: var(--ef-danger-ink);  background-color: color-mix(in srgb, var(--ef-danger) 12%, transparent); }
.ef-badge--accent  { border-color: var(--ef-accent-strong); color: var(--ef-accent-fg); background-color: var(--ef-accent); }

/* 分级徽标：色由 data-tier 决定 */
.ef-badge--tier {
  /* 文字与描边用分级 ink 色，tint 填充用分级原色（见 [data-tier] 的映射） */
  border-color: var(--ef-tier-ink, var(--ef-border));
  color: var(--ef-tier-ink, var(--ef-ink-muted));
  background-color: color-mix(in srgb, var(--ef-tier-color, transparent) 14%, transparent);
}

/* ---------- 标签（可选中，用于筛选行） ---------- */

.ef-chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ef-space-2);
}

.ef-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35em;
  padding: 0.3rem 0.7rem;
  border: 1px solid var(--ef-border);
  border-radius: var(--ef-radius-pill);
  background-color: var(--ef-surface-muted);
  color: var(--ef-ink-muted);
  font-size: var(--ef-text-sm);
  line-height: 1.3;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color var(--ef-duration-fast) var(--ef-ease-out),
    border-color var(--ef-duration-fast) var(--ef-ease-out),
    color var(--ef-duration-fast) var(--ef-ease-out);
}

.ef-chip:hover {
  border-color: var(--ef-border-strong);
  color: var(--ef-ink);
}

.ef-chip[aria-pressed="true"],
.ef-chip.is-active {
  border-color: var(--ef-accent-strong);
  background-color: var(--ef-accent);
  color: var(--ef-accent-fg);
  font-weight: var(--ef-weight-semibold);
  background-image: repeating-linear-gradient(
    -45deg,
    rgb(0 0 0 / 12%) 0 1px,
    transparent 1px 5px
  );
}

.ef-chip svg {
  width: 14px;
  height: 14px;
}

/* ---------- 分隔线 ---------- */

.ef-divider {
  height: 1px;
  margin: var(--ef-space-4) 0;
  border: 0;
  background-color: var(--ef-border);
}

.ef-divider--labeled {
  display: flex;
  align-items: center;
  gap: var(--ef-space-3);
  height: auto;
  background-color: transparent;
  background-image: none;
  font-family: var(--ef-font-mono);
  font-size: var(--ef-text-xs);
  letter-spacing: var(--ef-tracking-caps);
  text-transform: uppercase;
  color: var(--ef-ink-subtle);
}

.ef-divider--labeled::before,
.ef-divider--labeled::after {
  content: "";
  flex: 1 1 auto;
  height: 1px;
  background-color: var(--ef-border);
}

/* ---------- 键盘提示 ---------- */

.ef-kbd {
  display: inline-block;
  min-width: 1.5em;
  padding: 0.1em 0.4em;
  border: 1px solid var(--ef-border);
  border-bottom-width: 2px;
  border-radius: var(--ef-radius-sm);
  background-color: var(--ef-surface-raised);
  color: var(--ef-ink-muted);
  font-family: var(--ef-font-mono);
  font-size: 0.6875rem;
  line-height: 1.5;
  text-align: center;
}

/* ---------- 头像 ---------- */

.ef-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 36px;
  height: 36px;
  border: 1px solid var(--ef-border);
  background-color: var(--ef-surface-muted);
  color: var(--ef-ink-muted);
  font-family: var(--ef-font-mono);
  font-size: var(--ef-text-sm);
  font-weight: var(--ef-weight-semibold);
  overflow: hidden;
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

.ef-avatar > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ef-avatar--sm { width: 26px; height: 26px; font-size: var(--ef-text-xs); }
.ef-avatar--lg { width: 52px; height: 52px; font-size: var(--ef-text-lg); }

/* ---------- 载入指示 ---------- */

.ef-spinner {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid var(--ef-border);
  border-top-color: var(--ef-accent-ink);
  border-radius: 50%;
  animation: ef-spin 0.7s linear infinite;
}

.ef-skeleton {
  display: block;
  height: 1em;
  border-radius: var(--ef-radius-sm);
  background-color: var(--ef-surface-muted);
  background-image: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--ef-ink) 8%, transparent),
    transparent
  );
  background-size: 200% 100%;
  animation: ef-skeleton-sweep 1.4s ease-in-out infinite;
}

@keyframes ef-skeleton-sweep {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}

/* ---------- 进度条 ---------- */

.ef-progress {
  position: relative;
  height: 6px;
  overflow: hidden;
  border: 1px solid var(--ef-border);
  border-radius: var(--ef-radius-sm);
  background-color: var(--ef-surface-sunken);
}

.ef-progress__bar {
  height: 100%;
  background-color: var(--ef-accent);
  transition: width var(--ef-duration-slow) var(--ef-ease-out-quint);
}

/* ---------- 提示气泡 ---------- */

.ef-tooltip {
  position: relative;
}

.ef-tooltip__bubble {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  z-index: var(--ef-z-tooltip);
  transform: translateX(-50%);
  padding: 0.3rem 0.55rem;
  border-radius: var(--ef-radius-sm);
  background-color: var(--ef-tooltip);
  color: var(--ef-tooltip-fg);
  font-family: var(--ef-font-mono);
  font-size: var(--ef-text-xs);
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity var(--ef-duration-fast) var(--ef-ease-out),
    visibility var(--ef-duration-fast);
  pointer-events: none;
}

.ef-tooltip:hover .ef-tooltip__bubble,
.ef-tooltip:focus-within .ef-tooltip__bubble {
  opacity: 1;
  visibility: visible;
}
```

- [ ] **Step 4: 建组件探针并核对**

创建 `endfield/tools/_probe.html`，把上述所有原子组件各放一个示例（按钮 4 种变体 × 3 尺寸、载入态、图标按钮、输入框、带图标输入框、下拉、文本域、复选、单选、开关、4 种徽标、分级徽标、标签组含激活项、分隔线两种、kbd、头像三尺寸、spinner、skeleton、进度条、tooltip）。

打开核对：

- 主按钮为主色底 + 深墨字；悬停变深；`disabled` 半透明。
- 载入态按钮文字消失、中央出现旋转环。
- 图标按钮右上与左下被切角。
- 输入框聚焦时描边变主色并有一圈淡光晕。
- 下拉框右侧有自绘箭头。
- 复选/单选/开关选中后为主色，复选与标签的激活态叠有斜纹。
- 徽标为等宽小字；分级徽标颜色随 `data-tier` 变化。
- `Tab` 走查所有控件，焦点轮廓始终可见。
- 切换系统深色模式，全部组件配色正确且文字清晰。

- [ ] **Step 5: 删除探针并提交**

```bash
cd "F:/AiWorkspace/KimiCode/public"
rm endfield/tools/_probe.html
git add endfield/css/components.css
git commit -m "feat(endfield): 实现原子组件样式（按钮/表单/徽标/标签等）"
```

---

### Task 6: 结构组件样式

实现规格 §6.2 的 24 类结构组件。

**Files:**
- Modify: `endfield/css/components.css`（追加结构组件段落）
- Test: `endfield/tools/_probe.html`（临时，Step 4 删除）

**Interfaces:**
- Consumes: Task 1 令牌、Task 3 全部手法类、Task 5 原子组件类
- Produces: 以下类名，页面模板依赖：
  - `.ef-panel`、`.ef-panel__header`、`.ef-panel__title`、`.ef-panel__body`、`.ef-panel__footer`
  - `.ef-section-header`、`.ef-section-header__eyebrow`、`.ef-section-header__title`、`.ef-section-header__actions`
  - `.ef-stat`、`.ef-stat__value`、`.ef-stat__label`、`.ef-stat__sub`
  - `.ef-card`、`.ef-card__media`、`.ef-card__body`、`.ef-card__title`、`.ef-card__meta`
  - `.ef-item-card`、`.ef-item-card__media`、`.ef-item-card__body`、`.ef-item-card__name`、`.ef-item-card__sub`、`.ef-item-card__icons`
  - `.ef-stat-card`
  - `.ef-empty`
  - `.ef-callout` + `--info` / `--warn` / `--danger` / `--success`
  - `.ef-code`
  - `.ef-table`、`.ef-table__sort`
  - `.ef-timeline`、`.ef-timeline__item`、`.ef-timeline__time`、`.ef-timeline__body`
  - `.ef-accordion`
  - `.ef-tabs`、`.ef-tabs__list`、`.ef-tabs__tab`、`.ef-tabs__panel`
  - `.ef-dropdown`、`.ef-dropdown__menu`、`.ef-dropdown__item`
  - `.ef-modal`、`.ef-modal__panel`、`.ef-modal__header`、`.ef-modal__body`、`.ef-modal__footer`
  - `.ef-drawer`
  - `.ef-toast`、`.ef-toast-stack`
  - `.ef-pagination`
  - `.ef-breadcrumb`
  - `.ef-filter-row`、`.ef-filter-row__label`
  - `.ef-searchbar`
  - `.ef-info-grid`、`.ef-info-grid__key`、`.ef-info-grid__value`
  - `.ef-toc`
  - `.ef-viewer`
  - `.ef-heatmap`
  - `.ef-chart`

- [ ] **Step 1: 写面板、区块头、统计、卡片**

追加到 `endfield/css/components.css`：

```css
/* ==========================================================================
   结构组件
   ========================================================================== */

/* ---------- 面板 ---------- */
.ef-panel {
  border: 1px solid var(--ef-border);
  /* 用 background-color 而非 background 简写：简写会重置 background-image，
     抹掉同一元素上 .ef-industrial-shell / .ef-grid-backdrop / .ef-corner-frame--all 的底纹。 */
  background-color: var(--ef-surface);
}

.ef-panel__header {
  display: flex;
  align-items: center;
  gap: var(--ef-space-3);
  padding: var(--ef-space-3) var(--ef-space-4);
  border-bottom: 1px solid var(--ef-border);
  background-color: var(--ef-surface-muted);
}

.ef-panel__title {
  font-family: var(--ef-font-display);
  font-size: var(--ef-text-base);
  font-weight: var(--ef-weight-semibold);
}

.ef-panel__body {
  padding: var(--ef-space-4);
}

.ef-panel__footer {
  display: flex;
  align-items: center;
  gap: var(--ef-space-2);
  padding: var(--ef-space-3) var(--ef-space-4);
  border-top: 1px solid var(--ef-border);
  background-color: var(--ef-surface-muted);
}

/* ---------- 区块头 ---------- */
.ef-section-header {
  display: flex;
  align-items: flex-end;
  gap: var(--ef-space-4);
  margin-bottom: var(--ef-space-4);
  padding-bottom: var(--ef-space-3);
  border-bottom: 1px solid var(--ef-border);
}

.ef-section-header__main {
  min-width: 0;
  flex: 1 1 auto;
}

.ef-section-header__eyebrow {
  display: block;
  margin-bottom: 0.15em;
  font-family: var(--ef-font-mono);
  font-size: var(--ef-text-xs);
  letter-spacing: var(--ef-tracking-caps);
  text-transform: uppercase;
  color: var(--ef-ink-subtle);
}

.ef-section-header__eyebrow::before {
  content: "// ";
}

.ef-section-header__title {
  display: flex;
  align-items: center;
  gap: var(--ef-space-3);
  margin: 0;
  font-family: var(--ef-font-display);
  font-size: var(--ef-text-xl);
  font-weight: var(--ef-weight-bold);
}

.ef-section-header__title::before {
  content: "";
  flex: none;
  width: 3px;
  height: 1.1em;
  background-color: var(--ef-accent-ink);
}

.ef-section-header__actions {
  display: flex;
  align-items: center;
  gap: var(--ef-space-2);
  flex: none;
}

/* ---------- 统计块 ---------- */
.ef-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1em;
  text-align: center;
}

.ef-stat__value {
  font-family: var(--ef-font-mono);
  font-size: var(--ef-text-3xl);
  font-weight: var(--ef-weight-bold);
  line-height: 1;
  color: var(--ef-accent-ink);
  font-variant-numeric: tabular-nums;
}

.ef-stat__label {
  font-size: var(--ef-text-sm);
  font-weight: var(--ef-weight-medium);
  color: var(--ef-ink);
}

.ef-stat__sub {
  font-family: var(--ef-font-mono);
  font-size: 0.625rem;
  letter-spacing: var(--ef-tracking-caps);
  text-transform: uppercase;
  color: var(--ef-ink-subtle);
}

/* ---------- 卡片 ---------- */
.ef-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--ef-border);
  background-color: var(--ef-surface-raised);
  overflow: hidden;
}

.ef-card__media {
  aspect-ratio: 16 / 9;
  background-color: var(--ef-surface-muted);
  overflow: hidden;
}

.ef-card__media > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ef-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--ef-space-1);
  padding: var(--ef-space-3) var(--ef-space-4) var(--ef-space-4);
  min-width: 0;
}

.ef-card__title {
  margin: 0;
  font-size: var(--ef-text-base);
  font-weight: var(--ef-weight-semibold);
  overflow-wrap: anywhere;
}

.ef-card__meta {
  font-size: var(--ef-text-xs);
  color: var(--ef-ink-subtle);
}

/* ---------- 条目卡（数据卡，强制直角） ---------- */
.ef-item-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--ef-border);
  border-radius: var(--ef-radius-0);
  background-color: var(--ef-surface-raised);
  color: inherit;
  text-decoration: none;
  overflow: hidden;
  transition:
    border-color var(--ef-duration-fast) var(--ef-ease-out),
    transform var(--ef-duration-fast) var(--ef-ease-out);
}

.ef-item-card:hover {
  border-color: var(--ef-accent-ink);
  transform: translateY(-2px);
}

.ef-item-card__media {
  position: relative;
  aspect-ratio: 1 / 1;
  background-color: var(--ef-surface-muted);
  overflow: hidden;
}

.ef-item-card__media > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 图上角的编号水印 */
.ef-item-card__media::before {
  content: "# " attr(data-index);
  position: absolute;
  top: 6px;
  left: 8px;
  font-family: var(--ef-font-mono);
  font-size: 0.5625rem;
  letter-spacing: var(--ef-tracking-caps);
  text-transform: uppercase;
  color: var(--ef-ink-subtle);
}

.ef-item-card__body {
  display: flex;
  align-items: center;
  gap: var(--ef-space-2);
  padding: var(--ef-space-2) var(--ef-space-3);
  min-width: 0;
}

.ef-item-card__text {
  min-width: 0;
  flex: 1 1 auto;
}

.ef-item-card__name {
  display: block;
  font-size: var(--ef-text-sm);
  font-weight: var(--ef-weight-semibold);
  overflow-wrap: anywhere;
}

.ef-item-card__sub {
  display: block;
  font-family: var(--ef-font-mono);
  font-size: 0.625rem;
  letter-spacing: var(--ef-tracking-wide);
  color: var(--ef-ink-subtle);
  overflow-wrap: anywhere;
}

.ef-item-card__icons {
  display: flex;
  align-items: center;
  gap: 3px;
  flex: none;
}

.ef-item-card__icons > span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: 0.625rem;
  font-weight: var(--ef-weight-bold);
}

.ef-item-card__icons > span svg {
  width: 14px;
  height: 14px;
}

/* 卡片底部分级条 */
.ef-item-card > .ef-tier-strip {
  margin-top: auto;
}

/* ---------- 指标卡 ---------- */
.ef-stat-card {
  display: flex;
  align-items: center;
  gap: var(--ef-space-3);
  padding: var(--ef-space-4);
  border: 1px solid var(--ef-border);
  background-color: var(--ef-surface-raised);
}

.ef-stat-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 40px;
  height: 40px;
  background-color: var(--ef-surface-muted);
  color: var(--ef-accent-ink);
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

.ef-stat-card__icon svg {
  width: 20px;
  height: 20px;
}

.ef-stat-card__text {
  min-width: 0;
}

.ef-stat-card__value {
  display: block;
  font-family: var(--ef-font-mono);
  font-size: var(--ef-text-2xl);
  font-weight: var(--ef-weight-bold);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.ef-stat-card__label {
  display: block;
  font-size: var(--ef-text-xs);
  color: var(--ef-ink-muted);
}

/* 主色辉光（可选） */
.ef-entry-glow {
  box-shadow: inset 0 0 20px -4px color-mix(in srgb, var(--ef-accent-glow) 60%, transparent);
}

/* ---------- 空状态 ---------- */
.ef-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ef-space-3);
  padding: var(--ef-space-12) var(--ef-space-6);
  text-align: center;
  color: var(--ef-ink-muted);
}

.ef-empty__icon {
  color: var(--ef-border-strong);
}

.ef-empty__icon svg {
  width: 48px;
  height: 48px;
}

.ef-empty__title {
  margin: 0;
  font-size: var(--ef-text-lg);
  font-weight: var(--ef-weight-semibold);
  color: var(--ef-ink);
}

/* ---------- 提示块 ---------- */
.ef-callout {
  --ef-callout-color: var(--ef-info);
  --ef-callout-ink: var(--ef-info-ink);
  display: flex;
  gap: var(--ef-space-3);
  margin: var(--ef-space-4) 0;
  padding: var(--ef-space-3) var(--ef-space-4);
  border: 1px solid var(--ef-border);
  /* 3px 边框属图形，需 >=3:1：原色做边框亮色主题下 success 仅 2.00:1，故用 ink */
  border-left: 3px solid var(--ef-callout-ink, var(--ef-callout-color));
  background-color: color-mix(in srgb, var(--ef-callout-color) 7%, var(--ef-surface));
  font-size: var(--ef-text-sm);
}

.ef-callout__title {
  display: block;
  margin-bottom: 0.15em;
  font-family: var(--ef-font-mono);
  font-size: var(--ef-text-xs);
  letter-spacing: var(--ef-tracking-caps);
  text-transform: uppercase;
  /* 用 ink 变量：callout 背景是该色 7% tint，原色做文字亮色主题仅 2.00–4.34:1 */
  color: var(--ef-callout-ink, var(--ef-callout-color));
}

.ef-callout--warn   { --ef-callout-color: var(--ef-warn);    --ef-callout-ink: var(--ef-warn-ink); }
.ef-callout--danger { --ef-callout-color: var(--ef-danger);  --ef-callout-ink: var(--ef-danger-ink); }
.ef-callout--success { --ef-callout-color: var(--ef-success); --ef-callout-ink: var(--ef-success-ink); }

/* ---------- 代码块 ---------- */
.ef-code {
  position: relative;
  margin: 0 0 var(--ef-space-4);
  border: 1px solid var(--ef-border);
  background-color: var(--ef-code-bg);
  color: var(--ef-code-fg);
}

.ef-code__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ef-space-3);
  padding: var(--ef-space-2) var(--ef-space-3);
  border-bottom: 1px solid var(--ef-border);
  font-family: var(--ef-font-mono);
  font-size: var(--ef-text-xs);
  letter-spacing: var(--ef-tracking-caps);
  text-transform: uppercase;
  opacity: 0.8;
}

.ef-code > pre {
  margin: 0;
  border: 0;
  border-radius: 0;
  background-color: transparent;
  background-image: none;
}
```

- [ ] **Step 2: 写表格、时间线、折叠、标签页、下拉、模态、抽屉、Toast、分页、面包屑**

追加到 `endfield/css/components.css`：

```css
/* ---------- 表格 ---------- */
.ef-table {
  width: 100%;
  border: 1px solid var(--ef-border);
  font-size: var(--ef-text-sm);
}

.ef-table thead th {
  padding: var(--ef-space-2) var(--ef-space-3);
  border-bottom: 1px solid var(--ef-border);
  background-color: var(--ef-surface-sunken);
  font-family: var(--ef-font-mono);
  font-size: var(--ef-text-xs);
  font-weight: var(--ef-weight-medium);
  letter-spacing: var(--ef-tracking-caps);
  text-transform: uppercase;
  color: var(--ef-ink-muted);
  text-align: left;
  white-space: nowrap;
}

.ef-table tbody td {
  padding: var(--ef-space-2) var(--ef-space-3);
  border-bottom: 1px solid var(--ef-border);
  overflow-wrap: anywhere;
}

.ef-table tbody tr:last-child td {
  border-bottom: 0;
}

.ef-table tbody tr:hover {
  background-color: var(--ef-surface-muted);
}

.ef-table__sort {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  padding: 0;
  border: 0;
  background-color: transparent;
  background-image: none;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  cursor: pointer;
}

.ef-table__sort:hover {
  color: var(--ef-ink);
}

.ef-table__sort[aria-sort]::after {
  content: "▲";
  font-size: 0.7em;
  color: var(--ef-accent-ink);
}

.ef-table__sort[aria-sort="descending"]::after {
  content: "▼";
}

/* 横向滚动兜底：宽表在窄屏可滚 */
.ef-table-wrap {
  overflow-x: auto;
}

/* ---------- 时间线 ---------- */
.ef-timeline {
  position: relative;
  margin: 0;
  padding: 0 0 0 var(--ef-space-6);
  list-style: none;
}

.ef-timeline::before {
  content: "";
  position: absolute;
  left: 5px;
  top: 6px;
  bottom: 6px;
  width: 1px;
  background-color: var(--ef-border);
}

.ef-timeline__item {
  position: relative;
  padding-bottom: var(--ef-space-5);
}

.ef-timeline__item::before {
  content: "";
  position: absolute;
  left: calc(-1 * var(--ef-space-6) + 1px);
  top: 5px;
  width: 9px;
  height: 9px;
  background-color: var(--ef-border-strong);
  --ef-chamfer-size: 3px;
  clip-path: polygon(
    0 0,
    calc(100% - var(--ef-chamfer-size)) 0,
    100% var(--ef-chamfer-size),
    100% 100%,
    var(--ef-chamfer-size) 100%,
    0 calc(100% - var(--ef-chamfer-size))
  );
}

.ef-timeline__item--accent::before {
  background-color: var(--ef-accent-ink);
}

.ef-timeline__time {
  display: block;
  margin-bottom: 0.15em;
  font-family: var(--ef-font-mono);
  font-size: var(--ef-text-xs);
  color: var(--ef-ink-subtle);
}

.ef-timeline__body {
  font-size: var(--ef-text-sm);
}

.ef-timeline__title {
  font-weight: var(--ef-weight-semibold);
  overflow-wrap: anywhere;
}

/* ---------- 折叠面板 ---------- */
.ef-accordion {
  border: 1px solid var(--ef-border);
}

.ef-accordion > details {
  border-bottom: 1px solid var(--ef-border);
}

.ef-accordion > details:last-child {
  border-bottom: 0;
}

.ef-accordion > details > summary {
  display: flex;
  align-items: center;
  gap: var(--ef-space-2);
  padding: var(--ef-space-3) var(--ef-space-4);
  font-size: var(--ef-text-sm);
  font-weight: var(--ef-weight-medium);
  cursor: pointer;
  list-style: none;
}

.ef-accordion > details > summary::-webkit-details-marker {
  display: none;
}

.ef-accordion > details > summary::before {
  content: "▾";
  flex: none;
  color: var(--ef-accent-ink);
  transition: transform var(--ef-duration-fast) var(--ef-ease-out);
}

.ef-accordion > details:not([open]) > summary::before {
  transform: rotate(-90deg);
}

.ef-accordion > details > summary:hover {
  background-color: var(--ef-surface-muted);
}

.ef-accordion__body {
  padding: 0 var(--ef-space-4) var(--ef-space-4);
  font-size: var(--ef-text-sm);
  color: var(--ef-ink-muted);
}

/* ---------- 标签页 ---------- */
.ef-tabs__list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ef-space-1);
  border-bottom: 1px solid var(--ef-border);
}

.ef-tabs__tab {
  padding: var(--ef-space-2) var(--ef-space-4);
  border: 0;
  border-bottom: 2px solid transparent;
  background-color: transparent;
  background-image: none;
  color: var(--ef-ink-muted);
  font-family: var(--ef-font-mono);
  font-size: var(--ef-text-xs);
  letter-spacing: var(--ef-tracking-caps);
  text-transform: uppercase;
  cursor: pointer;
  transition:
    color var(--ef-duration-fast) var(--ef-ease-out),
    border-color var(--ef-duration-fast) var(--ef-ease-out);
}

.ef-tabs__tab:hover {
  color: var(--ef-ink);
}

.ef-tabs__tab[aria-selected="true"] {
  border-bottom-color: var(--ef-accent-ink);
  color: var(--ef-ink);
  background-image: repeating-linear-gradient(
    -45deg,
    color-mix(in srgb, var(--ef-accent) 22%, transparent) 0 1px,
    transparent 1px 5px
  );
}

.ef-tabs__panel {
  padding-top: var(--ef-space-4);
}

/* 无 JS 时全部面板可见，不隐藏内容 */
.ef-tabs__panel[hidden] {
  display: none;
}

/* ---------- 下拉菜单 ---------- */
.ef-dropdown {
  position: relative;
  display: inline-block;
}

.ef-dropdown__menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  z-index: var(--ef-z-menu);
  min-width: 12rem;
  padding: var(--ef-space-1);
  border: 1px solid var(--ef-border);
  background-color: var(--ef-surface-raised);
  box-shadow: 0 6px 20px rgb(0 0 0 / 25%);
}

.ef-dropdown__menu[hidden] {
  display: none;
}

.ef-dropdown__item {
  display: flex;
  align-items: center;
  gap: var(--ef-space-2);
  width: 100%;
  padding: var(--ef-space-2) var(--ef-space-3);
  border: 0;
  background-color: transparent;
  background-image: none;
  color: var(--ef-ink-muted);
  font-size: var(--ef-text-sm);
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.ef-dropdown__item:hover,
.ef-dropdown__item:focus-visible {
  background-color: var(--ef-surface-muted);
  color: var(--ef-ink);
}

.ef-dropdown__sep {
  height: 1px;
  margin: var(--ef-space-1) 0;
  background-color: var(--ef-border);
}

/* ---------- 模态 ---------- */
.ef-modal {
  position: fixed;
  inset: 0;
  z-index: var(--ef-z-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--ef-space-4);
}

.ef-modal[hidden] {
  display: none;
}

.ef-modal__scrim {
  position: absolute;
  inset: 0;
  background-color: rgb(0 0 0 / 60%);
}

.ef-modal__panel {
  position: relative;
  width: 100%;
  max-width: 34rem;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--ef-border);
  background-color: var(--ef-surface-raised);
  animation: ef-corner-in 0.25s var(--ef-ease-out-quint) both;
}

.ef-modal__header {
  display: flex;
  align-items: center;
  gap: var(--ef-space-3);
  padding: var(--ef-space-3) var(--ef-space-4);
  border-bottom: 1px solid var(--ef-border);
  background-color: var(--ef-surface-muted);
}

.ef-modal__title {
  flex: 1 1 auto;
  margin: 0;
  font-size: var(--ef-text-lg);
  font-weight: var(--ef-weight-semibold);
}

.ef-modal__body {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: var(--ef-space-4);
}

.ef-modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--ef-space-2);
  padding: var(--ef-space-3) var(--ef-space-4);
  border-top: 1px solid var(--ef-border);
}

/* ---------- 抽屉 ---------- */
.ef-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: var(--ef-z-overlay);
  width: min(24rem, 92vw);
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--ef-border);
  background-color: var(--ef-surface-raised);
  animation: ef-drawer-in 0.25s var(--ef-ease-out-quint) both;
}

@keyframes ef-drawer-in {
  from { transform: translateX(100%); }
  to   { transform: none; }
}

.ef-drawer[hidden] {
  display: none;
}

/* ---------- Toast ---------- */
.ef-toast-stack {
  position: fixed;
  top: calc(var(--ef-header-bar-h) + var(--ef-space-4));
  right: var(--ef-space-4);
  z-index: var(--ef-z-menu);
  display: flex;
  flex-direction: column;
  gap: var(--ef-space-2);
  pointer-events: none;
}

.ef-toast {
  --ef-toast-color: var(--ef-border-strong);
  --ef-toast-ink: var(--ef-ink-muted);
  display: flex;
  align-items: flex-start;
  gap: var(--ef-space-2);
  min-width: 16rem;
  max-width: 24rem;
  padding: var(--ef-space-3) var(--ef-space-4);
  border: 1px solid var(--ef-border);
  /* 3px 边框属图形，需 >=3:1：原色做边框亮色主题下 success 仅 2.12:1，故用 ink */
  border-left: 3px solid var(--ef-toast-ink, var(--ef-toast-color));
  background-color: var(--ef-surface-raised);
  font-size: var(--ef-text-sm);
  box-shadow: 0 6px 20px rgb(0 0 0 / 25%);
  pointer-events: auto;
  animation: ef-rise-in 0.25s var(--ef-ease-out-quint) both;
}

.ef-toast--success { --ef-toast-color: var(--ef-success); --ef-toast-ink: var(--ef-success-ink); }
.ef-toast--warn    { --ef-toast-color: var(--ef-warn);    --ef-toast-ink: var(--ef-warn-ink); }
.ef-toast--danger  { --ef-toast-color: var(--ef-danger);  --ef-toast-ink: var(--ef-danger-ink); }

/* ---------- 分页 ---------- */
.ef-pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ef-space-1);
  margin-top: var(--ef-space-6);
}

.ef-pagination__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.5rem;
  border: 1px solid var(--ef-border);
  background-color: var(--ef-surface-raised);
  color: var(--ef-ink-muted);
  font-family: var(--ef-font-mono);
  font-size: var(--ef-text-sm);
  text-decoration: none;
  font-variant-numeric: tabular-nums;
}

.ef-pagination__link:hover {
  border-color: var(--ef-border-strong);
  color: var(--ef-ink);
}

.ef-pagination__link[aria-current="page"] {
  border-color: var(--ef-accent-strong);
  background-color: var(--ef-accent);
  color: var(--ef-accent-fg);
  font-weight: var(--ef-weight-semibold);
}

.ef-pagination__link[aria-disabled="true"] {
  opacity: 0.4;
  pointer-events: none;
}

/* ---------- 面包屑 ---------- */
.ef-breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ef-space-2);
  margin: 0 0 var(--ef-space-2);
  padding: 0;
  list-style: none;
  font-family: var(--ef-font-mono);
  font-size: var(--ef-text-xs);
  color: var(--ef-ink-subtle);
}

.ef-breadcrumb > li {
  display: flex;
  align-items: center;
  gap: var(--ef-space-2);
}

.ef-breadcrumb > li + li::before {
  content: "/";
  color: var(--ef-border-strong);
}

.ef-breadcrumb a {
  color: var(--ef-ink-muted);
  text-decoration: none;
}

.ef-breadcrumb a:hover {
  color: var(--ef-accent-ink);
}
```

- [ ] **Step 3: 写筛选行、搜索栏、信息网格、目录、图片查看器、热力图、图表、页头**

追加到 `endfield/css/components.css`：

```css
/* ---------- 筛选行 ---------- */
.ef-filter-row {
  display: flex;
  align-items: flex-start;
  gap: var(--ef-space-4);
  padding: var(--ef-space-2) 0;
  border-bottom: 1px solid var(--ef-border);
}

.ef-filter-row:last-child {
  border-bottom: 0;
}

.ef-filter-row__label {
  flex: none;
  width: 5.5rem;
  padding-top: 0.3rem;
  font-size: var(--ef-text-sm);
  color: var(--ef-ink-muted);
}

.ef-filter-row__options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ef-space-2);
  min-width: 0;
  flex: 1 1 auto;
}

/* ---------- 搜索栏 ---------- */
.ef-searchbar {
  position: relative;
  display: flex;
  align-items: center;
}

.ef-searchbar > svg {
  position: absolute;
  left: 0.7rem;
  width: 16px;
  height: 16px;
  color: var(--ef-ink-subtle);
  pointer-events: none;
}

.ef-searchbar > input {
  width: 100%;
  padding: 0.5rem 2.5rem 0.5rem 2.2rem;
  border: 1px solid var(--ef-border);
  border-radius: var(--ef-radius);
  background-color: var(--ef-surface-sunken);
  color: var(--ef-ink);
  font-size: var(--ef-text-sm);
}

.ef-searchbar > input:focus {
  outline: none;
  border-color: var(--ef-accent-ink);
  background-color: var(--ef-surface);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--ef-accent) 30%, transparent);
}

.ef-searchbar > .ef-kbd {
  position: absolute;
  right: 0.5rem;
}

/* ---------- 信息网格（详情页信息面板） ---------- */
.ef-info-grid {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--ef-space-3) var(--ef-space-4);
  margin: 0;
  font-size: var(--ef-text-sm);
}

.ef-info-grid__key {
  margin: 0;
  color: var(--ef-ink-subtle);
  font-family: var(--ef-font-mono);
  font-size: var(--ef-text-xs);
  letter-spacing: var(--ef-tracking-wide);
}

.ef-info-grid__value {
  margin: 0;
  font-weight: var(--ef-weight-semibold);
  overflow-wrap: anywhere;
}

/* ---------- 目录 ---------- */
.ef-toc {
  position: sticky;
  top: calc(var(--ef-header-bar-h) + var(--ef-space-4));
  font-size: var(--ef-text-sm);
}

.ef-toc__title {
  margin: 0 0 var(--ef-space-2);
  font-family: var(--ef-font-mono);
  font-size: var(--ef-text-xs);
  letter-spacing: var(--ef-tracking-caps);
  text-transform: uppercase;
  color: var(--ef-ink-subtle);
}

.ef-toc__list {
  margin: 0;
  padding: 0;
  list-style: none;
  border-left: 1px solid var(--ef-border);
}

.ef-toc__list a {
  display: block;
  padding: 0.25rem 0 0.25rem var(--ef-space-3);
  margin-left: -1px;
  border-left: 2px solid transparent;
  color: var(--ef-ink-muted);
  text-decoration: none;
}

.ef-toc__list a:hover {
  color: var(--ef-ink);
}

.ef-toc__list a.is-active {
  border-left-color: var(--ef-accent-ink);
  color: var(--ef-ink);
  font-weight: var(--ef-weight-medium);
}

.ef-toc__list .ef-toc__sub {
  padding-left: var(--ef-space-6);
  font-size: var(--ef-text-xs);
}

/* ---------- 图片查看器 ---------- */
.ef-viewer {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--ef-border);
  background-color: var(--ef-surface-sunken);
}

.ef-viewer__toolbar {
  display: flex;
  align-items: center;
  gap: var(--ef-space-1);
  padding: var(--ef-space-2);
  border-bottom: 1px solid var(--ef-border);
  background-color: var(--ef-surface-muted);
}

.ef-viewer__zoom {
  min-width: 3.5rem;
  font-family: var(--ef-font-mono);
  font-size: var(--ef-text-xs);
  text-align: center;
  color: var(--ef-ink-muted);
  font-variant-numeric: tabular-nums;
}

.ef-viewer__stage {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 20rem;
  overflow: hidden;
  background-image:
    linear-gradient(var(--ef-grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--ef-grid-line) 1px, transparent 1px);
  background-size: var(--ef-grid-size) var(--ef-grid-size);
}

.ef-viewer__stage > img {
  max-width: 100%;
  max-height: 70vh;
  transition: transform var(--ef-duration-base) var(--ef-ease-out-quint);
}

/* ---------- 热力图 ---------- */
.ef-heatmap {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(7, 1fr);
  gap: 3px;
  padding: var(--ef-space-3);
  border: 1px solid var(--ef-border);
  background-color: var(--ef-heatmap-bg);
  overflow-x: auto;
}

.ef-heatmap > span {
  width: 11px;
  height: 11px;
  background-color: var(--ef-heatmap-empty);
}

/* 强度由 --ef-heat 控制 0–4 */
/* 用 --ef-heat-ramp 而非 --ef-accent 做递增色：亮色主题的 accent 是亮黄
   (#f2cc00)，混入浅灰底后各级亮度只差 1.04–1.10:1，肉眼分不出深浅；
   改用 accent-ink 家族的深黄后各级拉开到 1.27–1.94:1。暗色主题的
   accent 本身够亮，直接复用即可。 */
.ef-heatmap > span[data-level="1"] { background-color: color-mix(in srgb, var(--ef-heat-ramp) 18%, var(--ef-heatmap-empty)); }
.ef-heatmap > span[data-level="2"] { background-color: color-mix(in srgb, var(--ef-heat-ramp) 38%, var(--ef-heatmap-empty)); }
.ef-heatmap > span[data-level="3"] { background-color: color-mix(in srgb, var(--ef-heat-ramp) 62%, var(--ef-heatmap-empty)); }
.ef-heatmap > span[data-level="4"] { background-color: var(--ef-heat-ramp); }

/* ---------- 图表（纯 SVG，无第三方库） ---------- */
.ef-chart {
  display: block;
  width: 100%;
  height: auto;
  font-family: var(--ef-font-mono);
  font-size: 9px;
}

.ef-chart__grid {
  stroke: var(--ef-border);
  stroke-width: 1;
}

.ef-chart__axis-label {
  fill: var(--ef-ink-subtle);
}

.ef-chart__line {
  fill: none;
  stroke: var(--ef-accent-ink);
  stroke-width: 2;
  stroke-linejoin: round;
}

.ef-chart__area {
  fill: color-mix(in srgb, var(--ef-accent) 18%, transparent);
  stroke: none;
}

.ef-chart__bar {
  fill: var(--ef-accent);
}

.ef-chart__point {
  fill: var(--ef-surface);
  stroke: var(--ef-accent-ink);
  stroke-width: 2;
}

.ef-chart__donut-track {
  fill: none;
  stroke: var(--ef-surface-muted);
  stroke-width: 14;
}

.ef-chart__donut-value {
  fill: none;
  stroke: var(--ef-accent-ink);
  stroke-width: 14;
  stroke-linecap: butt;
}

.ef-chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ef-space-4);
  margin-top: var(--ef-space-3);
  font-size: var(--ef-text-xs);
  color: var(--ef-ink-muted);
}

.ef-chart-legend > span {
  display: inline-flex;
  align-items: center;
  gap: var(--ef-space-2);
}

.ef-chart-legend > span::before {
  content: "";
  width: 10px;
  height: 10px;
  background-color: var(--ef-legend-color, var(--ef-accent-ink));
}

/* ---------- 页面标题区 ---------- */
.ef-page-header {
  margin-bottom: var(--ef-space-6);
}

.ef-page-header__row {
  display: flex;
  align-items: flex-start;
  gap: var(--ef-space-4);
  flex-wrap: wrap;
}

.ef-page-header__main {
  min-width: 0;
  flex: 1 1 auto;
}

.ef-page-header__title {
  margin: 0;
  font-size: var(--ef-text-4xl);
  font-weight: var(--ef-weight-bold);
  line-height: 1.05;
  overflow-wrap: anywhere;
}

.ef-page-header__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ef-space-3);
  margin-top: var(--ef-space-2);
  font-size: var(--ef-text-xs);
  color: var(--ef-ink-subtle);
}

.ef-page-header__meta > span {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
}

.ef-page-header__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ef-space-2);
  flex: none;
}

/* ---------- 网格工具 ---------- */
.ef-grid {
  display: grid;
  gap: var(--ef-space-4);
}

.ef-grid--cards {
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}

.ef-grid--panels {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.ef-grid--stats {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

/* ---------- 布局工具 ---------- */
.ef-row {
  display: flex;
  align-items: center;
  gap: var(--ef-space-3);
  flex-wrap: wrap;
}

.ef-row--between {
  justify-content: space-between;
}

.ef-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ef-space-4);
}

.ef-spacer {
  flex: 1 1 auto;
}

.ef-muted {
  color: var(--ef-ink-muted);
}

.ef-subtle {
  color: var(--ef-ink-subtle);
}

.ef-mono {
  font-family: var(--ef-font-mono);
}

.ef-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
```

- [ ] **Step 4: 建结构组件探针并核对**

创建 `endfield/tools/_probe.html`，把上述结构组件各放一个示例，并核对：

- 面板头/脚为次表面色，与主体区分。
- 区块头 eyebrow 行以 `//` 开头，标题左侧有主色竖条。
- 统计块数字为等宽主色大字，下方中文标签 + 英文大写副标签。
- 条目卡为直角，悬停描边变主色并上浮 2px，底部有分级条，图上角有 `#` 编号。
- 表格表头为凹陷底 + 等宽大写小字；行悬停高亮。
- 时间线节点为切角小方块，竖线贯通。
- 折叠面板用 `<details>`，无 JS 时仍可展开。
- 标签页激活项下方有主色下划线并叠斜纹。
- 模态框居中、入场有缩放动画、遮罩半透明。
- Toast 从右侧淡入。
- 分页当前页为主色实底。
- 信息网格为「标签 / 值」两列，标签为等宽小字。
- 图片查看器舞台有网格底纹。
- 热力图格子颜色随 `data-level` 加深。
- 折线/柱状/环形三种 SVG 图表正确渲染，配色取主色。

切换深色模式再核对一遍。

- [ ] **Step 5: 删除探针并提交**

```bash
cd "F:/AiWorkspace/KimiCode/public"
rm endfield/tools/_probe.html
git add endfield/css/components.css
git commit -m "feat(endfield): 实现结构组件样式（面板/卡片/表格/模态/图表等）"
```

---

### Task 7: 主题与交互脚本

实现三态主题切换与全部交互行为。

**Files:**
- Create: `endfield/js/theme.js`
- Create: `endfield/js/ui.js`
- Test: `endfield/tools/_probe.html`（临时，Step 5 删除）

**Interfaces:**
- Consumes: Task 3 的 `.ef-reveal` / `.is-visible`、Task 4 的 `.ef-app` / `.is-collapsed` / `.is-open`、Task 6 的 `.ef-modal` / `.ef-tabs__tab` / `.ef-dropdown__menu` / `.ef-toast-stack`
- Produces: 以下全局契约，所有页面模板依赖：
  - `window.EFTheme`：`{ get(): 'light'|'dark'|'system', set(v): void, toggle(): void, apply(): void, onChange(cb): void }`
  - `window.EFUI`：`{ init(root?): void, toast(msg, variant?): void, openModal(id), closeModal(id) }`
  - `data-*` 属性契约：`[data-theme-toggle]`、`[data-sidebar-toggle]`、`[data-modal-open="id"]`、`[data-modal-close]`、`[data-tabs]` 容器内 `[role="tab"]` + `[role="tabpanel"]`、`[data-dropdown-toggle]`、`[data-search-input]`、`[data-theme-radio]`

- [ ] **Step 1: 写主题脚本**

创建 `endfield/js/theme.js`：

```js
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
```

- [ ] **Step 2: 写交互脚本**

创建 `endfield/js/ui.js`：

```js
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

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && app.classList.contains('is-open')) {
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
      Array.prototype.forEach.call(menus, function (menu) { menu.hidden = true; });
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
```

- [ ] **Step 3: 建交互探针**

创建 `endfield/tools/_probe.html`：

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>交互探针</title>
<link rel="stylesheet" href="../css/base.css">
<link rel="stylesheet" href="../css/utilities.css">
<link rel="stylesheet" href="../css/layout.css">
<link rel="stylesheet" href="../css/components.css">
</head>
<body>
<a class="ef-skip-link" href="#ef-main">跳到主内容</a>

<div class="ef-app">
  <header class="ef-topbar">
    <div class="ef-topbar__signal"></div>
    <div class="ef-topbar__bar">
      <button class="ef-icon-btn" data-sidebar-toggle aria-expanded="true"
              aria-controls="ef-sidebar" aria-label="切换侧栏">☰</button>
      <a class="ef-topbar__brand" href="#">◈ 档案库</a>
      <div class="ef-topbar__search">
        <div class="ef-searchbar">
          <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M11 11l4 4" stroke="currentColor" stroke-width="1.5"/></svg>
          <input type="search" placeholder="搜索…" aria-label="搜索">
          <kbd class="ef-kbd">/</kbd>
        </div>
      </div>
      <div class="ef-topbar__actions">
        <button class="ef-icon-btn" data-theme-toggle aria-label="切换主题">◐</button>
        <div class="ef-dropdown">
          <button class="ef-icon-btn" data-dropdown-toggle="dd1" aria-label="更多">⋯</button>
          <div class="ef-dropdown__menu" id="dd1" hidden>
            <button class="ef-dropdown__item">偏好设置</button>
            <div class="ef-dropdown__sep"></div>
            <button class="ef-dropdown__item">退出登录</button>
          </div>
        </div>
      </div>
    </div>
  </header>

  <aside class="ef-sidebar" id="ef-sidebar">
    <nav class="ef-sidebar__section" aria-label="浏览">
      <div class="ef-sidebar__section-title">浏览</div>
      <a class="ef-sidebar__item" href="#" aria-current="page">
        <span class="ef-label-pair"><b>首页</b><i>Home</i></span>
      </a>
      <a class="ef-sidebar__item" href="#">
        <span class="ef-label-pair"><b>索引</b><i>Index</i></span>
      </a>
    </nav>
  </aside>

  <main class="ef-main" id="ef-main">
    <div class="ef-content ef-stack">
      <h1>交互验证</h1>

      <div class="ef-row">
        <button class="ef-btn ef-btn--primary" data-modal-open="m1">打开模态</button>
        <button class="ef-btn" id="toastBtn">弹 Toast</button>
      </div>

      <div class="ef-panel" data-tabs>
        <div class="ef-tabs__list" role="tablist" aria-label="示例选项卡">
          <button class="ef-tabs__tab" role="tab" id="t1" aria-controls="p1" aria-selected="true">选项卡一</button>
          <button class="ef-tabs__tab" role="tab" id="t2" aria-controls="p2" aria-selected="false">选项卡二</button>
        </div>
        <div class="ef-panel__body">
          <div class="ef-tabs__panel" role="tabpanel" id="p1" aria-labelledby="t1">面板一内容</div>
          <div class="ef-tabs__panel" role="tabpanel" id="p2" aria-labelledby="t2" hidden>面板二内容</div>
        </div>
      </div>

      <div class="ef-reveal" style="height:600px;border:1px solid var(--ef-border)">
        滚动到这里应淡入（初始 opacity: 0）
      </div>
    </div>
  </main>
</div>

<div class="ef-modal" id="m1" hidden role="dialog" aria-modal="true" aria-labelledby="m1t">
  <div class="ef-modal__scrim" data-modal-close></div>
  <div class="ef-modal__panel" tabindex="-1">
    <div class="ef-modal__header">
      <h2 class="ef-modal__title" id="m1t">模态标题</h2>
      <button class="ef-icon-btn" data-modal-close aria-label="关闭">✕</button>
    </div>
    <div class="ef-modal__body">
      <p>按 Tab 应在面板内循环，按 Esc 应关闭。</p>
      <button class="ef-btn">第一个可聚焦元素</button>
      <button class="ef-btn">最后一个可聚焦元素</button>
    </div>
    <div class="ef-modal__footer">
      <button class="ef-btn" data-modal-close>取消</button>
      <button class="ef-btn ef-btn--primary" data-modal-close>确定</button>
    </div>
  </div>

  <!-- 遮罩必须是 .ef-app 的子元素：显示规则是后代选择器 .ef-app.is-open .ef-scrim -->
  <div class="ef-scrim"></div>
</div>

<script src="../js/theme.js"></script>
<script src="../js/ui.js"></script>
<script>
  document.getElementById('toastBtn').addEventListener('click', function () {
    window.EFUI.toast('操作已完成', 'success');
  });
</script>
</body>
</html>
```

- [ ] **Step 4: 逐项核对交互**

打开探针，确认：

- 点主题按钮在「跟随系统 → 浅色 → 深色」间循环，按钮 `title` 随之更新；刷新后保持。
- 点侧栏按钮：宽屏下侧栏收起为图标栏；窄屏下侧栏从左滑出、遮罩出现、点遮罩关闭、`Esc` 关闭。
- 点「打开模态」：模态出现，焦点进入面板；`Tab` 在面板内循环不逃逸；`Esc` 关闭；关闭后焦点回到触发按钮。
- 点「弹 Toast」：右上角出现带左侧绿条的提示，4 秒后消失。
- 选项卡：点击切换，`←`/`→` 方向键也能切换，且面板正确显示/隐藏。
- 点 `⋯` 打开下拉，点别处关闭，`Esc` 关闭。
- 按 `/` 键焦点跳到搜索框。
- 滚动到长块：淡入出现。
- **禁用 JavaScript 后刷新**：所有文本内容仍可读；`<details>` 若有仍可展开；主题跟随系统偏好（浅色/深色都试一次）。这一步覆盖 Review Focus 第 7 条。

- [ ] **Step 5: 删除探针并提交**

```bash
cd "F:/AiWorkspace/KimiCode/public"
rm endfield/tools/_probe.html
git add endfield/js/theme.js endfield/js/ui.js
git commit -m "feat(endfield): 实现三态主题与交互脚本"
```

---

### Task 8: 页面结构校验脚本与设计系统总览页

写第三个校验脚本，并建出设计系统总览页 `index.html`。

**Files:**
- Create: `endfield/tools/check-pages.mjs`
- Create: `endfield/index.html`
- Create: `endfield/css/brand.css`
- Test: `endfield/tools/check-pages.mjs`

**Interfaces:**
- Consumes: Task 1–7 的全部 CSS/JS
- Produces: `check-pages.mjs` 供后续所有页面任务复用；`index.html` 作为令牌与组件的可视化索引

- [ ] **Step 1: 写页面校验脚本**

创建 `endfield/tools/check-pages.mjs`：

```js
#!/usr/bin/env node
/**
 * 校验所有 HTML 页面的结构完整性与本地资源可解析性。
 * 检查项：
 *   1. 有 doctype、lang、charset、viewport
 *   2. 有跳到主内容的链接与 <main id="ef-main">
 *   3. 所有相对 href/src 指向的文件真实存在
 *   4. 无绝对路径引用（file:// 下会 404）
 *   5. 每个 <img> 有 alt
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

const pages = walk(root);
const errors = [];

if (pages.length === 0) {
  console.error('错误：未找到任何 HTML 页面。');
  process.exit(1);
}

for (const page of pages) {
  const rel = relative(root, page).replace(/\\/g, '/');
  const html = readFileSync(page, 'utf8');

  if (!/^<!doctype html>/i.test(html.trim())) {
    errors.push(`${rel}: 缺少 <!doctype html>`);
  }
  if (!/<html[^>]+lang=/i.test(html)) {
    errors.push(`${rel}: <html> 缺少 lang 属性`);
  }
  if (!/<meta[^>]+charset=/i.test(html)) {
    errors.push(`${rel}: 缺少 charset 声明`);
  }
  if (!/<meta[^>]+name=["']viewport["']/i.test(html)) {
    errors.push(`${rel}: 缺少 viewport 声明`);
  }
  if (!/class=["'][^"']*ef-skip-link/.test(html)) {
    errors.push(`${rel}: 缺少 .ef-skip-link 跳转链接`);
  }
  if (!/<main[^>]+id=["']ef-main["']/.test(html)) {
    errors.push(`${rel}: 缺少 <main id="ef-main">`);
  }

  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt\s*=/i.test(m[0])) {
      errors.push(`${rel}: <img> 缺少 alt 属性：${m[0].slice(0, 60)}…`);
    }
  }

  for (const m of html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)) {
    const url = m[1];
    if (/^(?:https?:|mailto:|tel:|data:|#|javascript:)/i.test(url)) continue;
    if (url.startsWith('/')) {
      errors.push(`${rel}: 使用了绝对路径 "${url}"，file:// 下会 404`);
      continue;
    }
    const target = resolve(dirname(page), url.split('#')[0].split('?')[0]);
    if (!existsSync(target)) {
      errors.push(`${rel}: 引用不存在的文件 "${url}"`);
    }
  }
}

console.log(`已检查 ${pages.length} 个页面。`);

if (errors.length > 0) {
  console.error(`\n错误：发现 ${errors.length} 处问题：`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}

console.log('通过：页面结构完整，本地资源均可解析。');
```

- [ ] **Step 2: 运行确认抓到缺失**

Run: `cd endfield && node tools/check-pages.mjs`
Expected: 输出 `错误：未找到任何 HTML 页面。`，退出码 1。（此刻还没有页面，这是正确行为。）

- [ ] **Step 3: 写品牌覆盖层**

创建 `endfield/css/brand.css`：

```css
/* ==========================================================================
   品牌覆盖层（示例，默认不被任何页面引入）
   引入方式：在任何页面的 <head> 中，于 tokens.css 之后加一行
     <link rel="stylesheet" href="../css/brand.css">
   改下面几个变量即可换肤，无需改动 tokens.css。
   ========================================================================== */

:root {
  /* 主色五件套：改这五行即可换主色。
     accent-ink 是主色作为文字/细图形时的替代色 —— 亮色主题下
     主色本身对比度不足，必须给一个更深的同色相值。 */
  --ef-user-accent: #f2cc00;
  --ef-user-accent-strong: #d9ad00;
  --ef-user-accent-soft: #fff1a6;
  --ef-user-accent-glow: #ffd84a;
  --ef-user-accent-ink: #8a6d00;

  /* 字体：接入自有品牌字体 */
  --ef-font-sans: system-ui, -apple-system, "Segoe UI", "Microsoft YaHei",
    "PingFang SC", sans-serif;
  --ef-font-mono: "JetBrains Mono", ui-monospace, monospace;
}

/* 暗色主题需要单独给 accent-ink，因为深黄在深底上会看不清 */
html[data-theme="dark"],
html:not([data-theme="light"]) {
  --ef-user-accent-ink: #d8bf00;
}

/* 需要更彻底换肤时，直接覆盖语义令牌 */
/*
:root {
  --ef-surface: #0d1117;
  --ef-ink: #e6edf3;
  --ef-accent: #3fb950;
}
*/
```

- [ ] **Step 4: 写设计系统总览页**

创建 `endfield/index.html`。此页是设计系统的可视化索引，包含色板、排版尺度、全部组件示例、动效演示与实时调色控件。

结构要点（必须全部落地）：

1. `<head>` 中依次引入 `css/base.css`、`css/utilities.css`、`css/layout.css`、`css/components.css`，并在 `theme.js` 之前加一段内联脚本预置主题。
2. 顶部信号条 + 顶栏（含主题切换按钮、搜索框）。
3. 左侧栏列出本页各章节锚点。
4. 章节：令牌色板（浅/深并排）、分级色、排版尺度、按钮、表单、徽标与标签、卡片、面板与区块头、表格、时间线、折叠与选项卡、模态与 Toast、分页与面包屑、信息网格、图表、动效演示、实时调色。
5. 实时调色控件：三个 `<input type="range">` 分别调主色的 H/S/L，用 `style.setProperty('--ef-user-accent', hsl(...))` 实时写回，同时写 `--ef-user-accent-strong`（亮度减 10%）、`--ef-user-accent-glow`（亮度加 8%）与 `--ef-user-accent-ink`（亮度减 28%，保证亮色主题下文字与细图形仍达标）。

内联主题预置脚本（放在 `<head>` 里、CSS 之后）：

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

实时调色的脚本（放在页尾）：

```html
<script>
  (function () {
    var h = document.getElementById('tuneH');
    var s = document.getElementById('tuneS');
    var l = document.getElementById('tuneL');
    if (!h || !s || !l) return;
    var out = document.getElementById('tuneOut');

    function apply() {
      var hue = Number(h.value);
      var sat = Number(s.value);
      var lig = Number(l.value);
      var root = document.documentElement.style;
      var base = 'hsl(' + hue + ' ' + sat + '% ' + lig + '%)';
      root.setProperty('--ef-user-accent', base);
      root.setProperty('--ef-user-accent-strong', 'hsl(' + hue + ' ' + sat + '% ' + Math.max(0, lig - 10) + '%)');
      root.setProperty('--ef-user-accent-soft', 'hsl(' + hue + ' ' + sat + '% ' + Math.min(100, lig + 34) + '%)');
      root.setProperty('--ef-user-accent-glow', 'hsl(' + hue + ' ' + Math.min(100, sat + 8) + '% ' + Math.min(100, lig + 8) + '%)');
      /* accent-ink 需更深才达标；亮度降 28 保证与主色可辨又不失对比度 */
      root.setProperty('--ef-user-accent-ink', 'hsl(' + hue + ' ' + sat + '% ' + Math.max(0, lig - 28) + '%)');
      if (out) out.textContent = base;
    }

    [h, s, l].forEach(function (el) { el.addEventListener('input', apply); });
    apply();
  })();
</script>
```

- [ ] **Step 5: 运行两个校验脚本**

Run: `cd endfield && node tools/check-tokens.mjs && node tools/check-pages.mjs`
Expected: 两个脚本都输出「通过」，退出码 0。

- [ ] **Step 6: 浏览器核对总览页**

打开 `endfield/index.html`，确认：

- 每个章节都能通过侧栏锚点跳转。
- 色板区浅色与深色两栏并排，色块上标注令牌名与色值。
- 全部组件示例正常渲染，无破版。
- 点主题按钮整页切换且无闪烁。
- 拖动实时调色滑块，主色**立即**在全页生效（按钮、竖条、图表、卡片分级条都跟着变）。
- 按 `/` 键焦点进入搜索框。
- 控制台**无任何 error**。

- [ ] **Step 7: 提交**

```bash
cd "F:/AiWorkspace/KimiCode/public"
git add endfield/tools/check-pages.mjs endfield/index.html endfield/css/brand.css
git commit -m "feat(endfield): 加入页面校验脚本、设计系统总览页与品牌覆盖层"
```

---

### Task 9: 页面模板 — 首页、列表页、详情页

三个核心内容页。它们定义页面级组合模式，后续页面沿用。

**Files:**
- Create: `endfield/pages/home.html`
- Create: `endfield/pages/list.html`
- Create: `endfield/pages/detail.html`

**Interfaces:**
- Consumes: Task 1–8 全部 CSS/JS；`.ef-app` 骨架、`.ef-section-header`、`.ef-stat`、`.ef-card`、`.ef-item-card`、`.ef-filter-row`、`.ef-chip`、`.ef-pagination`、`.ef-info-grid`、`.ef-viewer`、`.ef-page-header`、`.ef-breadcrumb`
- Produces: 可复制的页面级组合模式；后续页面（Task 10–12）沿用相同的 `<head>` 引用块与骨架结构

- [ ] **Step 1: 写首页**

创建 `endfield/pages/home.html`。关键结构（完整实现，不要省略）：

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>首页 · 档案库</title>
<meta name="description" content="工业军事科幻 HUD 设计系统示例首页。">
<link rel="stylesheet" href="../css/base.css">
<link rel="stylesheet" href="../css/utilities.css">
<link rel="stylesheet" href="../css/layout.css">
<link rel="stylesheet" href="../css/components.css">
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
</head>
<body>
<a class="ef-skip-link" href="#ef-main">跳到主内容</a>

<div class="ef-app">
  <!-- 顶栏：与 Task 8 总览页相同的结构，导航项指向各页面 -->
  <header class="ef-topbar">
    <div class="ef-topbar__signal"></div>
    <div class="ef-topbar__bar">
      <button class="ef-icon-btn ef-sidebar-toggle" data-sidebar-toggle
              aria-expanded="true" aria-controls="ef-sidebar" aria-label="切换侧栏">☰</button>
      <a class="ef-topbar__brand" href="home.html">◈ 档案库 <span class="ef-eyebrow">BETA</span></a>
      <div class="ef-topbar__search">
        <div class="ef-searchbar">
          <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M11 11l4 4" stroke="currentColor" stroke-width="1.5"/></svg>
          <input type="search" placeholder="搜索条目、分类…" aria-label="搜索">
          <kbd class="ef-kbd">/</kbd>
        </div>
      </div>
      <div class="ef-topbar__actions">
        <button class="ef-icon-btn" data-theme-toggle aria-label="切换主题">◐</button>
        <a class="ef-btn ef-btn--sm" href="login.html">登录</a>
      </div>
    </div>
  </header>

  <!-- 侧栏：导航项覆盖全部 12 个页面，当前页用 aria-current="page" -->
  <aside class="ef-sidebar" id="ef-sidebar">
    <nav class="ef-sidebar__section" aria-label="浏览">
      <div class="ef-sidebar__section-title">浏览</div>
      <a class="ef-sidebar__item" href="home.html" aria-current="page"><span class="ef-label-pair"><b>首页</b><i>Home</i></span></a>
      <a class="ef-sidebar__item" href="index-page.html"><span class="ef-label-pair"><b>分类索引</b><i>Index</i></span></a>
      <a class="ef-sidebar__item" href="changes.html"><span class="ef-label-pair"><b>最近更改</b><i>Recent</i></span></a>
    </nav>
    <nav class="ef-sidebar__section" aria-label="内容分类">
      <div class="ef-sidebar__section-title">内容分类</div>
      <a class="ef-sidebar__item" href="list.html"><span class="ef-label-pair"><b>条目列表</b><i>Listing</i></span></a>
      <a class="ef-sidebar__item" href="search.html"><span class="ef-label-pair"><b>搜索</b><i>Search</i></span></a>
      <a class="ef-sidebar__item" href="dashboard.html"><span class="ef-label-pair"><b>仪表盘</b><i>Dashboard</i></span></a>
      <a class="ef-sidebar__item" href="settings.html"><span class="ef-label-pair"><b>设置</b><i>Settings</i></span></a>
    </nav>
    <div class="ef-sidebar__footer">
      <button class="ef-btn ef-btn--sm" data-sidebar-toggle
              aria-expanded="true" aria-controls="ef-sidebar" style="width:100%">收起侧栏</button>
    </div>
  </aside>

  <main class="ef-main" id="ef-main">
    <div class="ef-content ef-stack">

      <!-- Hero -->
      <section class="ef-panel ef-industrial-shell ef-corner-frame--all" style="padding:var(--ef-space-10) var(--ef-space-8)">
        <div class="ef-row ef-row--between" style="align-items:flex-start">
          <div style="min-width:0">
            <span class="ef-eyebrow">// Archive Index</span>
            <h1 class="ef-boot-title" style="font-size:var(--ef-text-5xl);margin:.2em 0">档案库</h1>
            <p class="ef-muted" style="max-width:36rem">工业军事科幻 HUD 设计系统示例站。全部内容为中性占位文案。</p>
            <div class="ef-row" style="margin-top:var(--ef-space-5)">
              <a class="ef-btn ef-btn--primary ef-btn--lg" href="list.html">浏览条目</a>
              <a class="ef-btn ef-btn--lg" href="article.html">阅读文章</a>
            </div>
          </div>
          <div class="ef-row" style="gap:var(--ef-space-8);flex:none">
            <div class="ef-stat"><span class="ef-stat__value">7,256</span><span class="ef-stat__label">条目</span><span class="ef-stat__sub">Articles</span></div>
            <div class="ef-stat"><span class="ef-stat__value">63,593</span><span class="ef-stat__label">次修订</span><span class="ef-stat__sub">Revisions</span></div>
            <div class="ef-stat"><span class="ef-stat__value">18</span><span class="ef-stat__label">位编辑者</span><span class="ef-stat__sub">Editors</span></div>
          </div>
        </div>
        <div class="ef-signal-bars" style="margin-top:var(--ef-space-8);justify-content:flex-end">
          <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i class="is-active"></i><i></i><i></i><i></i>
        </div>
      </section>

      <!-- 动态：大图 + 侧边列表 -->
      <section>
        <div class="ef-section-header">
          <div class="ef-section-header__main">
            <span class="ef-section-header__eyebrow">Game News</span>
            <h2 class="ef-section-header__title">最新动态</h2>
          </div>
          <div class="ef-section-header__actions"><a class="ef-btn ef-btn--sm" href="changes.html">全部动态 →</a></div>
        </div>
        <div style="display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:var(--ef-space-4)">
          <article class="ef-card">
            <div class="ef-card__media" style="aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;color:var(--ef-ink-subtle)" aria-hidden="true">封面占位</div>
            <div class="ef-card__body">
              <span class="ef-eyebrow">2026.07.16</span>
              <h3 class="ef-card__title">版本更新说明</h3>
              <p class="ef-card__meta ef-muted" style="margin:0">示例摘要文本，用于演示卡片布局。</p>
            </div>
          </article>
          <ul class="ef-timeline" style="margin:0">
            <li class="ef-timeline__item ef-timeline__item--accent">
              <time class="ef-timeline__time">2026.07.16</time>
              <div class="ef-timeline__body"><a class="ef-timeline__title" href="article.html">版本更新说明</a></div>
            </li>
            <li class="ef-timeline__item">
              <time class="ef-timeline__time">2026.06.19</time>
              <div class="ef-timeline__body"><a class="ef-timeline__title" href="article.html">活动开启说明</a></div>
            </li>
            <li class="ef-timeline__item">
              <time class="ef-timeline__time">2026.06.05</time>
              <div class="ef-timeline__body"><a class="ef-timeline__title" href="article.html">规则调整公告</a></div>
            </li>
          </ul>
        </div>
      </section>

      <!-- 分类入口 -->
      <section>
        <div class="ef-section-header">
          <div class="ef-section-header__main">
            <span class="ef-section-header__eyebrow">Categories</span>
            <h2 class="ef-section-header__title">内容分类</h2>
          </div>
        </div>
        <div class="ef-grid ef-grid--panels">
          <!-- 重复 6 个，图标用内联 SVG，名称与英文副标签成对 -->
          <a class="ef-panel" href="list.html" style="padding:var(--ef-space-4);text-decoration:none">
            <span class="ef-label-pair"><b>分类一</b><i>Category One</i></span>
            <p class="ef-subtle" style="margin:var(--ef-space-2) 0 0;font-size:var(--ef-text-xs)">128 个条目</p>
          </a>
          <!-- …其余 5 个同构… -->
        </div>
      </section>

    </div>
  </main>

  <footer class="ef-footer">
    <div class="ef-footer__inner">
      <ul class="ef-footer__links">
        <li><a href="article.html">关于本站</a></li>
        <li><a href="article.html">隐私政策</a></li>
        <li><a href="article.html">使用条款</a></li>
        <li><a href="article.html">联系我们</a></li>
      </ul>
      <p class="ef-footer__legal">示例内容，仅用于设计系统演示。所有名称与数据均为虚构。</p>
    </div>
  </footer>

  <!-- 遮罩必须是 .ef-app 的子元素：显示规则是后代选择器 .ef-app.is-open .ef-scrim -->
  <div class="ef-scrim"></div>
</div>
<script src="../js/theme.js"></script>
<script src="../js/ui.js"></script>
</body>
</html>
```

首页还要加：Hero 下方一个横向 `ef-grid--stats` 的 4 个 `ef-stat-card`（带图标与 `ef-entry-glow`）。

- [ ] **Step 2: 写列表页**

创建 `endfield/pages/list.html`，沿用首页的 `<head>`、顶栏、侧栏、页脚（侧栏把 `aria-current="page"` 移到「条目列表」）。主体内容：

1. `ef-breadcrumb`：首页 / 条目列表。
2. `ef-page-header`：标题「条目列表」，meta 含「共 128 个条目」与「最近更新 2026.09.24」，actions 含「复制链接」「导出」两个按钮。
3. 筛选面板：`ef-panel` 内 5 行 `ef-filter-row`，每行 `ef-filter-row__label` + `ef-filter-row__options`（首个 `ef-chip` 为「全部」且 `aria-pressed="true"`，其余为普通 `ef-chip`）。5 行标签分别为：类别、等级、属性、状态、标签。
4. 结果区头部：`ef-row--between`，左为「共 128 条」`ef-eyebrow`，右为排序 `<select class="ef-select" style="width:auto">`。
5. `ef-grid ef-grid--cards` 内 18 个 `ef-item-card`。每张卡：

```html
<a class="ef-item-card" href="detail.html" data-tier="4">
  <div class="ef-item-card__media" data-index="01" role="img" aria-label="条目缩略图占位"></div>
  <div class="ef-item-card__body">
    <span class="ef-item-card__text">
      <span class="ef-item-card__name">条目名称一</span>
      <span class="ef-item-card__sub">// Item One</span>
    </span>
    <span class="ef-item-card__icons">
      <span class="ef-badge--tier" aria-label="等级 4">4</span>
    </span>
  </div>
  <div class="ef-tier-strip"></div>
</a>
```

18 张卡的 `data-tier` 在 1–6 间分布，`data-index` 依次为 `01`…`18`。

6. `ef-pagination`：上一页（`aria-disabled="true"`）、1、2、3（`aria-current="page"`）、下一页。

- [ ] **Step 3: 写详情页**

创建 `endfield/pages/detail.html`，沿用相同骨架（`aria-current="page"` 在「条目列表」）。主体内容：

1. `ef-breadcrumb`：首页 / 条目列表 / 条目名称一。
2. `ef-page-header`：标题「条目名称一」；meta 含「最近编辑：2026/9/24 11:35」「编辑：示例编辑者」「摘要：更新条目档案」；actions 含「复制链接」「长截图」「阅读」「关注」「详细」5 个 `ef-btn--sm`。
3. 双栏（`display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:var(--ef-space-6)`）：
   - 左：`ef-viewer`，toolbar 含「−」「100%」「+」「↻」「⛶」按钮，stage 内放一个 `role="img"` 的占位方块。
   - 右：`ef-panel` 内依次为 `ef-badge--accent`「ITEM」、大标题、`ef-eyebrow` 英文名、图标组（3 个 `ef-badge--tier`）、`ef-divider`、`ef-info-grid`（6 组键值）、`ef-divider`、简介段落。
4. 下方 `ef-panel` 含 `ef-tabs`（两个选项卡：基础信息 / 进阶信息），每个面板内一个 `ef-table`。
5. 底部一个 `ef-callout--info` 说明数据来源。

- [ ] **Step 4: 运行校验**

Run: `cd endfield && node tools/check-tokens.mjs && node tools/check-pages.mjs`
Expected: 两个都通过。若报「引用不存在的文件」，说明侧栏里有指向尚未创建页面的链接——这是**预期内的暂时失败**，因为 Task 10–12 才会补齐其余页面。此时可在对应链接上先指向已存在的页面，等后续任务再改回。**最终 Task 13 必须全部通过。**

- [ ] **Step 5: 三断点与双主题核对**

在 375 / 768 / 1440 三档、浅色与深色两主题下逐个打开三个页面，确认：

- 首页 Hero 在窄屏下统计块换行、不溢出；大图与时间线在窄屏改为上下堆叠。
- 列表页在 1440px 显示 6 列卡片、768px 约 3 列、375px 约 2 列；筛选行在窄屏下标签与选项上下堆叠。
- 详情页双栏在窄屏改为上下堆叠；`ef-viewer` 的 stage 不超出容器。
- 长条目名称（把某张卡的名称临时改成 40 个无空格字符）**不撑破卡片**，验证后改回。
- 三页均无横向滚动条；控制台无 error。

- [ ] **Step 6: 提交**

```bash
cd "F:/AiWorkspace/KimiCode/public"
git add endfield/pages/home.html endfield/pages/list.html endfield/pages/detail.html
git commit -m "feat(endfield): 加入首页、列表页、详情页三个页面模板"
```

---

### Task 10: 页面模板 — 文章页、索引页、最近更改页

**Files:**
- Create: `endfield/pages/article.html`
- Create: `endfield/pages/index-page.html`
- Create: `endfield/pages/changes.html`

**Interfaces:**
- Consumes: Task 9 建立的页面骨架模式；`.ef-h2-title`、`.ef-toc`、`.ef-callout`、`.ef-code`、`.ef-table`、`.ef-accordion`、`.ef-timeline`
- Produces: 文章页的正文排版模式（`h2.ef-h2-title` + 段落 + 表格 + 脚注），供后续复用

- [ ] **Step 1: 写文章页**

创建 `endfield/pages/article.html`，沿用骨架（侧栏 `aria-current="page"` 放在「分类索引」之外——文章页不属于侧栏任一分类，故不加 `aria-current`）。

主体：

1. `ef-breadcrumb`：首页 / 分类索引 / 文章标题。
2. `ef-page-header`：标题「文章标题示例」+ meta（最近编辑时间、编辑者）。
3. 双栏 `grid-template-columns: minmax(0,1fr) 16rem`：
   - 左：`<article>` 正文。开头一个 `ef-callout--info`（标题「提示」）。正文含：
     - 3 个 `<h2 class="ef-h2-title">` 小节，各带 2 段文字。
     - 一个 `ef-table`（3 列 × 5 行，含表头）。
     - 一个 `ef-code` 代码块（含 head 里的语言标签与复制按钮）。
     - 一个 `ef-accordion`（3 个 `<details>`）。
     - 一个 `ef-callout--warn`。
     - 正文末尾 `ef-divider--labeled` 分隔线，标签「脚注」，后接有序列表 3 条。
   - 右：`ef-toc`，标题「本页目录」，列出正文 3 个 `h2` 与 2 个 `h3` 的锚点（`ef-toc__sub` 用于 `h3`）。
4. 正文所有 `h2`/`h3` 必须有 `id`，且与 `ef-toc` 的 `href` 一一对应。

- [ ] **Step 2: 写分类索引页**

创建 `endfield/pages/index-page.html`，沿用骨架（`aria-current="page"` 放在「分类索引」）。

主体：

1. `ef-page-header`：标题「分类索引」+ meta（「共 12 个分类」）。
2. 一个 `ef-searchbar` 用于过滤（纯展示，无实际逻辑）。
3. `ef-grid ef-grid--panels` 内 12 个分区。每个分区为一个 `ef-panel`：

```html
<section class="ef-panel">
  <div class="ef-panel__header">
    <h2 class="ef-panel__title">分区名称</h2>
    <span class="ef-badge">24</span>
  </div>
  <div class="ef-panel__body">
    <ul style="margin:0;padding-left:1.1em;font-size:var(--ef-text-sm)">
      <li><a href="detail.html">条目名称一</a></li>
      <li><a href="detail.html">条目名称二</a></li>
      <li><a href="detail.html">条目名称三</a></li>
      <li><a href="detail.html">条目名称四</a></li>
    </ul>
  </div>
</section>
```

12 个分区的标题依次为：类别一…类别十二，数量徽标各不相同。

- [ ] **Step 3: 写最近更改页**

创建 `endfield/pages/changes.html`，沿用骨架（`aria-current="page"` 放在「最近更改」）。

主体：

1. `ef-page-header`：标题「最近更改」+ meta（「最近 50 次修订」）。
2. 筛选行：一行 `ef-filter-row`，标签「时间范围」，选项为 4 个 `ef-chip`（1 小时 / 1 天 / 7 天 / 30 天，首个 `aria-pressed="true"`）。
3. 一个 `ef-panel`，内含 `ef-timeline` 共 12 个 `ef-timeline__item`。每项结构：

```html
<li class="ef-timeline__item">
  <time class="ef-timeline__time" datetime="2026-09-24T11:35:14">2026/9/24 11:35:14</time>
  <div class="ef-timeline__body">
    <a class="ef-timeline__title" href="detail.html">条目名称一</a>
    <span class="ef-badge ef-badge--success" style="margin-left:.5em">+128</span>
    <span class="ef-badge ef-badge--danger">−42</span>
    <p class="ef-muted" style="margin:.2em 0 0;font-size:var(--ef-text-xs)">
      编辑：示例编辑者 · 摘要：更新条目档案
    </p>
  </div>
</li>
```

其中第 1、5、9 项加 `ef-timeline__item--accent` 表示重点修订。

- [ ] **Step 4: 运行校验**

Run: `cd endfield && node tools/check-tokens.mjs && node tools/check-pages.mjs`
Expected: 令牌校验通过。页面校验可能仍报未创建页面的链接（Task 11–12 待补），记录即可。

- [ ] **Step 5: 双主题与窄屏核对**

三档宽度 × 两主题，逐个打开三个页面：

- 文章页：窄屏下目录移到正文上方或隐藏；`ef-h2-title` 的渐变条随标题换行正确重现（这是 `box-decoration-break: clone` 的作用，**多行标题每行都要有下划线**）；表格在窄屏可横向滚动而不撑破页面。
- 索引页：分区网格在 375px 为单列、1440px 为多列。
- 最近更改页：时间线在窄屏不溢出。

- [ ] **Step 6: 提交**

```bash
cd "F:/AiWorkspace/KimiCode/public"
git add endfield/pages/article.html endfield/pages/index-page.html endfield/pages/changes.html
git commit -m "feat(endfield): 加入文章页、分类索引页、最近更改页模板"
```

---

### Task 11: 页面模板 — 搜索页、登录页、设置页

**Files:**
- Create: `endfield/pages/search.html`
- Create: `endfield/pages/login.html`
- Create: `endfield/pages/settings.html`

**Interfaces:**
- Consumes: Task 9–10 的骨架与组件；`.ef-searchbar`、`.ef-input`、`.ef-field`、`.ef-check`、`.ef-switch`、`.ef-select`、`.ef-empty`、`.ef-tabs`
- Produces: 表单页布局模式（登录页为无侧栏的居中布局，后续可复用）

- [ ] **Step 1: 写搜索页**

创建 `endfield/pages/search.html`，沿用骨架（侧栏 `aria-current="page"` 放在「搜索」）。

主体：

1. 顶部一个大的 `ef-searchbar`，`value="示例"`，并有一个「搜索」`ef-btn--primary`。
2. 结果统计行：`ef-eyebrow` 显示「找到 23 条结果，用时 0.04 秒」。
3. 双栏 `grid-template-columns: 14rem minmax(0,1fr)`：
   - 左：`ef-panel` 内 3 行 `ef-filter-row`（命名空间 / 类型 / 时间），选项为 `ef-chip`。
   - 右：结果列表，10 条。每条为 `ef-panel` 内的：

```html
<article class="ef-panel" style="padding:var(--ef-space-4)">
  <a href="detail.html" style="font-size:var(--ef-text-lg);font-weight:var(--ef-weight-semibold);text-decoration:none">
    结果标题含<mark>示例</mark>关键词
  </a>
  <p class="ef-muted" style="margin:.3em 0 0;font-size:var(--ef-text-sm)">
    摘要文本，其中<mark>示例</mark>关键词被高亮显示，用于演示命中效果。
  </p>
  <p class="ef-eyebrow" style="margin:.4em 0 0">/detail · 2026.09.24</p>
</article>
```

4. 结果列表末尾加 `ef-pagination`。
5. 再写一个「无结果」变体区块：`ef-empty`（图标 + 「没有匹配的结果」+ 「试试更短的关键词」+ 「清除筛选」按钮），放在 `hidden` 的容器里，并在页面底部用一个说明性 `ef-callout` 指出这是空结果态样式示例。

`<mark>` 需要样式，在页面 `<style>` 中定义：

```css
mark {
  padding: 0 0.15em;
  background: var(--ef-accent-soft);
  color: var(--ef-ink);
  font-weight: var(--ef-weight-semibold);
}
```

- [ ] **Step 2: 写登录页**

创建 `endfield/pages/login.html`。**此页不使用侧栏**，采用居中单栏布局：

```html
<body>
<a class="ef-skip-link" href="#ef-main">跳到主内容</a>
<div class="ef-topbar">
  <div class="ef-topbar__signal"></div>
  <div class="ef-topbar__bar">
    <a class="ef-topbar__brand" href="home.html">◈ 档案库</a>
    <div class="ef-spacer"></div>
    <button class="ef-icon-btn" data-theme-toggle aria-label="切换主题">◐</button>
  </div>
</div>

<main id="ef-main" class="ef-industrial-shell"
      style="min-height:calc(100vh - var(--ef-header-bar-h) - var(--ef-header-signal-h));
             display:flex;align-items:center;justify-content:center;padding:var(--ef-space-6)">
  <div class="ef-panel ef-chamfer" style="width:100%;max-width:24rem;padding:var(--ef-space-8)">
    <div style="text-align:center;margin-bottom:var(--ef-space-6)">
      <span class="ef-eyebrow">// Sign In</span>
      <h1 style="margin:.2em 0 0;font-size:var(--ef-text-2xl)">登录档案库</h1>
    </div>

    <form>
      <div class="ef-field">
        <label class="ef-label" for="loginUser">用户名</label>
        <input class="ef-input" id="loginUser" name="username" autocomplete="username" required>
      </div>
      <div class="ef-field">
        <label class="ef-label" for="loginPass">密码</label>
        <input class="ef-input" id="loginPass" name="password" type="password"
               autocomplete="current-password" required>
      </div>
      <div class="ef-row ef-row--between" style="margin-bottom:var(--ef-space-4)">
        <label class="ef-check"><input type="checkbox" name="remember"> 记住我</label>
        <a href="#" style="font-size:var(--ef-text-xs)">忘记密码？</a>
      </div>
      <button class="ef-btn ef-btn--primary" type="submit" style="width:100%">登录</button>
    </form>

    <hr class="ef-divider">

    <div class="ef-stack" style="gap:var(--ef-space-2)">
      <button class="ef-btn" type="button" style="width:100%">使用通行证登录</button>
      <button class="ef-btn" type="button" style="width:100%">使用密钥登录</button>
    </div>

    <p style="margin:var(--ef-space-5) 0 0;text-align:center;font-size:var(--ef-text-sm)">
      <span class="ef-muted">还没有账号？</span> <a href="#">注册</a>
    </p>
  </div>
</main>

<script src="../js/theme.js"></script>
</body>
```

- [ ] **Step 3: 写设置页**

创建 `endfield/pages/settings.html`，沿用骨架（`aria-current="page"` 放在「设置」）。

主体：

1. `ef-page-header`：标题「设置」+ meta（「管理你的偏好」）。
2. `ef-panel` 内 `ef-tabs`，4 个选项卡：个人资料 / 外观 / 通知 / 安全。每个面板：

**个人资料**：`ef-field` × 3（显示名称、邮箱、个人简介 `ef-textarea`）+ 「保存」按钮。
**外观**：主题三选一（3 个 `ef-radio`：跟随系统 / 浅色 / 深色，`name="theme"`，`value` 分别为 `system`/`light`/`dark`，并加 `data-theme-radio` 属性）+ 「紧凑模式」「显示网格底纹」两个 `ef-switch` + 一个 `ef-select` 选语言。
**通知**：4 个 `ef-switch`（条目更新、回复提醒、每周摘要、安全告警）。
**安全**：`ef-field` × 2（当前密码、新密码）+ 「两步验证」`ef-switch` + 一个 `ef-btn--danger`「注销所有会话」。

外观面板的选项需与主题脚本联动，在页尾加：

```html
<script>
  (function () {
    var radios = document.querySelectorAll('[data-theme-radio]');
    if (!radios.length || !window.EFTheme) return;

    function sync() {
      var current = window.EFTheme.get();
      Array.prototype.forEach.call(radios, function (r) {
        r.checked = r.value === current;
      });
    }

    Array.prototype.forEach.call(radios, function (r) {
      r.addEventListener('change', function () {
        if (r.checked) window.EFTheme.set(r.value);
      });
    });

    sync();
    window.EFTheme.onChange(sync);
  })();
</script>
```

- [ ] **Step 4: 运行校验**

Run: `cd endfield && node tools/check-tokens.mjs && node tools/check-pages.mjs`
Expected: 令牌校验通过；页面校验可能仍报未创建页面的链接。

- [ ] **Step 5: 逐项核对**

- 搜索页：命中词高亮为主色浅底；窄屏下筛选侧栏移到结果上方；空结果态区块样式正确（可临时去掉 `hidden` 查看后改回）。
- 登录页：卡片居中且**有切角**；窄屏下卡片占满宽度但保留内边距；表单标签为等宽大写小字；`Tab` 顺序正确。
- 设置页：选项卡切换正常；点外观里的「深色」单选项，整页**立即**变深色；刷新后主题保持；通知面板的开关可切换。
- 三页在深色主题下配色正确。

- [ ] **Step 6: 提交**

```bash
cd "F:/AiWorkspace/KimiCode/public"
git add endfield/pages/search.html endfield/pages/login.html endfield/pages/settings.html
git commit -m "feat(endfield): 加入搜索页、登录页、设置页模板"
```

---

### Task 12: 页面模板 — 仪表盘、404、500

**Files:**
- Create: `endfield/pages/dashboard.html`
- Create: `endfield/pages/error-404.html`
- Create: `endfield/pages/error-500.html`

**Interfaces:**
- Consumes: Task 9–11 全部；`.ef-stat-card`、`.ef-chart`、`.ef-heatmap`、`.ef-table`、`.ef-dropdown`
- Produces: 图表与数据展示模式；两个错误页的无侧栏居中布局模式

- [ ] **Step 1: 写仪表盘**

创建 `endfield/pages/dashboard.html`，沿用骨架（`aria-current="page"` 放在「仪表盘」）。

主体：

1. `ef-page-header`：标题「仪表盘」+ meta（「数据截至 2026.09.24」）+ actions 含一个时间范围 `ef-dropdown`。
2. `ef-grid ef-grid--stats` 内 4 个 `ef-stat-card`（图标 + 数值 + 标签），其中一个带 `ef-entry-glow`。
3. 双栏 `grid-template-columns: minmax(0,2fr) minmax(0,1fr)`：
   - 左：`ef-panel`，标题「访问趋势」，body 内一个折线图 SVG。SVG 要求：

```html
<svg class="ef-chart" viewBox="0 0 640 200" role="img" aria-label="访问趋势折线图">
  <!-- 水平网格线 ×4 -->
  <line class="ef-chart__grid" x1="40" y1="40"  x2="620" y2="40"/>
  <line class="ef-chart__grid" x1="40" y1="80"  x2="620" y2="80"/>
  <line class="ef-chart__grid" x1="40" y1="120" x2="620" y2="120"/>
  <line class="ef-chart__grid" x1="40" y1="160" x2="620" y2="160"/>
  <!-- 面积 + 折线 -->
  <path class="ef-chart__area" d="M40,150 L140,110 L240,125 L340,70 L440,85 L540,45 L620,60 L620,180 L40,180 Z"/>
  <path class="ef-chart__line" d="M40,150 L140,110 L240,125 L340,70 L440,85 L540,45 L620,60"/>
  <!-- 数据点 -->
  <circle class="ef-chart__point" cx="40"  cy="150" r="3"/>
  <circle class="ef-chart__point" cx="140" cy="110" r="3"/>
  <circle class="ef-chart__point" cx="240" cy="125" r="3"/>
  <circle class="ef-chart__point" cx="340" cy="70"  r="3"/>
  <circle class="ef-chart__point" cx="440" cy="85"  r="3"/>
  <circle class="ef-chart__point" cx="540" cy="45"  r="3"/>
  <circle class="ef-chart__point" cx="620" cy="60"  r="3"/>
  <!-- X 轴标签 -->
  <text class="ef-chart__axis-label" x="40"  y="196" text-anchor="middle">周一</text>
  <text class="ef-chart__axis-label" x="180" y="196" text-anchor="middle">周二</text>
  <text class="ef-chart__axis-label" x="320" y="196" text-anchor="middle">周三</text>
  <text class="ef-chart__axis-label" x="460" y="196" text-anchor="middle">周四</text>
  <text class="ef-chart__axis-label" x="620" y="196" text-anchor="middle">周五</text>
</svg>
<div class="ef-chart-legend">
  <span style="--ef-legend-color:var(--ef-accent-ink)">访问量</span>
</div>
```

   - 右：`ef-panel`，标题「来源占比」，body 内一个环形图 SVG：

```html
<svg class="ef-chart" viewBox="0 0 200 200" role="img" aria-label="来源占比环形图">
  <circle class="ef-chart__donut-track" cx="100" cy="100" r="70"/>
  <!-- 周长 = 2πr ≈ 439.8；45% 用 dasharray -->
  <circle class="ef-chart__donut-value" cx="100" cy="100" r="70"
          transform="rotate(-90 100 100)"
          stroke-dasharray="197.9 439.8"/>
  <text x="100" y="96" text-anchor="middle"
        style="font-family:var(--ef-font-mono);font-size:28px;font-weight:700;fill:var(--ef-ink)">45%</text>
  <text class="ef-chart__axis-label" x="100" y="118" text-anchor="middle">直接访问</text>
</svg>
<div class="ef-chart-legend">
  <span style="--ef-legend-color:var(--ef-accent-ink)">直接访问 45%</span>
  <span style="--ef-legend-color:var(--ef-border-strong)">其他 55%</span>
</div>
```

4. 一行 `ef-heatmap`（7 行 × 20 列 = 140 个 `<span>`，`data-level` 在 0–4 间分布）。
5. `ef-panel` 内 `ef-table-wrap` + `ef-table`：5 列（条目 / 类别 / 等级 / 修订数 / 最近更新）× 8 行，表头用 `ef-table__sort` 按钮，其中一列带 `aria-sort="descending"`。

- [ ] **Step 2: 写 404 页**

创建 `endfield/pages/error-404.html`。无侧栏，居中布局（同登录页的居中方式）。
**必须**与 `login.html` 一样包含 `<a class="ef-skip-link" href="#ef-main">跳到主内容</a>`
与 `<main id="ef-main" class="ef-industrial-shell">`（居中容器即 `<main>`），
否则 Step 4 的 `check-pages.mjs` 会报错。内容：

- `ef-badge--warn` 显示「404」。
- `<h1>` 「页面不存在」，字号 `var(--ef-text-5xl)`。
- 一段说明文字。
- 两个按钮：「返回首页」（`ef-btn--primary`，指向 `home.html`）、「搜索条目」（`ef-btn`，指向 `search.html`）。
- 底部一个小型 `ef-signal-bars` 装饰。

- [ ] **Step 3: 写 500 页**

创建 `endfield/pages/error-500.html`，结构与 404 页一致（同样必须含
`.ef-skip-link` 与 `<main id="ef-main">`），差异：

- `ef-badge--danger` 显示「500」。
- 标题「服务异常」。
- 说明文字含「请稍后重试」。
- 按钮：「重试」（`ef-btn--primary`，`onclick="location.reload()"`）、「返回首页」（`ef-btn`）。
- 额外一个 `ef-callout--danger`，标题「状态」，内容说明这是示例错误页。

- [ ] **Step 4: 运行全部三个校验脚本**

Run: `cd endfield && node tools/check-tokens.mjs && node tools/check-contrast.mjs && node tools/check-pages.mjs`
Expected: **三个全部通过**。此时 12 个页面已齐，不应再有「引用不存在的文件」错误。

- [ ] **Step 5: 逐项核对**

- 仪表盘：折线图有网格、面积、折线与数据点，配色为主色；环形图 45% 弧段正确、中心有百分比文字；热力图格子深浅分明；表格表头可排序样式正确（带 `aria-sort` 的列有箭头）。
- 窄屏下折线图与环形图缩小但不溢出；表格可横向滚动。
- 404 与 500 页居中、切角/徽标正确；两个页面的按钮链接可点通。
- 深色主题下三页配色正确。

- [ ] **Step 6: 提交**

```bash
cd "F:/AiWorkspace/KimiCode/public"
git add endfield/pages/dashboard.html endfield/pages/error-404.html endfield/pages/error-500.html
git commit -m "feat(endfield): 加入仪表盘、404、500 页面模板"
```

---

### Task 13: README 与最终验收

**Files:**
- Create: `endfield/README.md`
- Modify: 各页面（仅在核对中发现问题时）

**Interfaces:**
- Consumes: 全部
- Produces: 面向使用者的说明文档

- [ ] **Step 1: 写 README**

创建 `endfield/README.md`，包含以下小节：

1. **这是什么** — 一句话定位：工业军事科幻 HUD 风格的设计系统，零构建，纯静态。
2. **快速开始** — 双击 `index.html`；或起本地服务器 `python -m http.server 8000`。说明两种方式都可，`file://` 下功能完整。
3. **目录结构** — 照抄规格 §2 的树（去掉 `react/` 部分，那属于另一个计划）。
4. **设计令牌** — 完整令牌表（色彩、排版、形状、动效、层级），直接从 `tokens.css` 抄录。说明所有令牌以 `--ef-` 为前缀。
5. **主题** — 三态说明（跟随系统 / 浅色 / 深色），`data-theme` 属性与 `localStorage` 键名 `ef-theme`；说明 `dark` 令牌在两处重复定义，改一处必须同步另一处。
6. **换肤** — 如何通过 `--ef-user-accent*` 五个变量或引入 `brand.css` 换主色；说明 `accent` 用于填充、`accent-ink` 用于文字与细图形，以及为什么必须分开；给一段可复制的代码。
7. **13 种视觉手法** — 每种给类名、一句话说明、最小 HTML 片段。
8. **组件索引** — 按类别列出全部类名，每条一句话。
9. **页面模板** — 12 个页面清单与各自用途。
10. **校验脚本** — 三个脚本的用途与运行命令：
    ```
    node tools/check-tokens.mjs     # 令牌引用完整性
    node tools/check-contrast.mjs   # WCAG 对比度
    node tools/check-pages.mjs      # 页面结构与资源可解析
    ```
11. **可访问性** — 已实现的项：跳转链接、语义 landmark、键盘可达、焦点可见、模态焦点陷阱、`prefers-reduced-motion`、对比度达标、无 JS 可用。
12. **设计原则** — 简述这套系统为什么长这样：工业 HUD 气质、单一主色、等宽拉丁标签、切角而非圆角、网格与扫描线、动效克制。

- [ ] **Step 2: 运行全部校验脚本**

Run: `cd endfield && node tools/check-tokens.mjs && node tools/check-contrast.mjs && node tools/check-pages.mjs`
Expected: 三个都输出「通过」，退出码 0。

- [ ] **Step 3: 全量页面走查**

对全部 13 个 HTML（`index.html` + 12 个页面模板）执行以下核对，逐项记录结果：

- 在**浅色**与**深色**两主题下各打开一次，控制台**无 error**。
- 在 **375 / 768 / 1440** 三档宽度下各打开一次，**无横向滚动条**（用 `document.documentElement.scrollWidth > clientWidth` 判断）。
- 从 `index.html` 出发，点击侧栏每个导航项，确认 12 个页面**互相可达**且无死链。
- 每个页面 `Tab` 走查一遍，焦点轮廓始终可见。

- [ ] **Step 4: 验证 reduced-motion 与打印**

- 开启「模拟 prefers-reduced-motion: reduce」，刷新 `index.html` 与首页，确认动效停止且**没有元素停留在不可见状态**。
- 打开打印预览（`Ctrl+P`），确认输出为**白底黑字**，且侧栏与顶栏被隐藏。这一步覆盖 Review Focus 第 6 条。

- [ ] **Step 5: 验证无 JS 与 file:// 两种极端**

- **无 JS**：在浏览器禁用 JavaScript，刷新首页与文章页，确认内容可读、`<details>` 可展开、主题跟随系统。覆盖 Review Focus 第 7 条。
- **`file://`**：直接双击 `endfield/index.html` 与 `endfield/pages/home.html`（不经过任何服务器），确认样式与脚本**全部生效**、无 404。覆盖 Review Focus 第 1 条。

- [ ] **Step 6: 提交**

```bash
cd "F:/AiWorkspace/KimiCode/public"
git add endfield/README.md
git commit -m "docs(endfield): 加入 README 与令牌说明"
```

---

## Self-Review

**1. 规格覆盖**

| 规格小节 | 覆盖任务 |
|---|---|
| §2 目录结构 | Task 1（骨架）、Task 8（brand.css、index.html） |
| §3.1–3.5 色彩令牌 | Task 1 Step 2 |
| §3.6 排版令牌 | Task 1 Step 2 |
| §3.7 形状/动效/层级 | Task 1 Step 2 |
| §4 主题架构（三态） | Task 1 Step 2（CSS）、Task 7 Step 1（JS） |
| §5.1 切角 | Task 3 Step 1 |
| §5.2 四角括号 | Task 3 Step 1 |
| §5.3 网格底纹 | Task 3 Step 1 |
| §5.4 工业底 | Task 3 Step 1（类）+ Task 2（body 默认） |
| §5.5 扫描线 | Task 3 Step 1 |
| §5.6 斜纹 | Task 3 Step 1 |
| §5.7 中英双行标签 | Task 3 Step 1 |
| §5.8 竖条/双斜杠/方括号 | Task 3 Step 1 |
| §5.9 标题渐变条 | Task 3 Step 1 |
| §5.10 信号波形条 | Task 3 Step 1 |
| §5.11 顶部信号条 | Task 3 Step 1 |
| §5.12 分级条 | Task 3 Step 1 |
| §5.13 入场动效（7 组） | Task 3 Step 1 |
| §6.1 原子组件（13 类） | Task 5 |
| §6.2 结构组件（24 类） | Task 6 |
| §6.3 侧栏激活态 | Task 4 Step 1 |
| §7 页面模板（12 个） | Task 9（3 个）、Task 10（3 个）、Task 11（3 个）、Task 12（3 个） |
| §7 index.html 总览页 + 实时调色 | Task 8 |
| §9 可访问性 | Task 2（跳转链接、焦点、打印）、Task 4（响应式）、Task 5（焦点）、Task 7（焦点陷阱、无 JS）、Task 13（走查） |
| §11 验收方式 | Task 13 |

规格 §10「不在范围内」已通过 Global Constraints 落实（无第三方库、无后端、中性文案）。

无遗漏。

**2. 占位符扫描**

已检查：计划中无 "TBD"、"TODO"、"待补"、"类似 Task N" 等表述。每个代码步骤都给出了可直接落地的完整代码。Task 9–12 的页面模板中，重复性极高的部分（如首页 6 个分类入口、列表页 18 张卡片）以「重复 N 个，结构如下」加完整单例代码的方式给出，因为逐条粘贴 18 份同构 HTML 不增加信息量，且执行者可按单例机械扩展——单例本身是完整可用的。

**3. 类型与命名一致性**

已核对以下跨任务引用，名称全部一致：

- `--ef-*` 令牌名在 Task 1 定义、Task 2–13 消费，无拼写漂移。
- `.ef-app` / `.is-collapsed` / `.is-open`：Task 4 定义，Task 7 消费，一致。
- `.ef-reveal` / `.is-visible`：Task 3 定义，Task 7 消费，一致。
- `.ef-skip-link` / `#ef-main`：Task 2 定义，Task 8 的校验脚本检查，Task 9–12 所有页面使用，一致。
- `window.EFTheme` 的 `get/set/toggle/apply/onChange`：Task 7 定义，Task 11 设置页消费，一致。
- `window.EFUI` 的 `init/toast/openModal/closeModal`：Task 7 定义并使用，一致。
- `data-*` 属性：`data-theme-toggle`、`data-sidebar-toggle`、`data-modal-open/close`、`data-tabs`、`data-dropdown-toggle`、`data-theme-radio`、`data-tier`、`data-level`、`data-index` —— Task 7 与 Task 3/6/8/11 两侧一致。
- `.ef-scrim`：Task 4 定义，Task 7 消费，Task 9 页面使用，一致。
- `.ef-tier-strip` 依赖的 `--ef-tier-color`：Task 3 通过 `[data-tier]` 设置，Task 6 的 `.ef-item-card` 使用，一致。
- `ef-skeleton-sweep` 关键帧：Task 5 定义并使用，一致。

**4. Review Focus 覆盖**

| Review Focus 项 | 对应测试 |
|---|---|
| 1. `file://` 双击打开 | Task 13 Step 5 |
| 2. 拼错的令牌名 | Task 1 Step 5（负向测试，证明脚本真会失败） |
| 3. 超长无断点文本 | Task 2 Step 5、Task 4 Step 4、Task 9 Step 5 |
| 4. 375px 窄屏 | Task 4 Step 4、Task 9 Step 5、Task 13 Step 3 |
| 5. `prefers-reduced-motion` | Task 3 Step 5、Task 13 Step 4 |
| 6. 打印 | Task 13 Step 4 |
| 7. 无 JavaScript | Task 7 Step 4、Task 13 Step 5 |

7 项全部有对应测试。
