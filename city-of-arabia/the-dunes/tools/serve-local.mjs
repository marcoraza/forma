import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const port = Number(process.env.PORT || 4194);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.m4a': 'audio/mp4',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.svg': 'image/svg+xml',
};

function mapPath(pathname) {
  if (pathname === '/' || pathname === '/thedunes' || pathname === '/thedunes/') return '/thedunes.html';
  if (
    pathname === '/thedunes/moods' ||
    pathname === '/thedunes/moods/' ||
    pathname === '/moods' ||
    pathname === '/moods/' ||
    pathname === '/thedunes/previews' ||
    pathname === '/thedunes/previews/'
  ) return '/thedunes/moods.html';
  return pathname;
}

http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const requested = mapPath(pathname);
  const file = path.resolve(root, `.${requested}`);
  if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    response.writeHead(404).end('Not found');
    return;
  }

  const size = fs.statSync(file).size;
  const range = request.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
  const headers = {
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-store',
    'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream',
  };

  if (range) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    response.writeHead(206, {
      ...headers,
      'Content-Length': end - start + 1,
      'Content-Range': `bytes ${start}-${end}/${size}`,
    });
    if (request.method === 'HEAD') response.end();
    else fs.createReadStream(file, { start, end }).pipe(response);
    return;
  }

  response.writeHead(200, { ...headers, 'Content-Length': size });
  if (request.method === 'HEAD') response.end();
  else fs.createReadStream(file).pipe(response);
}).listen(port, '127.0.0.1', () => {
  process.stdout.write(`Local preview: http://127.0.0.1:${port}/thedunes.html\n`);
  process.stdout.write(`Moods:         http://127.0.0.1:${port}/thedunes/moods\n`);
});
