import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UpdateUserByAdminDto } from './dto/update-user-by-admin.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';

@Injectable()
export class AdminService {
  constructor(private readonly userService: UsersService) {}

  async findAll() {
    return this.userService.findAll();
  }

  async findOne(id: string) {
    const user = await this.userService.findOne(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, data: UpdateUserDto) {
    const user = await this.findOne(id);
    const updated = await this.userService.update(user.id, data);

    // TODO: logs, history

    return updated;
  }

  async remove(id: string) {
    await this.userService.remove(id);
    // TODO: logs, history, notification
  }

  async ban(id: string, data: UpdateUserByAdminDto) {
    const user = await this.findOne(id);
    const banUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

    const updatedUser = await this.userService.updateByAdmin(user.id, {
      isBanned: true,
      banEndAt: data.banEndAt || banUntil,
    });

    return {
      isBanned: updatedUser.isBanned,
      banEndAt: updatedUser.banEndAt,
    };
  }

  async unban(id: string) {
    const user = await this.findOne(id);

    const updatedUser = await this.userService.updateByAdmin(user.id, {
      isBanned: false,
      banEndAt: null,
    });

    return {
      userId: updatedUser.id,
      isBanned: updatedUser.isBanned,
    };
  }
}
