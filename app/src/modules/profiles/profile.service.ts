import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { isFiniteNumber } from 'src/common/utils/number.utils';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  private async requireProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  // TODO: storage service wrapper
  async updateAvatar(userId: string, avatar: string | null) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.profile.update({
      where: { userId },
      data: { avatar },
    });
  }

  async changeBalance(userId: string, delta: number | string | Prisma.Decimal) {
    const profile = await this.requireProfile(userId);
    const amount =
      delta instanceof Prisma.Decimal ? delta : new Prisma.Decimal(delta);

    const updated = await this.prisma.profile.update({
      where: { userId: profile.userId },
      data: {
        balance: { increment: amount },
      },
    });

    return updated.balance;
  }

  async getBalance(userId: string) {
    const profile = await this.requireProfile(userId);
    return profile.balance;
  }

  async addExperience(userId: string, amount: number) {
    // assertFiniteNumber(amount, 'Experience amount must be a finite number');
    if (!isFiniteNumber(amount)) {
      throw new BadRequestException(
        'Experience amount must be a finite number',
      );
    }

    const profile = await this.requireProfile(userId);

    return this.prisma.profile.update({
      where: { userId: profile.userId },
      data: {
        level: { increment: Math.trunc(amount) },
      },
    });
  }

  async updateRating(userId: string, rating: number) {
    if (!isFiniteNumber(rating)) {
      throw new BadRequestException(
        'Experience amount must be a finite number',
      );
    }
    const profile = await this.requireProfile(userId);
    return this.prisma.profile.update({
      where: { userId: profile.userId },
      data: { rating: Math.trunc(rating) },
    });
  }

  async getProfileData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        addresses: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isBanned: user.isBanned,
      profile: user.profile,
      addresses: user.addresses,
    };
  }
}
