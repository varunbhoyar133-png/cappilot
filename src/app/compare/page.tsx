'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Building, 
  ArrowLeft, 
  Sparkles, 
  Bell, 
  CheckCircle2, 
  LockKeyhole 
} from 'lucide-react';

export default function ComparePage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] w-full px-4 text-center relative animate-fade-in">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-soft"></div>
      <div className="absolute bottom-1/4 left-1/3 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-xl w-full glass-panel rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-200/50 dark:border-slate-800/50 relative overflow-hidden backdrop-blur-md animate-slide-up">
        
        {/* Glow corner */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-xl opacity-30"></div>

        {/* Lock / Feature badge */}
        <div className="inline-flex p-4 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 mb-6 shadow-inner">
          <LockKeyhole className="h-9 w-9" />
        </div>

        {/* Feature Spotlight Badge */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/15 to-purple-500/15 border border-indigo-500/20 text-indigo-650 dark:text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider mb-6">
            <Sparkles className="h-3 w-3 text-amber-500" /> College Comparison Matrix
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-800 dark:text-white tracking-tight mb-4 leading-tight">
          Comparison Engine<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-505 dark:from-indigo-400 dark:to-purple-400">
            Coming Soon
          </span>
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-md mx-auto font-medium">
          We are currently engineering a robust side-by-side comparison engine. Soon, you will be able to evaluate and analyze up to 3 engineering colleges side-by-side on cutoffs, placements, accreditations, and fees.
        </p>

        {/* Subscription Form */}
        {!subscribed ? (
          <form onSubmit={handleNotifyMe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-8">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email to get notified..."
              className="flex-grow px-4 py-3 rounded-xl border border-slate-200 bg-white/70 dark:border-slate-850 dark:bg-slate-900/70 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-550 active:scale-95 transition-all duration-200 shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bell className="h-4 w-4" /> Notify Me
            </button>
          </form>
        ) : (
          <div className="max-w-md mx-auto p-4 mb-8 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-sm font-semibold animate-fade-in justify-center">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>Success! We'll notify you on release.</span>
          </div>
        )}

        {/* Back Link */}
        <Link 
          href="/search" 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors duration-200"
        >
          <ArrowLeft className="h-3 w-3" /> Back to College Directory
        </Link>
      </div>
    </div>
  );
}
