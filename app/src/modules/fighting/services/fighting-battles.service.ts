import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
} from '@nestjs/common';
import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';
import { RedisService } from 'src/core/redis/redis.service';
import {
  FIGHTING_ACTIVE_BATTLE_TTL_SECONDS,
  FIGHTING_DEFAULT_BLOCK_POWER,
  FIGHTING_DEFAULT_HEALTH,
  FIGHTING_DEFAULT_STRIKE,
  FIGHTING_FINISHED_BATTLE_TTL_SECONDS,
  FIGHTING_HIT_ZONES,
  FIGHTING_MOVE_TIMEOUT_MS,
} from '../constants/fighting.constants';
import { MakeFightingMoveDto } from '../dto/make-fighting-move.dto';
import {
  FightingBattleFinishedEvent,
  FightingBattleMove,
  FightingBattleRealtimeEvent,
  FightingBattleRoom,
  FightingBattleStatusResponse,
  FightingHitZone,
  FightingMoveResult,
  FightingPlayerBattleStats,
  FightingRoundResult,
  FightingRoundResultEvent,
} from '../types/fighting-battle.types';

type FightingBattleEventListener = (event: FightingBattleRealtimeEvent) => void;

@Injectable()
export class FightingBattlesService implements OnModuleDestroy {
  private readonly logger = new Logger(FightingBattlesService.name);
  private readonly battleTimeouts = new Map<string, NodeJS.Timeout>();
  private readonly battleLocks = new Map<string, Promise<unknown>>();
  private readonly events = new EventEmitter();

  constructor(private readonly redisService: RedisService) {}

  onBattleEvent(listener: FightingBattleEventListener) {
    this.events.on('battleEvent', listener);
  }

  offBattleEvent(listener: FightingBattleEventListener) {
    this.events.off('battleEvent', listener);
  }

  async createBattleRoom(
    player1Id: string,
    player2Id: string,
  ): Promise<FightingBattleRoom> {
    const [player1Stats, player2Stats] = await Promise.all([
      this.getPlayerBattleStats(player1Id),
      this.getPlayerBattleStats(player2Id),
    ]);
    const now = new Date().toISOString();
    const battleRoom: FightingBattleRoom = {
      id: randomUUID(),
      player1Id,
      player2Id,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      currentRound: 1,
      player1Health: player1Stats.maxHealth,
      player2Health: player2Stats.maxHealth,
      player1Stats,
      player2Stats,
      player1Moves: [],
      player2Moves: [],
      pendingMoves: {},
      roundResults: [],
    };

    await this.saveBattleRoom(battleRoom);
    this.startMoveTimeout(battleRoom.id);

    return battleRoom;
  }

  async getBattleStatus(
    battleId: string,
  ): Promise<FightingBattleStatusResponse> {
    const battle = await this.getBattleRoomOrThrow(battleId);

    return this.toBattleStatusResponse(battle);
  }

  async getBattleStateForParticipant(
    battleId: string,
    userId: string,
  ): Promise<FightingBattleStatusResponse> {
    const battle = await this.getBattleRoomOrThrow(battleId);
    this.ensureBattleParticipant(battle, userId);

    return this.toBattleStatusResponse(battle);
  }

  async makeMove(
    userId: string,
    dto: MakeFightingMoveDto,
  ): Promise<FightingMoveResult> {
    this.validateHitZone(dto.attackZone);
    this.validateHitZone(dto.defenseZone);

    return this.runWithBattleLock(dto.battleId, async () => {
      const battle = await this.getBattleRoomOrThrow(dto.battleId);

      if (battle.status !== 'active') {
        throw new ConflictException('Battle already finished');
      }

      this.ensureBattleParticipant(battle, userId);

      if (battle.pendingMoves[userId]) {
        throw new ConflictException('You have already made a move this round');
      }

      battle.pendingMoves[userId] = this.createMove(battle, userId, {
        attackZone: dto.attackZone,
        defenseZone: dto.defenseZone,
      });
      battle.updatedAt = new Date().toISOString();

      const result = await this.resolvePendingRoundIfReady(battle);

      if (!result.roundResult) {
        await this.saveBattleRoom(battle);
        this.emitBattleEvent({
          event: 'fightingPlayerMoved',
          battleId: battle.id,
          payload: {
            battleId: battle.id,
            round: battle.currentRound,
            playerId: userId,
            message: 'Player submitted a move',
          },
        });
      }

      return result;
    });
  }

  async onModuleDestroy() {
    for (const timeout of this.battleTimeouts.values()) {
      clearTimeout(timeout);
    }

    this.battleTimeouts.clear();
    this.events.removeAllListeners();
  }

  private async resolvePendingRoundIfReady(
    battle: FightingBattleRoom,
  ): Promise<FightingMoveResult> {
    const player1Move = battle.pendingMoves[battle.player1Id];
    const player2Move = battle.pendingMoves[battle.player2Id];

    if (!player1Move || !player2Move) {
      return {
        battle,
        isFinished: false,
      };
    }

    this.clearMoveTimeout(battle.id);

    const roundResult = this.processRound(battle, player1Move, player2Move);
    const isFinished = battle.status === 'finished';

    await this.saveBattleRoom(battle);

    this.emitRoundEvents(battle, roundResult, isFinished);

    if (!isFinished) {
      this.startMoveTimeout(battle.id);
    }

    return {
      battle,
      roundResult,
      isFinished,
    };
  }

  private processRound(
    battle: FightingBattleRoom,
    player1Move: FightingBattleMove,
    player2Move: FightingBattleMove,
  ): FightingRoundResult {
    const player1DamageTaken = this.calculateDamage(player2Move, player1Move);
    const player2DamageTaken = this.calculateDamage(player1Move, player2Move);
    const player1HealthAfter = Math.max(
      battle.player1Health - player1DamageTaken,
      0,
    );
    const player2HealthAfter = Math.max(
      battle.player2Health - player2DamageTaken,
      0,
    );

    const roundResult: FightingRoundResult = {
      round: battle.currentRound,
      player1Move,
      player2Move,
      player1DamageTaken,
      player2DamageTaken,
      player1HealthAfter,
      player2HealthAfter,
    };

    battle.player1Moves.push(player1Move);
    battle.player2Moves.push(player2Move);
    battle.roundResults.push(roundResult);
    battle.pendingMoves = {};
    battle.currentRound += 1;
    battle.player1Health = player1HealthAfter;
    battle.player2Health = player2HealthAfter;
    battle.updatedAt = new Date().toISOString();

    if (player1HealthAfter <= 0 || player2HealthAfter <= 0) {
      battle.status = 'finished';
      battle.winnerId = this.getWinnerId(battle);
    }

    return roundResult;
  }

  private async applyAutoMoves(battleId: string) {
    try {
      await this.runWithBattleLock(battleId, async () => {
        const battle = await this.getBattleRoom(battleId);

        if (!battle || battle.status !== 'active') {
          return;
        }

        let hasNewAutoMove = false;

        if (!battle.pendingMoves[battle.player1Id]) {
          battle.pendingMoves[battle.player1Id] = this.createAutoMove(
            battle,
            battle.player1Id,
          );
          hasNewAutoMove = true;
        }

        if (!battle.pendingMoves[battle.player2Id]) {
          battle.pendingMoves[battle.player2Id] = this.createAutoMove(
            battle,
            battle.player2Id,
          );
          hasNewAutoMove = true;
        }

        if (!hasNewAutoMove) {
          return;
        }

        battle.updatedAt = new Date().toISOString();
        await this.resolvePendingRoundIfReady(battle);
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to apply auto moves';
      this.logger.warn(`Auto move failed for battle ${battleId}: ${message}`);
    }
  }

  private createAutoMove(
    battle: FightingBattleRoom,
    playerId: string,
  ): FightingBattleMove {
    return this.createMove(
      battle,
      playerId,
      {
        attackZone: this.getRandomHitZone(),
        defenseZone: this.getRandomHitZone(),
      },
      true,
    );
  }

  private createMove(
    battle: FightingBattleRoom,
    playerId: string,
    zones: { attackZone: FightingHitZone; defenseZone: FightingHitZone },
    isAuto = false,
  ): FightingBattleMove {
    const stats = this.getBattleStatsForPlayer(battle, playerId);

    return {
      playerId,
      attackZone: zones.attackZone,
      defenseZone: zones.defenseZone,
      healthBefore: this.getHealthForPlayer(battle, playerId),
      strike: stats.strike,
      blockPower: stats.blockPower,
      isAuto: isAuto || undefined,
      createdAt: new Date().toISOString(),
    };
  }

  private calculateDamage(
    attacker: FightingBattleMove,
    defender: FightingBattleMove,
  ): number {
    if (attacker.attackZone === defender.defenseZone) {
      return Math.max(attacker.strike - defender.blockPower, 0);
    }

    return attacker.strike;
  }

  private getWinnerId(battle: FightingBattleRoom): string | undefined {
    if (battle.player1Health <= 0 && battle.player2Health <= 0) {
      return undefined;
    }

    if (battle.player1Health <= 0) return battle.player2Id;
    if (battle.player2Health <= 0) return battle.player1Id;

    return undefined;
  }

  private emitRoundEvents(
    battle: FightingBattleRoom,
    roundResult: FightingRoundResult,
    isFinished: boolean,
  ) {
    const roundPayload: FightingRoundResultEvent = {
      battleId: battle.id,
      ...roundResult,
      isFinished,
    };

    this.emitBattleEvent({
      event: 'fightingRoundResult',
      battleId: battle.id,
      payload: roundPayload,
    });

    if (!isFinished) {
      return;
    }

    const loserId = battle.winnerId
      ? battle.winnerId === battle.player1Id
        ? battle.player2Id
        : battle.player1Id
      : undefined;
    const finishedPayload: FightingBattleFinishedEvent = {
      battleId: battle.id,
      winnerId: battle.winnerId,
      loserId,
      finalHealth: {
        player1: battle.player1Health,
        player2: battle.player2Health,
      },
      totalRounds: battle.roundResults.length,
      roundResults: battle.roundResults,
    };

    this.emitBattleEvent({
      event: 'fightingBattleFinished',
      battleId: battle.id,
      payload: finishedPayload,
    });
  }

  private emitBattleEvent(event: FightingBattleRealtimeEvent) {
    this.events.emit('battleEvent', event);
  }

  private async getBattleRoomOrThrow(
    battleId: string,
  ): Promise<FightingBattleRoom> {
    const battle = await this.getBattleRoom(battleId);

    if (!battle) {
      throw new NotFoundException('Battle not found');
    }

    return battle;
  }

  private async getBattleRoom(
    battleId: string,
  ): Promise<FightingBattleRoom | null> {
    const rawBattle = await this.redisService.get(this.getBattleKey(battleId));

    return rawBattle ? (JSON.parse(rawBattle) as FightingBattleRoom) : null;
  }

  private async saveBattleRoom(battle: FightingBattleRoom) {
    const ttlSeconds =
      battle.status === 'finished'
        ? FIGHTING_FINISHED_BATTLE_TTL_SECONDS
        : FIGHTING_ACTIVE_BATTLE_TTL_SECONDS;

    await this.redisService.set(
      this.getBattleKey(battle.id),
      JSON.stringify(battle),
      ttlSeconds,
    );
  }

  private startMoveTimeout(battleId: string) {
    this.clearMoveTimeout(battleId);

    const timeout = setTimeout(() => {
      void this.applyAutoMoves(battleId);
    }, FIGHTING_MOVE_TIMEOUT_MS);

    this.battleTimeouts.set(battleId, timeout);
  }

  private clearMoveTimeout(battleId: string) {
    const timeout = this.battleTimeouts.get(battleId);

    if (timeout) {
      clearTimeout(timeout);
      this.battleTimeouts.delete(battleId);
    }
  }

  private async runWithBattleLock<T>(
    battleId: string,
    action: () => Promise<T>,
  ): Promise<T> {
    const previous = this.battleLocks.get(battleId) ?? Promise.resolve();
    let release!: () => void;
    const current = new Promise<void>((resolve) => {
      release = resolve;
    });
    const queued = previous.then(() => current);

    this.battleLocks.set(battleId, queued);

    try {
      await previous;
      return await action();
    } finally {
      release();
      if (this.battleLocks.get(battleId) === queued) {
        this.battleLocks.delete(battleId);
      }
    }
  }

  private toBattleStatusResponse(
    battle: FightingBattleRoom,
  ): FightingBattleStatusResponse {
    return {
      id: battle.id,
      status: battle.status,
      player1Id: battle.player1Id,
      player2Id: battle.player2Id,
      currentRound: battle.currentRound,
      player1Health: battle.player1Health,
      player2Health: battle.player2Health,
      winnerId: battle.winnerId,
      lastRoundResult: battle.roundResults.at(-1),
      createdAt: battle.createdAt,
      updatedAt: battle.updatedAt,
    };
  }

  private ensureBattleParticipant(battle: FightingBattleRoom, userId: string) {
    if (userId !== battle.player1Id && userId !== battle.player2Id) {
      throw new ForbiddenException('Current user is not a battle participant');
    }
  }

  private getBattleStatsForPlayer(
    battle: FightingBattleRoom,
    playerId: string,
  ): FightingPlayerBattleStats {
    if (playerId === battle.player1Id) return battle.player1Stats;
    if (playerId === battle.player2Id) return battle.player2Stats;

    throw new ForbiddenException('Current user is not a battle participant');
  }

  private getHealthForPlayer(battle: FightingBattleRoom, playerId: string) {
    if (playerId === battle.player1Id) return battle.player1Health;
    if (playerId === battle.player2Id) return battle.player2Health;

    throw new ForbiddenException('Current user is not a battle participant');
  }

  private validateHitZone(zone: string): asserts zone is FightingHitZone {
    if (!FIGHTING_HIT_ZONES.includes(zone as FightingHitZone)) {
      throw new BadRequestException('Invalid attack or defense zone');
    }
  }

  private getRandomHitZone(): FightingHitZone {
    const index = Math.floor(Math.random() * FIGHTING_HIT_ZONES.length);

    return FIGHTING_HIT_ZONES[index];
  }

  private getBattleKey(battleId: string) {
    return `fighting:battle:${battleId}`;
  }

  private async getPlayerBattleStats(
    _userId: string,
  ): Promise<FightingPlayerBattleStats> {
    return {
      maxHealth: FIGHTING_DEFAULT_HEALTH,
      strike: FIGHTING_DEFAULT_STRIKE,
      blockPower: FIGHTING_DEFAULT_BLOCK_POWER,
    };
  }
}
