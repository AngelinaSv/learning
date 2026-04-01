const fs = require('fs');
const path = require('path');

const STORAGE = path.join(__dirname, '../storage');
const MAX_SIZE = 3 * 1024 * 1024;
const STATUSES = {
  DONE: 'done',
  UPLOADING: 'uploading',
  ERROR: 'error',
};
const ERROR_MESSAGES = {
  QUOTA_EXCEEDED: 'Quota exceeded',
};

const filesStatuses = {};
const fileSizes = {};

function getTotalSize() {
  return Object.values(fileSizes).reduce((a, b) => a + b, 0);
}

exports.checkFileExists = (fileId) => {
  return fs.existsSync(path.join(STORAGE, fileId));
};

exports.checkQuota = (fileId, contentLength) => {
  if (
    (contentLength && contentLength > MAX_SIZE) ||
    (getTotalSize() + contentLength > MAX_SIZE)
  ) {
    filesStatuses[fileId] = { status: STATUSES.ERROR };
    return { allowed: false, message: ERROR_MESSAGES.QUOTA_EXCEEDED };
  }

  return { allowed: true };
};

exports.saveChunk = (fileId, req, res) => {
  const filePath = path.join(STORAGE, fileId);

  if (!filesStatuses[fileId]) {
    filesStatuses[fileId] = { status: STATUSES.UPLOADING };
    fileSizes[fileId] = 0;
  }

  const writeStream = fs.createWriteStream(filePath, {
    flags: 'a',
  });

  req.on('data', chunk => {
    fileSizes[fileId] += chunk.length;

    if (getTotalSize() > MAX_SIZE) {
      writeStream.destroy();
      fs.unlinkSync(filePath);
      filesStatuses[fileId] = { status: STATUSES.ERROR};
      return res.end('Quota exceeded');
    }

    writeStream.write(chunk);
  });

  req.on('end', () => {
    filesStatuses[fileId] = { status: STATUSES.DONE };
    writeStream.end();
    res.end('Chunk saved');
  });
};

exports.getFiles = () => {
  return fs.readdirSync(STORAGE);
};

exports.getFileStream = (fileId) => {
  return fs.createReadStream(path.join(STORAGE, fileId));
};

exports.deleteFile = (fileId) => {
  const filePath = path.join(STORAGE, fileId);

  if (fs.existsSync(filePath)) {
    const size = fs.statSync(filePath).size;
    fs.unlinkSync(filePath);
    delete fileSizes[fileId];
    delete filesStatuses[fileId];
  }
};

exports.getStatus = (fileId) => {
  return filesStatuses[fileId];
};
