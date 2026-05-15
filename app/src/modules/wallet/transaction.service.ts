import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Prisma,
  TransactionType,
  TransactionStatus,
} from '@generated/prisma/client';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async processWithdrawal(walletId: string, dto: WithdrawDto) {
    const { amount, idempotencyKey } = dto;

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

  async processDeposit(walletId: string, dto: DepositDto) {
    const amount = new Prisma.Decimal(dto.amount);

    if (amount.lte(0)) {
      throw new BadRequestException('Amount must be > 0');
    }

    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { id: walletId },
      });

      if (!wallet || !wallet.isActive) {
        throw new BadRequestException('Wallet not available');
      }

      const depositTx = await tx.transaction.create({
        data: {
          walletId: walletId,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          amount,
          description: 'Deposit funds',
          idempotencyKey: dto.idempotencyKey, // если добавишь (очень желательно)
        },
      });

      await tx.wallet.update({
        where: { id: walletId },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      return depositTx;
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
