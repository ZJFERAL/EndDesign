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
