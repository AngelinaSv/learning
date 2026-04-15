import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { randomUUID } from 'crypto';
import { User } from './types/user.type';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class UserService {
  constructor(private storage: StorageService) {}

  private async setQuota(userId: string, quota: number): Promise<User> {
    if (quota <= 0) {
      throw new Error('Invalid quota');
    }

    const users = await this.storage.readUsers();

    const user = users.find((u) => u.id === userId);

    if (!user) {
      throw new Error('User not found');
    }

    user.quota = quota;

    await this.storage.writeUsers(users);

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, quota } = createUserDto;
    const users = await this.storage.readUsers();

    if (users.find((u) => u.email === email)) {
      throw new Error('User already exists');
    }

    const user: User = {
      id: randomUUID().toString(),
      email,
      password,
      quota: quota || 1073741824,
    };

    users.push(user);
    await this.storage.writeUsers(users);
    await this.storage.createUserFolder(user.id);

    return user;
  }

  findAll(): Promise<User[]> {
    return this.storage.readUsers();
  }

  async findOne(id: string): Promise<User> {
    const users = await this.storage.readUsers();

    const user = users.find((u) => u.id === id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const users = await this.storage.readUsers();
    return users.find((u) => u.email === email);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const users = await this.storage.readUsers();
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email) {
      users[userIndex].email = updateUserDto.email;
    }

    if (updateUserDto.password) {
      users[userIndex].password = updateUserDto.password;
    }

    if (updateUserDto.quota) {
      users[userIndex].quota = updateUserDto.quota;
    }

    await this.storage.writeUsers(users);
    return users[userIndex];
  }

  async remove(id: string): Promise<void> {
    const users = await this.storage.readUsers();

    const filtered = users.filter((u) => u.id !== id);

    await this.storage.writeUsers(filtered);
    await this.storage.deleteUserFolder(id);
  }
}
