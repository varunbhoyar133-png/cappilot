'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, BookOpen, SlidersHorizontal, Award, ChevronRight, TrendingUp } from 'lucide-react';

export default function TrendsPage() {
  const [colleges, setColleges] = useState<any[]>([]);
  const [selectedCollegeCode, setSelectedCollegeCode] = useState('');
  const [selectedBranchCode, setSelectedBranchCode] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('GOPENS');
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = ['GOPENS', 'GOPENH', 'LOPENS', 'LOPENH', 'GSCS', 'GSTS', 'GOBCH', 'GOBCS', 'EWS', 'TFWS'];

  useEffect(() => {
    async function loadColleges() {
      try {
        const res = await fetch('/api/colleges');
        if (res.ok) {
          const data = await res.json();
          setColleges(data.colleges || []);
          if (data.colleges && data.colleges.length > 0) {
            setSelectedCollegeCode(data.colleges[0].code);
          }
        }
      } catch (e) {}
    }
    loadColleges();
  }, []);

  // Fetch trend data whenever college, branch, or category changes
  useEffect(() => {
    if (!selectedCollegeCode) return;
    
    async function loadTrends() {
      setLoading(true);
      try {
        const res = await fetch(`/api/colleges/${selectedCollegeCode}`);
        if (res.ok) {
          const data = await res.json();
          const col = data.college;
          
          // Auto select first branch if none selected or if selected branch not offered by this college
          const offeredChoices = col.choices || [];
          let currentChoice = offeredChoices.find((ch: any) => ch.courseCode === selectedBranchCode);
          if (!currentChoice && offeredChoices.length > 0) {
            currentChoice = offeredChoices[0];
            setSelectedBranchCode(offeredChoices[0].courseCode);
          }

          if (currentChoice) {
            // Filter cutoffs for selected category
            const cutoffs = currentChoice.cutoffs || [];
            
            // Map round and year structures
            const formattedTrends = [];
            for (const year of ['2022-2023', '2023-24', '2024-25']) {
              for (const round of [1, 2, 3]) {
                const matched = cutoffs.find(
                  (c: any) => c.year === year && c.round === round && c.category === selectedCategory
                );
                formattedTrends.push({
                  year,
                  round,
                  percentile: matched ? matched.percentile : null,
                  rank: matched ? matched.meritRank : null
                });
              }
            }
            setTrendData(formattedTrends);
          } else {
            setTrendData([]);
          }
        }
      } catch (e) {}
      setLoading(false);
    }
    loadTrends();
  }, [selectedCollegeCode, selectedBranchCode, selectedCategory]);

  const activeCollege = colleges.find(c => c.code === selectedCollegeCode);
  const collegeBranches = activeCollege?.choices.map((ch: any) => ch.course) || [];

  // Generate SVG points for the trend graph
  const getGraphPoints = () => {
    // Keep only valid entries
    const validPoints = trendData.filter(d => d.percentile !== null);
    if (validPoints.length <= 1) return "";
    
    // SVG width: 500, height: 200
    // X scale: map 0 to validPoints.length-1 to range 50 -> 450
    // Y scale: map percentile range min-1 to max+1 to range 170 -> 30
    const percentiles = validPoints.map(p => p.percentile);
    const minP = Math.min(...percentiles) - 0.5;
    const maxP = Math.max(...percentiles) + 0.5;
    const pDiff = maxP - minP || 1;

    return validPoints.map((pt, idx) => {
      const x = 50 + (idx * 400) / (validPoints.length - 1);
      const y = 170 - ((pt.percentile - minP) * 140) / pDiff;
      return `${x},${y}`;
    }).join(" ");
  };

  return (
    <div className="space-y-8 w-full">
      <div className="space-y-2">
        <h1 className="text-3xl font-black font-display text-slate-850 dark:text-white flex items-center gap-2">
          <LineChart className="h-8 w-8 text-indigo-600" /> Cutoff Trend Visualizer
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track course cutoff shifts across CAP Round 1, 2, and 3 for the years 2022, 2023, and 2024.
        </p>
      </div>

      {/* Selectors Form */}
      <div className="glass-panel rounded-3xl p-6 shadow-md grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Target College</label>
          <select
            value={selectedCollegeCode}
            onChange={e => {
              setSelectedCollegeCode(e.target.value);
              setSelectedBranchCode('');
            }}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {colleges.map(c => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Engineering Branch</label>
          <select
            value={selectedBranchCode}
            onChange={e => setSelectedBranchCode(e.target.value)}
            disabled={collegeBranches.length === 0}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {collegeBranches.map((b: any) => (
              <option key={b.code} value={b.code}>{b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Category Quota</label>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading trend records...</p>
        </div>
      ) : trendData.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-500">
          <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-650 dark:text-slate-400">No cutoff history found for this combination.</p>
          <p className="text-xs text-slate-400 mt-1">Try selecting another category or branch.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left panel: Custom SVG chart */}
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 shadow-md space-y-4">
            <h3 className="text-base font-bold text-slate-850 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" /> Historical Cutoff Percentile Curve
            </h3>

            {/* Custom SVG Line Chart */}
            <div className="w-full overflow-hidden bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-900">
              <svg viewBox="0 0 500 200" className="w-full h-64 overflow-visible">
                {/* Horizontal grid lines */}
                <line x1="50" y1="30" x2="450" y2="30" stroke="#94a3b8" strokeOpacity="0.1" strokeDasharray="4 4" />
                <line x1="50" y1="100" x2="450" y2="100" stroke="#94a3b8" strokeOpacity="0.1" strokeDasharray="4 4" />
                <line x1="50" y1="170" x2="450" y2="170" stroke="#94a3b8" strokeOpacity="0.1" strokeDasharray="4 4" />

                {/* Trend line */}
                {getGraphPoints() && (
                  <>
                    <polyline
                      fill="none"
                      stroke="url(#indigo-grad)"
                      strokeWidth="3.5"
                      points={getGraphPoints()}
                      className="transition-all duration-500"
                    />
                    
                    {/* SVG Gradient definition */}
                    <defs>
                      <linearGradient id="indigo-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4f46e5" />
                        <stop offset="100%" stopColor="#9333ea" />
                      </linearGradient>
                    </defs>
                  </>
                )}

                {/* Plot points & labels */}
                {trendData.filter(d => d.percentile !== null).map((pt, idx, arr) => {
                  const percentiles = arr.map(p => p.percentile);
                  const minP = Math.min(...percentiles) - 0.5;
                  const maxP = Math.max(...percentiles) + 0.5;
                  const pDiff = maxP - minP || 1;
                  const x = 50 + (idx * 400) / (arr.length - 1);
                  const y = 170 - ((pt.percentile - minP) * 140) / pDiff;

                  return (
                    <g key={idx} className="group cursor-pointer">
                      <circle
                        cx={x}
                        cy={y}
                        r="6"
                        className="fill-indigo-600 dark:fill-indigo-400 stroke-white dark:stroke-slate-950 stroke-2 hover:r-8 transition-all"
                      />
                      {/* Tooltip label */}
                      <text
                        x={x}
                        y={y - 12}
                        textAnchor="middle"
                        className="text-[9px] font-black fill-slate-800 dark:fill-slate-200"
                      >
                        {pt.percentile.toFixed(2)}%
                      </text>
                      {/* X axis labels */}
                      <text
                        x={x}
                        y="190"
                        textAnchor="middle"
                        className="text-[8px] font-bold fill-slate-400 uppercase"
                      >
                        {pt.year.replace('2022-2023', '22-23').replace('2023-24', '23-24').replace('2024-25', '24-25')} R{pt.round}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Right panel: Comparative numbers table */}
          <div className="glass-panel rounded-3xl p-6 shadow-md space-y-4 h-fit">
            <h3 className="text-base font-bold text-slate-850 dark:text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" /> Cutoff Data Sheet
            </h3>

            <div className="space-y-4">
              <div className="divide-y divide-slate-100 dark:divide-slate-900 text-xs">
                {trendData.map((d, idx) => (
                  <div key={idx} className="flex justify-between py-2.5 hover:bg-slate-50/50 dark:hover:bg-slate-900/15 rounded px-2">
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-350">Year {d.year} (Round {d.round})</p>
                      <p className="text-[10px] text-slate-400 font-semibold">Merit Rank: {d.rank ? `#${d.rank.toLocaleString()}` : 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                        {d.percentile !== null ? `${d.percentile.toFixed(4)}%ile` : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
