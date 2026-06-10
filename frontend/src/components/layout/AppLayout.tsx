import { Gamepad2, Home, LogOut, MessageSquare, Shield, Swords, Trophy, UserRound, Video } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { disconnectGlobalChat } from '../../services/globalChatSocket';
import { AUTH_SESSION_CHANGED_EVENT, clearAuthSession, getAccessToken, getStoredUser } from '../../lib/auth';
import { cn } from '../../lib/utils';
import { getCurrentUser } from '../../services/accountService';
import { endVideoSlotSession, VIDEO_SLOT_SESSION_STORAGE_KEY } from '../../services/videoSlotsService';
import { GlobalChatWidget } from '../chat/GlobalChatWidget';
import { Button } from '../ui/button';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/fighting', label: 'Fighting', icon: Swords },
  { to: '/roulette', label: 'Roulette', icon: Trophy },
  { to: '/video-slots', label: 'Video Slots', icon: Video },
  { to: '/chat', label: 'Chat', icon: MessageSquare },
  { to: '/account', label: 'Account', icon: UserRound },
];

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(() => getAccessToken());
  const [user, setUser] = useState(() => getStoredUser());
  const [serverRole, setServerRole] = useState<string | undefined>(user?.role);
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    const syncAuthSession = () => {
      setToken(getAccessToken());
      setUser(getStoredUser());
    };

    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, syncAuthSession);
    window.addEventListener('storage', syncAuthSession);

    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, syncAuthSession);
      window.removeEventListener('storage', syncAuthSession);
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setServerRole(undefined);
      return;
    }

    let mounted = true;

    getCurrentUser()
      .then((currentUser) => {
        if (mounted) setServerRole(currentUser.role);
      })
      .catch(() => {
        if (mounted) setServerRole(undefined);
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  useEffect(() => {
    const previousPath = previousPathRef.current;

    if (previousPath === '/video-slots' && location.pathname !== '/video-slots') {
      const sessionId = sessionStorage.getItem(VIDEO_SLOT_SESSION_STORAGE_KEY);
      sessionStorage.removeItem(VIDEO_SLOT_SESSION_STORAGE_KEY);

      if (sessionId) {
        void endVideoSlotSession(sessionId).catch(() => undefined);
      }
    }

    previousPathRef.current = location.pathname;
  }, [location.pathname]);

  const logout = () => {
    const sessionId = sessionStorage.getItem(VIDEO_SLOT_SESSION_STORAGE_KEY);
    sessionStorage.removeItem(VIDEO_SLOT_SESSION_STORAGE_KEY);

    if (sessionId) {
      void endVideoSlotSession(sessionId).catch(() => undefined);
    }

    disconnectGlobalChat();
    clearAuthSession();
    navigate('/login');
  };

  if (!token) {
    disconnectGlobalChat();
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="neon-bg min-h-screen text-white">
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link to="/fighting" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-plasma/40 bg-plasma/15 shadow-glow">
              <Gamepad2 className="h-5 w-5 text-plasma" />
            </span>
            <span>
              <span className="block text-sm font-black uppercase tracking-[0.22em] text-white">Neon Realms</span>
              <span className="text-xs text-slate-500">Live arena platform</span>
            </span>
          </Link>

          <nav className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {[...navItems, ...(serverRole === 'ADMIN' ? [{ to: '/admin/users', label: 'Admin', icon: Shield }] : [])].map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-semibold text-slate-400 transition hover:bg-white/10 hover:text-white',
                      isActive && 'bg-white/10 text-white shadow-violet',
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center justify-between gap-3 lg:justify-end">
            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-semibold text-white">{user?.username || user?.email || 'Guest'}</p>
              <p className="text-xs text-slate-500">{user ? 'Authenticated' : 'Offline preview'}</p>
            </div>
            <Button variant="outline" size="icon" onClick={logout} aria-label="Log out" title="Log out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <Outlet />
      <GlobalChatWidget />
    </div>
  );
}
