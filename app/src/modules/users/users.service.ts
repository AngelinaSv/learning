import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserByAdminDto } from '../admin/dto/update-user-by-admin.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profilesService: PrismaService,
    // private readonly addressService: AddressesService,
  ) {}

  async create(data: CreateUserDto) {
    const existingUser = await this.userExists(data.email);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.prisma.user.create({
      data: {
        ...data,
        profile: {
          create: {
            rating: 0,
            balance: 0,
            level: 0,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // TODO: mapping to UserDto
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      profile: user.profile,
    };
  }

  async userExists(email: string): Promise<boolean> {
    const user = await this.findOneByEmail(email);
    return !!user;
  }

  // TODO: create separate service for admin operations and move this method
  async findAll() {
    const users = await this.prisma.user.findMany({
      where: { isDeleted: false },
      include: {
        profile: true,
      },
    });

    return users;
  }

  async findOne(id: string) {
    console.log('??');
    console.log('id', id);
    const user = await this.prisma.user.findUnique({
      where: { id },
      // include: {
      //   profile: true,
      //   address: true,
      // },
    });

    if (!user) {
      throw new NotFoundException();
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isBanned: user.isBanned,
    };
  }

  async update(id: string, data: UpdateUserDto) {
    const user = await this.findOne(id);

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: data.email,
        username: data.username,
        profile: data.profile
          ? {
              update: {
                rating: data.profile.rating,
                level: data.profile.level,
                balance: data.profile.balance,
              },
            }
          : undefined,
      },
      include: {
        profile: true,
      },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      role: updatedUser.role,
      profile: updatedUser.profile,
    };
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

  async updateByAdmin(id: string, data: UpdateUserByAdminDto) {
    const user = await this.findOne(id);

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data,
    });

    return updatedUser;
  }

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
