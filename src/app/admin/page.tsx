'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, UploadCloud, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState('cutoff');
  const [year, setYear] = useState('2024-25');
  const [round, setRound] = useState('3');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

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
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to process file layout.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network failure. Please try again.');
    }
  };

  return (
    <div className="space-y-8 w-full max-w-2xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-black font-display text-slate-850 dark:text-white flex items-center gap-2">
          <UploadCloud className="h-8 w-8 text-indigo-600" /> Admin Importer Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload and seed CAP Cutoff PDF documents, Seat Matrix PDFs, or CSV college profile stats.
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-8 shadow-lg glow-primary">
        <form onSubmit={handleUpload} className="space-y-6">
          
          {/* File select drag boundary */}
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center hover:border-indigo-500/50 transition cursor-pointer relative bg-white/40 dark:bg-slate-900/30">
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
                <option value="2022-2023">2022-23</option>
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
    </div>
  );
}
