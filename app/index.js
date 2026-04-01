const http = require('http');
const url = require('url');
const router = require('./router');

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, 'storage');

if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
} 

http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  req.pathname = parsedUrl.pathname;
  req.query = parsedUrl.query;

  for (const route of router) {
    if (req.method === route.method && route.path.test(req.pathname)) {
      const params = req.pathname.match(route.path);
      req.params = params?.slice(1);
      return route.handler(req, res);
    }
  }

  res.statusCode = 404;
  res.end('Not found');
}).listen(3009, () => {
  console.log('Server running on http://localhost:3009');
});
