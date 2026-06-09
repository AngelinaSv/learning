export type FightingBattleStatus = 'active' | 'finished';
export type FightingHitZone = 'head' | 'body' | 'legs';

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
  round: number;
  player1Move: FightingBattleMove;
  player2Move: FightingBattleMove;
  player1DamageTaken: number;
  player2DamageTaken: number;
  player1HealthAfter: number;
  player2HealthAfter: number;
}

export interface FightingPlayerBattleStats {
  maxHealth: number;
  strike: number;
  blockPower: number;
  heroId?: string;
  heroName?: string;
}

export type FightingBattleResult = 'PLAYER1_WIN' | 'PLAYER2_WIN' | 'DRAW';

export interface FightingBattleRoom {
  id: string;
  player1Id: string;
  player2Id: string;
  status: FightingBattleStatus;
  createdAt: string;
  updatedAt: string;
  currentRound: number;
  player1Health: number;
  player2Health: number;
  player1Stats: FightingPlayerBattleStats;
  player2Stats: FightingPlayerBattleStats;
  player1Moves: FightingBattleMove[];
  player2Moves: FightingBattleMove[];
  pendingMoves: Record<string, FightingBattleMove>;
  roundResults: FightingRoundResult[];
  winnerId?: string;
  result: FightingBattleResult | null;
}

export interface FightingBattleStatusResponse {
  id: string;
  status: FightingBattleStatus;
  player1Id: string;
  player2Id: string;
  currentRound: number;
  player1Health: number;
  player2Health: number;
  winnerId?: string;
  result: FightingBattleResult | null;
  lastRoundResult?: FightingRoundResult;
  createdAt: string;
  updatedAt: string;
}

export interface FightingPlayerMovedEvent {
  battleId: string;
  round: number;
  playerId: string;
  message: 'Player submitted a move';
}

export interface FightingRoundResultEvent extends FightingRoundResult {
  battleId: string;
  isFinished: boolean;
}

export interface FightingBattleFinishedEvent {
  battleId: string;
  winnerId?: string;
  loserId?: string;
  result: FightingBattleResult | null;
  finalHealth: {
    player1: number;
    player2: number;
  };
  totalRounds: number;
  roundResults: FightingRoundResult[];
}

export type FightingBattleRealtimeEvent =
  | {
      event: 'fightingPlayerMoved';
      battleId: string;
      payload: FightingPlayerMovedEvent;
    }
  | {
      event: 'fightingRoundResult';
      battleId: string;
      payload: FightingRoundResultEvent;
    }
  | {
      event: 'fightingBattleFinished';
      battleId: string;
      payload: FightingBattleFinishedEvent;
    };

export interface FightingMoveResult {
  battle: FightingBattleRoom;
  roundResult?: FightingRoundResult;
  isFinished: boolean;
}
