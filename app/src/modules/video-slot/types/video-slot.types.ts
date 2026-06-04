import { Prisma } from '@generated/prisma/client';

export type VideoSlotGrid = number[][];

export type VideoSlotWinningLine = {
  lineId: number;
  symbols: number[];
  symbol: number;
  matches: number;
  multiplier: number;
  win: Prisma.Decimal;
};

export type CalculateWinParams = {
  grid: VideoSlotGrid;
  lines: number[];
  bet: Prisma.Decimal | number | string;
};

export type CalculateWinResult = {
  totalWin: Prisma.Decimal;
  winningLines: VideoSlotWinningLine[];
};

export type VideoSlotSession = {
  gameId: string;
  userId: string;
  mode: number;
  totalSpins: number;
  totalBets: string;
  totalWins: string;
  createdAt: string;
};
