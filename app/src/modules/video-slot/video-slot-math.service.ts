import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import { randomInt } from 'node:crypto';
import {
  GAME_REELS,
  PAYLINES_CONFIG,
  PAYTABLE,
  TEST_REELS,
  VIDEO_SLOT_REELS_COUNT,
  VIDEO_SLOT_ROWS_COUNT,
  WILD_SYMBOL,
} from './constants/video-slot.constants';
import {
  CalculateWinParams,
  CalculateWinResult,
  VideoSlotGrid,
} from './types/video-slot.types';

@Injectable()
export class VideoSlotMathService {
  getReels(mode: number): number[][] {
    if (mode === 0) {
      return TEST_REELS;
    }

    return GAME_REELS;
  }

  generateGrid(mode: number): VideoSlotGrid {
    const reels = this.getReels(mode);

    return reels.map((reel) => {
      const stopIndex = randomInt(reel.length);

      return [
        reel[stopIndex],
        reel[(stopIndex + 1) % reel.length],
        reel[(stopIndex + 2) % reel.length],
      ];
    });
  }

  transposeGrid(grid: VideoSlotGrid): VideoSlotGrid {
    return Array.from({ length: VIDEO_SLOT_ROWS_COUNT }, (_row, rowIndex) =>
      Array.from(
        { length: VIDEO_SLOT_REELS_COUNT },
        (_reel, reelIndex) => grid[reelIndex][rowIndex],
      ),
    );
  }

  calculateWin(params: CalculateWinParams): CalculateWinResult {
    const bet = new Prisma.Decimal(params.bet);
    const betPerLine = bet.div(params.lines.length);
    const winningLines = [];
    let totalWin = new Prisma.Decimal(0);

    for (const lineId of params.lines) {
      const payline = PAYLINES_CONFIG.find((line) => line.id === lineId);

      if (!payline) {
        throw new BadRequestException(`Invalid payline: ${lineId}`);
      }

      const symbols = payline.rows.map(
        (rowIndex, reelIndex) => params.grid[reelIndex][rowIndex],
      );
      const result = this.calculateLineWin(symbols, betPerLine);

      if (result) {
        totalWin = totalWin.plus(result.win);
        winningLines.push({ lineId, symbols, ...result });
      }
    }

    return { totalWin, winningLines };
  }

  // This developer/admin tool verifies the math model without side effects
  simulateRtp(spins: number, bet: number, lines: number[], mode: number) {
    let totalBets = new Prisma.Decimal(0);
    let totalWins = new Prisma.Decimal(0);
    let maxWin = new Prisma.Decimal(0);
    let hits = 0;

    for (let spin = 0; spin < spins; spin += 1) {
      const grid = this.generateGrid(mode);
      const { totalWin } = this.calculateWin({ grid, lines, bet });

      totalBets = totalBets.plus(bet);
      totalWins = totalWins.plus(totalWin);

      if (totalWin.gt(0)) {
        hits += 1;
      }

      if (totalWin.gt(maxWin)) {
        maxWin = totalWin;
      }
    }

    return {
      spins,
      totalBets: totalBets.toString(),
      totalWins: totalWins.toString(),
      rtp: totalBets.gt(0) ? totalWins.div(totalBets).mul(100).toNumber() : 0,
      hitRate: (hits / spins) * 100,
      averageWin: hits > 0 ? totalWins.div(hits).toString() : '0',
      maxWin: maxWin.toString(),
      mode,
    };
  }

  private calculateLineWin(symbols: number[], betPerLine: Prisma.Decimal) {
    let targetSymbol: number | null = null;
    let matches = 0;

    for (const symbol of symbols) {
      if (targetSymbol === null) {
        if (symbol === WILD_SYMBOL) {
          matches += 1;
          continue;
        }

        targetSymbol = symbol;

        if (!PAYTABLE[targetSymbol]) {
          break;
        }

        matches += 1;
        continue;
      }

      if (symbol !== targetSymbol && symbol !== WILD_SYMBOL) {
        break;
      }

      matches += 1;
    }

    const payingSymbol = targetSymbol ?? WILD_SYMBOL;
    const paytable = PAYTABLE[payingSymbol];

    if (!paytable || matches < 3) {
      return null;
    }

    const multiplier = paytable[matches as 3 | 4 | 5];

    if (!multiplier) {
      return null;
    }

    return {
      symbol: payingSymbol,
      matches,
      multiplier,
      win: betPerLine.mul(multiplier),
    };
  }
}
