import { api } from '../lib/api';

export type FightingHitZone = 'head' | 'body' | 'legs';

export interface FightingHero {
  id: string;
  name: string;
  description?: string;
  maxHealth: number;
  strike: number;
  blockPower: number;
}

export interface FightingProfile {
  id: string;
  userId: string;
  selectedHero: string;
  hero?: FightingHero;
  rating?: number;
  rank?: string;
  wins?: number;
  losses?: number;
  draws?: number;
}

export interface FightingPlayerStats {
  maxHealth?: number;
  strike?: number;
  blockPower?: number;
  heroId?: string;
  heroName?: string;
}

export interface FightingBattleMove {
  playerId: string;
  attackZone: FightingHitZone;
  defenseZone: FightingHitZone;
  healthBefore: number;
  strike: number;
  blockPower: number;
  isAuto?: boolean;
  createdAt: string;
}

export interface FightingRoundResult {
  battleId?: string;
  round: number;
  player1Move: FightingBattleMove;
  player2Move: FightingBattleMove;
  player1DamageTaken: number;
  player2DamageTaken: number;
  player1HealthAfter: number;
  player2HealthAfter: number;
  isFinished?: boolean;
}

export interface FightingBattleRoom {
  id: string;
  status: 'active' | 'finished';
  player1Id: string;
  player2Id: string;
  currentRound: number;
  player1Health: number;
  player2Health: number;
  player1Stats?: FightingPlayerStats;
  player2Stats?: FightingPlayerStats;
  winnerId?: string;
  result?: string | null;
  lastRoundResult?: FightingRoundResult;
  roundResults?: FightingRoundResult[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FightingMatchmakingWaitingEvent {
  status: 'waiting';
  userId: string;
  queuedAt: string;
}

export interface FightingMatchFoundEvent {
  status: 'matched';
  battleId: string;
  player1Id: string;
  player2Id: string;
  battleState: FightingBattleRoom;
}

export interface FightingMatchmakingCancelledEvent {
  status: 'cancelled';
}

export async function getFightingProfile() {
  const { data } = await api.get<FightingProfile>('/fighting/profile/me');
  return data;
}

export async function getFightingHeroes() {
  const { data } = await api.get<FightingHero[]>('/fighting/heroes');
  return data;
}

export async function selectFightingHero(heroId: string) {
  const { data } = await api.patch<FightingProfile>('/fighting/profile/me/hero', { heroId });
  return data;
}

export async function getFightingBattle(battleId: string) {
  const { data } = await api.get<FightingBattleRoom>(`/fighting/battles/${battleId}`);
  return data;
}
