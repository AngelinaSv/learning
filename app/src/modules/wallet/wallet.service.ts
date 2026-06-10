import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TransactionType, Wallet } from '@generated/prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TransactionService } from './transaction.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';

type PrismaTx = Prisma.TransactionClient;
type MoneyInput = Prisma.Decimal | number | string;

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    private readonly transactionService: TransactionService,
  ) {}

  async getBalance(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
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

  async toggleWalletStatus(walletId: string, isActive: boolean) {
    return this.prisma.wallet.update({
      where: { id: walletId },
      data: { isActive },
    });
  }

  async processDeposit(userId: string, dto: DepositDto) {
    const amount = this.parsePositiveAmount(dto.amount);

    const existing = await this.transactionService.findByIdempotencyKey(
      dto.idempotencyKey,
    );

    if (existing) {
      return existing;
    }

    return this.prisma.$transaction(async (tx) => {
      const wallet = await this.incrementBalance(tx, userId, amount);

      return this.transactionService.createDepositTransaction(tx, {
        userId,
        walletId: wallet.id,
        amount,
        idempotencyKey: dto.idempotencyKey,
      });
    });
  }

  async processWithdrawal(userId: string, dto: WithdrawDto) {
    const amount = this.parsePositiveAmount(dto.amount);

    const existing = await this.transactionService.findByIdempotencyKey(
      dto.idempotencyKey,
    );

    if (existing) {
      return existing;
    }

    return this.prisma.$transaction(async (tx) => {
      const wallet = await this.decrementBalance(tx, userId, amount);

      return this.transactionService.createWithdrawalTransaction(tx, {
        userId,
        walletId: wallet.id,
        amount,
        idempotencyKey: dto.idempotencyKey,
      });
    });
  }

  async withdrawForBet(
    tx: PrismaTx,
    userId: string,
    amount: MoneyInput,
    referenceId?: string,
  ) {
    const amountDecimal = this.parsePositiveAmount(
      amount,
      'Bet amount must be > 0',
    );
    const wallet = await this.decrementBalance(tx, userId, amountDecimal);

    return this.transactionService.createBetTransaction(tx, {
      userId,
      walletId: wallet.id,
      amount: amountDecimal,
      referenceId,
    });
  }

  async creditGameWin(
    tx: PrismaTx,
    userId: string,
    amount: MoneyInput,
    referenceId?: string,
  ) {
    const amountDecimal = this.parsePositiveAmount(
      amount,
      'Win amount must be > 0',
    );
    const wallet = await this.incrementBalance(tx, userId, amountDecimal);

    return this.transactionService.createWinTransaction(tx, {
      userId,
      walletId: wallet.id,
      amount: amountDecimal,
      referenceId,
    });
  }

  async processRefund(originalTransactionId: string) {
    return this.prisma.$transaction(async (tx) => {
      const originalTx = await this.transactionService.findById(
        tx,
        originalTransactionId,
      );

      if (!originalTx) {
        throw new NotFoundException('Transaction not found');
      }

      if (originalTx.type !== TransactionType.WITHDRAWAL) {
        throw new BadRequestException('Only withdrawals can be refunded');
      }

      const existingRefund =
        await this.transactionService.findRefundByReference(
          tx,
          originalTransactionId,
        );

      if (existingRefund) {
        throw new ConflictException('Already refunded');
      }

      const wallet = await this.incrementBalanceByWalletId(
        tx,
        originalTx.walletId,
        originalTx.amount,
      );

      return this.transactionService.createRefundTransaction(tx, {
        userId: originalTx.userId,
        walletId: wallet.id,
        amount: originalTx.amount,
        referenceId: originalTx.id,
      });
    });
  }

  private parsePositiveAmount(
    amount: MoneyInput,
    message = 'Amount must be > 0',
  ) {
    const amountDecimal = new Prisma.Decimal(amount);

    if (amountDecimal.lte(0)) {
      throw new BadRequestException(message);
    }

    return amountDecimal;
  }

  private async getActiveWallet(tx: PrismaTx, userId: string | null) {
    if (!userId) {
      throw new BadRequestException('Wallet unavailable');
    }

    const wallet = await tx.wallet.findUnique({
      where: { userId },
    });

    if (!wallet || !wallet.isActive) {
      throw new BadRequestException('Wallet unavailable');
    }

    return wallet;
  }

  private async getActiveWalletById(tx: PrismaTx, walletId: string) {
    const wallet = await tx.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet || !wallet.isActive) {
      throw new BadRequestException('Wallet unavailable');
    }

    return wallet;
  }

  private validateBalance(wallet: Wallet, amount: Prisma.Decimal) {
    if (wallet.balance.lt(amount)) {
      throw new BadRequestException('Insufficient funds');
    }
  }

  private async decrementBalance(
    tx: PrismaTx,
    userId: string | null,
    amount: Prisma.Decimal,
  ) {
    const wallet = await this.getActiveWallet(tx, userId);

    this.validateBalance(wallet, amount);

    const updatedWallet = await tx.wallet.updateMany({
      where: {
        id: wallet.id,
        balance: {
          gte: amount,
        },
      },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });

    if (updatedWallet.count === 0) {
      throw new BadRequestException('Insufficient funds');
    }

    return wallet;
  }

  private async incrementBalance(
    tx: PrismaTx,
    userId: string | null,
    amount: Prisma.Decimal,
  ) {
    const wallet = await this.getActiveWallet(tx, userId);

    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    return wallet;
  }

  private async incrementBalanceByWalletId(
    tx: PrismaTx,
    walletId: string,
    amount: Prisma.Decimal,
  ) {
    const wallet = await this.getActiveWalletById(tx, walletId);

    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    return wallet;
  }
}
