const fs = require('fs');

exports.getHome = (req, res) => {
  const html = fs.readFileSync('./views/index.html');

  res.setHeader('Content-Type', 'text/html');
  res.end(html);
};
