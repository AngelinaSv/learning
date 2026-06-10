import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../core/prisma/prisma.service';
import { UpdateUserByAdminDto } from './dto/update-user-by-admin.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { AdminUserListResponseDto } from './dto/admin-user-list-response.dto';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';
import { Prisma } from '@generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    const existingUser = await this.userExists(data.email);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.prisma.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          ...data,
          profile: {
            create: {
              rating: 0,
              level: 0,
            },
          },
          wallet: {
            create: {
              balance: 0,
            },
          },
        },
        include: {
          profile: true,
        },
      });
    });

    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async userExists(email: string): Promise<boolean> {
    const user = await this.findOneByEmail(email);
    return !!user;
  }

  async getMe(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException();
    }

    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      select: {
        id: true,
        username: true,
        isBanned: true,
        isDeleted: true,
        role: true,
      },
      where: { id },
    });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async update(id: string, data: UpdateUserDto) {
    const user = await this.findOne(id);

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        username: data.username,
      },
      include: {
        profile: true,
      },
    });

    return plainToInstance(UserResponseDto, updatedUser, {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findAllByAdmin(data: AdminUsersQueryDto) {
    const { page, limit, search } = data;
    const skip = (page - 1) * limit;
    const normalizedSearch = search?.trim();
    const where: Prisma.UserWhereInput | undefined = normalizedSearch
      ? {
          OR: [
            {
              username: {
                contains: normalizedSearch,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: normalizedSearch,
                mode: 'insensitive',
              },
            },
          ],
        }
      : undefined;

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          profile: true,
          wallet: true,
        },
      }),

      this.prisma.user.count({ where }),
    ]);

    return {
      data: plainToInstance(AdminUserListResponseDto, users, {
        excludeExtraneousValues: true,
      }),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneByAdmin(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async updateByAdmin(id: string, data: UpdateUserByAdminDto) {
    const user = await this.findOne(id);

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data,
    });

    return updatedUser;
  }
}
