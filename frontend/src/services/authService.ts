import { api } from '../lib/api';
import { type AuthUser } from '../lib/auth';

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  username: string;
}

export interface SignUpResponse {
  user: AuthUser;
}

export async function signIn(email: string, password: string) {
  const { data } = await api.post<LoginResponse>('/auth/sign-in', { email, password });
  return data;
}

export async function signUp(payload: SignUpPayload) {
  const { data } = await api.post<SignUpResponse>('/auth/sign-up', payload);
  return data;
}
