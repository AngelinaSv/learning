import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UpdateUserByAdminDto } from './dto/update-user-by-admin.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { AdminUserListResponseDto } from './dto/admin-user-list-response.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly userService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  async getUsersList(data: PaginationQueryDto) {
    const { page, limit } = data;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          profile: true,
          wallet: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: plainToInstance(AdminUserListResponseDto, users, {
        excludeExtraneousValues: true,
      }),
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.userService.findOneByAdmin(id);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async update(id: string, data: UpdateUserByAdminDto) {
    const user = await this.findOne(id);
    const updated = await this.userService.updateByAdmin(user.id, data);

    return updated;
  }

  async removeUser(id: string) {
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
