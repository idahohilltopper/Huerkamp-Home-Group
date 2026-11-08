// Serves the freshly built site (dist/) on http://localhost:4400 for the pre-push check (preflight.sh), so a change is
// tested before it goes live. Pages, scripts and styles come from dist/; /api/* requests are passed to the live site
// (listings, sold homes, address suggestions), since the functions only run on Netlify. The site check intercepts the
// lead and alert sends itself, so nothing reaches Follow Up Boss.
// Usage: node scripts/site-check/serve-dist.mjs [port]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
const port = Number(process.argv[2] ?? 4400);
const LIVE = 'https://www.huerkamphomes.com';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.geojson': 'application/json', '.txt': 'text/plain', '.xml': 'application/xml', '.ico': 'image/x-icon' };

http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://localhost:${port}`);
  if (u.pathname.startsWith('/api/') || u.pathname.startsWith('/listings/')) {
    try {
      const headers = {};
      for (const h of ['x-idx-eula', 'x-account', 'content-type', 'accept']) if (req.headers[h]) headers[h] = req.headers[h];
      const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await new Promise((ok) => { const c = []; req.on('data', (d) => c.push(d)); req.on('end', () => ok(Buffer.concat(c))); });
      const r = await fetch(LIVE + u.pathname + u.search, { method: req.method, headers, body, redirect: 'manual' });
      const loc = r.headers.get('location');
      res.writeHead(r.status, { 'content-type': r.headers.get('content-type') ?? 'application/json', ...(loc ? { location: loc.replace(LIVE, '') } : {}) });
      return res.end(Buffer.from(await r.arrayBuffer()));
    } catch (e) { res.writeHead(502); return res.end(String(e.message)); }
  }
  let f = path.join(root, decodeURIComponent(u.pathname));
  if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  // /videos is dist/videos.html (with a dist/videos/ folder beside it for the single videos), so try .html first.
  if (fs.existsSync(f + '.html')) f += '.html';
  else if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { res.writeHead(404, { 'content-type': 'text/html' }); return res.end(fs.existsSync(path.join(root, '404.html')) ? fs.readFileSync(path.join(root, '404.html')) : 'Not found'); }
  res.writeHead(200, { 'content-type': types[path.extname(f)] ?? 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(port, () => console.log(`dist on http://localhost:${port}`));
