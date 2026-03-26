function asyncLoop(limit, chunkSize, callback) {
  let i = 0;

  function run() {
    const end = Math.min(i + chunkSize, limit);

    while (i < end) {
      i++;
    }

    if (i < limit) {
      setImmediate(run);
    } else {
      callback();
    }
  }

  run();
}

console.log('start');

asyncLoop(1_000_000_000, 1_000_000, () => {
  console.log('done');
});

setTimeout(() => {
  console.log('timeout fired');
}, 0);
