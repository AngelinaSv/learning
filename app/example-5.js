const http = require('http');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

function cpuIntensiveTask(n) {
  let result = 0;
  for (let i = 0; i < n; i++) {
    result += Math.sqrt(i) * Math.sin(i) * Math.cos(i);
    for (let j = 1; j < 100; j++) {
      result += Math.pow(i, 0.5);
    }
  }
  return result;
}

function runInWorker(n) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, {
      workerData: { n }
    });
    
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}

if (!isMainThread) {
  const result = cpuIntensiveTask(workerData.n);
  parentPort.postMessage(result);
  process.exit(0);
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/compute') {
    const start = Date.now();
    
    try {
      const result = await runInWorker(50000);
      const duration = Date.now() - start;
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        result: result.toFixed(2),
        duration: `${duration}ms`,
        pid: process.pid,
        threadType: 'worker'
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Worker Thread Server running. Try /compute endpoint\n');
  }
});

server.listen(3001, () => {
  console.log(`Worker Thread Server running on port 3001 (PID: ${process.pid})`);
});
