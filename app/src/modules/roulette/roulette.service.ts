import { BadRequestException, Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { PrismaService } from '../../core/prisma/prisma.service';
import { SpinRouletteDto } from './dto/spin-roulette.dto';
import { Prisma, RouletteBetType } from '@generated/prisma/client';
import { BetStrategy } from './types/roulette.types';
import { WalletService } from '../wallet/wallet.service';
import {
  isColorBet,
  isColumnBet,
  isDozenBet,
  isEvenOddBet,
  isNumberBet,
  isRangeBet,
} from './utils/roulette.helpers';

@Injectable()
export class RouletteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
  ) {}

  async createSession(userId: string) {
    const serverSeed = crypto.randomBytes(32).toString('hex');
    const serverHash = crypto
      .createHash('sha256')
      .update(serverSeed)
      .digest('hex');

    const gameRoom = await this.prisma.gameSession.create({
      data: {
        userId,
        serverSeed,
        serverHash,
        clientSeed: 'default',
      },
    });

    return { success: true, gameRoom };
  }

  async findAllSessions(userId: string) {
    const gameSessions = await this.prisma.gameSession.findMany({
      where: { userId },
    });
    return gameSessions;
  }

  async getCurrentSession(userId: string) {
    let session = await this.prisma.gameSession.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!session) {
      const serverSeed = crypto.randomBytes(32).toString('hex');

      const serverHash = crypto
        .createHash('sha256')
        .update(serverSeed)
        .digest('hex');

      session = await this.prisma.gameSession.create({
        data: {
          userId,
          serverSeed,
          serverHash,
          clientSeed: crypto.randomUUID(),
        },
      });
    }

    return {
      id: session.id,
      serverHash: session.serverHash,
      clientSeed: session.clientSeed,
      nonce: session.nonce,
      status: session.status,
      createdAt: session.createdAt,
    };
  }

  async finishSession(userId: string, sessionId: string) {
    const session = await this.prisma.gameSession.findFirst({
      where: {
        id: sessionId,
        userId,
        status: 'ACTIVE',
      },
    });

    if (!session) {
      throw new BadRequestException('Active game session not found');
    }

    const finishedSession = await this.prisma.gameSession.update({
      where: {
        id: session.id,
      },
      data: {
        status: 'FINISHED',
        finishedAt: new Date(),
      },
    });

    return {
      success: true,
      sessionId: finishedSession.id,
      serverSeed: finishedSession.serverSeed,
      serverHash: finishedSession.serverHash,
      clientSeed: finishedSession.clientSeed,
      nonce: finishedSession.nonce,
      finishedAt: finishedSession.finishedAt,
    };
  }

  async spin(userId: string, dto: SpinRouletteDto) {
    return this.prisma.$transaction(async (tx) => {
      const amount = new Prisma.Decimal(dto.amount);
      const betValue = dto.betValue.toUpperCase();

      if (amount.lte(0)) {
        throw new BadRequestException('Bet amount must be > 0');
      }

      this.validateBet(dto.betType, betValue);

      const session = await tx.gameSession.findFirst({
        where: {
          id: dto.sessionId,
          userId,
        },
      });

      if (!session) {
        throw new BadRequestException('Game session not found');
      }

      const rouletteBetId = crypto.randomUUID();
      const betTransaction = await this.walletService.withdrawForBet(
        tx,
        userId,
        amount,
        rouletteBetId,
      );

      const result = this.generateResult(
        session.serverSeed,
        session.clientSeed,
        session.nonce,
      );
      const resultColor = this.getResultColor(result);
      const isWin = this.checkWin(result, dto.betType, betValue);
      const multiplier = this.getPayoutMultiplier(dto.betType);
      const payout = isWin ? amount.mul(multiplier) : new Prisma.Decimal(0);
      const profit = payout.minus(amount);

      const winTransaction = payout.gt(0)
        ? await this.walletService.creditGameWin(
            tx,
            userId,
            payout,
            rouletteBetId,
          )
        : null;

      await tx.rouletteBet.create({
        data: {
          id: rouletteBetId,
          userId,
          gameSessionId: session.id,
          betType: dto.betType,
          betValue,
          betAmount: amount,
          winningNumber: result,
          winningColor: resultColor,
          payoutAmount: payout,
          profit,
          isWin,
          betTransactionId: betTransaction.id,
          winTransactionId: winTransaction?.id,
          nonce: session.nonce,
        },
      });

      await tx.gameSession.update({
        where: { id: session.id },
        data: {
          nonce: {
            increment: 1,
          },
        },
      });

      return {
        result,
        resultColor,
        isWin,
        payout,
        profit,
      };
    });
  }

  async getMyHistory(userId: string) {
    return this.prisma.rouletteBet.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });
  }

  async getRating() {
    return this.prisma.rouletteBet.groupBy({
      by: ['userId'],
      _sum: {
        profit: true,
      },
      orderBy: {
        _sum: {
          profit: 'desc',
        },
      },
      take: 10,
    });
  }

  private generateResult(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
  ) {
    const hmac = crypto.createHmac('sha256', serverSeed);

    hmac.update(`${clientSeed}:${nonce}`);

    const hash = hmac.digest('hex');

    return parseInt(hash.slice(0, 8), 16) % 37;
  }

  private checkWin(
    result: number,
    type: RouletteBetType,
    value: string,
  ): boolean {
    const strategy = this.strategies[type];

    if (!strategy) {
      return false;
    }

    return strategy(result, value);
  }

  private validateBet(type: RouletteBetType, value: string) {
    if (type === RouletteBetType.NUMBER) {
      const numberValue = Number(value);

      if (
        !Number.isInteger(numberValue) ||
        numberValue < 0 ||
        numberValue > 36
      ) {
        throw new BadRequestException('Invalid roulette number');
      }

      return;
    }

    const allowedValues: Record<
      Exclude<RouletteBetType, 'NUMBER'>,
      string[]
    > = {
      [RouletteBetType.COLOR]: ['RED', 'BLACK', 'GREEN'],
      [RouletteBetType.EVEN_ODD]: ['EVEN', 'ODD'],
      [RouletteBetType.DOZEN]: ['FIRST', 'SECOND', 'THIRD'],
      [RouletteBetType.COLUMN]: ['FIRST', 'SECOND', 'THIRD'],
      [RouletteBetType.RANGE]: ['LOW', 'HIGH'],
    };

    if (!allowedValues[type].includes(value)) {
      throw new BadRequestException('Invalid roulette bet value');
    }
  }

  private getPayoutMultiplier(type: RouletteBetType) {
    if (type === RouletteBetType.NUMBER) return 36;
    if (type === RouletteBetType.DOZEN || type === RouletteBetType.COLUMN) {
      return 3;
    }

    return 2;
  }

  private getResultColor(result: number) {
    if (result === 0) return 'GREEN';

    const red = new Set([
      1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
    ]);

    return red.has(result) ? 'RED' : 'BLACK';
  }

  private readonly strategies: Record<RouletteBetType, BetStrategy> = {
    [RouletteBetType.NUMBER]: isNumberBet,
    [RouletteBetType.COLOR]: isColorBet,
    [RouletteBetType.EVEN_ODD]: isEvenOddBet,
    [RouletteBetType.DOZEN]: isDozenBet,
    [RouletteBetType.COLUMN]: isColumnBet,
    [RouletteBetType.RANGE]: isRangeBet,
  };
}
