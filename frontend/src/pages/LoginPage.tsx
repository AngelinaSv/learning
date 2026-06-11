import { motion } from 'framer-motion';
import { LockKeyhole, Mail, Sparkles } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { NeonButton } from '../components/shared/NeonButton';
import { ErrorState } from '../components/shared/ErrorState';
import { Input } from '../components/ui/input';
import { API_URL, getErrorMessage } from '../lib/api';
import { clearAuthSession, getAccessToken, setAuthSession } from '../lib/auth';
import { signIn } from '../services/authService';
import { getCurrentUser } from '../services/accountService';

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.24 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function hasOAuthAccessTokenParam() {
  return new URLSearchParams(window.location.search).has('accessToken');
}

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(hasOAuthAccessTokenParam);
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(
    hasOAuthAccessTokenParam,
  );
  const [error, setError] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hasAccessToken = searchParams.has('accessToken');
    const accessToken = searchParams.get('accessToken');

    if (!hasAccessToken) {
      setIsProcessingOAuth(false);
      return;
    }

    window.history.replaceState({}, '', `${window.location.origin}/login`);

    if (!accessToken) {
      setError('Google login failed. Please try again.');
      setIsLoading(false);
      setIsProcessingOAuth(false);
      return;
    }

    const processOAuthToken = async () => {
      setError('');
      setIsLoading(true);

      try {
        setAuthSession(accessToken);
        const user = await getCurrentUser();
        setAuthSession(accessToken, user);
        navigate('/home', { replace: true });
      } catch (err) {
        clearAuthSession();
        setError(getErrorMessage(err, 'Google login failed. Please try again.'));
        setIsProcessingOAuth(false);
      } finally {
        setIsLoading(false);
      }
    };

    void processOAuthToken();
  }, [navigate]);

  if (!isProcessingOAuth && getAccessToken()) {
    return <Navigate to="/home" replace />;
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const session = await signIn(email, password);
      setAuthSession(session.accessToken, session.user);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to sign in. Check your credentials and try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleLogin = () => {
    setError('');
    setIsLoading(true);
    window.location.href = `${API_URL}/auth/google`;
  };

  if (isProcessingOAuth) {
    return (
      <main className="neon-bg flex min-h-screen items-center justify-center px-4 py-10 text-white">
        <div className="glass-panel neon-border w-full max-w-md rounded-lg p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-plasma/40 bg-plasma/15 shadow-glow">
            <Sparkles className="h-7 w-7 text-plasma" />
          </div>
          <h1 className="text-2xl font-black tracking-normal">NEON REALMS</h1>
          <p className="mt-3 text-sm text-slate-400">Completing Google login...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="neon-bg flex min-h-screen items-center justify-center px-4 py-10 text-white">
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={onSubmit}
        className="glass-panel neon-border w-full max-w-md rounded-lg p-6"
      >
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-plasma/40 bg-plasma/15 shadow-glow">
            <Sparkles className="h-7 w-7 text-plasma" />
          </div>
          <h1 className="text-3xl font-black tracking-normal">NEON REALMS</h1>
          <p className="mt-2 text-sm text-slate-400">Sign in to enter the arena.</p>
        </div>

        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <Mail className="h-4 w-4 text-plasma" />
              Email / username
            </span>
            <Input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="user@example.com"
              disabled={isLoading}
            />
          </label>

          <label className="block space-y-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <LockKeyhole className="h-4 w-4 text-rune" />
              Password
            </span>
            <Input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              disabled={isLoading}
            />
          </label>

          {error ? <ErrorState message={error} /> : null}

          <NeonButton
            type="submit"
            wrapperClassName="flex w-full"
            className="w-full"
            size="lg"
            disabled={isLoading || !email || !password}
          >
            {isLoading ? 'Signing in...' : 'Login'}
          </NeonButton>

          <NeonButton
            type="button"
            variant="outline"
            wrapperClassName="flex w-full"
            className="w-full border-cyan-300/25 bg-white/[0.06] text-white hover:border-cyan-300/60 hover:bg-cyan-300/10"
            size="lg"
            disabled={isLoading}
            onClick={onGoogleLogin}
          >
            <GoogleIcon />
            Continue with Google
          </NeonButton>

          <p className="text-center text-sm text-slate-400">
            New to Neon Realms?{' '}
            <Link to="/signup" className="font-semibold text-plasma transition hover:text-white">
              Create an account
            </Link>
          </p>
        </div>
      </motion.form>
    </main>
  );
}
