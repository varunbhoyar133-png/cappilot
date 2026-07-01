'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed');
      } else {
        // Cache user details locally for Navbar state
        localStorage.setItem('cap_user', JSON.stringify(data.user));
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 glow-primary">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 mb-3 animate-pulse-soft">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-850 dark:text-white">Sign In to Your Account</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Access your predictor profile & preferences</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-sm mb-6 border border-rose-200/50 dark:border-rose-950/50">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="candidate@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white/50 dark:border-slate-800 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white/50 dark:border-slate-800 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 text-sm disabled:opacity-50"
          >
            {loading ? 'Signing In...' : (
              <>
                Continue <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          New to CapPilot?{' '}
          <Link href="/auth/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
