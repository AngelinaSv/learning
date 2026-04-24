import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as fss from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private STORAGE: string;

  constructor(private configService: ConfigService) {
    this.STORAGE = path.join(
      process.cwd(),
      this.configService.get<string>('storage.path') || 'storage/files',
    );
  }

  getFilePath(userId: string, filename: string) {
    return path.join(this.STORAGE, userId, filename);
  }

  getUserDir(userId: string) {
    return path.join(this.STORAGE, userId);
  }

  async ensureUserDir(userId: string) {
    await fs.mkdir(this.getUserDir(userId), { recursive: true });
  }

  async getFiles(userId: string) {
    return fs.readdir(this.getUserDir(userId));
  }

  async getFileStats(userId: string, filename: string) {
    return fs.stat(this.getFilePath(userId, filename));
  }

  async getFolderSize(userId: string): Promise<number> {
    const files = await this.getFiles(userId);

    let total = 0;

    for (const file of files) {
      if (file.includes('.chunk.')) continue;

      const stat = await this.getFileStats(userId, file);
      total += stat.size;
    }

    return total;
  }

  async fileExists(userId: string, filename: string) {
    try {
      await fs.access(this.getFilePath(userId, filename));
      return true;
    } catch {
      return false;
    }
  }

  async saveFromBuffer(userId: string, filename: string, buffer: Buffer) {
    const filePath = this.getFilePath(userId, filename);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);
  }

  async deleteFile(userId: string, filename: string) {
    await fs.rm(this.getFilePath(userId, filename), { force: true });
  }

  createWriteStream(userId: string, filename: string, append = true) {
    return fss.createWriteStream(this.getFilePath(userId, filename), {
      flags: append ? 'a' : 'w',
    });
  }

  getFileStream(userId: string, filename: string) {
    return fss.createReadStream(this.getFilePath(userId, filename));
  }

  async createUserFolder(userId: string) {
    await fs.mkdir(this.getUserDir(userId), { recursive: true });
  }

  async deleteUserFolder(userId: string) {
    const folderPath = this.getUserDir(userId);

    await fs.rm(folderPath, {
      recursive: true,
      force: true,
    });
  }
}
