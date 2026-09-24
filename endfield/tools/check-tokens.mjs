#!/usr/bin/env node
/**
 * 校验所有 var(--ef-*) 引用在 css/ 下有定义，或自带回退值。
 * 无定义的引用会静默失效（渲染成透明或继承），肉眼极难发现，故用脚本拦截。
 * 退出码 1 表示存在无定义且无回退的引用。
 *
 * 两处判定必须严格：
 * 1. 扫描前先剥离注释。否则注释里形如 `--ef-x:` 的文本会被当成定义，
 *    把真正的拼写错误放过去。
 * 2. 定义必须落在「基础块」里。基础块指 :root 与普通选择器规则
 *    （如 `.ef-chamfer { --ef-chamfer-size: … }`，这是合法的规则级局部令牌）。
 *    只写在主题块里的名字，在缺少该主题的另一主题下会失效，按错误处理。
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cssDir = join(root, 'css');

/** 剥离 /* ... *\/ 注释（含跨行），用空格占位以免把两侧文本粘在一起。 */
const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, ' ');

/** @media (prefers-color-scheme: …)：其内部的一切都属于主题作用域。 */
const isThemeMedia = (prelude) =>
  /@media/.test(prelude) && /prefers-color-scheme/.test(prelude);

/** 解析顶层及嵌套块，记录 prelude、自身文本范围与主题作用域判定。 */
function parseBlocks(src) {
  const nodes = [];
  const stack = [];
  let preludeStart = 0;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === '{') {
      const parent = stack[stack.length - 1] ?? null;
      const prelude = src.slice(preludeStart, i).trim();
      const inThemeMedia = Boolean(parent?.inThemeMedia) || isThemeMedia(prelude);
      const node = {
        prelude,
        preludeStart,
        bodyStart: i + 1,
        bodyEnd: -1,
        children: [],
        inThemeMedia,
        // 主题块：prelude 提到 data-theme，或嵌在 prefers-color-scheme 媒体查询内。
        themeScoped: inThemeMedia || /data-theme/.test(prelude),
      };
      if (parent) parent.children.push(node);
      stack.push(node);
      nodes.push(node);
      preludeStart = i + 1;
    } else if (ch === '}') {
      const node = stack.pop();
      if (node) node.bodyEnd = i;
      preludeStart = i + 1;
    }
  }
  return nodes;
}

/** 块的自身文本：去掉嵌套子块，只留本层的声明。 */
function ownText(src, node) {
  if (node.bodyEnd < 0) return '';
  let out = '';
  let cursor = node.bodyStart;
  for (const child of node.children) {
    out += src.slice(cursor, child.preludeStart);
    cursor = child.bodyEnd + 1;
  }
  return out + src.slice(cursor, node.bodyEnd);
}

const namesIn = (text) =>
  [...text.matchAll(/(--ef-[\w-]+)\s*:/g)].map((m) => m[1]);

const baseDefined = new Set();
const allDefined = new Set();
const used = [];

for (const file of readdirSync(cssDir).filter((f) => f.endsWith('.css'))) {
  const src = stripComments(readFileSync(join(cssDir, file), 'utf8'));

  for (const node of parseBlocks(src)) {
    for (const name of namesIn(ownText(src, node))) {
      allDefined.add(name);
      if (!node.themeScoped) baseDefined.add(name);
    }
  }

  for (const m of src.matchAll(/var\(\s*(--ef-[\w-]+)\s*(,)?/g)) {
    used.push({ name: m[1], file, hasFallback: Boolean(m[2]) });
  }
}

const satisfiable = (u) => baseDefined.has(u.name) || u.hasFallback;
const missing = used.filter((u) => !satisfiable(u) && !allDefined.has(u.name));
const themeOnly = used.filter((u) => !satisfiable(u) && allDefined.has(u.name));
const fallbackOnly = used.filter((u) => !baseDefined.has(u.name) && u.hasFallback);

console.log(`已定义令牌 ${baseDefined.size} 个，引用 ${used.length} 处。`);

if (fallbackOnly.length > 0) {
  const names = [...new Set(fallbackOnly.map((u) => u.name))].sort();
  console.log(`\n仅有回退值（可接受，通常为宿主覆盖点）：\n  ${names.join('\n  ')}`);
}

if (themeOnly.length > 0) {
  console.error(
    `\n错误：以下 ${themeOnly.length} 处引用的令牌只定义在主题块中，未定义于基础层，在缺少该主题时会失效：`,
  );
  for (const u of themeOnly) console.error(`  ${u.name}  ← ${u.file}`);
}

if (missing.length > 0) {
  console.error(`\n错误：以下 ${missing.length} 处引用既无定义也无回退值：`);
  for (const u of missing) console.error(`  ${u.name}  ← ${u.file}`);
}

if (missing.length > 0 || themeOnly.length > 0) process.exit(1);

console.log('\n通过：所有令牌引用都有定义或回退值。');
