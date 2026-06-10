import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import { randomUUID } from 'node:crypto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { RedisService } from 'src/core/redis/redis.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { PlayVideoSlotDto } from './dto/play-video-slot.dto';
import { StartVideoSlotDto } from './dto/start-video-slot.dto';
import { VideoSlotMathService } from './video-slot-math.service';
import {
  PAYLINES_CONFIG,
  VIDEO_SLOT_SESSION_PREFIX,
  VIDEO_SLOT_SESSION_TTL_SECONDS,
} from './constants/video-slot.constants';
import { VideoSlotSession } from './types/video-slot.types';

@Injectable()
export class VideoSlotService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly walletService: WalletService,
    private readonly mathService: VideoSlotMathService,
  ) {}

  async initializeGameSession(userId: string, dto: StartVideoSlotDto = {}) {
    const key = this.getSessionKey(userId);
    const activeSession = await this.redisService.get(key);

    if (activeSession) {
      throw new ConflictException('Active video slot session already exists');
    }

    const session: VideoSlotSession = {
      gameId: randomUUID(),
      userId,
      mode: dto.mode ?? 1,
      totalSpins: 0,
      totalBets: '0',
      totalWins: '0',
      createdAt: new Date().toISOString(),
    };

    await this.saveSession(session);

    return {
      gameId: session.gameId,
      status: 'ACTIVE',
      mode: session.mode,
    };
  }

  async getCurrentSession(userId: string) {
    const session = await this.getActiveSession(userId);

    return {
      gameId: session.gameId,
      status: 'ACTIVE',
      mode: session.mode,
      totalSpins: session.totalSpins,
      totalBets: session.totalBets,
      totalWins: session.totalWins,
      createdAt: session.createdAt,
    };
  }

  async play(userId: string, sessionId: string, dto: PlayVideoSlotDto) {
    const session = await this.getActiveSession(userId);

    if (session.gameId !== sessionId) {
      throw new BadRequestException('Video slot sessionId mismatch');
    }

    const selectedLines = this.validateLines(dto.lines);
    const betAmount = new Prisma.Decimal(dto.bet);

    if (betAmount.lte(0)) {
      throw new BadRequestException('Bet amount must be > 0');
    }

    const spinResult = await this.prisma.$transaction(async (tx) => {
      const spinId = randomUUID();

      await this.walletService.withdrawForBet(tx, userId, betAmount, spinId);

      const grid = this.mathService.generateGrid(session.mode);
      const { totalWin, winningLines } = this.mathService.calculateWin({
        grid,
        lines: selectedLines,
        bet: betAmount,
      });

      if (totalWin.gt(0)) {
        await this.walletService.creditGameWin(tx, userId, totalWin, spinId);
      }

      return { grid, totalWin, winningLines };
    });

    const totalBets = new Prisma.Decimal(session.totalBets).plus(betAmount);
    const totalWins = new Prisma.Decimal(session.totalWins).plus(
      spinResult.totalWin,
    );
    const updatedSession: VideoSlotSession = {
      ...session,
      totalSpins: session.totalSpins + 1,
      totalBets: totalBets.toString(),
      totalWins: totalWins.toString(),
    };

    await this.saveSession(updatedSession);

    return {
      gameId: updatedSession.gameId,
      grid: this.mathService.transposeGrid(spinResult.grid),
      winningLines: spinResult.winningLines,
      totalWin: spinResult.totalWin.toString(),
      betAmount: betAmount.toString(),
      selectedLines,
      sessionStats: {
        totalSpins: updatedSession.totalSpins,
        totalBets: updatedSession.totalBets,
        totalWins: updatedSession.totalWins,
        currentSessionRtp: totalBets.gt(0)
          ? totalWins.div(totalBets).mul(100).toNumber()
          : 0,
      },
    };
  }

  async endGame(userId: string, sessionId: string) {
    const session = await this.getActiveSession(userId);

    if (session.gameId !== sessionId) {
      throw new BadRequestException('Video slot sessionId mismatch');
    }

    const totalBets = new Prisma.Decimal(session.totalBets);
    const totalWins = new Prisma.Decimal(session.totalWins);
    const netResult = totalWins.minus(totalBets);
    const rtp = totalBets.gt(0)
      ? totalWins.div(totalBets).mul(100).toNumber()
      : 0;

    await this.redisService.del(this.getSessionKey(userId));

    return this.prisma.videoSlotHistory.create({
      data: {
        gameId: session.gameId,
        userId: session.userId,
        mode: session.mode,
        totalSpins: session.totalSpins,
        totalBets,
        totalWins,
        netResult,
        rtp,
      },
    });
  }

  async getMyHistory(userId: string, data: PaginationQueryDto) {
    const { page, limit } = data;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.videoSlotHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.videoSlotHistory.count({
        where: { userId },
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

  private validateLines(lines: number[]) {
    const validLineIds = new Set(PAYLINES_CONFIG.map((line) => line.id));
    const uniqueLines = new Set(lines);

    if (uniqueLines.size !== lines.length) {
      throw new BadRequestException('Selected lines must be unique');
    }

    for (const line of lines) {
      if (!validLineIds.has(line)) {
        throw new BadRequestException(`Invalid payline: ${line}`);
      }
    }

    return lines;
  }

  private async getActiveSession(userId: string) {
    const storedSession = await this.redisService.get(
      this.getSessionKey(userId),
    );

    if (!storedSession) {
      throw new BadRequestException('Active video slot session not found');
    }

    return JSON.parse(storedSession) as VideoSlotSession;
  }

  private async saveSession(session: VideoSlotSession) {
    await this.redisService.set(
      this.getSessionKey(session.userId),
      JSON.stringify(session),
      VIDEO_SLOT_SESSION_TTL_SECONDS,
    );
  }

  private getSessionKey(userId: string) {
    return `${VIDEO_SLOT_SESSION_PREFIX}:${userId}`;
  }
}
