import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageShell } from '../components/layout/PageShell';
import { ErrorState } from '../components/shared/ErrorState';
import { LoadingState } from '../components/shared/LoadingState';
import { NeonCard } from '../components/shared/NeonCard';
import { Badge } from '../components/ui/badge';
import { getErrorMessage } from '../lib/api';
import { cn } from '../lib/utils';
import { getLeaderboard, LeaderboardEntry } from '../services/leaderboardService';

function formatMoney(value: string) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return value;

  return amount.toFixed(2);
}

export function StartPage() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    getLeaderboard(5)
      .then((nextLeaders) => {
        if (mounted) setLeaders(nextLeaders);
      })
      .catch((err) => {
        if (mounted) setError(getErrorMessage(err, 'Unable to load leaderboard.'));
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <PageShell eyebrow="Home" title="WELCOME TO NEON REALMS">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <NeonCard className="p-6">
          <div className="flex min-h-52 flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-plasma">Neon Realms</p>
            <h2 className="mt-3 text-3xl font-black tracking-normal text-white sm:text-4xl">Choose your next run</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Fighting, roulette, video slots, and global chat are available from the main menu.
            </p>
          </div>
        </NeonCard>

        <NeonCard className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black tracking-normal text-white">Leaderboard</h2>
              <p className="text-sm text-slate-500">Top net profit</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-plasma/35 bg-plasma/15">
              <Trophy className="h-5 w-5 text-plasma" />
            </div>
          </div>

          {isLoading ? <LoadingState label="Loading leaders" /> : null}
          {error ? <ErrorState message={error} /> : null}

          {!isLoading && !error ? (
            <div className="space-y-2">
              {leaders.length === 0 ? (
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-500">No leaderboard entries yet.</div>
              ) : (
                leaders.map((entry) => {
                  const netProfit = Number(entry.netProfit);

                  return (
                    <div key={entry.userId} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 p-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Badge variant={entry.rank <= 3 ? 'default' : 'muted'}>#{entry.rank}</Badge>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-white">{entry.username}</p>
                          <p className="text-xs text-slate-500">{entry.betCount} bets</p>
                        </div>
                      </div>
                      <span className={cn('shrink-0 font-mono text-sm font-black', netProfit >= 0 ? 'text-green-300' : 'text-red-300')}>
                        {netProfit > 0 ? '+' : ''}
                        {formatMoney(entry.netProfit)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          ) : null}
        </NeonCard>
      </div>
    </PageShell>
  );
}
