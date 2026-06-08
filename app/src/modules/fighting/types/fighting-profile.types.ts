import {
  FIGHTING_HEROES,
  FightingHeroId,
} from '../constants/fighting-heroes.constants';
import { FightingRank } from '../constants/fighting-ranks.constants';

export type FightingHero = (typeof FIGHTING_HEROES)[FightingHeroId];

export interface FightingProfileResponse {
  id: string;
  userId: string;
  selectedHero: FightingHeroId;
  hero: FightingHero;
  rating: number;
  rank: FightingRank;
  wins: number;
  losses: number;
  draws: number;
  createdAt: Date;
  updatedAt: Date;
}
