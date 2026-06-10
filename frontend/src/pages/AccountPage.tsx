import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CircleDollarSign,
  Mail,
  RefreshCw,
  Save,
  ShieldCheck,
  Star,
  UserRound,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageShell } from '../components/layout/PageShell';
import { ErrorState } from '../components/shared/ErrorState';
import { LoadingState } from '../components/shared/LoadingState';
import { NeonCard } from '../components/shared/NeonCard';
import { StatBadge } from '../components/shared/StatBadge';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { getErrorMessage } from '../lib/api';
import { updateStoredUser } from '../lib/auth';
import {
  AccountUser,
  depositToWallet,
  getCurrentUser,
  getWalletBalance,
  updateCurrentUser,
  WalletBalance,
  withdrawFromWallet,
} from '../services/accountService';

function formatBalance(value?: string | number, currency = 'UAH') {
  const numericValue = Number(value ?? 0);

  if (!Number.isFinite(numericValue)) {
    return `${value ?? '0'} ${currency}`;
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue) + ` ${currency}`;
}

export function AccountPage() {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [isWalletActionLoading, setIsWalletActionLoading] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState('');
  const [depositAmount, setDepositAmount] = useState('100');
  const [withdrawAmount, setWithdrawAmount] = useState('50');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadAccount = async (refreshing = false) => {
    setError('');
    setSuccess('');
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [nextUser, nextWallet] = await Promise.all([getCurrentUser(), getWalletBalance()]);
      setUser(nextUser);
      setUsernameDraft(nextUser.username || '');
      setWallet(nextWallet);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load account information.'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const reloadWallet = async () => {
    setWallet(await getWalletBalance());
  };

  const saveUsername = async (event: FormEvent) => {
    event.preventDefault();
    const nextUsername = usernameDraft.trim();

    if (!nextUsername) {
      setError('Username cannot be empty.');
      return;
    }

    setError('');
    setSuccess('');
    setIsSavingUsername(true);

    try {
      const nextUser = await updateCurrentUser(nextUsername);
      setUser(nextUser);
      setUsernameDraft(nextUser.username || '');
      updateStoredUser({ username: nextUser.username, email: nextUser.email });
      setSuccess('Username updated.');
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to update username.'));
    } finally {
      setIsSavingUsername(false);
    }
  };

  const runWalletAction = async (type: 'deposit' | 'withdraw') => {
    const rawAmount = type === 'deposit' ? depositAmount : withdrawAmount;
    const amount = Number(rawAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter an amount greater than 0.');
      return;
    }

    setError('');
    setSuccess('');
    setIsWalletActionLoading(true);

    try {
      if (type === 'deposit') {
        await depositToWallet(amount);
        setSuccess('Deposit completed.');
      } else {
        await withdrawFromWallet(amount);
        setSuccess('Withdrawal completed.');
      }
      await reloadWallet();
    } catch (err) {
      setError(getErrorMessage(err, type === 'deposit' ? 'Deposit failed.' : 'Withdrawal failed.'));
    } finally {
      setIsWalletActionLoading(false);
    }
  };

  useEffect(() => {
    void loadAccount();
  }, []);

  const initials = useMemo(() => {
    const source = user?.username || user?.email || 'Player';
    return source.slice(0, 2).toUpperCase();
  }, [user?.email, user?.username]);
  const hasAccountData = Boolean(user && wallet);

  return (
    <PageShell
      eyebrow="Account"
      title="Player Account"
      description="Your profile details and current wallet balance."
      actions={
        <Button variant="outline" onClick={() => void loadAccount(true)} disabled={isLoading || isRefreshing}>
          <RefreshCw className={isRefreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          Refresh
        </Button>
      }
    >
      {isLoading ? <LoadingState label="Loading account" /> : null}
      {error ? <ErrorState message={error} /> : null}
      {success ? (
        <div className="rounded-lg border border-green-400/25 bg-green-500/10 p-4 text-sm font-semibold text-green-100">
          {success}
        </div>
      ) : null}
      {!isLoading && error && !hasAccountData ? (
        <NeonCard className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black tracking-normal text-white">Sign in required</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">Account details and wallet balance are available after login.</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/login">Go to login</Link>
            </Button>
          </div>
        </NeonCard>
      ) : null}

      {hasAccountData ? <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <NeonCard className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-plasma/40 bg-plasma/15 text-xl font-black shadow-glow">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Signed in as</p>
                <h2 className="truncate text-2xl font-black tracking-normal text-white">{user?.username || 'Player'}</h2>
                <p className="mt-1 flex items-center gap-2 truncate text-sm text-slate-400">
                  <Mail className="h-4 w-4 shrink-0 text-plasma" />
                  {user?.email || 'No email available'}
                </p>
              </div>
            </div>
            <Badge variant="success">
              <ShieldCheck className="mr-1 h-3 w-3" />
              Active session
            </Badge>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <form onSubmit={saveUsername} className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                <UserRound className="h-4 w-4 text-plasma" />
                Username
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Input
                  value={usernameDraft}
                  onChange={(event) => setUsernameDraft(event.target.value)}
                  autoComplete="username"
                  disabled={isSavingUsername}
                />
                <Button
                  type="submit"
                  variant="outline"
                  disabled={isSavingUsername || !usernameDraft.trim() || usernameDraft.trim() === user?.username}
                >
                  <Save className={isSavingUsername ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
                  Save
                </Button>
              </div>
            </form>
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                <Star className="h-4 w-4 text-rune" />
                Profile
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatBadge label="Level" value={user?.profile?.level ?? 0} />
                <StatBadge label="Rating" value={user?.profile?.rating ?? 0} variant="default" />
              </div>
            </div>
          </div>
        </NeonCard>

        <NeonCard className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Wallet</p>
              <h2 className="mt-1 text-2xl font-black tracking-normal text-white">Balance</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-green-400/30 bg-green-500/10">
              <CircleDollarSign className="h-6 w-6 text-green-300" />
            </div>
          </div>

          <p className="mt-8 break-words text-4xl font-black text-white sm:text-5xl">
            {formatBalance(wallet?.balance, wallet?.currency)}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <StatBadge label="Currency" value={wallet?.currency || '-'} variant="secondary" />
            <Badge variant={wallet?.isActive ? 'success' : 'danger'}>{wallet?.isActive ? 'Active wallet' : 'Inactive wallet'}</Badge>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                <ArrowDownToLine className="h-4 w-4 text-green-300" />
                Deposit
              </p>
              <div className="mt-3 flex flex-col gap-2">
                <Input
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={depositAmount}
                  onChange={(event) => setDepositAmount(event.target.value)}
                  disabled={isWalletActionLoading || !wallet?.isActive}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void runWalletAction('deposit')}
                  disabled={isWalletActionLoading || !wallet?.isActive}
                >
                  <ArrowDownToLine className={isWalletActionLoading ? 'h-4 w-4 animate-pulse' : 'h-4 w-4'} />
                  Deposit
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                <ArrowUpFromLine className="h-4 w-4 text-plasma" />
                Withdraw
              </p>
              <div className="mt-3 flex flex-col gap-2">
                <Input
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={withdrawAmount}
                  onChange={(event) => setWithdrawAmount(event.target.value)}
                  disabled={isWalletActionLoading || !wallet?.isActive}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void runWalletAction('withdraw')}
                  disabled={isWalletActionLoading || !wallet?.isActive}
                >
                  <ArrowUpFromLine className={isWalletActionLoading ? 'h-4 w-4 animate-pulse' : 'h-4 w-4'} />
                  Withdraw
                </Button>
              </div>
            </div>
          </div>
        </NeonCard>
      </div> : null}
    </PageShell>
  );
}
