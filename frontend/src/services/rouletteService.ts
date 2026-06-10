import { api } from '../lib/api';

export type RouletteBetChoice = 'RED' | 'BLACK' | 'GREEN' | 'NUMBER';

export interface RouletteSession {
  id: string;
  serverHash?: string;
  clientSeed?: string;
  nonce?: number;
  status?: string;
  createdAt?: string;
}

export interface RouletteSpinResult {
  result: number;
  resultColor: 'RED' | 'BLACK' | 'GREEN';
  isWin: boolean;
  payout: string | number;
  profit: string | number;
}

export interface RouletteBetHistoryItem {
  id: string;
  betType: 'NUMBER' | 'COLOR' | string;
  betValue: string;
  profit: string | number;
  createdAt?: string;
}

interface RouletteHistoryResponse {
  data: RouletteBetHistoryItem[];
}

export async function getRouletteSession() {
  const { data } = await api.get<RouletteSession>('/roulette/sessions/current');
  return data;
}

export async function createRouletteSession() {
  const { data } = await api.post<{ success: boolean; gameRoom: RouletteSession }>('/roulette/sessions');
  return data.gameRoom;
}

export async function finishRouletteSession(sessionId: string) {
  const { data } = await api.delete(`/roulette/sessions/${sessionId}`);
  return data;
}

export async function getRouletteHistory(limit = 8) {
  const { data } = await api.get<RouletteHistoryResponse | RouletteBetHistoryItem[]>('/roulette/history', {
    params: { page: 1, limit },
  });

  return Array.isArray(data) ? data : data.data;
}

export async function spinRoulette(sessionId: string, amount: number, choice: RouletteBetChoice, number: number) {
  const payload =
    choice === 'NUMBER'
      ? { sessionId, amount, betType: 'NUMBER', betValue: String(number) }
      : { sessionId, amount, betType: 'COLOR', betValue: choice };
  const { data } = await api.post<RouletteSpinResult>('/roulette/spin', payload);
  return data;
}
