import { FightingBattleRoom } from './fighting-battle.types';

export type FightingDuelRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface FightingDuelRequest {
  id: string;
  challengerId: string;
  opponentId?: string;
  status: FightingDuelRequestStatus;
  createdAt: string;
  battleRoomId?: string;
}

export interface FightingDuelAcceptResult {
  duelRequest: FightingDuelRequest;
  battleRoom: FightingBattleRoom;
}
