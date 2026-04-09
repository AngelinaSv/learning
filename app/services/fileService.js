import fs from 'fs';
import path from 'path';
import { ERROR_MESSAGES } from '../constants/errors/file.errors.js';
import { STATUSES } from '../constants/file.constants.js';

export class FileService {
  constructor() {
    this.STORAGE = path.join(process.cwd(), 'storage');
    this.MAX_SIZE = 5 * 1024 * 1024;
    this.filesStatuses = {};
    this.fileSizes = {};

    if (!fs.existsSync(this.STORAGE)) {
      fs.mkdirSync(this.STORAGE);
    }
  }

  getTotalSize() {
    const files = fs.readdirSync(this.STORAGE);
    return files.reduce((total, filename) => {
      const stats = fs.statSync(path.join(this.STORAGE, filename));
      return total + stats.size;
    }, 0);
  }

  checkFileExists(filename) {
    return fs.existsSync(path.join(this.STORAGE, filename));
  }

  isQuotaExceeded(fileSize) {
    if (!fileSize) {
      return false;
    }

    if (fileSize > this.MAX_SIZE) {
      return true;
    }

    if (this.getTotalSize() + fileSize > this.MAX_SIZE) {
      return true;
    }

    return false;
  }

  checkQuota(filename, contentLength) {
    if (this.isQuotaExceeded(contentLength)) {
      this.filesStatuses[filename] = { status: STATUSES.ERROR };
      return { allowed: false };
    }
    return { allowed: true };
  }

  async saveFromBuffer(filename, buffer) {
    const filePath = path.join(this.STORAGE, filename);
    
    this.filesStatuses[filename] = { status: STATUSES.UPLOADING };
    this.fileSizes[filename] = 0;

    try {
      fs.writeFileSync(filePath, buffer);
      this.fileSizes[filename] = buffer.length;
      this.filesStatuses[filename] = { status: STATUSES.DONE };
      return { message: 'File saved' };
    } catch (err) {
      this.filesStatuses[filename] = { status: STATUSES.ERROR };
      throw err;
    }
  }

  async saveChunk(filename, req) {
    const filePath = path.join(this.STORAGE, filename);

    if (!this.filesStatuses[filename]) {
      this.filesStatuses[filename] = { status: STATUSES.UPLOADING };
      this.fileSizes[filename] = 0;
    }

    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(filePath, { flags: 'a' });

      req.on('data', (chunk) => {
        this.fileSizes[filename] += chunk.length;

        if (this.getTotalSize() > this.MAX_SIZE) {
          writeStream.destroy();
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          this.filesStatuses[filename] = { status: STATUSES.ERROR };
          return reject(new Error(ERROR_MESSAGES.QUOTA_EXCEEDED));
        }

        writeStream.write(chunk);
      });

      req.on('end', () => {
        this.filesStatuses[filename] = { status: STATUSES.DONE };
        writeStream.end();
        resolve({ message: 'Chunk saved' });
      });

      req.on('error', (err) => {
        writeStream.destroy();
        reject(err);
      });
    });
  }

  getFiles() {
    return fs.readdirSync(this.STORAGE);
  }

  getFilesWithMetadata() {
    const files = fs.readdirSync(this.STORAGE);
    return files.map(filename => {
      const filePath = path.join(this.STORAGE, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        status: this.filesStatuses[filename]?.status || 'done',
        size: stats.size
      };
    });
  }

  getFileStream(filename) {
    return fs.createReadStream(path.join(this.STORAGE, filename));
  }

  deleteFile(filename) {
    const filePath = path.join(this.STORAGE, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      delete this.fileSizes[filename];
      delete this.filesStatuses[filename];
    }
  }

  getStatus(filename) {
    return this.filesStatuses[filename] || { status: STATUSES.ERROR };
  }

  getQuota() {
    return this.MAX_SIZE;
  }

  setQuota(bytes) {
    if (typeof bytes === 'number' && bytes > 0) {
      this.MAX_SIZE = bytes;
      return this.MAX_SIZE;
    }
    return null;
  }
}
