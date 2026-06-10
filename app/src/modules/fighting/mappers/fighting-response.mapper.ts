import {
  FightingHero,
  FightingProfileResponse,
} from '../types/fighting-profile.types';
import {
  FightingBattleMove,
  FightingBattleRoom,
  FightingPlayerBattleStats,
  FightingRoundResult,
} from '../types/fighting-battle.types';
import {
  FightingDuelAcceptResult,
  FightingDuelRequest,
} from '../types/fighting-duel-request.types';
import { FightingBattleMoveDto } from '../dto/responses/fighting-battle-move.dto';
import { FightingBattleRoomDto } from '../dto/responses/fighting-battle-room.dto';
import { FightingDuelAcceptResponseDto } from '../dto/responses/fighting-duel-accept-response.dto';
import { FightingDuelRequestResponseDto } from '../dto/responses/fighting-duel-request-response.dto';
import { FightingHeroResponseDto } from '../dto/responses/fighting-hero-response.dto';
import { FightingPlayerBattleStatsDto } from '../dto/responses/fighting-player-battle-stats.dto';
import { FightingProfileResponseDto } from '../dto/responses/fighting-profile-response.dto';
import { FightingRoundResultDto } from '../dto/responses/fighting-round-result.dto';

export class FightingResponseMapper {
  static toHeroResponseDto(hero: FightingHero): FightingHeroResponseDto {
    return {
      id: hero.id,
      name: hero.name,
      description: hero.description,
      maxHealth: hero.maxHealth,
      strike: hero.strike,
      blockPower: hero.blockPower,
    };
  }

  static toProfileResponseDto(
    profile: FightingProfileResponse,
  ): FightingProfileResponseDto {
    return {
      id: profile.id,
      userId: profile.userId,
      selectedHero: profile.selectedHero,
      hero: this.toHeroResponseDto(profile.hero),
      rating: profile.rating,
      rank: profile.rank,
      wins: profile.wins,
      losses: profile.losses,
      draws: profile.draws,
      createdAt: this.toIsoString(profile.createdAt),
      updatedAt: this.toIsoString(profile.updatedAt),
    };
  }

  static toDuelRequestResponseDto(
    request: FightingDuelRequest,
  ): FightingDuelRequestResponseDto {
    return {
      id: request.id,
      challengerId: request.challengerId,
      opponentId: request.opponentId,
      status: request.status,
      battleRoomId: request.battleRoomId,
      createdAt: request.createdAt,
    };
  }

  static toDuelAcceptResponseDto(
    result: FightingDuelAcceptResult,
  ): FightingDuelAcceptResponseDto {
    return {
      duelRequest: this.toDuelRequestResponseDto(result.duelRequest),
      battleRoom: this.toBattleRoomDto(result.battleRoom),
    };
  }

  static toBattleRoomDto(battle: FightingBattleRoom): FightingBattleRoomDto {
    const lastRoundResult = battle.roundResults.at(-1);

    return {
      id: battle.id,
      status: battle.status,
      player1Id: battle.player1Id,
      player2Id: battle.player2Id,
      currentRound: battle.currentRound,
      player1Health: battle.player1Health,
      player2Health: battle.player2Health,
      player1Stats: this.toPlayerBattleStatsDto(battle.player1Stats),
      player2Stats: this.toPlayerBattleStatsDto(battle.player2Stats),
      winnerId: battle.winnerId,
      result: battle.result,
      lastRoundResult: lastRoundResult
        ? this.toRoundResultDto(lastRoundResult)
        : undefined,
      roundResults: battle.roundResults.map((roundResult) =>
        this.toRoundResultDto(roundResult),
      ),
      createdAt: battle.createdAt,
      updatedAt: battle.updatedAt,
    };
  }

  static toPlayerBattleStatsDto(
    stats: FightingPlayerBattleStats,
  ): FightingPlayerBattleStatsDto {
    return {
      maxHealth: stats.maxHealth,
      strike: stats.strike,
      blockPower: stats.blockPower,
      heroId: stats.heroId,
      heroName: stats.heroName,
    };
  }

  static toRoundResultDto(
    roundResult: FightingRoundResult,
  ): FightingRoundResultDto {
    return {
      round: roundResult.round,
      player1Move: this.toBattleMoveDto(roundResult.player1Move),
      player2Move: this.toBattleMoveDto(roundResult.player2Move),
      player1DamageTaken: roundResult.player1DamageTaken,
      player2DamageTaken: roundResult.player2DamageTaken,
      player1HealthAfter: roundResult.player1HealthAfter,
      player2HealthAfter: roundResult.player2HealthAfter,
    };
  }

  static toBattleMoveDto(move: FightingBattleMove): FightingBattleMoveDto {
    return {
      playerId: move.playerId,
      attackZone: move.attackZone,
      defenseZone: move.defenseZone,
      healthBefore: move.healthBefore,
      strike: move.strike,
      blockPower: move.blockPower,
      isAuto: move.isAuto,
      createdAt: move.createdAt,
    };
  }

  private static toIsoString(value: string | Date): string {
    return value instanceof Date ? value.toISOString() : value;
  }
}
