'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ListOrdered, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Printer, 
  Sparkles, 
  Building, 
  BookOpen, 
  AlertCircle,
  FileText,
  Save,
  Check
} from 'lucide-react';

export default function PreferencesPage() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [savedStatus, setSavedStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Load session user and preferences on mount
  useEffect(() => {
    const cachedUser = localStorage.getItem('cap_user');
    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
    }
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/preferences');
      if (res.ok) {
        const data = await res.json();
        const codes = data.preferenceList?.choiceCodes || [];
        
        // Fetch detailed info for these choice codes
        if (codes.length > 0) {
          const detailsList = [];
          for (const code of codes) {
            // Load college details from choice code prefix (first 5 digits)
            const collegeCode = code.substring(0, 5);
            const detailRes = await fetch(`/api/colleges/${collegeCode}`);
            if (detailRes.ok) {
              const detailData = await detailRes.json();
              const choice = detailData.college?.choices.find((ch: any) => ch.choiceCode === code);
              if (choice) {
                // Attach college name and package details
                detailsList.push({
                  choiceCode: code,
                  collegeName: detailData.college.name,
                  courseName: choice.course.name,
                  avgCutoff: getChoiceAvgCutoff(choice),
                  fees: detailData.college.fees,
                  avgPackage: detailData.college.avgPackage
                });
              }
            }
          }
          setPreferences(detailsList);
        } else {
          setPreferences([]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getChoiceAvgCutoff = (choice: any): number => {
    // Find latest year Round 3 GOPEN/GOPENS cutoff
    const latestCutoffs = choice.cutoffs.filter((c: any) => c.round === 3 && (c.category === 'GOPENS' || c.category.startsWith('GOPEN')));
    if (latestCutoffs.length > 0) {
      return latestCutoffs[0].percentile;
    }
    return 0;
  };

  const handleSave = async (listToSave = preferences) => {
    setSavedStatus('saving');
    try {
      const codes = listToSave.map(p => p.choiceCode);
      const res = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choiceCodes: codes })
      });
      if (res.ok) {
        setSavedStatus('saved');
        setTimeout(() => setSavedStatus('idle'), 3000);
      }
    } catch (e) {
      setSavedStatus('idle');
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newList = [...preferences];
    const temp = newList[index];
    newList[index] = newList[index - 1];
    newList[index - 1] = temp;
    setPreferences(newList);
    handleSave(newList);
  };

  const moveDown = (index: number) => {
    if (index === preferences.length - 1) return;
    const newList = [...preferences];
    const temp = newList[index];
    newList[index] = newList[index + 1];
    newList[index + 1] = temp;
    setPreferences(newList);
    handleSave(newList);
  };

  const removeChoice = (choiceCode: string) => {
    const newList = preferences.filter(p => p.choiceCode !== choiceCode);
    setPreferences(newList);
    handleSave(newList);
  };

  // Smart sorting algorithm: Arranges options by descending order of historical cutoffs
  const handleSmartSort = () => {
    const sorted = [...preferences].sort((a, b) => b.avgCutoff - a.avgCutoff);
    setPreferences(sorted);
    handleSave(sorted);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 w-full print:p-0">
      
      {/* Header Info (Hidden during printing) */}
      <div className="space-y-2 print:hidden">
        <h1 className="text-3xl font-black font-display text-slate-850 dark:text-white flex items-center gap-2">
          <ListOrdered className="h-8 w-8 text-indigo-600" /> Preference List Generator
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Rank your options in order of interest. Use our Smart Sort button to align them automatically by cutoff difficulty.
        </p>
      </div>

      {/* Candidates Info header printed at the top of PDF */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black uppercase text-slate-900">MHT CET CAP - Option Form Report</h1>
            <p className="text-xs text-slate-600 font-semibold mt-1">Generated via CapPilot Portal</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">A.Y. 2026-27</span>
          </div>
        </div>
        
        {user && (
          <div className="grid grid-cols-4 gap-4 mt-6 text-xs text-slate-800 font-medium">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Candidate Name</span>
              <span className="font-bold text-slate-900">{user.name}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
              <span>{user.email}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">MHT CET Percentile</span>
              <span className="font-bold text-slate-900">{user.percentile}%ile</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Category & Gender</span>
              <span className="font-bold text-slate-900">{user.category} | {user.gender}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 glass-panel rounded-3xl shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSmartSort}
            disabled={preferences.length <= 1}
            className="flex items-center gap-1.5 px-4  py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-xs shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" /> Smart Sort Option List
          </button>

          <button
            onClick={handlePrint}
            disabled={preferences.length === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl font-semibold text-xs transition duration-200 disabled:opacity-50 text-slate-600 dark:text-slate-300"
          >
            <Printer className="h-4 w-4" /> Export Option Form PDF
          </button>
        </div>

        <div className="flex items-center gap-2">
          {savedStatus === 'saving' && (
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
              <span className="h-3 w-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span> Saving changes...
            </span>
          )}
          {savedStatus === 'saved' && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <Check className="h-4 w-4" /> List saved to account
            </span>
          )}
        </div>
      </div>

      {/* Main preferences list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading options lists...</p>
        </div>
      ) : !user ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-500 print:hidden">
          <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-600 dark:text-slate-400">Authentication Required.</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">Please log in to your candidate account to create and manage preference forms.</p>
          <Link href="/auth/login" className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md transition duration-200">
            Sign In Now
          </Link>
        </div>
      ) : preferences.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-500 print:hidden">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-600 dark:text-slate-400">Your Preference Form is currently empty.</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">Go to the Predictor page and add colleges using the plus button.</p>
          <Link href="/predictor" className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md transition duration-200">
            Open Predictor Tool
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {preferences.map((item, idx) => (
            <div 
              key={item.choiceCode} 
              className="glass-panel rounded-2xl p-4 flex items-center justify-between gap-4 border border-slate-200 dark:border-slate-800 transition-all duration-200 hover:border-indigo-600/30 print:shadow-none print:border-slate-300 print:rounded-none print:p-3"
            >
              
              {/* Left Order Number Badge */}
              <div className="flex items-center gap-4">
                <span className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-black text-sm flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 shrink-0 print:border-slate-300 print:bg-slate-100 print:text-slate-900">
                  {idx + 1}
                </span>

                {/* College / Course Detail */}
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-800 dark:text-white leading-tight">
                    {item.collegeName}
                  </h4>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold"><BookOpen className="h-3.5 w-3.5 text-slate-400" /> {item.courseName}</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">Choice Code: {item.choiceCode}</span>
                    <span className="font-semibold print:inline hidden text-slate-800">Fees: ₹{item.fees.toLocaleString()}/yr</span>
                  </div>
                </div>
              </div>

              {/* Right sorting / delete controls */}
              <div className="flex items-center gap-2 shrink-0 print:hidden">
                
                <div className="text-right mr-4 text-xs font-semibold hidden md:block">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Cutoff Score</p>
                  <p className="text-slate-700 dark:text-slate-300 font-bold">{item.avgCutoff > 0 ? `${item.avgCutoff}%ile` : 'N/A'}</p>
                </div>

                {/* Move buttons */}
                <button
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition duration-150"
                  title="Move Up"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>

                <button
                  onClick={() => moveDown(idx)}
                  disabled={idx === preferences.length - 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition duration-150"
                  title="Move Down"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>

                {/* Delete button */}
                <button
                  onClick={() => removeChoice(item.choiceCode)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 transition duration-150"
                  title="Delete Option"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* PDF Print placement rating */}
              <div className="hidden print:block text-right shrink-0 text-xs font-semibold text-slate-800">
                Avg Cutoff: {item.avgCutoff > 0 ? `${item.avgCutoff}%ile` : 'N/A'}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Signature block printed at the bottom of the PDF Option Form */}
      <div className="hidden print:block mt-24 border-t border-slate-300 pt-8">
        <div className="flex justify-between items-center text-xs text-slate-800 font-semibold">
          <div className="space-y-4">
            <p>Candidate Signature: _________________________</p>
            <p className="text-[10px] text-slate-500 font-medium">Date: {new Date().toLocaleDateString()}</p>
          </div>
          <div className="space-y-4 text-right">
            <p>Parent/Guardian Signature: _________________________</p>
            <p className="text-[10px] text-slate-500 font-medium">Verified by CAP Counseling Center</p>
          </div>
        </div>
      </div>

    </div>
  );
}
