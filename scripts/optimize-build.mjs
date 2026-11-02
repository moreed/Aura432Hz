import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const indexHtmlPath = path.resolve(distDir, 'index.html');
const fourOhFourPath = path.resolve(distDir, '404.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.warn('[optimize-build] dist/index.html not found, skipping optimization.');
  process.exit(0);
}

let html = fs.readFileSync(indexHtmlPath, 'utf-8');

// 1. Convert render-blocking stylesheet to asynchronous non-render-blocking preload + media="print" onload pattern
const cssMatch = html.match(/<link\s+rel="stylesheet"[^>]+href="(\/assets\/index-[^"]+\.css)"[^>]*>/i);
if (cssMatch) {
  const originalLink = cssMatch[0];
  const cssHref = cssMatch[1];

  const nonBlockingCss = [
    `<link rel="preload" as="style" href="${cssHref}" crossorigin>`,
    `<link rel="stylesheet" href="${cssHref}" media="print" onload="this.media='all'" crossorigin>`,
    `<noscript><link rel="stylesheet" href="${cssHref}"></noscript>`
  ].join('\n    ');

  html = html.replace(originalLink, nonBlockingCss);
  console.log(`[optimize-build] Optimized render-blocking CSS: ${cssHref}`);
}

// 2. Remove any accidental preconnects to firestore or images in dist
html = html.replace(/<link\s+rel="preconnect"\s+href="https:\/\/firestore\.googleapis\.com"[^>]*>\s*/gi, '');
html = html.replace(/<link\s+rel="preconnect"\s+href="https:\/\/images\.unsplash\.com"[^>]*>\s*/gi, '');

// 3. Ensure .well-known directory and ard.json are copied to dist
const publicWellKnown = path.resolve(__dirname, '../public/.well-known');
const distWellKnown = path.resolve(distDir, '.well-known');
if (fs.existsSync(publicWellKnown)) {
  if (!fs.existsSync(distWellKnown)) {
    fs.mkdirSync(distWellKnown, { recursive: true });
  }
  const ardSrc = path.resolve(publicWellKnown, 'ard.json');
  if (fs.existsSync(ardSrc)) {
    fs.copyFileSync(ardSrc, path.resolve(distWellKnown, 'ard.json'));
    console.log('[optimize-build] Synced .well-known/ard.json to dist');
  }
}

// Ensure llms.txt & llms-full.txt are in dist
const publicLlms = path.resolve(__dirname, '../public/llms.txt');
if (fs.existsSync(publicLlms)) {
  fs.copyFileSync(publicLlms, path.resolve(distDir, 'llms.txt'));
}
const publicLlmsFull = path.resolve(__dirname, '../public/llms-full.txt');
if (fs.existsSync(publicLlmsFull)) {
  fs.copyFileSync(publicLlmsFull, path.resolve(distDir, 'llms-full.txt'));
}

// 4. Write back optimized index.html and sync to 404.html
fs.writeFileSync(indexHtmlPath, html, 'utf-8');
fs.writeFileSync(fourOhFourPath, html, 'utf-8');
console.log('[optimize-build] Successfully updated dist/index.html and dist/404.html');
