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
import { Input } from '../components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { getErrorMessage } from '../lib/api';
import { cn } from '../lib/utils';
import {
  finishRouletteSession,
  getRouletteHistory,
  getRouletteSession,
  RouletteBetHistoryItem,
  RouletteBetChoice,
  RouletteSession,
  RouletteSpinResult,
  spinRoulette,
} from '../services/rouletteService';

const choices: RouletteBetChoice[] = ['RED', 'BLACK', 'GREEN', 'NUMBER'];

function colorFor(choice?: string) {
  if (choice === 'RED') return 'text-red-300 border-red-400/30 bg-red-500/10';
  if (choice === 'BLACK') return 'text-slate-200 border-slate-500/40 bg-slate-900/60';
  if (choice === 'GREEN') return 'text-green-300 border-green-400/30 bg-green-500/10';
  return 'text-plasma border-plasma/30 bg-plasma/10';
}

function formatHistoryChoice(item: RouletteBetHistoryItem) {
  if (item.betType === 'NUMBER') return `NUMBER ${item.betValue}`;
  return item.betValue;
}

function formatSignedProfit(value: string | number) {
  const profit = Number(value);

  if (!Number.isFinite(profit)) return String(value);

  const formatted = Number.isInteger(profit) ? String(profit) : profit.toFixed(2);
  return profit > 0 ? `+${formatted}` : formatted;
}

export function RoulettePage() {
  const [session, setSession] = useState<RouletteSession | null>(null);
  const [amount, setAmount] = useState(10);
  const [choice, setChoice] = useState<RouletteBetChoice>('RED');
  const [number, setNumber] = useState(17);
  const [displayNumber, setDisplayNumber] = useState(0);
  const [result, setResult] = useState<RouletteSpinResult | null>(null);
  const [history, setHistory] = useState<RouletteBetHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [error, setError] = useState('');
  const sessionIdRef = useRef<string | null>(null);

  const loadHistory = async () => {
    setHistory(await getRouletteHistory());
  };

  useEffect(() => {
    let mounted = true;

    const openSession = async () => {
      setError('');
      setIsLoading(true);

      try {
        const nextSession = await getRouletteSession();

        if (!mounted) {
          if (nextSession.id) void finishRouletteSession(nextSession.id).catch(() => undefined);
          return;
        }

        sessionIdRef.current = nextSession.id;
        setSession(nextSession);

        const nextHistory = await getRouletteHistory();
        if (mounted) setHistory(nextHistory);
      } catch (err) {
        if (mounted) setError(getErrorMessage(err, 'Roulette session is unavailable.'));
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void openSession();

    return () => {
      mounted = false;
      const sessionId = sessionIdRef.current;
      sessionIdRef.current = null;

      if (sessionId) {
        void finishRouletteSession(sessionId).catch(() => undefined);
      }
    };
  }, []);

  useEffect(() => {
    if (!isSpinning) return;
    const timer = window.setInterval(() => setDisplayNumber(Math.floor(Math.random() * 37)), 70);
    return () => window.clearInterval(timer);
  }, [isSpinning]);

  const spin = async () => {
    if (!session?.id) {
      setError('Roulette session is still starting.');
      return;
    }

    setError('');
    setIsSpinning(true);
    try {
      const nextResult = await spinRoulette(session.id, amount, choice, number);
      window.setTimeout(async () => {
        setResult(nextResult);
        setDisplayNumber(nextResult.result);
        setIsSpinning(false);
        await loadHistory();
      }, 650);
    } catch (err) {
      setIsSpinning(false);
      setError(getErrorMessage(err, 'Spin failed.'));
    }
  };

  const resultLabel = useMemo(() => {
    if (!result) return 'Awaiting first draw';
    return result.isWin ? `Win +${result.payout}` : `Loss ${result.profit}`;
  }, [result]);

  return (
    <PageShell eyebrow="Roulette" title="Live Number Draw" description="Fast color and number betting with a lightweight draw animation.">
      {isLoading ? <LoadingState label="Loading roulette session" /> : null}
      {error ? <ErrorState message={error} /> : null}

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <NeonCard className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black tracking-normal">Draw Chamber</h2>
              <p className="text-sm text-slate-500">{session?.id ? `Session ${session.id.slice(0, 8)}` : 'No active session'}</p>
            </div>
            <Badge variant={session?.status === 'ACTIVE' || session?.id ? 'success' : 'muted'}>{session?.status || 'standby'}</Badge>
          </div>

          <motion.div
            key={displayNumber}
            initial={{ scale: 0.82, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn('mx-auto my-10 flex h-48 w-48 items-center justify-center rounded-full border text-7xl font-black shadow-glow', colorFor(result?.resultColor))}
          >
            {displayNumber}
          </motion.div>

          <div className="flex flex-wrap justify-center gap-2">
            <StatBadge label="Color" value={result?.resultColor || '-'} />
            <StatBadge label="Payout" value={result?.payout ?? '-'} variant={result?.isWin ? 'success' : 'muted'} />
          </div>
        </NeonCard>

        <NeonCard className="p-6">
          <h2 className="text-xl font-black tracking-normal">Bet Slip</h2>
          <div className="mt-5 space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-300">Bet amount</span>
              <Input type="number" min={1} value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
            </label>

            <div className="space-y-2">
              <span className="text-sm font-semibold text-slate-300">Bet type</span>
              <Tabs value={choice} onValueChange={(value) => setChoice(value as RouletteBetChoice)}>
                <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4">
                  {choices.map((item) => (
                    <TabsTrigger key={item} value={item}>
                      {item}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-300">Number 0-36</span>
              <Input
                type="number"
                min={0}
                max={36}
                value={number}
                onChange={(event) => setNumber(Math.max(0, Math.min(36, Number(event.target.value))))}
                disabled={choice !== 'NUMBER'}
              />
            </label>

            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Result</p>
              <p className={cn('mt-1 text-2xl font-black', result?.isWin ? 'text-green-300' : 'text-slate-200')}>{resultLabel}</p>
            </div>

            <div className="grid gap-2">
              <NeonButton onClick={spin} disabled={isLoading || isSpinning || amount <= 0 || !session?.id}>
                <RotateCw className={cn('h-4 w-4', isSpinning && 'animate-spin')} />
                {isSpinning ? 'Spinning' : 'Spin'}
              </NeonButton>
            </div>
          </div>
        </NeonCard>
      </div>

      <NeonCard className="p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black tracking-normal">Recent Bets</h2>
            <p className="text-sm text-slate-500">Latest roulette results for your account.</p>
          </div>
          <Badge variant="muted">{history.length}</Badge>
        </div>

        {history.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-500">
            No bets yet.
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {history.map((item) => {
              const profit = Number(item.profit);
              const isWin = Number.isFinite(profit) && profit > 0;

              return (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-4 py-3">
                  <span className="truncate text-sm font-black text-white">{formatHistoryChoice(item)}</span>
                  <span className={cn('shrink-0 font-mono text-sm font-black', isWin ? 'text-green-300' : 'text-red-300')}>
                    {formatSignedProfit(item.profit)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </NeonCard>
    </PageShell>
  );
}
