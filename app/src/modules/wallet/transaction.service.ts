/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Prisma,
  TransactionType,
  TransactionStatus,
} from '@generated/prisma/client';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async processWithdrawal(
    walletId: string,
    amount: Prisma.Decimal,
    idempotencyKey: string,
  ) {
    const existing = await this.prisma.transaction.findUnique({
      where: { idempotencyKey },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { id: walletId },
      });

      if (!wallet || !wallet.isActive) {
        throw new BadRequestException('Wallet unavailable');
      }

      if (wallet.balance.lt(amount)) {
        throw new BadRequestException('Insufficient funds');
      }

      const transaction = await tx.transaction.create({
        data: {
          walletId,
          type: TransactionType.WITHDRAWAL,
          status: TransactionStatus.COMPLETED,
          amount,
          idempotencyKey,
          description: 'Withdrawal',
        },
      });

      await tx.wallet.update({
        where: { id: walletId },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      return transaction;
    });
  }

  async getHistory(walletId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { walletId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({
        where: { walletId },
      }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async processRefund(originalTransactionId: string) {
    return this.prisma.$transaction(async (tx) => {
      const originalTx = await tx.transaction.findUnique({
        where: { id: originalTransactionId },
      });

      if (!originalTx) {
        throw new NotFoundException('Transaction not found');
      }

      if (originalTx.type !== TransactionType.WITHDRAWAL) {
        throw new BadRequestException('Only withdrawals can be refunded');
      }

      const existingRefund = await tx.transaction.findFirst({
        where: {
          referenceId: originalTransactionId,
          type: TransactionType.REFUND,
        },
      });

      if (existingRefund) {
        throw new ConflictException('Already refunded');
      }

      const refund = await tx.transaction.create({
        data: {
          walletId: originalTx.walletId,
          type: TransactionType.REFUND,
          status: TransactionStatus.COMPLETED,
          amount: originalTx.amount,
          referenceId: originalTx.id,
          description: 'Refund',
        },
      });

      await tx.wallet.update({
        where: { id: originalTx.walletId },
        data: {
          balance: {
            increment: originalTx.amount,
          },
        },
      });

      return refund;
    });
  }

  async markAsDisputed(transactionId: string) {
    const tx = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    return this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.DISPUTED,
      },
    });
  }
}
