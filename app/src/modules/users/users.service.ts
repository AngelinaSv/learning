import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { DbToRole } from './mappers/user-role.mapper';
import { PasswordHashService } from 'src/common/security/services/password-hash.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordHashService: PasswordHashService,
  ) {}

  async create(data: CreateUserDto) {
    const existingUser = await this.userExists(data.email);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.passwordHashService.hash(data.password);

    const user = await this.prisma.users.create({
      data: {
        ...data,
        password: hashedPassword,
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
      role: DbToRole[user.role],
      profile: user.profile,
    };
  }

  async userExists(email: string): Promise<boolean> {
    const user = await this.findOneByEmail(email);
    return !!user;
  }

  async findOne(id: number) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      include: {
        profile: true,
        address: true,
      },
    });

    if (!user) {
      throw new NotFoundException();
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: DbToRole[user.role],
      profile: user.profile,
    };
  }

  async update(id: number, data: UpdateUserDto) {
    const user = await this.findOne(id);

    const updatedUser = await this.prisma.users.update({
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
      role: DbToRole[updatedUser.role],
      profile: updatedUser.profile,
    };
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);

    await this.prisma.users.update({
      where: { id: user.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  private async findOneByEmail(email: string) {
    const user = await this.prisma.users.findUnique({ where: { email } });

    return user;
  }
}
