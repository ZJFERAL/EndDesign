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
