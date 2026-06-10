import axios from 'axios';
import { clearAuthSession, getAccessToken } from './auth';

const BACKEND_PORT = '3009';

function getBackendOrigin() {
  if (typeof window === 'undefined') {
    return '';
  }

  return `${window.location.protocol}//${window.location.hostname}:${BACKEND_PORT}`;
}

const backendOrigin = getBackendOrigin();

export const API_URL = import.meta.env.VITE_API_URL || `${backendOrigin}/api/v1`;
export const CHAT_WS_URL =
  import.meta.env.VITE_CHAT_WS_URL || import.meta.env.VITE_WS_URL || `${backendOrigin}/chat`;
export const FIGHTING_WS_URL =
  import.meta.env.VITE_FIGHTING_WS_URL || `${backendOrigin}/fighting`;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthSession();
    }

    return Promise.reject(error);
  },
);

export function getErrorMessage(error: unknown, fallback = 'Something went wrong') {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    const message = data?.message;

    if (Array.isArray(message)) return message.join(', ');
    if (message) return message;
    if (error.message) return error.message;
  }

  if (error instanceof Error) return error.message;

  return fallback;
}
