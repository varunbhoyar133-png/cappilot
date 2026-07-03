'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building, 
  Search, 
  X, 
  Check, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Award, 
  TrendingUp,
  ExternalLink,
  Info
} from 'lucide-react';

export default function ComparePage() {
  const [allColleges, setAllColleges] = useState<any[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [compareData, setCompareData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch matching colleges dynamically from the server as user types
  useEffect(() => {
    if (searchQuery.trim() === '') {
      async function loadInitialColleges() {
        try {
          const res = await fetch('/api/colleges?limit=20');
          if (res.ok) {
            const data = await res.json();
            setAllColleges(data.colleges || []);
          }
        } catch (e) {}
      }
      loadInitialColleges();
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/colleges?search=${encodeURIComponent(searchQuery)}&limit=30`);
        if (res.ok) {
          const data = await res.json();
          setAllColleges(data.colleges || []);
        }
      } catch (e) {}
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Fetch comparison details when selectedCodes changes
  useEffect(() => {
    async function loadCompareDetails() {
      if (selectedCodes.length === 0) {
        setCompareData([]);
        return;
      }
      
      setLoading(true);
      const dataList = [];
      for (const code of selectedCodes) {
        try {
          const res = await fetch(`/api/colleges/${code}`);
          if (res.ok) {
            const data = await res.json();
            if (data.college) dataList.push(data.college);
          }
        } catch (e) {}
      }
      setCompareData(dataList);
      setLoading(false);
    }
    loadCompareDetails();
  }, [selectedCodes]);

  const addCollege = (code: string) => {
    if (selectedCodes.length >= 3) {
      alert("You can compare a maximum of 3 colleges simultaneously.");
      return;
    }
    if (!selectedCodes.includes(code)) {
      setSelectedCodes([...selectedCodes, code]);
    }
    setSearchQuery('');
    setShowDropdown(false);
  };

  const removeCollege = (code: string) => {
    setSelectedCodes(selectedCodes.filter(c => c !== code));
  };

  // Filter list for search input dropdown
  const filteredColleges = allColleges.filter(col => !selectedCodes.includes(col.code));

  return (
    <div className="space-y-8 w-full">
      <div className="space-y-2">
        <h1 className="text-3xl font-black font-display text-slate-850 dark:text-white flex items-center gap-2">
          <Building className="h-8 w-8 text-indigo-600 animate-pulse-soft" /> College Comparison Tool
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Select up to 3 colleges and compare fees, placement statistics, NAAC ratings, and course matrices side-by-side.
        </p>
      </div>

      {/* College Selection Search block */}
      <div className="glass-panel rounded-3xl p-6 shadow-md space-y-4">
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {selectedCodes.map(code => {
              const col = allColleges.find(c => c.code === code);
              return (
                <span 
                  key={code} 
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-500/25 animate-fade-in"
                >
                  {col ? col.name : code}
                  <button onClick={() => removeCollege(code)} className="p-0.5 rounded-full hover:bg-indigo-600 hover:text-white transition duration-200">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
            
            {selectedCodes.length === 0 && (
              <span className="text-sm text-slate-400 italic">No colleges selected yet. Select from search below.</span>
            )}
          </div>

          {selectedCodes.length < 3 && (
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Type college name or 5-digit code to compare..."
                value={searchQuery}
                onFocus={() => setShowDropdown(true)}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm"
              />
              
              {/* Dropdown list */}
              {showDropdown && searchQuery.trim() !== '' && (
                <div className="absolute left-0 right-0 mt-2 max-h-60 overflow-y-auto glass-panel rounded-xl shadow-lg z-30 divide-y divide-slate-100 dark:divide-slate-900 animate-fade-in">
                  {filteredColleges.length === 0 ? (
                    <div className="p-4 text-sm text-slate-400 text-center">No colleges found.</div>
                  ) : (
                    filteredColleges.map(col => (
                      <button
                        key={col.code}
                        onClick={() => addCollege(col.code)}
                        className="w-full text-left px-4 py-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-900 flex justify-between gap-4 font-semibold text-slate-700 dark:text-slate-300"
                      >
                        <span className="truncate">{col.name}</span>
                        <span className="shrink-0 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">Code: {col.code}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comparison Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Comparing college metrics...</p>
        </div>
      ) : compareData.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-500">
          <Info className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-600 dark:text-slate-400">Select colleges to view comparison chart.</p>
          <p className="text-xs text-slate-400 mt-1">You can add up to 3 colleges to compare placements, fees, and cutoffs side-by-side.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-800 dark:text-white">
                  <th className="py-5 px-6 font-bold w-1/4">Key Features</th>
                  {compareData.map(col => (
                    <th key={col.code} className="py-5 px-6 font-bold w-1/4 border-l border-slate-200 dark:border-slate-800">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Code: {col.code}</span>
                        <h4 className="text-sm font-black leading-tight text-slate-800 dark:text-white">{col.name}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold">{col.city}, {col.district}</p>
                      </div>
                    </th>
                  ))}
                  {/* Empty cells if fewer than 3 colleges */}
                  {Array.from({ length: 3 - compareData.length }).map((_, i) => (
                    <th key={i} className="py-5 px-6 text-slate-400 italic text-xs font-semibold w-1/4 border-l border-slate-200 dark:border-slate-800 text-center">
                      Select college to compare
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                
                {/* 1. Base details */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <td className="py-4 px-6 font-semibold bg-slate-100/10 text-slate-800 dark:text-slate-200">College Type</td>
                  {compareData.map(col => (
                    <td key={col.code} className="py-4 px-6 border-l border-slate-200 dark:border-slate-800 font-bold">{col.type}</td>
                  ))}
                  {Array.from({ length: 3 - compareData.length }).map((_, i) => <td key={i} className="border-l border-slate-200 dark:border-slate-800" />)}
                </tr>

                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <td className="py-4 px-6 font-semibold bg-slate-100/10 text-slate-800 dark:text-slate-200">Autonomy Status</td>
                  {compareData.map(col => (
                    <td key={col.code} className="py-4 px-6 border-l border-slate-200 dark:border-slate-800 font-bold">
                      {col.isAutonomous ? (
                        <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1"><Check className="h-4 w-4" /> Autonomous</span>
                      ) : 'Non-Autonomous'}
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareData.length }).map((_, i) => <td key={i} className="border-l border-slate-200 dark:border-slate-800" />)}
                </tr>

                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <td className="py-4 px-6 font-semibold bg-slate-100/10 text-slate-800 dark:text-slate-200">Accreditations</td>
                  {compareData.map(col => (
                    <td key={col.code} className="py-4 px-6 border-l border-slate-200 dark:border-slate-800">
                      <div className="flex flex-col gap-1 text-xs">
                        <span>NAAC Rating: <strong className="text-slate-800 dark:text-white">{col.naacRating || 'N/A'}</strong></span>
                        <span>NBA Accredited: <strong className="text-slate-800 dark:text-white">{col.nbaAccredited ? 'Yes' : 'No'}</strong></span>
                      </div>
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareData.length }).map((_, i) => <td key={i} className="border-l border-slate-200 dark:border-slate-800" />)}
                </tr>

                {/* 2. Fees */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <td className="py-4 px-6 font-semibold bg-slate-100/10 text-slate-800 dark:text-slate-200">Tuition Fees (Annual)</td>
                  {compareData.map(col => (
                    <td key={col.code} className="py-4 px-6 border-l border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-white flex items-center">
                      <DollarSign className="h-4 w-4 text-slate-400" /> ₹{col.fees.toLocaleString()}
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareData.length }).map((_, i) => <td key={i} className="border-l border-slate-200 dark:border-slate-800" />)}
                </tr>

                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <td className="py-4 px-6 font-semibold bg-slate-100/10 text-slate-800 dark:text-slate-200">Hostel Facility</td>
                  {compareData.map(col => (
                    <td key={col.code} className="py-4 px-6 border-l border-slate-200 dark:border-slate-800">
                      {col.hasHostel ? (
                        <span>Available (₹{col.hostelFees?.toLocaleString()}/yr)</span>
                      ) : 'No Hostel'}
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareData.length }).map((_, i) => <td key={i} className="border-l border-slate-200 dark:border-slate-800" />)}
                </tr>

                {/* 3. Placements */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <td className="py-4 px-6 font-semibold bg-slate-100/10 text-slate-800 dark:text-slate-200">Average Salary Package</td>
                  {compareData.map(col => (
                    <td key={col.code} className="py-4 px-6 border-l border-slate-200 dark:border-slate-800 font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Briefcase className="h-4 w-4" /> {col.avgPackage ? `${col.avgPackage} LPA` : 'N/A'}
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareData.length }).map((_, i) => <td key={i} className="border-l border-slate-200 dark:border-slate-800" />)}
                </tr>

                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <td className="py-4 px-6 font-semibold bg-slate-100/10 text-slate-800 dark:text-slate-200">Highest Salary Package</td>
                  {compareData.map(col => (
                    <td key={col.code} className="py-4 px-6 border-l border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-white">
                      {col.highestPackage ? `${col.highestPackage} LPA` : 'N/A'}
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareData.length }).map((_, i) => <td key={i} className="border-l border-slate-200 dark:border-slate-800" />)}
                </tr>

                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <td className="py-4 px-6 font-semibold bg-slate-100/10 text-slate-800 dark:text-slate-200">Placement %</td>
                  {compareData.map(col => (
                    <td key={col.code} className="py-4 px-6 border-l border-slate-200 dark:border-slate-800 font-semibold">
                      {col.placementPercentage ? `${col.placementPercentage}%` : 'N/A'}
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareData.length }).map((_, i) => <td key={i} className="border-l border-slate-200 dark:border-slate-800" />)}
                </tr>

                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <td className="py-4 px-6 font-semibold bg-slate-100/10 text-slate-800 dark:text-slate-200">NIRF Rank</td>
                  {compareData.map(col => (
                    <td key={col.code} className="py-4 px-6 border-l border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-white">
                      {col.nirfRank ? `#${col.nirfRank}` : 'N/A'}
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareData.length }).map((_, i) => <td key={i} className="border-l border-slate-200 dark:border-slate-800" />)}
                </tr>

                {/* 4. Cutoff Baselines */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <td className="py-4 px-6 font-semibold bg-slate-100/10 text-slate-800 dark:text-slate-200">CS Cutoff Round 3 (2024)</td>
                  {compareData.map(col => {
                    const csChoice = col.choices.find((ch: any) => ch.course.name.toLowerCase().includes('computer'));
                    const csCutoff = csChoice?.cutoffs.find((cut: any) => cut.year === '2024-25' && cut.round === 3 && cut.category === 'GOPENS');
                    return (
                      <td key={col.code} className="py-4 px-6 border-l border-slate-200 dark:border-slate-800 font-black text-rose-500">
                        {csCutoff ? `${csCutoff.percentile}%ile` : 'N/A'}
                      </td>
                    );
                  })}
                  {Array.from({ length: 3 - compareData.length }).map((_, i) => <td key={i} className="border-l border-slate-200 dark:border-slate-800" />)}
                </tr>

                {/* 5. Links */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <td className="py-4 px-6 font-semibold bg-slate-100/10 text-slate-800 dark:text-slate-200">Actions</td>
                  {compareData.map(col => (
                    <td key={col.code} className="py-4 px-6 border-l border-slate-200 dark:border-slate-800">
                      <div className="flex flex-col gap-2 text-xs">
                        <Link 
                          href={`/colleges/${col.code}`} 
                          className="text-center font-bold px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition duration-200 shadow-sm"
                        >
                          View Details
                        </Link>
                        {col.website && (
                          <a 
                            href={col.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-center font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1"
                          >
                            Website <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareData.length }).map((_, i) => <td key={i} className="border-l border-slate-200 dark:border-slate-800" />)}
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
