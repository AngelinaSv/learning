import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/core/redis/redis.service';
import {
  FIGHTING_MATCHMAKING_QUEUE_KEY,
  FIGHTING_MATCHMAKING_TTL_SECONDS,
} from '../constants/fighting.constants';
import {
  FightingMatchmakingCancelledEvent,
  FightingMatchmakingPlayer,
  FightingMatchmakingResult,
} from '../types/fighting-matchmaking.types';
import { FightingBattlesService } from './fighting-battles.service';

@Injectable()
export class FightingMatchmakingService {
  constructor(
    private readonly redisService: RedisService,
    private readonly fightingBattlesService: FightingBattlesService,
  ) {}

  async findOpponent(
    userId: string,
    socketId: string,
  ): Promise<FightingMatchmakingResult> {
    const existingRecord = await this.getMatchmakingPlayer(userId);

    if (existingRecord) {
      return {
        status: 'waiting',
        payload: {
          status: 'waiting',
          userId,
          queuedAt: existingRecord.createdAt,
        },
      };
    }

    // The queue may contain stale user IDs because player records expire by TTL.
    // Keep popping until a valid opponent record is found or the queue becomes empty.
    while (true) {
      const opponentId = await this.redisService.client.lpop(
        FIGHTING_MATCHMAKING_QUEUE_KEY,
      );

      if (!opponentId) {
        break;
      }

      if (opponentId === userId) {
        continue;
      }

      const opponentRecord = await this.getMatchmakingPlayer(opponentId);

      if (!opponentRecord) {
        continue;
      }

      await this.redisService.del(this.getMatchmakingUserKey(opponentId));

      const battleRoom = await this.fightingBattlesService.createBattleRoom(
        opponentId,
        userId,
      );
      const battleState = await this.fightingBattlesService.getBattleStatus(
        battleRoom.id,
      );

      return {
        status: 'matched',
        opponent: opponentRecord,
        payload: {
          status: 'matched',
          battleId: battleRoom.id,
          player1Id: battleRoom.player1Id,
          player2Id: battleRoom.player2Id,
          battleState,
        },
      };
    }

    const queuedAt = new Date().toISOString();
    const player: FightingMatchmakingPlayer = {
      userId,
      socketId,
      createdAt: queuedAt,
    };

    await this.redisService.client
      .pipeline()
      .set(
        this.getMatchmakingUserKey(userId),
        JSON.stringify(player),
        'EX',
        FIGHTING_MATCHMAKING_TTL_SECONDS,
      )
      // Remove possible duplicates before pushing the user to the queue again.
      .lrem(FIGHTING_MATCHMAKING_QUEUE_KEY, 0, userId)
      .rpush(FIGHTING_MATCHMAKING_QUEUE_KEY, userId)
      .exec();

    return {
      status: 'waiting',
      payload: {
        status: 'waiting',
        userId,
        queuedAt,
      },
    };
  }

  async cancel(userId: string): Promise<FightingMatchmakingCancelledEvent> {
    await this.redisService.client
      .pipeline()
      .del(this.getMatchmakingUserKey(userId))
      .lrem(FIGHTING_MATCHMAKING_QUEUE_KEY, 0, userId)
      .exec();

    return { status: 'cancelled' };
  }

  private async getMatchmakingPlayer(
    userId: string,
  ): Promise<FightingMatchmakingPlayer | null> {
    const rawPlayer = await this.redisService.get(
      this.getMatchmakingUserKey(userId),
    );

    if (!rawPlayer) {
      return null;
    }

    try {
      return JSON.parse(rawPlayer) as FightingMatchmakingPlayer;
    } catch {
      await this.redisService.del(this.getMatchmakingUserKey(userId));
      return null;
    }
  }

  private getMatchmakingUserKey(userId: string) {
    return `fighting:matchmaking:user:${userId}`;
  }
}
