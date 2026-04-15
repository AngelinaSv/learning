import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as fss from 'fs';
import * as path from 'path';
import { User } from 'src/user/types/user.type';

@Injectable()
export class StorageService {
  private STORAGE = path.join(process.cwd(), 'storage/files');
  private usersFile = path.join(process.cwd(), 'storage/users.json');

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
    console.log('STORAGE', this.STORAGE);
    console.log('this.getUserDir(userId)', this.getUserDir(userId));
    return fs.readdir(this.getUserDir(userId));
  }

  async getFileStats(userId: string, filename: string) {
    console.log(
      'this.getFilePath(userId, filename)',
      this.getFilePath(userId, filename),
    );
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

  async readUsers(): Promise<User[]> {
    try {
      const data = await fs.readFile(this.usersFile, 'utf8');
      return JSON.parse(data) as User[];
    } catch {
      return [];
    }
  }

  async writeUsers(users: User[]) {
    await fs.writeFile(this.usersFile, JSON.stringify(users, null, 2));
  }
}
