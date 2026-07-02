'use client';

import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Users, 
  Search, 
  TrendingUp, 
  MessageSquare, 
  ShieldAlert, 
  List, 
  Calendar, 
  User as UserIcon, 
  Database,
  GraduationCap,
  Award,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  // Existing Importer State
  const [file, setFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState('cutoff');
  const [year, setYear] = useState('2024-25');
  const [round, setRound] = useState('3');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Admin Tracking & Verification State
  const [activeTab, setActiveTab] = useState<'users' | 'searches' | 'predictions' | 'importer'>('users');
  const [authorized, setAuthorized] = useState<boolean | null>(null); // null = checking, false = unauthorized, true = admin
  const [dataLoading, setDataLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    searchLogsCount: 0,
    predictionLogsCount: 0,
    chatHistoryCount: 0
  });
  const [users, setUsers] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [recentPredictions, setRecentPredictions] = useState<any[]>([]);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const localUserStr = localStorage.getItem('cap_user');
      if (!localUserStr) {
        setAuthorized(false);
        setDataLoading(false);
        return;
      }

      try {
        const localUser = JSON.parse(localUserStr);
        if (localUser.email === 'admin@cappilot.com' || localUser.role === 'ADMIN') {
          setAuthorized(true);
          await fetchAdminData();
        } else {
          setAuthorized(false);
          setDataLoading(false);
        }
      } catch (e) {
        setAuthorized(false);
        setDataLoading(false);
      }
    };

    checkAuthAndFetch();
  }, []);

  const fetchAdminData = async () => {
    setDataLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          setUsers(data.users);
          setRecentSearches(data.recentSearches);
          setRecentPredictions(data.recentPredictions);
        }
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setStatus('loading');
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', uploadType);
    formData.append('year', year);
    formData.append('round', round);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'File processed successfully.');
        setFile(null);
        fetchAdminData(); // Refresh dashboard counts
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to process file layout.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network failure. Please try again.');
    }
  };

  // 1. Unauthorized Access State
  if (authorized === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-6 animate-slide-up">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-lg shadow-rose-500/5 animate-pulse-soft">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="text-2xl font-bold font-display text-slate-850 dark:text-white">Admin Access Restricted</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            You do not have administrative privileges to access this dashboard. Please sign in with an administrator account.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/auth/login" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition">
            Sign In as Admin
          </Link>
          <Link href="/" className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // 2. Loading State
  if (authorized === null || (authorized === true && dataLoading && users.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="h-10 w-10 text-indigo-600 animate-spin" />
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-4 uppercase tracking-widest">Verifying Administrator Access...</p>
      </div>
    );
  }

  // 3. Authorized Admin UI
  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto animate-slide-up">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black font-display text-slate-850 dark:text-white flex items-center gap-2">
            <Database className="h-8 w-8 text-indigo-600" /> Admin Command Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track user profiles, analyze prediction metrics, view search trends, and manage cutoff dataset imports.
          </p>
        </div>
        <button 
          onClick={fetchAdminData}
          disabled={dataLoading}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 rounded-xl transition disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${dataLoading ? 'animate-spin' : ''}`} /> Refresh Data
        </button>
      </div>

      {/* Aggregate Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Users */}
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Users</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.totalUsers}</h3>
          </div>
        </div>

        {/* Card 2: Predictions Run */}
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Predictions Logged</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.predictionLogsCount}</h3>
          </div>
        </div>

        {/* Card 3: Search Logs */}
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Search className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Searches Registered</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.searchLogsCount}</h3>
          </div>
        </div>

        {/* Card 4: Chat messages */}
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Counselling Messages</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.chatHistoryCount}</h3>
          </div>
        </div>
      </div>

      {/* Tabs Selection Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 border-b-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition ${
            activeTab === 'users' 
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <Users className="h-4 w-4" /> Users Directory
        </button>
        <button
          onClick={() => setActiveTab('searches')}
          className={`px-6 py-3 border-b-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition ${
            activeTab === 'searches' 
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <Search className="h-4 w-4" /> Search Queries
        </button>
        <button
          onClick={() => setActiveTab('predictions')}
          className={`px-6 py-3 border-b-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition ${
            activeTab === 'predictions' 
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="h-4 w-4" /> Cutoff Predictions
        </button>
        <button
          onClick={() => setActiveTab('importer')}
          className={`px-6 py-3 border-b-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition ${
            activeTab === 'importer' 
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <UploadCloud className="h-4 w-4" /> Data Importer
        </button>
      </div>

      {/* Tab Panels */}
      <div className="w-full">
        {/* Tab 1: User Directory */}
        {activeTab === 'users' && (
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-4 bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Registered Candidate Profiles</h3>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 rounded-full">{users.length} Candidates</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 uppercase font-bold tracking-wider">
                    <th className="p-4">Name & Email</th>
                    <th className="p-4">Candidate Specs</th>
                    <th className="p-4">Home University</th>
                    <th className="p-4 text-center">Favs</th>
                    <th className="p-4 text-center">Lists</th>
                    <th className="p-4 text-center">Chats</th>
                    <th className="p-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {users.map((u, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {u.name}
                          {u.role === 'ADMIN' && (
                            <span className="text-[8px] font-extrabold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 px-1 rounded">ADMIN</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-750 dark:text-slate-350">{u.percentile.toFixed(2)} %ile</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{u.category} | {u.gender}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{u.homeUniversity}</span>
                      </td>
                      <td className="p-4 text-center font-bold text-indigo-600 dark:text-indigo-400">{u._count?.favourites || 0}</td>
                      <td className="p-4 text-center font-bold text-purple-600 dark:text-purple-400">{u._count?.preferenceLists || 0}</td>
                      <td className="p-4 text-center font-bold text-emerald-600 dark:text-emerald-400">{u._count?.chatHistories || 0}</td>
                      <td className="p-4 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Search Queries */}
        {activeTab === 'searches' && (
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-4 bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Recent User Search Logs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 uppercase font-bold tracking-wider">
                    <th className="p-4">ID</th>
                    <th className="p-4">Search Query</th>
                    <th className="p-4">Query Type</th>
                    <th className="p-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {recentSearches.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 font-bold uppercase tracking-wider">No Search Logs Available</td>
                    </tr>
                  ) : (
                    recentSearches.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition">
                        <td className="p-4 text-slate-400">#{s.id}</td>
                        <td className="p-4 font-semibold text-slate-850 dark:text-slate-200">{s.query}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.type === 'college' 
                              ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                              : s.type === 'branch' 
                                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' 
                                : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                          }`}>
                            {s.type}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">
                          {new Date(s.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Cutoff Predictions */}
        {activeTab === 'predictions' && (
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-4 bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Recent Prediction Run Logs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 uppercase font-bold tracking-wider">
                    <th className="p-4">ID</th>
                    <th className="p-4">Target Score</th>
                    <th className="p-4">Reservation Category</th>
                    <th className="p-4">Branch Filter</th>
                    <th className="p-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {recentPredictions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 font-bold uppercase tracking-wider">No Prediction Runs Available</td>
                    </tr>
                  ) : (
                    recentPredictions.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition">
                        <td className="p-4 text-slate-400">#{p.id}</td>
                        <td className="p-4 font-bold text-slate-900 dark:text-white">{p.percentile.toFixed(4)} %ile</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded text-[10px] font-bold">{p.category}</span>
                        </td>
                        <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{p.branch}</td>
                        <td className="p-4 text-slate-400">
                          {new Date(p.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Importer Dashboard */}
        {activeTab === 'importer' && (
          <div className="glass-panel rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-lg glow-primary max-w-2xl mx-auto">
            <form onSubmit={handleUpload} className="space-y-6">
              
              {/* File select drag boundary */}
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-805 rounded-2xl p-6 text-center hover:border-indigo-500/50 transition cursor-pointer relative bg-white/40 dark:bg-slate-900/30">
                <input 
                  type="file" 
                  accept=".pdf,.csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="space-y-2.5">
                  <UploadCloud className="h-10 w-10 text-slate-450 mx-auto animate-pulse-soft" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {file ? file.name : "Drag & drop file here, or click to select"}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    Supports official Cutoff/Seat Matrix PDF or College profiles CSV
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Upload Type</label>
                  <select
                    value={uploadType}
                    onChange={e => setUploadType(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none"
                  >
                    <option value="cutoff">Official Cutoff PDF</option>
                    <option value="seatmatrix">Seat Matrix PDF</option>
                    <option value="collegeinfo">College Profiles CSV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Academic Year</label>
                  <select
                    value={year}
                    onChange={e => setYear(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none"
                  >
                    <option value="2024-25">2024-25</option>
                    <option value="2023-24">2023-24</option>
                    <option value="2022-23">2022-23</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Target CAP Round</label>
                  <select
                    value={round}
                    onChange={e => setRound(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none"
                  >
                    <option value="1">Round 1</option>
                    <option value="2">Round 2</option>
                    <option value="3">Round 3</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'loading' || !file}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <RefreshCw className="h-4.5 w-4.5 animate-spin" /> Processing document layout...
                  </>
                ) : "Trigger Import Pipeline"}
              </button>
            </form>

            {/* Feedback Messages */}
            {status === 'success' && (
              <div className="mt-6 flex items-start gap-2.5 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs border border-emerald-200/50">
                <CheckCircle className="h-5 w-5 shrink-0" />
                <div>
                  <h4 className="font-bold">Import Pipeline Success</h4>
                  <p className="mt-1 leading-relaxed">{message}</p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="mt-6 flex items-start gap-2.5 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs border border-rose-200/50">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div>
                  <h4 className="font-bold">Pipeline Import Error</h4>
                  <p className="mt-1 leading-relaxed">{message}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
