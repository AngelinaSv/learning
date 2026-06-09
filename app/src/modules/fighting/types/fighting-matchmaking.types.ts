import { FightingBattleStatusResponse } from './fighting-battle.types';

export interface FightingMatchmakingPlayer {
  userId: string;
  socketId: string;
  createdAt: string;
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
  battleState: FightingBattleStatusResponse;
}

export interface FightingMatchmakingCancelledEvent {
  status: 'cancelled';
}

export type FightingMatchmakingResult =
  | {
      status: 'waiting';
      payload: FightingMatchmakingWaitingEvent;
    }
  | {
      status: 'matched';
      opponent: FightingMatchmakingPlayer;
      payload: FightingMatchFoundEvent;
    };
