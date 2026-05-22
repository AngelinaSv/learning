import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getBalance(walletId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
      select: {
        balance: true,
        currency: true,
        isActive: true,
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  // For future
  async debit(walletId: string, amount: number) {
    const value = new Prisma.Decimal(amount);

    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) throw new NotFoundException('Wallet not found');
    if (!wallet.isActive) throw new BadRequestException('Wallet blocked');
    if (wallet.balance.lt(value)) {
      throw new BadRequestException('Insufficient funds');
    }

    return this.prisma.wallet.update({
      where: { id: walletId },
      data: {
        balance: { decrement: value },
      },
    });
  }

  async credit(walletId: string, amount: number) {
    const value = new Prisma.Decimal(amount);

    return this.prisma.wallet.update({
      where: { id: walletId },
      data: {
        balance: { increment: value },
      },
    });
  }

  async toggleWalletStatus(walletId: string, isActive: boolean) {
    return this.prisma.wallet.update({
      where: { id: walletId },
      data: { isActive },
    });
  }
}
