import { motion } from 'framer-motion';
import { RotateCw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ErrorState } from '../components/shared/ErrorState';
import { LoadingState } from '../components/shared/LoadingState';
import { NeonButton } from '../components/shared/NeonButton';
import { NeonCard } from '../components/shared/NeonCard';
import { StatBadge } from '../components/shared/StatBadge';
import { PageShell } from '../components/layout/PageShell';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { getErrorMessage } from '../lib/api';
import { cn } from '../lib/utils';
import {
  getVideoSlotSession,
  spinVideoSlot,
  startVideoSlotSession,
  VIDEO_SLOT_SESSION_STORAGE_KEY,
  VideoSlotSession,
  VideoSlotSpinResult,
} from '../services/videoSlotsService';

const symbols = ['◆', '✦', '●', '▲', '★', '7'];
const lineOptions = Array.from({ length: 15 }, (_item, index) => index + 1);
const reelCount = 5;
const rowCount = 3;
const defaultSelectedLines = [1, 2, 3, 4, 5];

function randomGrid() {
  return Array.from({ length: reelCount }, () => Array.from({ length: rowCount }, () => Math.floor(Math.random() * symbols.length)));
}

function normalizeSlotGrid(nextGrid: number[][]) {
  const isReelGrid = nextGrid.length === reelCount && nextGrid.every((column) => column.length === rowCount);
  const isRowGrid = nextGrid.length === rowCount && nextGrid.every((row) => row.length === reelCount);

  if (isReelGrid) {
    return nextGrid.map((column) => column.slice(0, rowCount));
  }

  if (isRowGrid) {
    return Array.from({ length: reelCount }, (_column, columnIndex) =>
      Array.from({ length: rowCount }, (_row, rowIndex) => nextGrid[rowIndex][columnIndex]),
    );
  }

  return randomGrid();
}

async function getOrCreateVideoSlotSession() {
  try {
    return await getVideoSlotSession();
  } catch {
    try {
      return await startVideoSlotSession();
    } catch {
      return getVideoSlotSession();
    }
  }
}

export function VideoSlotsPage() {
  const [session, setSession] = useState<VideoSlotSession | null>(null);
  const [bet, setBet] = useState(15);
  const [selectedLines, setSelectedLines] = useState<number[]>(defaultSelectedLines);
  const [grid, setGrid] = useState<number[][]>(randomGrid);
  const [result, setResult] = useState<VideoSlotSpinResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [error, setError] = useState('');
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const openSession = async () => {
      setError('');
      setIsLoading(true);

      try {
        const nextSession = await getOrCreateVideoSlotSession();

        if (!mounted) {
          return;
        }

        sessionIdRef.current = nextSession.gameId;
        sessionStorage.setItem(VIDEO_SLOT_SESSION_STORAGE_KEY, nextSession.gameId);
        setSession(nextSession);
      } catch (err) {
        if (mounted) setError(getErrorMessage(err, 'Unable to start slot session.'));
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void openSession();

    return () => {
      mounted = false;
      sessionIdRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isSpinning) return;
    const timer = window.setInterval(() => setGrid(randomGrid()), 90);
    return () => window.clearInterval(timer);
  }, [isSpinning]);

  const toggleLine = (line: number) => {
    setSelectedLines((current) => {
      if (current.includes(line)) {
        return current.filter((item) => item !== line);
      }

      return [...current, line].sort((a, b) => a - b);
    });
  };

  const spin = async () => {
    if (!session?.gameId) {
      setError('Slot session is still starting.');
      return;
    }

    if (selectedLines.length === 0) {
      setError('Choose at least one line.');
      return;
    }

    setError('');
    setIsSpinning(true);
    try {
      let activeSession = session;
      let nextResult: VideoSlotSpinResult;

      try {
        nextResult = await spinVideoSlot(activeSession.gameId, bet, selectedLines);
      } catch (err) {
        const message = getErrorMessage(err);
        const sessionMissing =
          message.includes('Active video slot session not found') || message.includes('Video slot sessionId mismatch');

        if (!sessionMissing) {
          throw err;
        }

        activeSession = await getOrCreateVideoSlotSession();
        sessionIdRef.current = activeSession.gameId;
        sessionStorage.setItem(VIDEO_SLOT_SESSION_STORAGE_KEY, activeSession.gameId);
        setSession(activeSession);
        nextResult = await spinVideoSlot(activeSession.gameId, bet, selectedLines);
      }

      window.setTimeout(() => {
        setResult(nextResult);
        setGrid(normalizeSlotGrid(nextResult.grid));
        setSession((current) =>
          current
            ? {
                ...current,
                totalSpins: nextResult.sessionStats.totalSpins,
                totalBets: nextResult.sessionStats.totalBets,
                totalWins: nextResult.sessionStats.totalWins,
              }
            : current,
        );
        setIsSpinning(false);
      }, 700);
    } catch (err) {
      setIsSpinning(false);
      setError(getErrorMessage(err, 'Spin failed.'));
    }
  };

  const lastWin = useMemo(() => result?.totalWin ?? '0', [result]);
  const totalWin = useMemo(() => session?.totalWins ?? result?.sessionStats.totalWins ?? '0', [result, session?.totalWins]);
  const displayGrid = useMemo(() => normalizeSlotGrid(grid), [grid]);
  const betIsDivisibleByLines = selectedLines.length > 0 && bet % selectedLines.length === 0;

  return (
    <PageShell eyebrow="Video Slots" title="Video Slots" description="Five-column slot board with automatic session handling and lightweight reel animation.">
      {isLoading ? <LoadingState label="Starting slot session" /> : null}
      {error ? <ErrorState message={error} /> : null}

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <NeonCard className="p-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black tracking-normal">Slot Machine</h2>
              <p className="text-sm text-slate-500">{session?.gameId ? `Session ${session.gameId.slice(0, 8)}` : 'No active session'}</p>
            </div>
            <Badge variant={session ? 'success' : 'muted'}>{session?.status || 'standby'}</Badge>
          </div>

          <div className="grid grid-cols-5 gap-3 rounded-lg border border-white/10 bg-black/25 p-3">
            {displayGrid.map((column, columnIndex) => (
              <div key={columnIndex} className="grid grid-rows-3 gap-3">
                {column.map((symbol, rowIndex) => (
                  <motion.div
                    key={`${columnIndex}-${rowIndex}-${symbol}-${isSpinning}`}
                    initial={{ opacity: 0.55, y: isSpinning ? -10 : 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex aspect-square items-center justify-center rounded-lg border border-white/10 bg-[#211033] text-3xl font-black shadow-inner sm:text-4xl',
                      result?.winningLines?.some((line) => line.symbol === symbol) ? 'text-plasma shadow-glow' : 'text-white',
                    )}
                  >
                    {symbols[symbol] ?? symbols[0]}
                  </motion.div>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-4">
            <StatBadge label="Last Win" value={lastWin} variant={Number(lastWin) > 0 ? 'success' : 'muted'} />
            <StatBadge label="Total Win" value={totalWin} variant={Number(totalWin) > 0 ? 'success' : 'muted'} />
            <StatBadge label="Spins" value={session?.totalSpins ?? result?.sessionStats.totalSpins ?? 0} />
            <StatBadge label="Bets" value={session?.totalBets ?? '0'} variant="muted" />
          </div>
        </NeonCard>

        <NeonCard className="p-6">
          <h2 className="text-xl font-black tracking-normal">Spin Controls</h2>
          <div className="mt-5 space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-300">Bet amount</span>
              <Input type="number" min={1} value={bet} onChange={(event) => setBet(Number(event.target.value))} />
            </label>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-300">Lines</span>
                <Badge variant={selectedLines.length ? 'secondary' : 'danger'}>{selectedLines.length} selected</Badge>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {lineOptions.map((value) => {
                  const isSelected = selectedLines.includes(value);

                  return (
                    <Button
                      key={value}
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      aria-pressed={isSelected}
                      onClick={() => toggleLine(value)}
                      disabled={isSpinning}
                      className="h-10 px-0"
                    >
                      {value}
                    </Button>
                  );
                })}
              </div>
              {!betIsDivisibleByLines ? (
                <p className="text-xs font-semibold text-red-200">Bet must be divisible by selected lines.</p>
              ) : null}
            </div>

            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Winning lines</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {result?.winningLines?.length ? (
                  result.winningLines.map((line) => (
                    <Badge key={line.lineId} variant="success">
                      Line {line.lineId}: +{line.win}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">None yet.</span>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <NeonButton
                onClick={spin}
                disabled={isLoading || isSpinning || bet <= 0 || !session?.gameId || selectedLines.length === 0 || !betIsDivisibleByLines}
              >
                <RotateCw className={cn('h-4 w-4', isSpinning && 'animate-spin')} />
                {isSpinning ? 'Spinning' : 'Spin'}
              </NeonButton>
            </div>
          </div>
        </NeonCard>
      </div>
    </PageShell>
  );
}
