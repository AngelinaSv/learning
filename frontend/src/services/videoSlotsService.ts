import { api } from '../lib/api';

export const VIDEO_SLOT_SESSION_STORAGE_KEY = 'neon-realms:video-slot-session-id';

export interface VideoSlotSession {
  gameId: string;
  status: string;
  mode?: number;
  totalSpins?: number;
  totalBets?: string;
  totalWins?: string;
  createdAt?: string;
}

export interface VideoSlotWinningLine {
  lineId: number;
  symbols: number[];
  symbol: number;
  matches: number;
  multiplier: number;
  win: string | number;
}

export interface VideoSlotSpinResult {
  gameId: string;
  grid: number[][];
  winningLines: VideoSlotWinningLine[];
  totalWin: string;
  betAmount: string;
  selectedLines: number[];
  sessionStats: {
    totalSpins: number;
    totalBets: string;
    totalWins: string;
    currentSessionRtp: number;
  };
}

export async function startVideoSlotSession() {
  const { data } = await api.post<VideoSlotSession>('/video-slots/sessions');
  return data;
}

export async function getVideoSlotSession() {
  const { data } = await api.get<VideoSlotSession>('/video-slots/sessions/current');
  return data;
}

export async function spinVideoSlot(sessionId: string, bet: number, lines: number[]) {
  const { data } = await api.post<VideoSlotSpinResult>(`/video-slots/sessions/${sessionId}/spins`, {
    bet,
    lines,
  });
  return data;
}

export async function endVideoSlotSession(sessionId: string) {
  const { data } = await api.delete(`/video-slots/sessions/${sessionId}`);
  return data;
}
