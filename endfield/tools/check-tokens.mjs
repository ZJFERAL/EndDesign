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
