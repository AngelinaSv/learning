import { api } from '../lib/api';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  totalBets: string;
  totalWins: string;
  netProfit: string;
  betCount: number;
  lastPlayedAt?: string | null;
}

interface LeaderboardResponse {
  data: LeaderboardEntry[];
}

export async function getLeaderboard(limit = 5) {
  const { data } = await api.get<LeaderboardResponse>('/leaderboard', {
    params: { page: 1, limit },
  });

  return data.data;
}
