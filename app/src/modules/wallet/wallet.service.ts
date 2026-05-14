/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async createWallet(userId: number, currency: string = 'UAH') {
    return this.prisma.wallet.create({
      data: {
        userId,
        currency,
      },
    });
  }

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

  async deposit(dto: { id: string; amount: number }) {
    const amount = new Prisma.Decimal(dto.amount);

    if (amount.lte(0)) {
      throw new BadRequestException('Amount must be > 0');
    }

    return this.prisma.wallet.update({
      where: { id: dto.id },
      data: {
        balance: {
          increment: amount,
        },
      },
    });
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
