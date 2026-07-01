'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sun, Moon, Menu, X, GraduationCap, User as UserIcon, LogOut } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [user, setUser] = useState<any>(null);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme as 'light' | 'dark');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Fetch session data on mount and pathname change
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/favourites'); // Simple session validator or endpoint
        if (res.ok) {
          // If authenticated, we fetch session cookie
          // We can read user info from cookie or make a profile endpoint
          // Let's check localStorage for logged-in user cache or fetch it
          const localUser = localStorage.getItem('cap_user');
          if (localUser) {
            setUser(JSON.parse(localUser));
          }
        } else {
          setUser(null);
          localStorage.removeItem('cap_user');
        }
      } catch (e) {
        setUser(null);
      }
    }
    checkSession();
  }, [pathname]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      localStorage.removeItem('cap_user');
      router.push('/');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const navLinks = [
    { name: 'Predictor', path: '/predictor' },
    { name: 'Search', path: '/search' },
    { name: 'Compare', path: '/compare' },
    { name: 'Preference List', path: '/preferences' },
    { name: 'Trends', path: '/trends' },
    { name: 'AI Counselling', path: '/counselling' }
  ];

  return (
    <nav className="glass-panel sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                CapPilot
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            {navLinks.map(link => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-900/50 dark:hover:text-indigo-400'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Theme & User Profile Menu */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-indigo-400 transition-all duration-200"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {user ? (
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-200 dark:border-slate-800">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user.name}</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">{user.percentile}%ile | {user.category}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-3 border-l border-slate-200 dark:border-slate-800">
                <Link
                  href="/auth/login"
                  className="px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-slate-50 rounded-lg transition-all duration-200 dark:text-indigo-400 dark:hover:bg-slate-900/50"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-500/20 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-slate-200 dark:border-slate-800 animate-fade-in">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navLinks.map(link => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-base font-medium ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-900/50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            
            {user ? (
              <div className="pt-4 pb-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center px-3 mb-3">
                  <div className="ml-3">
                    <div className="text-base font-semibold text-slate-800 dark:text-slate-200">{user.name}</div>
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">{user.percentile}%ile | {user.category}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center px-3 py-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-base font-medium"
                >
                  <LogOut className="mr-2 h-5 w-5" /> Logout
                </button>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col space-y-2 px-3">
                <Link
                  href="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center justify-center px-4 py-2 text-base font-semibold text-indigo-600 border border-indigo-600/30 rounded-lg hover:bg-slate-50 dark:text-indigo-400"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center justify-center px-4 py-2 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
