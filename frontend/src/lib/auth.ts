const ACCESS_TOKEN_KEY = 'neon-realms:access-token';
const USER_KEY = 'neon-realms:user';
export const AUTH_SESSION_CHANGED_EVENT = 'neon-realms:auth-session-changed';

export interface AuthUser {
  id?: string;
  email?: string;
  username?: string;
  role?: string;
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAuthSession(accessToken: string, user?: AuthUser) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}

export function updateStoredUser(user: AuthUser) {
  const currentUser = getStoredUser();
  localStorage.setItem(USER_KEY, JSON.stringify({ ...currentUser, ...user }));
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}
