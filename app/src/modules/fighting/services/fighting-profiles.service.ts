import { BadRequestException, Injectable } from '@nestjs/common';
import { FightingProfile } from '@generated/prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import {
  FIGHTING_DEFAULT_HERO_ID,
  FIGHTING_HEROES,
  FightingHeroId,
} from '../constants/fighting-heroes.constants';
import {
  FIGHTING_DEFAULT_RATING,
  getFightingRank,
} from '../constants/fighting-ranks.constants';
import { FightingPlayerBattleStats } from '../types/fighting-battle.types';
import { FightingProfileResponse } from '../types/fighting-profile.types';

@Injectable()
export class FightingProfilesService {
  constructor(private readonly prismaService: PrismaService) {}

  async getOrCreateProfile(userId: string): Promise<FightingProfileResponse> {
    const profile =
      (await this.prismaService.fightingProfile.findUnique({
        where: { userId },
      })) ??
      (await this.prismaService.fightingProfile.create({
        data: {
          userId,
          selectedHero: FIGHTING_DEFAULT_HERO_ID,
          rating: FIGHTING_DEFAULT_RATING,
          wins: 0,
          losses: 0,
          draws: 0,
        },
      }));

    return this.toProfileResponse(profile);
  }

  async getMyProfile(userId: string): Promise<FightingProfileResponse> {
    return this.getOrCreateProfile(userId);
  }

  async selectHero(
    userId: string,
    heroId: FightingHeroId,
  ): Promise<FightingProfileResponse> {
    if (!FIGHTING_HEROES[heroId]) {
      throw new BadRequestException('Invalid fighting hero');
    }

    await this.getOrCreateProfile(userId);

    const profile = await this.prismaService.fightingProfile.update({
      where: { userId },
      data: { selectedHero: heroId },
    });

    return this.toProfileResponse(profile);
  }

  async getPlayerBattleStats(
    userId: string,
  ): Promise<FightingPlayerBattleStats> {
    const profile = await this.getOrCreateProfile(userId);
    const hero = profile.hero;

    return {
      maxHealth: hero.maxHealth,
      strike: hero.strike,
      blockPower: hero.blockPower,
      heroId: hero.id,
      heroName: hero.name,
    };
  }

  async applyBattleResult(
    winnerId: string | null | undefined,
    player1Id: string,
    player2Id: string,
  ) {
    await Promise.all([
      this.getOrCreateProfile(player1Id),
      this.getOrCreateProfile(player2Id),
    ]);

    await this.prismaService.$transaction(async (tx) => {
      if (!winnerId) {
        await Promise.all([
          tx.fightingProfile.update({
            where: { userId: player1Id },
            data: {
              draws: { increment: 1 },
              rating: { increment: 5 },
            },
          }),
          tx.fightingProfile.update({
            where: { userId: player2Id },
            data: {
              draws: { increment: 1 },
              rating: { increment: 5 },
            },
          }),
        ]);
        return;
      }

      const loserId = winnerId === player1Id ? player2Id : player1Id;
      const loserProfile = await tx.fightingProfile.findUniqueOrThrow({
        where: { userId: loserId },
      });

      await Promise.all([
        tx.fightingProfile.update({
          where: { userId: winnerId },
          data: {
            wins: { increment: 1 },
            rating: { increment: 25 },
          },
        }),
        tx.fightingProfile.update({
          where: { userId: loserId },
          data: {
            losses: { increment: 1 },
            rating: Math.max(loserProfile.rating - 15, 0),
          },
        }),
      ]);
    });
  }

  getHeroes() {
    return Object.values(FIGHTING_HEROES);
  }

  private toProfileResponse(profile: FightingProfile): FightingProfileResponse {
    const selectedHero = this.normalizeHeroId(profile.selectedHero);
    const hero = FIGHTING_HEROES[selectedHero];

    return {
      id: profile.id,
      userId: profile.userId,
      selectedHero,
      hero,
      rating: profile.rating,
      rank: getFightingRank(profile.rating),
      wins: profile.wins,
      losses: profile.losses,
      draws: profile.draws,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  private normalizeHeroId(heroId: string): FightingHeroId {
    if (FIGHTING_HEROES[heroId as FightingHeroId]) {
      return heroId as FightingHeroId;
    }

    return FIGHTING_DEFAULT_HERO_ID;
  }
}
