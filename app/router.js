const fileController = require('./controllers/fileController');
const pageController = require('./controllers/pageController');

module.exports = [
  { method: 'GET', path: /^\/$/, handler: pageController.getHome },
  { method: 'GET', path: /^\/files$/, handler: fileController.getFiles },
  { method: 'GET', path: /^\/files\/(.+)$/, handler: fileController.getFile },
  { method: 'DELETE', path: /^\/files\/(.+)$/, handler: fileController.deleteFile },
  { method: 'GET', path: /^\/status\/(.+)$/, handler: fileController.getStatus },
  { method: 'POST', path: /^\/upload$/, handler: fileController.uploadChunk },
];
