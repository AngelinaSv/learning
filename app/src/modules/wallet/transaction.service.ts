import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import {
  Prisma,
  TransactionStatus,
  TransactionType,
} from '@generated/prisma/client';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

type PrismaTx = Prisma.TransactionClient;

type TransactionRecordData = {
  userId: string | null;
  walletId: string;
  amount: Prisma.Decimal | number | string;
  idempotencyKey?: string;
  referenceId?: string;
};

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async findByIdempotencyKey(idempotencyKey: string) {
    return this.prisma.transaction.findUnique({
      where: { idempotencyKey },
    });
  }

  async findById(tx: PrismaTx, transactionId: string) {
    return tx.transaction.findUnique({
      where: { id: transactionId },
    });
  }

  async findRefundByReference(tx: PrismaTx, referenceId: string) {
    return tx.transaction.findFirst({
      where: {
        referenceId,
        type: TransactionType.REFUND,
      },
    });
  }

  async createDepositTransaction(tx: PrismaTx, data: TransactionRecordData) {
    return tx.transaction.create({
      data: {
        userId: data.userId,
        walletId: data.walletId,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.COMPLETED,
        amount: data.amount,
        idempotencyKey: data.idempotencyKey,
        description: 'Deposit funds',
      },
    });
  }

  async createWithdrawalTransaction(tx: PrismaTx, data: TransactionRecordData) {
    return tx.transaction.create({
      data: {
        userId: data.userId,
        walletId: data.walletId,
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.COMPLETED,
        amount: data.amount,
        idempotencyKey: data.idempotencyKey,
        description: 'Withdrawal',
      },
    });
  }

  async createBetTransaction(tx: PrismaTx, data: TransactionRecordData) {
    return tx.transaction.create({
      data: {
        userId: data.userId,
        walletId: data.walletId,
        type: TransactionType.BET,
        status: TransactionStatus.COMPLETED,
        amount: data.amount,
        referenceId: data.referenceId,
        description: 'Roulette bet',
      },
    });
  }

  async createWinTransaction(tx: PrismaTx, data: TransactionRecordData) {
    return tx.transaction.create({
      data: {
        userId: data.userId,
        walletId: data.walletId,
        type: TransactionType.WIN,
        status: TransactionStatus.COMPLETED,
        amount: data.amount,
        referenceId: data.referenceId,
        description: 'Roulette win',
      },
    });
  }

  async createRefundTransaction(tx: PrismaTx, data: TransactionRecordData) {
    return tx.transaction.create({
      data: {
        userId: data.userId,
        walletId: data.walletId,
        type: TransactionType.REFUND,
        status: TransactionStatus.COMPLETED,
        amount: data.amount,
        referenceId: data.referenceId,
        description: 'Refund',
      },
    });
  }

  async getTransactionHistory(userId: string, data: PaginationQueryDto) {
    const { page, limit } = data;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: {
          OR: [{ userId }, { wallet: { userId } }],
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({
        where: {
          OR: [{ userId }, { wallet: { userId } }],
        },
      }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
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
