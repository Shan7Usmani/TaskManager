'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-provider';
import { useRouter } from 'next/navigation';
import { ListTodo, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const fn = isSignUp ? signUp : signIn;
    const err = await fn(email, password);

    if (err) {
      setError(err);
      setSubmitting(false);
    } else if (isSignUp) {
      setSuccess('Account created! Check your email for verification, then sign in.');
      setIsSignUp(false);
      setSubmitting(false);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#05080c] alien-grid flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[rgba(0,255,122,0.2)] to-[rgba(0,217,255,0.2)] flex items-center justify-center glow-green">
            <ListTodo className="w-7 h-7 text-neon-green" />
          </div>
          <h1
            className="text-lg font-bold tracking-[0.2em] uppercase text-neon-green"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            TaskManager
          </h1>
          <p className="text-xs text-[#606060] mt-2">
            Sign in to sync across devices
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-[10px] text-neon-green tracking-[0.2em] uppercase mb-1.5" style={{ fontFamily: 'Orbitron, monospace' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="alien-input w-full px-4 py-3 rounded-xl text-sm"
              placeholder="you@email.com"
            />
          </div>

          <div>
            <label className="block text-[10px] text-neon-green tracking-[0.2em] uppercase mb-1.5" style={{ fontFamily: 'Orbitron, monospace' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="alien-input w-full px-4 py-3 rounded-xl text-sm"
              placeholder="Min 6 characters"
            />
          </div>

          {error && (
            <p className="text-neon-red text-xs">{error}</p>
          )}

          {success && (
            <p className="text-neon-green text-xs">{success}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-solid py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}
            className="w-full text-center text-xs text-[#606060] hover:text-neon-green transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </form>
      </div>
    </div>
  );
}
