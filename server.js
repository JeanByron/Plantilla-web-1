const http = require('http');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 8000;
const root = process.cwd();
const mime = {
  '.html':'text/html', '.htm':'text/html', '.js':'application/javascript',
  '.css':'text/css', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg',
  '.svg':'image/svg+xml', '.json':'application/json', '.wasm':'application/wasm',
  '.ico':'image/x-icon'
};

http.createServer((req, res) => {
  try {
    let urlPath = decodeURI(req.url.split('?')[0]);
    let filePath = path.join(root, urlPath);
    if (filePath.endsWith(path.sep)) filePath = path.join(filePath, 'index.html');
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Not found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
      const stream = fs.createReadStream(filePath);
      stream.on('error', () => {
        res.statusCode = 500;
        res.end('Server error');
      });
      stream.pipe(res);
    });
  } catch (e) {
    res.statusCode = 500;
    res.end('Server error');
  }
}).listen(port, () => console.log('Static server at http://localhost:' + port));
