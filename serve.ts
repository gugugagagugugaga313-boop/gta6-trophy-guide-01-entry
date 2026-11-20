// Leonida Platinum — tiny static server for local preview only.
// Run: node serve.ts --port 8901, then open http://localhost:8901/
// Serves the files under app/ and nothing else; no network calls are made.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), 'app');
const port = Number(process.argv.find((a) => a.startsWith('--port='))?.slice(7) ?? process.argv[process.argv.indexOf('--port') + 1] ?? 8901);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
};

const server = createServer(async (req, res) => {
  const path = req.url === '/' || !req.url ? '/index.html' : req.url.split('?')[0].split('#')[0];
  const file = join(root, decodeURIComponent(path));
  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end('no');
    return;
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});

server.listen(port, () => console.log(`Leonida Platinum preview at http://localhost:${port}/`));
