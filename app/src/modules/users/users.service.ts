import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserByAdminDto } from '../admin/dto/update-user-by-admin.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { AdminUserListResponseDto } from '../admin/dto/admin-user-list-response.dto';

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

    // TODO: mapping to UserDto
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

  // admin
  async findAllByAdmin(data: PaginationQueryDto) {
    const { page, limit } = data;
    const skip = (page - 1) * limit;

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
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

      this.prisma.user.count(),
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
