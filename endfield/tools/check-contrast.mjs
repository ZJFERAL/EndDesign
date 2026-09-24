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
}

if (failed > 0) {
  console.error(`\n错误：${failed} 项对比度不达标。`);
  process.exit(1);
}
console.log('\n通过：所有配色对比度达标。');
