const cluster = require('cluster');
const http = require('http');
const os = require('os');
const crypto = require('crypto');

const numCPUs = os.cpus().length;

function heavyHash(password, iterations) {
  let hash = password;

  for (let i = 0; i < iterations; i++) {
    hash = crypto.createHash('sha256').update(hash).digest('hex');
  }

  return hash;
}

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  console.log(`CPUs: ${numCPUs}`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code) => {
    console.log(`Worker ${worker.process.pid} died`);

    if (code !== 0) {
      console.log('Restarting worker...');
      cluster.fork();
    }
  });

} else {

  const server = http.createServer((req, res) => {
    if (req.url === '/hash') {
      const password = req.headers['x-password'] || 'default';
      const iterations = parseInt(req.headers['x-iter'], 10) || 200000;

      const start = Date.now();

      const result = heavyHash(password, iterations);

      const duration = Date.now() - start;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        pid: process.pid,
        time: `${duration} ms`,
        hash: result.slice(0, 20) + '...'
      }));

    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  server.listen(8000, () => {
    console.log(`Worker ${process.pid} started`);
  });
}
