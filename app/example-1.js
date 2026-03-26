const fs = require('fs');

fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) throw err;

  process.nextTick(() => {
    for (let i = 0; i < 1e6; i++) {};
    console.log('Parsing done');
  });

  console.log('File read complete');
});
