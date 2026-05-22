import { BadRequestException, Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { SpinRouletteDto } from './dto/spin-roulette.dto';
import { RouletteBetType } from '@generated/prisma/client';
import { BetStrategy } from './types/roulette.types';
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
  constructor(private readonly prisma: PrismaService) {}

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
    const session = await this.prisma.gameSession.findFirst({
      where: {
        id: dto.sessionId,
        userId,
      },
    });

    if (!session) {
      throw new BadRequestException('Game session not found');
    }

    const result = this.generateResult(
      session.serverSeed,
      session.clientSeed,
      session.nonce,
    );

    const isWin = this.checkWin(result, dto.betType, dto.betValue);

    const multiplier = dto.betType === 'NUMBER' ? 36 : 2;

    const payout = isWin ? dto.amount * multiplier : 0;
    const profit = payout - dto.amount;

    await this.prisma.rouletteBet.create({
      data: {
        userId,
        gameId: session.id,
        betType: dto.betType,
        betValue: dto.betValue,
        betAmount: dto.amount,
        winningNumber: result,
        payoutAmount: payout,
        profit,
        isWin,
        nonce: session.nonce,
      },
    });

    await this.prisma.gameSession.update({
      where: { id: session.id },
      data: {
        nonce: {
          increment: 1,
        },
      },
    });

    return {
      result,
      isWin,
      payout,
      profit,
    };
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

  private readonly strategies: Record<RouletteBetType, BetStrategy> = {
    [RouletteBetType.NUMBER]: isNumberBet,
    [RouletteBetType.COLOR]: isColorBet,
    [RouletteBetType.EVEN_ODD]: isEvenOddBet,
    [RouletteBetType.DOZEN]: isDozenBet,
    [RouletteBetType.COLUMN]: isColumnBet,
    [RouletteBetType.RANGE]: isRangeBet,
  };
}
