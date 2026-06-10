export const FIGHTING_DEFAULT_HEALTH = 10;
export const FIGHTING_DEFAULT_STRIKE = 3;
export const FIGHTING_DEFAULT_BLOCK_POWER = 2;
export const FIGHTING_MOVE_TIMEOUT_MS = 20_000;

export const FIGHTING_DUEL_REQUEST_TTL_SECONDS = 10 * 60;
export const FIGHTING_ACTIVE_BATTLE_TTL_SECONDS = 30 * 60;
export const FIGHTING_FINISHED_BATTLE_TTL_SECONDS = 60 * 60;
export const FIGHTING_MATCHMAKING_TTL_SECONDS = 2 * 60;

export const FIGHTING_PENDING_DUEL_REQUESTS_KEY =
  'fighting:duel-requests:pending';
export const FIGHTING_MATCHMAKING_QUEUE_KEY = 'fighting:matchmaking:queue';

export const FIGHTING_HIT_ZONES = ['head', 'body', 'legs'] as const;
