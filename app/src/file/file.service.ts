import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { StorageService } from 'src/storage/storage.service';
import { User } from 'src/user/types/user.type';

export interface FileInfo {
  filename: string;
  size: number;
  status?: string;
}

export const FILE_STATUSES = {
  UPLOADING: 'uploading',
  DONE: 'done',
  ERROR: 'error',
} as const;

export type FileStatus = (typeof FILE_STATUSES)[keyof typeof FILE_STATUSES];

export const FILE_ERROR_MESSAGES = {
  QUOTA_EXCEEDED: 'Quota exceeded',
} as const;

@Injectable()
export class FileService {
  private fileStatuses: Record<string, Record<string, { status: FileStatus }>> =
    {};

  constructor(private storage: StorageService) {}

  async getTotalSize(userId: string): Promise<number> {
    return this.storage.getFolderSize(userId);
  }

  private async isQuotaExceeded(
    user: User,
    newFileSize: number,
  ): Promise<boolean> {
    if (!newFileSize) return false;

    if (newFileSize > user.quota) return true;

    const total = await this.getTotalSize(user.id);

    return total + newFileSize > user.quota;
  }

  checkQuota(user: User, fileSize: number) {
    if (this.isQuotaExceededSync(user, fileSize)) {
      return { allowed: false };
    }
    return { allowed: true };
  }

  private isQuotaExceededSync(user: User, fileSize: number): boolean {
    if (!fileSize) return false;
    if (fileSize > user.quota) return true;
    return false;
  }

  async saveFromBuffer(
    user: User,
    filename: string,
    buffer: Buffer,
  ): Promise<FileInfo> {
    const isQuotaExceeded = await this.isQuotaExceeded(user, buffer.length);

    if (isQuotaExceeded) {
      throw new Error(FILE_ERROR_MESSAGES.QUOTA_EXCEEDED);
    }

    this.fileStatuses[user.id] = this.fileStatuses[user.id] || {};
    this.fileStatuses[user.id][filename] = { status: FILE_STATUSES.UPLOADING };

    try {
      await this.storage.saveFromBuffer(user.id, filename, buffer);
      this.fileStatuses[user.id][filename] = { status: FILE_STATUSES.DONE };
      return {
        filename,
        size: buffer.length,
      };
    } catch (err) {
      this.fileStatuses[user.id][filename] = { status: FILE_STATUSES.ERROR };
      throw err;
    }
  }

  async saveChunk(
    user: User,
    filename: string,
    buffer: Buffer,
    chunkIndex: number,
    totalChunks: number,
  ): Promise<{ chunkIndex: number; message: string }> {
    const chunkFilename = `${filename}.chunk.${chunkIndex}`;
    await this.storage.saveFromBuffer(user.id, chunkFilename, buffer);

    return {
      chunkIndex,
      message: `Chunk ${chunkIndex + 1}/${totalChunks} saved`,
    };
  }

  async assembleChunks(
    user: User,
    filename: string,
    totalChunks: number,
  ): Promise<FileInfo> {
    const userDir = this.storage.getUserDir(user.id);

    const buffers: Buffer[] = [];
    let totalSize = 0;

    for (let i = 0; i < totalChunks; i++) {
      const chunkFilename = `${filename}.chunk.${i}`;
      const chunkPath = `${userDir}/${chunkFilename}`;

      try {
        const chunkData = await this.storage.getFileStats(
          user.id,
          chunkFilename,
        );
        totalSize += chunkData.size;
        buffers.push(fs.readFileSync(chunkPath));
      } catch {
        for (let j = 0; j < i; j++) {
          try {
            await this.storage.deleteFile(user.id, `${filename}.chunk.${j}`);
          } catch {
            throw new Error(`Missing chunk ${i}`);
          }
        }
      }
    }

    const isQuotaExceeded = await this.isQuotaExceeded(user, totalSize);
    if (isQuotaExceeded) {
      for (let i = 0; i < totalChunks; i++) {
        try {
          await this.storage.deleteFile(user.id, `${filename}.chunk.${i}`);
        } catch {
          throw new Error(FILE_ERROR_MESSAGES.QUOTA_EXCEEDED);
        }
      }
    }

    const finalBuffer = Buffer.concat(buffers);
    await this.storage.saveFromBuffer(user.id, filename, finalBuffer);

    for (let i = 0; i < totalChunks; i++) {
      try {
        await this.storage.deleteFile(user.id, `${filename}.chunk.${i}`);
      } catch {}
    }

    return {
      filename,
      size: finalBuffer.length,
    };
  }

  async getFiles(user: User): Promise<string[]> {
    const files = await this.storage.getFiles(user.id);
    return files.filter((f) => !f.includes('.chunk.'));
  }

  async getFilesWithMetadata(user: User): Promise<FileInfo[]> {
    const files = await this.storage.getFiles(user.id);

    const result: FileInfo[] = [];

    for (const filename of files) {
      if (filename.includes('.chunk.')) continue;

      try {
        const stat = await this.storage.getFileStats(user.id, filename);
        result.push({
          filename,
          size: stat.size,
          status:
            this.fileStatuses[user.id]?.[filename]?.status ||
            FILE_STATUSES.DONE,
        });
      } catch {}
    }

    return result;
  }

  getFileStream(user: User, filename: string) {
    return this.storage.getFileStream(user.id, filename);
  }

  async deleteFile(user: User, filename: string): Promise<void> {
    const exists = await this.storage.fileExists(user.id, filename);

    if (!exists) {
      throw new Error('File not found');
    }

    await this.storage.deleteFile(user.id, filename);
    delete this.fileStatuses[user.id]?.[filename];
  }

  async getFileStats(userId: string, filename: string) {
    return this.storage.getFileStats(userId, filename);
  }

  async getFilePath(userId: string, filename: string): Promise<string> {
    return this.storage.getFilePath(userId, filename);
  }
}
