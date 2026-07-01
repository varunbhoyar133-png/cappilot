'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, ArrowRight, Lock, Mail, User as UserIcon, Award, Percent } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [percentile, setPercentile] = useState('');
  const [category, setCategory] = useState('OPEN');
  const [gender, setGender] = useState('MALE');
  const [homeUniversity, setHomeUniversity] = useState('Savitribai Phule Pune University');
  const [isTfws, setIsTfws] = useState(false);
  const [isPwd, setIsPwd] = useState(false);
  const [isDefense, setIsDefense] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const universities = [
    'Savitribai Phule Pune University',
    'Mumbai University',
    'Shivaji University, Kolhapur',
    'Sant Gadge Baba Amravati University',
    'Dr. Babasaheb Ambedkar Marathwada University',
    'Rashtrasant Tukadoji Maharaj Nagpur University',
    'Kavayitri Bahinabai Chaudhari North Maharashtra University',
    'Dr. Babasaheb Ambedkar Technological University',
    'State Level'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const pct = parseFloat(percentile);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      setError('Please enter a valid percentile between 0 and 100');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          percentile: pct,
          category,
          gender,
          homeUniversity,
          isTfws,
          isPwd,
          isDefense
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
      } else {
        localStorage.setItem('cap_user', JSON.stringify(data.user));
        router.push('/predictor');
        router.refresh();
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] py-10 px-4">
      <div className="w-full max-w-lg glass-panel rounded-2xl p-8 glow-secondary animate-slide-up">
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-500/30 mb-3 animate-pulse-soft">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-850 dark:text-white">Create Candidate Profile</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Set up your profile to run predictors & save preferences</p>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-sm mb-6 border border-rose-200/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Varun Bhoyar"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white/50 dark:border-slate-800 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="varun@example.com"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white/50 dark:border-slate-800 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white/50 dark:border-slate-800 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">MHT CET Percentile</label>
              <div className="relative">
                <Percent className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={percentile}
                  onChange={e => setPercentile(e.target.value)}
                  placeholder="98.5042"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white/50 dark:border-slate-800 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Reservation Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="OPEN">OPEN (General)</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="EWS">EWS (Economically Weaker Section)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Home University (University Region)</label>
            <select
              value={homeUniversity}
              onChange={e => setHomeUniversity(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              {universities.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Special Quotas (Select all that apply)</label>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTfws}
                  onChange={e => setIsTfws(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold">TFWS Seat</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPwd}
                  onChange={e => setIsPwd(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold">PWD Quota</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefense}
                  onChange={e => setIsDefense(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold">Defense Quota</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 text-sm disabled:opacity-50 mt-4"
          >
            {loading ? 'Creating Profile...' : (
              <>
                Register & Continue <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already registered?{' '}
          <Link href="/auth/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
