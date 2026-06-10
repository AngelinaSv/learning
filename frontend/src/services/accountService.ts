import { api } from '../lib/api';

export interface AccountProfile {
  level: number;
  rating: number;
}

export interface AccountUser {
  email: string;
  username: string;
  role?: 'USER' | 'ADMIN';
  profile?: AccountProfile;
}

export interface WalletBalance {
  balance: string | number;
  currency: string;
  isActive: boolean;
}

export interface WalletTransaction {
  id: string;
  amount: string | number;
  status?: string;
  type?: string;
}

export async function getCurrentUser() {
  const { data } = await api.get<AccountUser>('/users/me');
  return data;
}

export async function updateCurrentUser(username: string) {
  const { data } = await api.patch<AccountUser>('/users/me', { username });
  return data;
}

export async function getWalletBalance() {
  const { data } = await api.get<WalletBalance>('/wallet/balance');
  return data;
}

export async function depositToWallet(amount: number) {
  const { data } = await api.post<WalletTransaction>('/wallet/deposit', {
    amount,
    idempotencyKey: crypto.randomUUID(),
  });
  return data;
}

export async function withdrawFromWallet(amount: number) {
  const { data } = await api.post<WalletTransaction>('/wallet/withdraw', {
    amount,
    idempotencyKey: crypto.randomUUID(),
  });
  return data;
}
