import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Radio, Shield, Sparkles, Swords, UserRound, Zap } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { ErrorState } from '../components/shared/ErrorState';
import { GameLog, type GameLogEntry } from '../components/shared/GameLog';
import { HealthBar } from '../components/shared/HealthBar';
import { LoadingState } from '../components/shared/LoadingState';
import { NeonButton } from '../components/shared/NeonButton';
import { NeonCard } from '../components/shared/NeonCard';
import { StatBadge } from '../components/shared/StatBadge';
import { PageShell } from '../components/layout/PageShell';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { FIGHTING_WS_URL, getErrorMessage } from '../lib/api';
import { getAccessToken } from '../lib/auth';
import { cn, formatTime } from '../lib/utils';
import {
  FightingBattleRoom,
  FightingHero,
  FightingHitZone,
  FightingMatchFoundEvent,
  FightingMatchmakingWaitingEvent,
  FightingProfile,
  FightingRoundResult,
  getFightingBattle,
  getFightingHeroes,
  getFightingProfile,
  selectFightingHero,
} from '../services/fightingService';

type ArenaState = 'idle' | 'searching' | 'matched' | 'inBattle' | 'battleFinished';
type SocketState = 'offline' | 'connecting' | 'connected';
type BattleMaxHealth = { battleId?: string; player1?: number; player2?: number };
type FighterStatsView = {
  maxHealth?: number;
  strike?: number;
  blockPower?: number;
  heroId?: string;
  heroName?: string;
};

const zoneLabels: FightingHitZone[] = ['head', 'body', 'legs'];

function newLog(message: string, tone: GameLogEntry['tone'] = 'default'): GameLogEntry {
  return { id: crypto.randomUUID(), time: formatTime(), message, tone };
}

function getPlayerMax(battle: FightingBattleRoom | null, side: 'player1' | 'player2', fallbackMaxHealth?: number) {
  const stats = side === 'player1' ? battle?.player1Stats : battle?.player2Stats;
  const health = side === 'player1' ? battle?.player1Health : battle?.player2Health;
  return stats?.maxHealth || fallbackMaxHealth || Math.max(health || 0, 1);
}

function describeMove(move?: { attackZone: FightingHitZone; defenseZone: FightingHitZone }) {
  return move ? `attacked ${move.attackZone} and defended ${move.defenseZone}` : 'move unavailable';
}

function normalizeBattleState(battleState: FightingBattleRoom, battleId?: string): FightingBattleRoom {
  return {
    ...battleState,
    id: battleState.id || battleId || '',
  };
}

function heroToStats(hero?: FightingHero): FighterStatsView | undefined {
  if (!hero) return undefined;

  return {
    maxHealth: hero.maxHealth,
    strike: hero.strike,
    blockPower: hero.blockPower,
    heroId: hero.id,
    heroName: hero.name,
  };
}

function inferHero(
  heroes: FightingHero[],
  stats: FighterStatsView | undefined,
  maxHealth: number | undefined,
) {
  if (stats?.heroId) {
    const byId = heroes.find((hero) => hero.id === stats.heroId);
    if (byId) return byId;
  }

  if (stats?.heroName) {
    const byName = heroes.find((hero) => hero.name === stats.heroName);
    if (byName) return byName;
  }

  const hp = stats?.maxHealth ?? maxHealth;
  return heroes.find((hero) => hero.maxHealth === hp);
}

function HeroMiniCard({
  hero,
  active,
  disabled,
  onSelect,
}: {
  hero: FightingHero;
  active: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled || active}
      className={cn(
        'rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:border-plasma/60 hover:bg-plasma/10 disabled:cursor-not-allowed disabled:opacity-60',
        active ? 'border-plasma/50 bg-plasma/15 shadow-glow' : 'border-white/10 bg-white/[0.03]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-white">{hero.name}</p>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-400">{hero.description}</p>
        </div>
        {active ? <Badge variant="success">Active</Badge> : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <StatBadge label="HP" value={hero.maxHealth} variant="success" />
        <StatBadge label="ATK" value={hero.strike} />
        <StatBadge label="DEF" value={hero.blockPower} variant="muted" />
      </div>
    </button>
  );
}

function FighterPanel({
  side,
  label,
  name,
  health,
  maxHealth,
  stats,
  damage,
}: {
  side: 'left' | 'right';
  label: string;
  name: string;
  health: number;
  maxHealth: number;
  stats?: FighterStatsView;
  damage?: number;
}) {
  return (
    <motion.div
      animate={damage ? { x: [0, side === 'left' ? -8 : 8, 7, 0] } : { x: 0 }}
      transition={{ duration: 0.35 }}
      className="relative"
    >
      <NeonCard className="overflow-hidden p-5" interactive>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">{label}</p>
            <h2 className="mt-1 text-2xl font-black tracking-normal">{name}</h2>
            <p className="text-sm text-slate-400">{stats?.heroName || 'Arena combatant'}</p>
          </div>
          <Badge variant={health <= 0 ? 'danger' : 'success'}>{health <= 0 ? 'Down' : 'Ready'}</Badge>
        </div>

        <div className="my-5 flex justify-center">
          <div className="relative h-44 w-full max-w-56 overflow-hidden rounded-lg border border-white/10 bg-[#211033]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(255,59,212,0.28),transparent_42%),radial-gradient(circle_at_50%_80%,rgba(139,92,246,0.25),transparent_38%)]" />
            <div className="absolute left-1/2 top-8 h-16 w-16 -translate-x-1/2 rounded-full border border-white/15 bg-black/30 shadow-glow" />
            <div className="absolute bottom-7 left-1/2 h-24 w-28 -translate-x-1/2 rounded-t-full border border-white/15 bg-black/35" />
            <Swords className="absolute bottom-8 left-1/2 h-16 w-16 -translate-x-1/2 text-plasma/80" />
          </div>
        </div>

        <HealthBar value={health} max={maxHealth} />

        <div className="mt-4 flex flex-wrap gap-2">
          <StatBadge label="ATK" value={stats?.strike ?? '-'} />
          <StatBadge label="DEF" value={stats?.blockPower ?? '-'} variant="muted" />
          <StatBadge label="MAX" value={maxHealth} variant="success" />
        </div>
      </NeonCard>

      <AnimatePresence>
        {damage ? (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: -28, scale: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2 text-3xl font-black text-red-300 drop-shadow-[0_0_18px_rgba(239,68,68,0.65)]"
          >
            -{damage}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export function FightingPage() {
  const token = getAccessToken();
  const socketRef = useRef<Socket | null>(null);
  const joinedBattleRef = useRef<string | null>(null);
  const battleRef = useRef<FightingBattleRoom | null>(null);
  const currentUserIdRef = useRef<string | undefined>(undefined);
  const [arenaState, setArenaState] = useState<ArenaState>('idle');
  const [profile, setProfile] = useState<FightingProfile | null>(null);
  const [heroes, setHeroes] = useState<FightingHero[]>([]);
  const [battle, setBattle] = useState<FightingBattleRoom | null>(null);
  const [battleMaxHealth, setBattleMaxHealth] = useState<BattleMaxHealth>({});
  const [battleId, setBattleId] = useState<string | null>(null);
  const [attackZone, setAttackZone] = useState<FightingHitZone>('head');
  const [defenseZone, setDefenseZone] = useState<FightingHitZone>('body');
  const [moveLockedRound, setMoveLockedRound] = useState<number | null>(null);
  const [queuedAt, setQueuedAt] = useState<string | null>(null);
  const [logs, setLogs] = useState<GameLogEntry[]>([newLog('Arena interface online.', 'muted')]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelectingHero, setIsSelectingHero] = useState(false);
  const [error, setError] = useState('');
  const [socketState, setSocketState] = useState<SocketState>('offline');
  const [damage, setDamage] = useState<{ left?: number; right?: number }>({});

  useEffect(() => {
    battleRef.current = battle;
  }, [battle]);

  useEffect(() => {
    currentUserIdRef.current = profile?.userId;
  }, [profile?.userId]);

  const addLog = useCallback((message: string, tone?: GameLogEntry['tone']) => {
    setLogs((current) => [newLog(message, tone), ...current].slice(0, 50));
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const nextProfile = await getFightingProfile();
      setProfile(nextProfile);
    } catch (err) {
      addLog(getErrorMessage(err, 'Unable to refresh rating.'), 'danger');
    }
  }, [addLog]);

  const rememberBattleMaxHealth = useCallback((nextBattle: FightingBattleRoom) => {
    setBattleMaxHealth((current) => {
      if (current.battleId === nextBattle.id) {
        return current;
      }

      return {
        battleId: nextBattle.id,
        player1: nextBattle.player1Stats?.maxHealth ?? Math.max(nextBattle.player1Health, 1),
        player2: nextBattle.player2Stats?.maxHealth ?? Math.max(nextBattle.player2Health, 1),
      };
    });
  }, []);

  const hydrateBattle = useCallback(
    async (nextBattleId: string, fallbackBattle?: FightingBattleRoom) => {
      try {
        const fullBattle = await getFightingBattle(nextBattleId);
        const normalizedBattle = normalizeBattleState(fullBattle, nextBattleId);
        rememberBattleMaxHealth(normalizedBattle);
        setBattle(normalizedBattle);
        setBattleId(normalizedBattle.id || nextBattleId);
      } catch (err) {
        if (fallbackBattle) {
          const normalizedBattle = normalizeBattleState(fallbackBattle, nextBattleId);
          rememberBattleMaxHealth(normalizedBattle);
          setBattle(normalizedBattle);
        }

        addLog(getErrorMessage(err, 'Unable to load full battle state.'), 'danger');
      }
    },
    [addLog, rememberBattleMaxHealth],
  );

  useEffect(() => {
    let mounted = true;

    async function load() {
      setIsLoading(true);
      setError('');

      try {
        const [nextProfile, nextHeroes] = await Promise.all([getFightingProfile(), getFightingHeroes()]);
        if (!mounted) return;
        setProfile(nextProfile);
        setHeroes(nextHeroes);
      } catch (err) {
        if (!mounted) return;
        setError(getErrorMessage(err, 'Fighting profile is unavailable. The arena UI can still render safely.'));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setSocketState('offline');
      return;
    }

    setSocketState('connecting');
    const socket = io(FIGHTING_WS_URL, {
      auth: { token },
      extraHeaders: { Authorization: `Bearer ${token}` },
      transports: ['websocket'],
    });

    socketRef.current = socket;
    socket.on('connect', () => {
      setSocketState('connected');
      addLog('Connected to fighting realtime.', 'success');
    });
    socket.on('disconnect', () => {
      setSocketState('offline');
      addLog('Fighting realtime disconnected.', 'muted');
    });
    socket.on('fightingMatchmakingWaiting', (payload: FightingMatchmakingWaitingEvent) => {
      setArenaState('searching');
      setQueuedAt(payload.queuedAt);
      addLog('Searching for opponent...', 'muted');
    });
    socket.on('fightingMatchmakingCancelled', () => {
      setArenaState('idle');
      setQueuedAt(null);
      addLog('Search cancelled.', 'muted');
    });
    socket.on('fightingMatchFound', (payload: FightingMatchFoundEvent) => {
      setArenaState('matched');
      setBattleId(payload.battleId);
      joinedBattleRef.current = payload.battleId;
      const nextBattle = normalizeBattleState(payload.battleState, payload.battleId);
      rememberBattleMaxHealth(nextBattle);
      setBattle(nextBattle);
      setMoveLockedRound(null);
      addLog(`Match found. Joining battle ${payload.battleId.slice(0, 8)}.`, 'success');
      void hydrateBattle(payload.battleId, nextBattle);
      socket.emit('joinFightingBattle', { battleId: payload.battleId });
    });
    socket.on('fightingBattleState', (nextBattle: FightingBattleRoom) => {
      const roomId = nextBattle.id || joinedBattleRef.current || '';
      const normalizedBattle = normalizeBattleState(nextBattle, roomId);
      rememberBattleMaxHealth(normalizedBattle);
      setBattle(normalizedBattle);
      setBattleId(roomId || null);
      setArenaState(nextBattle.status === 'finished' ? 'battleFinished' : 'inBattle');
      joinedBattleRef.current = roomId || null;
      addLog(`Battle room ${roomId ? roomId.slice(0, 8) : 'ready'} joined.`, 'success');
      if (roomId) {
        void hydrateBattle(roomId, normalizedBattle);
      }
    });
    socket.on('fightingPlayerMoved', (payload: { playerId?: string }) => {
      addLog(
        payload?.playerId && payload.playerId !== currentUserIdRef.current
          ? 'Rival locked their move.'
          : 'Move submitted.',
        'muted',
      );
    });
    socket.on('fightingRoundResult', (result: FightingRoundResult) => {
      setBattle((current) =>
        current
          ? {
              ...current,
              currentRound: result.round + 1,
              player1Health: result.player1HealthAfter,
              player2Health: result.player2HealthAfter,
              lastRoundResult: result,
              status: result.isFinished ? 'finished' : current.status,
            }
          : current,
      );
      const currentBattle = battleRef.current;
      const isPlayer2 = Boolean(currentUserIdRef.current && currentBattle?.player2Id === currentUserIdRef.current);
      setDamage(
        isPlayer2
          ? { left: result.player2DamageTaken, right: result.player1DamageTaken }
          : { left: result.player1DamageTaken, right: result.player2DamageTaken },
      );
      window.setTimeout(() => setDamage({}), 900);
      setMoveLockedRound(null);
      const yourMove = isPlayer2 ? result.player2Move : result.player1Move;
      const rivalMove = isPlayer2 ? result.player1Move : result.player2Move;
      const yourDamage = isPlayer2 ? result.player2DamageTaken : result.player1DamageTaken;
      const rivalDamage = isPlayer2 ? result.player1DamageTaken : result.player2DamageTaken;
      addLog(
        `Round ${result.round}: You ${describeMove(yourMove)}; Rival ${describeMove(rivalMove)}. Damage: You ${yourDamage}, Rival ${rivalDamage}.`,
        result.isFinished ? 'success' : 'default',
      );
      if (result.isFinished) {
        void refreshProfile();
      }
      setArenaState(result.isFinished ? 'battleFinished' : 'inBattle');
    });
    socket.on('fightingBattleFinished', (payload) => {
      setBattle((current) =>
        current
          ? {
              ...current,
              status: 'finished',
              result: payload.result,
              winnerId: payload.winnerId,
              player1Health: payload.finalHealth.player1,
              player2Health: payload.finalHealth.player2,
              roundResults: payload.roundResults,
            }
          : current,
      );
      setArenaState('battleFinished');
      setMoveLockedRound(null);
      void refreshProfile();
      const currentBattle = battleRef.current;
      const isPlayer2 = Boolean(currentUserIdRef.current && currentBattle?.player2Id === currentUserIdRef.current);
      const yourFinalHp = isPlayer2 ? payload.finalHealth.player2 : payload.finalHealth.player1;
      const rivalFinalHp = isPlayer2 ? payload.finalHealth.player1 : payload.finalHealth.player2;
      addLog(
        payload.winnerId
          ? payload.winnerId === currentUserIdRef.current
            ? `Battle finished. You won. Final HP: You ${yourFinalHp}, Rival ${rivalFinalHp}. Total rounds: ${payload.totalRounds}.`
            : `Battle finished. You lost. Final HP: You ${yourFinalHp}, Rival ${rivalFinalHp}. Total rounds: ${payload.totalRounds}.`
          : `Battle finished as a draw. Final HP: You ${yourFinalHp}, Rival ${rivalFinalHp}. Total rounds: ${payload.totalRounds}.`,
        'success',
      );
    });
    socket.on('fightingBattleError', (payload) => {
      const message = payload?.message || 'Battle socket error.';
      setError(message);
      addLog(message, 'danger');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [addLog, hydrateBattle, refreshProfile, rememberBattleMaxHealth, token]);

  const playerSides = useMemo(() => {
    const isPlayer2 = profile?.userId && battle?.player2Id === profile.userId;
    return {
      leftSide: isPlayer2 ? 'player2' : 'player1',
      rightSide: isPlayer2 ? 'player1' : 'player2',
    } as const;
  }, [battle?.player2Id, profile?.userId]);

  const activeHero = profile?.hero || heroes.find((hero) => hero.id === profile?.selectedHero);
  const canChangeHero = arenaState === 'idle';
  const currentRound = battle?.currentRound ?? 1;
  const moveLocked = moveLockedRound === currentRound && arenaState === 'inBattle';
  const moveControlsDisabled = arenaState !== 'inBattle' || moveLocked || battle?.status === 'finished' || socketState !== 'connected';

  const selectHero = async (heroId: string) => {
    if (!canChangeHero) return;
    setIsSelectingHero(true);
    setError('');

    try {
      const nextProfile = await selectFightingHero(heroId);
      setProfile(nextProfile);
      addLog(`Selected ${nextProfile.hero?.name || heroId}.`, 'success');
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to select hero.'));
    } finally {
      setIsSelectingHero(false);
    }
  };

  const findOpponent = () => {
    setError('');
    setArenaState('searching');
    setQueuedAt(new Date().toISOString());
    addLog('Searching for opponent...', 'muted');
    socketRef.current?.emit('findFightingOpponent', {});
  };

  const cancelSearch = () => {
    socketRef.current?.emit('cancelFightingMatchmaking', {});
    setArenaState('idle');
    setQueuedAt(null);
    addLog('Search cancelled.', 'muted');
  };

  const lockMove = () => {
    if (!battleId || moveControlsDisabled) return;
    socketRef.current?.emit(
      'makeFightingMove',
      {
        battleId,
        attackZone,
        defenseZone,
      },
      (response: { status?: string; message?: string }) => {
        if (response?.status === 'success') {
          setMoveLockedRound(currentRound);
          addLog('Move locked. Waiting for opponent...', 'success');
          return;
        }

        const message = response?.message || 'Move was not accepted.';
        setError(message);
        addLog(message, 'danger');
      },
    );
  };

  const findNewOpponent = () => {
    setBattle(null);
    setBattleMaxHealth({});
    setBattleId(null);
    setDamage({});
    setMoveLockedRound(null);
    joinedBattleRef.current = null;
    findOpponent();
  };

  const leftKey = playerSides.leftSide;
  const rightKey = playerSides.rightSide;
  const leftHealth = battle ? (leftKey === 'player1' ? battle.player1Health : battle.player2Health) : activeHero?.maxHealth ?? 10;
  const rightHealth = battle ? (rightKey === 'player1' ? battle.player1Health : battle.player2Health) : 10;
  const leftBattleStats = battle ? (leftKey === 'player1' ? battle.player1Stats : battle.player2Stats) : undefined;
  const rightBattleStats = battle ? (rightKey === 'player1' ? battle.player1Stats : battle.player2Stats) : undefined;
  const rightMaxHealth = battleMaxHealth[rightKey] || (battle ? rightHealth : undefined);
  const inferredRivalHero = inferHero(heroes, rightBattleStats, rightMaxHealth);
  const leftStats = leftBattleStats || heroToStats(activeHero);
  const rightStats = rightBattleStats || heroToStats(inferredRivalHero);
  const leftName = leftStats?.heroName || activeHero?.name || 'Your Fighter';
  const rightName = rightStats?.heroName || inferredRivalHero?.name || 'Rival Fighter';
  const lastRound = battle?.lastRoundResult;
  const lastRoundIsPlayer2 = Boolean(profile?.userId && battle?.player2Id === profile.userId);
  const lastRoundYourMove = lastRoundIsPlayer2 ? lastRound?.player2Move : lastRound?.player1Move;
  const lastRoundRivalMove = lastRoundIsPlayer2 ? lastRound?.player1Move : lastRound?.player2Move;
  const lastRoundYourDamage = lastRoundIsPlayer2 ? lastRound?.player2DamageTaken : lastRound?.player1DamageTaken;
  const lastRoundRivalDamage = lastRoundIsPlayer2 ? lastRound?.player1DamageTaken : lastRound?.player2DamageTaken;
  const battleOutcome = useMemo(() => {
    if (arenaState !== 'battleFinished') return arenaState;
    if (!battle?.winnerId) return 'Draw';
    return battle.winnerId === profile?.userId ? 'You won' : 'You lost';
  }, [arenaState, battle?.winnerId, profile?.userId]);

  return (
    <PageShell
      eyebrow="Fighting"
      title="Arena Duel"
      description="Select your hero, find an opponent through realtime matchmaking, then lock attack and guard zones each round."
      actions={
        <Badge variant={socketState === 'connected' ? 'success' : socketState === 'connecting' ? 'secondary' : 'muted'}>
          <Radio className="mr-1 h-3 w-3" />
          {socketState}
        </Badge>
      }
    >
      {isLoading ? <LoadingState label="Loading fighter profile" /> : null}
      {error ? <ErrorState message={error} /> : null}

      <Tabs defaultValue="battle" className="space-y-5">
        <TabsList>
          <TabsTrigger value="battle">Battle</TabsTrigger>
          <TabsTrigger value="heroes">Heroes</TabsTrigger>
        </TabsList>

        <TabsContent value="battle" className="space-y-5">
          <NeonCard className="p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-plasma/40 bg-plasma/15 shadow-glow">
                  <UserRound className="h-8 w-8 text-plasma" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Selected Hero</p>
                  <h2 className="text-2xl font-black tracking-normal">{activeHero?.name || 'No hero selected'}</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <StatBadge label="Rank" value={profile?.rank || '-'} />
                    <StatBadge label="Rating" value={profile?.rating ?? '-'} variant="secondary" />
                    <StatBadge label="W/L/D" value={`${profile?.wins ?? 0}/${profile?.losses ?? 0}/${profile?.draws ?? 0}`} variant="muted" />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                {arenaState === 'idle' ? (
                  <NeonButton onClick={findOpponent} disabled={socketState !== 'connected' || !activeHero}>
                    <Swords className="h-4 w-4" />
                    Find Opponent
                  </NeonButton>
                ) : null}
                {arenaState === 'searching' ? (
                  <Button variant="danger" onClick={cancelSearch}>
                    Cancel Search
                  </Button>
                ) : null}
                {arenaState === 'battleFinished' ? (
                  <NeonButton onClick={findNewOpponent} disabled={socketState !== 'connected'}>
                    <Swords className="h-4 w-4" />
                    Find New Opponent
                  </NeonButton>
                ) : null}
              </div>
            </div>
          </NeonCard>

          {arenaState === 'searching' ? (
            <NeonCard className="p-8 text-center">
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.72, 1, 0.72] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-plasma/40 bg-plasma/15 shadow-glow"
              >
                <Loader2 className="h-9 w-9 animate-spin text-plasma" />
              </motion.div>
              <h2 className="mt-5 text-2xl font-black tracking-normal">Searching for opponent...</h2>
              <p className="mt-2 text-sm text-slate-400">
                {queuedAt ? `Queued at ${formatTime(queuedAt)}.` : 'Waiting for matchmaking.'}
              </p>
            </NeonCard>
          ) : null}

          {arenaState === 'matched' ? (
            <NeonCard className="p-8 text-center">
              <Sparkles className="mx-auto h-10 w-10 text-plasma" />
              <h2 className="mt-4 text-2xl font-black tracking-normal">Match found</h2>
              <p className="mt-2 text-sm text-slate-400">Joining the battle room...</p>
            </NeonCard>
          ) : null}

          {(arenaState === 'idle' || arenaState === 'inBattle' || arenaState === 'battleFinished') && (
            <div className="grid gap-5 xl:grid-cols-[1fr_18rem_1fr]">
              <FighterPanel
                side="left"
                label="You"
                name={leftName}
                health={leftHealth}
                maxHealth={getPlayerMax(battle, leftKey, battleMaxHealth[leftKey] || activeHero?.maxHealth)}
                stats={leftStats}
                damage={damage.left}
              />

              <NeonCard className="flex flex-col justify-between p-5 text-center">
                <div>
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-plasma/40 bg-plasma/15 text-2xl font-black shadow-glow">
                    VS
                  </div>
                  <p className="mt-4 text-sm text-slate-400">Current round</p>
                  <p className="text-4xl font-black">{currentRound}</p>
                  <p className="mt-1 text-sm text-slate-500">{arenaState}</p>
                </div>

                <Separator className="my-5" />

                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Selected attack zone</p>
                    <Tabs value={attackZone} onValueChange={(value) => setAttackZone(value as FightingHitZone)}>
                      <TabsList className="w-full">
                        {zoneLabels.map((zone) => (
                          <TabsTrigger key={zone} value={zone} disabled={moveControlsDisabled} className="flex-1 capitalize">
                            {zone}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Selected defense zone</p>
                    <Tabs value={defenseZone} onValueChange={(value) => setDefenseZone(value as FightingHitZone)}>
                      <TabsList className="w-full">
                        {zoneLabels.map((zone) => (
                          <TabsTrigger key={zone} value={zone} disabled={moveControlsDisabled} className="flex-1 capitalize">
                            {zone}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>
                </div>

                <div className="mt-5 grid gap-2">
                  <NeonButton onClick={lockMove} disabled={moveControlsDisabled}>
                    <Zap className="h-4 w-4" />
                    Lock Move
                  </NeonButton>
                  {moveLocked ? <p className="text-sm font-semibold text-green-300">Move locked. Waiting for opponent...</p> : null}
                  {arenaState === 'battleFinished' ? (
                    <div className="rounded-lg border border-green-400/20 bg-green-500/10 p-3 text-sm text-green-100">
                      {battleOutcome}
                    </div>
                  ) : null}
                </div>
              </NeonCard>

              <FighterPanel
                side="right"
                label="Rival"
                name={rightName}
                health={rightHealth}
                maxHealth={getPlayerMax(battle, rightKey, battleMaxHealth[rightKey])}
                stats={rightStats}
                damage={damage.right}
              />
            </div>
          )}

          {lastRound ? (
            <NeonCard className="p-5">
              <div className="mb-4 flex items-center gap-3">
                <Shield className="h-5 w-5 text-rune" />
                <h2 className="text-xl font-black tracking-normal">Last Round Reveal</h2>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">You</p>
                  <p className="mt-2 text-sm text-slate-200">{describeMove(lastRoundYourMove)}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Rival</p>
                  <p className="mt-2 text-sm text-slate-200">{describeMove(lastRoundRivalMove)}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Damage</p>
                  <p className="mt-2 text-sm text-slate-200">
                    You took {lastRoundYourDamage}; Rival took {lastRoundRivalDamage}
                  </p>
                </div>
              </div>
            </NeonCard>
          ) : null}

          <NeonCard className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black tracking-normal">Round Log</h2>
                <p className="text-sm text-slate-500">{battle ? 'Active duel' : 'No active battle'}</p>
              </div>
              <Badge variant={arenaState === 'battleFinished' ? 'danger' : arenaState === 'inBattle' ? 'success' : 'secondary'}>
                {battleOutcome}
              </Badge>
            </div>
            <GameLog entries={logs} />
          </NeonCard>
        </TabsContent>

        <TabsContent value="heroes">
          <NeonCard className="p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black tracking-normal">Heroes</h2>
                <p className="text-sm text-slate-500">
                  Pick your active hero before matchmaking. Selection is disabled during active battles.
                </p>
              </div>
              <Badge variant={canChangeHero ? 'success' : 'muted'}>{canChangeHero ? 'Editable' : 'Locked'}</Badge>
            </div>
            {heroes.length === 0 ? (
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-500">No heroes loaded.</div>
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                {heroes.map((hero) => (
                  <HeroMiniCard
                    key={hero.id}
                    hero={hero}
                    active={hero.id === profile?.selectedHero}
                    disabled={!canChangeHero || isSelectingHero}
                    onSelect={() => selectHero(hero.id)}
                  />
                ))}
              </div>
            )}
          </NeonCard>
        </TabsContent>
      </Tabs>

      {arenaState === 'idle' && !isLoading ? (
        <div className="sr-only">
          Normal flow: Select hero, Find Opponent, Match found automatically, Fight, Result, Find New Opponent.
        </div>
      ) : null}
    </PageShell>
  );
}
