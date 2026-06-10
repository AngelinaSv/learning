import { Ban, RefreshCw, Search, ShieldAlert, ShieldCheck, Trash2, UserCog } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageShell } from '../components/layout/PageShell';
import { ErrorState } from '../components/shared/ErrorState';
import { LoadingState } from '../components/shared/LoadingState';
import { NeonCard } from '../components/shared/NeonCard';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { getErrorMessage } from '../lib/api';
import { cn, formatTime } from '../lib/utils';
import {
  AdminUser,
  deleteAdminUser,
  getAdminUser,
  getAdminUsers,
  updateAdminUser,
} from '../services/adminUsersService';
import { getCurrentUser } from '../services/accountService';

const pageSize = 8;
const banOptions = [
  { label: '1 hour', hours: 1 },
  { label: '24 hours', hours: 24 },
  { label: '7 days', hours: 24 * 7 },
  { label: '30 days', hours: 24 * 30 },
];

function formatDateTime(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString()} ${formatTime(date)}`;
}

function getBanEndAt(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

export function AdminUsersPage() {
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const selectedUserId = selectedUser?.id;

  const loadUsers = async (nextPage = page, nextSearch = search) => {
    setError('');
    setIsLoading(true);

    try {
      const response = await getAdminUsers({ page: nextPage, limit: pageSize, search: nextSearch || undefined });
      setUsers(response.data);
      setTotalPages(response.meta.totalPages || response.meta.lastPage || 1);

      if (selectedUserId) {
        const refreshed = response.data.find((user) => user.id === selectedUserId);
        if (refreshed) setSelectedUser(refreshed);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load users.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    getCurrentUser()
      .then((user) => {
        if (mounted) setIsAdmin(user.role === 'ADMIN');
      })
      .catch((err) => {
        if (mounted) setError(getErrorMessage(err, 'Unable to verify admin access.'));
      })
      .finally(() => {
        if (mounted) setIsCheckingAccess(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (isAdmin) void loadUsers(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, page, search]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchDraft.trim());
  };

  const selectUser = async (user: AdminUser) => {
    setError('');
    setNotice('');
    setSelectedUser(user);

    try {
      setSelectedUser(await getAdminUser(user.id));
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load user details.'));
    }
  };

  const runUserAction = async (action: () => Promise<void>, successMessage: string) => {
    setError('');
    setNotice('');
    setIsActionLoading(true);

    try {
      await action();
      setNotice(successMessage);
      await loadUsers(page, search);
      if (selectedUserId) setSelectedUser(await getAdminUser(selectedUserId));
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to update user.'));
    } finally {
      setIsActionLoading(false);
    }
  };

  const banUser = (hours: number) => {
    if (!selectedUser) return;
    void runUserAction(
      async () => {
        await updateAdminUser(selectedUser.id, { isBanned: true, banEndAt: getBanEndAt(hours) });
      },
      'User banned.',
    );
  };

  const unbanUser = () => {
    if (!selectedUser) return;
    void runUserAction(
      async () => {
        await updateAdminUser(selectedUser.id, { isBanned: false, banEndAt: null });
      },
      'User unbanned.',
    );
  };

  const removeUser = () => {
    if (!selectedUser) return;
    const userId = selectedUser.id;

    void runUserAction(
      async () => {
        await deleteAdminUser(userId);
        setSelectedUser(null);
      },
      'User deleted.',
    );
  };

  const pageLabel = useMemo(() => `${page} / ${Math.max(totalPages, 1)}`, [page, totalPages]);

  if (isCheckingAccess) {
    return (
      <PageShell eyebrow="Admin" title="User Management">
        <LoadingState label="Checking admin access" />
      </PageShell>
    );
  }

  if (!isAdmin) {
    return (
      <PageShell eyebrow="Admin" title="Access Denied">
        <NeonCard className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black tracking-normal text-white">Admins only</h2>
              <p className="mt-2 text-sm text-slate-400">This panel is available only for users with the ADMIN role.</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/">Back home</Link>
            </Button>
          </div>
        </NeonCard>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Admin"
      title="User Management"
      description="Search users, inspect details, ban or unban accounts, and delete users."
      actions={
        <Button variant="outline" onClick={() => void loadUsers(page, search)} disabled={isLoading}>
          <RefreshCw className={isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          Refresh
        </Button>
      }
    >
      {error ? <ErrorState message={error} /> : null}
      {notice ? <div className="rounded-lg border border-green-400/25 bg-green-500/10 p-4 text-sm font-semibold text-green-100">{notice}</div> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_26rem]">
        <NeonCard className="p-5">
          <form onSubmit={submitSearch} className="mb-4 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder="Search username or email"
                className="pl-9"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          {isLoading ? <LoadingState label="Loading users" /> : null}

          <div className="overflow-hidden rounded-lg border border-white/10">
            <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-white/10 bg-black/20 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              <span>User</span>
              <span>Role</span>
              <span>Status</span>
            </div>
            {users.length === 0 ? (
              <div className="p-5 text-sm text-slate-500">No users found.</div>
            ) : (
              users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => void selectUser(user)}
                  className={cn(
                    'grid w-full grid-cols-[1fr_auto_auto] gap-3 border-b border-white/10 px-4 py-3 text-left transition last:border-b-0 hover:bg-white/[0.04]',
                    selectedUser?.id === user.id && 'bg-plasma/10',
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black text-white">{user.username}</span>
                    <span className="block truncate text-xs text-slate-500">{user.email}</span>
                  </span>
                  <Badge variant={user.role === 'ADMIN' ? 'default' : 'muted'}>{user.role}</Badge>
                  <Badge variant={user.isDeleted ? 'danger' : user.isBanned ? 'secondary' : 'success'}>
                    {user.isDeleted ? 'Deleted' : user.isBanned ? 'Banned' : 'Active'}
                  </Badge>
                </button>
              ))
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <Button variant="outline" disabled={page <= 1 || isLoading} onClick={() => setPage((current) => Math.max(1, current - 1))}>
              Previous
            </Button>
            <span className="text-sm font-semibold text-slate-400">{pageLabel}</span>
            <Button variant="outline" disabled={page >= totalPages || isLoading} onClick={() => setPage((current) => current + 1)}>
              Next
            </Button>
          </div>
        </NeonCard>

        <NeonCard className="p-5">
          {selectedUser ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Selected user</p>
                  <h2 className="mt-1 truncate text-2xl font-black tracking-normal text-white">{selectedUser.username}</h2>
                  <p className="truncate text-sm text-slate-400">{selectedUser.email}</p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-plasma/35 bg-plasma/15">
                  <UserCog className="h-5 w-5 text-plasma" />
                </div>
              </div>

              <div className="grid gap-2">
                <InfoLine label="Role" value={selectedUser.role} />
                <InfoLine label="User ID" value={selectedUser.id} />
                <InfoLine label="Banned" value={selectedUser.isBanned ? 'Yes' : 'No'} />
                <InfoLine label="Ban ends" value={formatDateTime(selectedUser.banEndAt)} />
                <InfoLine label="Deleted" value={selectedUser.isDeleted ? 'Yes' : 'No'} />
                <InfoLine label="Created" value={formatDateTime(selectedUser.createdAt)} />
              </div>

              <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rune" />
                  <h3 className="font-black text-white">Ban duration</h3>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {banOptions.map((option) => (
                    <Button key={option.label} variant="outline" onClick={() => banUser(option.hours)} disabled={isActionLoading || selectedUser.isDeleted}>
                      <Ban className="h-4 w-4" />
                      {option.label}
                    </Button>
                  ))}
                </div>
                <Button className="mt-2 w-full" variant="outline" onClick={unbanUser} disabled={isActionLoading || selectedUser.isDeleted || !selectedUser.isBanned}>
                  <ShieldCheck className="h-4 w-4" />
                  Unban
                </Button>
              </div>

              <Button variant="danger" className="w-full" onClick={removeUser} disabled={isActionLoading || selectedUser.isDeleted}>
                <Trash2 className="h-4 w-4" />
                Delete user
              </Button>
            </div>
          ) : (
            <div className="flex min-h-80 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] p-5 text-center text-sm text-slate-500">
              Choose a user from the list to manage ban status or delete the account.
            </div>
          )}
        </NeonCard>
      </div>
    </PageShell>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="truncate font-semibold text-white">{value}</span>
    </div>
  );
}
