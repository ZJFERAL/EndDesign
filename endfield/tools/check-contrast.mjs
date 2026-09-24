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

/**
 * 与主题无关的令牌（--ef-info / --ef-success / --ef-warn / --ef-danger /
 * --ef-tier-1..6 等）只在 :root 定义一次，暗色块不重复声明。但 INK_PAIRS 的
 * 「原色」一列引用的正是这些名字，而上面的 themes 是按主题块**隔离**解析的，
 * 直接查会全部报「未定义」。因此单独留一份 :root 取值作为基础层。
 *
 * 只对「原色」回退到基础层，ink 令牌与表面令牌仍严格要求出现在本主题块里，
 * 否则暗色块漏写 ink 覆盖会被基础层的亮色值掩盖成假通过。
 */
const baseTokens = themes.light;
const resolveBase = (t, name) => t[name] ?? baseTokens[name];

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
  const INK_SURFACES = ['--ef-surface', '--ef-surface-muted', '--ef-surface-sunken'];
  for (const [inkTok, rawTok, , tintA, min, label] of INK_PAIRS) {
    // ink 与表面必须在本主题块里单独定义（暗色块漏写就是真缺陷）；
    // 原色是主题无关令牌，允许回退到 :root。
    const raw = resolveBase(t, rawTok);
    for (const surfTok of INK_SURFACES) {
      if (!t[inkTok] || !raw || !t[surfTok]) {
        console.error(
          `  缺失   ${label}：${[inkTok, t[rawTok] ? null : `${rawTok}(含基础层)`, surfTok].filter(Boolean).join(' / ')} 未定义`,
        );
        failed++;
        continue;
      }
      // 背景 = 原色以 tintA 的比例混到表面上。
      // 注意不能用 composite()：它取的是「前景」的 alpha，而这里 tint 比例来自
      // 原色（背景成分），必须显式加权求和，否则等于拿 ink 直接和原色比。
      // 原色回退到 :root（与主题无关）；ink 与表面取当前主题
      const rawRgb = parseColor(raw);
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
