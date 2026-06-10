import { motion } from 'framer-motion';
import { LockKeyhole, Mail, Sparkles } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { NeonButton } from '../components/shared/NeonButton';
import { ErrorState } from '../components/shared/ErrorState';
import { Input } from '../components/ui/input';
import { getErrorMessage } from '../lib/api';
import { getAccessToken, setAuthSession } from '../lib/auth';
import { signIn } from '../services/authService';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (getAccessToken()) {
    return <Navigate to="/" replace />;
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

          <NeonButton type="submit" className="w-full" size="lg" disabled={isLoading || !email || !password}>
            {isLoading ? 'Signing in...' : 'Login'}
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
