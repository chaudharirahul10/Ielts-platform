const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const root = path.join(__dirname, 'build');

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const requested = path.normalize(path.join(root, urlPath));
  const safePath = requested.startsWith(root) ? requested : root;

  fs.stat(safePath, (statErr, stat) => {
    const filePath = !statErr && stat.isFile()
      ? safePath
      : path.join(root, 'index.html');

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(500);
        res.end('Unable to read build output');
        return;
      }

      res.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream' });
      res.end(data);
    });
  });
}).listen(port, () => {
  console.log(`IELTS frontend serving at http://localhost:${port}`);
});
