const fileService = require('../services/fileService');

exports.getFiles = (req, res) => {
  res.end(JSON.stringify(fileService.getFiles()));
};

exports.getFile = (req, res) => {
  const id = decodeURIComponent(req.params[0]);
  const fileExists = fileService.checkFileExists(id);

  if (!fileExists) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found');
    return;
  }

  const stream = fileService.getFileStream(id);

  stream.pipe(res);
};

exports.deleteFile = (req, res) => {
  const id = decodeURIComponent(req.params[0]);
  const fileExists = fileService.checkFileExists(id);

  if (!fileExists) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found');
    return;
  }

  fileService.deleteFile(id);
  res.end('Deleted');
};

exports.getStatus = (req, res) => {
  const id = decodeURIComponent(req.params[0]);
  
  const status = fileService.getStatus(id);
  res.end(JSON.stringify(status));
};

exports.uploadChunk = (req, res) => {
  const contentLength = Number(req.headers['content-length']);
  const { fileId } = req.query;

  const quotaCheck = fileService.checkQuota(fileId, contentLength);

  if (!quotaCheck.allowed) {
    res.writeHead(413);
    return res.end(quotaCheck.message);
  }

  fileService.saveChunk(fileId, req, res);
};