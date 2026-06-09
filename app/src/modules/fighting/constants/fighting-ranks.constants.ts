export type FightingRank =
  | 'BRONZE'
  | 'SILVER'
  | 'GOLD'
  | 'PLATINUM'
  | 'DIAMOND';

export const FIGHTING_DEFAULT_RATING = 800;

export function getFightingRank(rating: number): FightingRank {
  if (rating >= 1600) return 'DIAMOND';
  if (rating >= 1400) return 'PLATINUM';
  if (rating >= 1200) return 'GOLD';
  if (rating >= 1000) return 'SILVER';
  return 'BRONZE';
}
