import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const allowed = new Set(['index.html','styles.css','tokens.css','main.js','core.js','rendering.js']);
const types = {html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8'};
createServer(async (req,res) => {
  const pathname = new URL(req.url, 'http://127.0.0.1').pathname;
  const file = pathname === '/' ? 'index.html' : pathname.slice(1);
  if (!allowed.has(file)) { res.writeHead(404); res.end('No encontrado'); return; }
  try { const data = await readFile(new URL('../app/' + file, import.meta.url)); res.writeHead(200,{'Content-Type':types[file.split('.').pop()]}); res.end(data); }
  catch { res.writeHead(500); res.end('No disponible'); }
}).listen(4173, '127.0.0.1', () => console.log('http://127.0.0.1:4173'));
