import { api } from '../lib/api';

export type AdminUserRole = 'USER' | 'ADMIN';

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  isBanned: boolean;
  banEndAt: string | null;
  isDeleted: boolean;
  role: AdminUserRole;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
  deletedAt?: string | null;
}

export interface AdminUsersMeta {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
  lastPage?: number;
}

export interface AdminUsersResponse {
  data: AdminUser[];
  meta: AdminUsersMeta;
}

export interface AdminUsersQuery {
  page: number;
  limit: number;
  search?: string;
}

export interface UpdateAdminUserPayload {
  isBanned?: boolean;
  banEndAt?: string | null;
  role?: AdminUserRole;
}

export async function getAdminUsers(query: AdminUsersQuery) {
  const { data } = await api.get<AdminUsersResponse>('/admin/users', { params: query });
  return data;
}

export async function getAdminUser(id: string) {
  const { data } = await api.get<AdminUser>(`/admin/users/${id}`);
  return data;
}

export async function updateAdminUser(id: string, payload: UpdateAdminUserPayload) {
  const { data } = await api.patch<AdminUser>(`/admin/users/${id}`, payload);
  return data;
}

export async function deleteAdminUser(id: string) {
  await api.delete(`/admin/users/${id}`);
}
