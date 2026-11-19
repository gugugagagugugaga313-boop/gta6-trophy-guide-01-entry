// Tiny static server for local development only: serves app/ on
// http://localhost:8080 so the guide can be tried in desktop Chrome.
// Usage: node serve.ts [--port 8080]. Standard library only.

import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(fileURLToPath(new URL('./app', import.meta.url)));
const portArg = process.argv.indexOf('--port');
const parsed = portArg === -1 ? 8080 : Number(process.argv[portArg + 1]);
const port = Number.isInteger(parsed) && parsed > 0 && parsed < 65536 ? parsed : 8080;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function contentType(file) {
  return TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream';
}

function resolveFile(pathname) {
  const file = resolve(join(appRoot, normalize(pathname)));
  if (file !== appRoot && !file.startsWith(appRoot + sep)) return null;
  try {
    const info = statSync(file);
    if (!info.isFile()) return null;
    return { file, size: info.size };
  } catch {
    return null;
  }
}

createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  let pathname = '/';
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400).end('bad request');
    return;
  }
  if (pathname.endsWith('/')) pathname += 'index.html';
  const found = resolveFile(pathname);
  if (!found) {
    response.writeHead(404).end('not found');
    return;
  }
  response.writeHead(200, {
    'content-type': contentType(found.file),
    'content-length': found.size,
    'cache-control': 'no-store',
  });
  createReadStream(found.file).pipe(response);
}).listen(port, '127.0.0.1', () => {
  console.log(`Leonida Platinum is on http://localhost:${port}`);
});
