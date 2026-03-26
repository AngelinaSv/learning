const http = require('http');

const bigObject = {};
for (let i = 0; i < 5_000_000; i++) {
  bigObject[i] = i;
}

http.createServer((req, res) => {
    req.url = '/json';
  if (req.url === '/json') {
    const json = JSON.stringify(bigObject); // CPU-bound
    res.end(json);
  } else {
    res.end('ok');
  }
}).listen(3000);
