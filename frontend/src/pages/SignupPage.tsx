import { motion } from 'framer-motion';
import { LockKeyhole, Mail, Sparkles, User, UserRoundPlus } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ErrorState } from '../components/shared/ErrorState';
import { NeonButton } from '../components/shared/NeonButton';
import { Input } from '../components/ui/input';
import { getErrorMessage } from '../lib/api';
import { getAccessToken, setAuthSession } from '../lib/auth';
import { signIn, signUp } from '../services/authService';

export function SignupPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (getAccessToken()) {
    return <Navigate to="/" replace />;
  }

  const canSubmit = username && email && password && confirmPassword && !isLoading;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await signUp({ username, email, password });
      const session = await signIn(email, password);
      setAuthSession(session.accessToken, session.user);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to create your account. Please try again.'));
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
            <UserRoundPlus className="h-7 w-7 text-plasma" />
          </div>
          <h1 className="text-3xl font-black tracking-normal">NEON REALMS</h1>
          <p className="mt-2 text-sm text-slate-400">Create your arena profile.</p>
        </div>

        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <User className="h-4 w-4 text-plasma" />
              Username
            </span>
            <Input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              placeholder="john_doe"
              disabled={isLoading}
            />
          </label>

          <label className="block space-y-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <Mail className="h-4 w-4 text-plasma" />
              Email
            </span>
            <Input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
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
              autoComplete="new-password"
              placeholder="StrongPassword123!"
              disabled={isLoading}
            />
          </label>

          <label className="block space-y-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <Sparkles className="h-4 w-4 text-rune" />
              Confirm password
            </span>
            <Input
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              disabled={isLoading}
            />
          </label>

          {error ? <ErrorState message={error} /> : null}

          <NeonButton type="submit" className="w-full" size="lg" disabled={!canSubmit}>
            {isLoading ? 'Creating account...' : 'Sign up'}
          </NeonButton>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-plasma transition hover:text-white">
              Log in
            </Link>
          </p>
        </div>
      </motion.form>
    </main>
  );
}
