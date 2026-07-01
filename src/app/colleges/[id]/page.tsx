'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Building, 
  MapPin, 
  Globe, 
  Compass, 
  DollarSign, 
  Briefcase, 
  Award, 
  Home, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle,
  ExternalLink,
  Phone,
  Bookmark,
  Plus,
  SlidersHorizontal
} from 'lucide-react';

export default function CollegeDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [college, setCollege] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'placements' | 'cutoffs' | 'courses' | 'fees'>('overview');
  
  // Cutoffs filters
  const [selectedYear, setSelectedYear] = useState('2024-25');
  const [selectedRound, setSelectedRound] = useState(3);
  const [selectedCategory, setSelectedCategory] = useState('GOPENS');
  const [expandedChoice, setExpandedChoice] = useState<string | null>(null);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [preferenceList, setPreferenceList] = useState<string[]>([]);

  const categories = ['GOPENS', 'GOPENH', 'LOPENS', 'LOPENH', 'GSCS', 'GSTS', 'GOBCH', 'GOBCS', 'EWS', 'TFWS'];

  useEffect(() => {
    if (id) {
      fetchCollegeDetails();
    }
    fetchFavourites();
    fetchPreferenceList();
  }, [id]);

  const fetchCollegeDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/colleges/${id}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to load college details');
      } else {
        setCollege(data.college);
      }
    } catch (e) {
      setError('Connection failure.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavourites = async () => {
    try {
      const res = await fetch('/api/favourites');
      if (res.ok) {
        const data = await res.json();
        setFavourites(data.favourites.map((f: any) => f.choiceCode));
      }
    } catch (e) {}
  };

  const fetchPreferenceList = async () => {
    try {
      const res = await fetch('/api/preferences');
      if (res.ok) {
        const data = await res.json();
        if (data.preferenceList) {
          setPreferenceList(data.preferenceList.choiceCodes || []);
        }
      }
    } catch (e) {}
  };

  const toggleFavourite = async (choiceCode: string) => {
    try {
      const res = await fetch('/api/favourites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choiceCode })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.added) {
          setFavourites([...favourites, choiceCode]);
        } else {
          setFavourites(favourites.filter(f => f !== choiceCode));
        }
      }
    } catch (e) {}
  };

  const togglePreference = async (choiceCode: string) => {
    let newList;
    if (preferenceList.includes(choiceCode)) {
      newList = preferenceList.filter(c => c !== choiceCode);
    } else {
      newList = [...preferenceList, choiceCode];
    }
    
    setPreferenceList(newList);

    try {
      await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choiceCodes: newList })
      });
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-3">
        <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading profile data...</p>
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center text-slate-500 max-w-xl mx-auto mt-20">
        <Building className="h-12 w-12 text-slate-350 mx-auto mb-3" />
        <p className="font-semibold text-rose-500">{error || 'College not found'}</p>
        <p className="text-xs text-slate-400 mt-1 mb-4">Please verify the college code and try again.</p>
        <Link href="/search" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs shadow-md">
          Back to Directory
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'placements', name: 'Placements' },
    { id: 'cutoffs', name: 'Cutoffs' },
    { id: 'courses', name: 'Courses & Seats' },
    { id: 'fees', name: 'Hostel & Fees' }
  ] as const;

  return (
    <div className="space-y-8 w-full">
      
      {/* Hero Banner Header */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 tracking-wider">
              College Code: {college.code}
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              {college.type}
            </span>
            {college.isAutonomous && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                Autonomous
              </span>
            )}
            {college.naacRating && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                NAAC Rating: {college.naacRating}
              </span>
            )}
            {college.nbaAccredited && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                NBA Accredited
              </span>
            )}
            {college.nirfRank && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400">
                NIRF: #{college.nirfRank}
              </span>
            )}
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-black font-display text-slate-850 dark:text-white leading-tight">
              {college.name}
            </h1>
            <p className="text-sm text-slate-400 font-semibold mt-1.5 flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {college.city}, {college.district}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 p-1 bg-slate-200/50 dark:bg-slate-900/50 rounded-xl overflow-x-auto">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-xs font-semibold rounded-lg shrink-0 transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-650 hover:bg-slate-200/50 dark:text-slate-300 dark:hover:bg-slate-900/50'
              }`}
            >
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="animate-fade-in">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-panel rounded-3xl p-6 shadow-md space-y-6">
              <h2 className="text-lg font-bold text-slate-850 dark:text-white border-l-4 border-indigo-600 pl-2">About Institution</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {college.name} is a premier engineering institution located in {college.city}, Maharashtra. Backed by {college.isAutonomous ? "academic autonomy" : "standard curriculum boundaries"}, it offers state-of-the-art laboratory infrastructure, active industry internship portals, and highly structured placement counseling programs.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-900 text-xs">
                <div className="space-y-1.5">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] block">Location Info</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 block">{college.city}, District: {college.district}</span>
                </div>
                <div className="space-y-1.5">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] block">Affiliation</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 block">Affiliated to regional state university system</span>
                </div>
                {college.website && (
                  <div className="space-y-1.5">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] block">Portal Link</span>
                    <a href={college.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
                      {college.website} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                <div className="space-y-1.5">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] block">Contact Support</span>
                  <span className="font-semibold text-slate-750 dark:text-slate-200 flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> +91 22 2419 8000</span>
                </div>
              </div>
            </div>

            {/* Google maps iframe block */}
            <div className="glass-panel rounded-3xl p-6 shadow-md h-fit space-y-4">
              <h2 className="text-base font-bold text-slate-850 dark:text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-rose-500" /> Location Map
              </h2>
              
              <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-850">
                <iframe
                  title="Google Maps"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(college.name)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
              
              <p className="text-[10px] text-slate-400 text-center font-semibold uppercase tracking-wider">
                Interactive routing embed
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: PLACEMENTS */}
        {activeTab === 'placements' && (
          <div className="glass-panel rounded-3xl p-6 shadow-md space-y-6">
            <h2 className="text-lg font-bold text-slate-850 dark:text-white border-l-4 border-indigo-600 pl-2">Placement Highlights</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 text-center space-y-1">
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Average CTC</p>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{college.avgPackage ? `${college.avgPackage} LPA` : 'N/A'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 text-center space-y-1">
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Highest CTC</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white">{college.highestPackage ? `${college.highestPackage} LPA` : 'N/A'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 text-center space-y-1">
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Median Package</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white">{college.medianPackage ? `${college.medianPackage} LPA` : 'N/A'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 text-center space-y-1">
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Placement Rate</p>
                <p className="text-2xl font-black text-emerald-500">{college.placementPercentage ? `${college.placementPercentage}%` : 'N/A'}</p>
              </div>
            </div>

            {/* Custom visual comparisons grid */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-900 space-y-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350">Package Distribution Visualizer</h3>
              
              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Average salary package</span>
                    <span>{college.avgPackage || 4.5} LPA</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full" style={{ width: `${Math.min(((college.avgPackage || 4.5) / 25) * 100, 100)}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Highest salary package</span>
                    <span>{college.highestPackage || 12.0} LPA</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" style={{ width: `${Math.min(((college.highestPackage || 12) / 60) * 100, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: CUTOFFS */}
        {activeTab === 'cutoffs' && (
          <div className="glass-panel rounded-3xl p-6 shadow-md space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-150 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
                <SlidersHorizontal className="h-5 w-5 text-indigo-600" /> Historical Option Forms Cutoffs
              </h2>

              {/* Filters toolbar */}
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] font-bold focus:outline-none"
                >
                  <option value="2024-25">Year 2024-25</option>
                  <option value="2023-24">Year 2023-24</option>
                  <option value="2022-2023">Year 2022-23</option>
                </select>

                <select
                  value={selectedRound}
                  onChange={e => setSelectedRound(Number(e.target.value))}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] font-bold focus:outline-none"
                >
                  <option value="1">CAP Round 1</option>
                  <option value="2">CAP Round 2</option>
                  <option value="3">CAP Round 3</option>
                </select>

                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] font-bold focus:outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Accordion List for Choice courses */}
            <div className="space-y-3.5">
              {college.choices.map((choice: any) => {
                const isExpanded = expandedChoice === choice.choiceCode;
                
                // Find cutoff matching year, round, category
                const targetCutoff = choice.cutoffs.find(
                  (c: any) => c.year === selectedYear && c.round === selectedRound && c.category === selectedCategory
                );

                const isFav = favourites.includes(choice.choiceCode);
                const inPref = preferenceList.includes(choice.choiceCode);

                return (
                  <div key={choice.choiceCode} className="border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden hover:border-indigo-600/30 transition duration-200">
                    <div 
                      className="p-4 bg-slate-50/40 dark:bg-slate-900/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer"
                      onClick={() => setExpandedChoice(isExpanded ? null : choice.choiceCode)}
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold bg-slate-200/50 dark:bg-slate-800/80 text-slate-500 px-2 py-0.5 rounded tracking-wider">
                          Choice Code: {choice.choiceCode}
                        </span>
                        <h4 className="text-sm font-black text-slate-800 dark:text-white leading-tight">
                          {choice.course.name}
                        </h4>
                      </div>

                      {/* Display percentile & action buttons */}
                      <div className="flex items-center gap-6 shrink-0 ml-auto sm:ml-0">
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Cutoff percentile</span>
                          <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                            {targetCutoff ? `${targetCutoff.percentile.toFixed(4)}%ile` : 'N/A'}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavourite(choice.choiceCode); }}
                            className={`p-1.5 rounded-lg border transition ${
                              isFav ? 'bg-rose-50 border-rose-200 text-rose-500' : 'border-slate-200 text-slate-400 hover:text-rose-500'
                            }`}
                          >
                            <Bookmark className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
                          </button>
                          
                          <button
                            onClick={(e) => { e.stopPropagation(); togglePreference(choice.choiceCode); }}
                            className={`p-1.5 rounded-lg border transition ${
                              inPref ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'border-slate-200 text-slate-500 hover:text-emerald-600'
                            }`}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                        </div>
                      </div>
                    </div>

                    {/* Expand cutoff detail sheet */}
                    {isExpanded && (
                      <div className="p-4 border-t border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-950/40 text-xs text-slate-500 space-y-3">
                        <p className="font-bold text-slate-700 dark:text-slate-300">Round {selectedRound} Merit Rank details: {targetCutoff?.meritRank ? `#${targetCutoff.meritRank.toLocaleString()}` : 'N/A'}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-[11px]">
                          <div>
                            <span className="font-semibold block text-[10px] text-slate-400 uppercase tracking-widest mb-1">Quota Details</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{choice.status}</span>
                            <span className="block text-slate-400 mt-0.5">Home University: {choice.homeUniversity}</span>
                          </div>
                          <div>
                            <span className="font-semibold block text-[10px] text-slate-400 uppercase tracking-widest mb-1">Cutoff Stage</span>
                            <span>Allotted during Stage {targetCutoff?.stage || 'I'} of counseling rounds</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: COURSES & SEAT MATRIX */}
        {activeTab === 'courses' && (
          <div className="glass-panel rounded-3xl p-6 shadow-md space-y-6">
            <h2 className="text-lg font-bold text-slate-850 dark:text-white border-l-4 border-indigo-600 pl-2">Offered Courses & Seat Capacities</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400 border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase text-slate-400">
                    <th className="py-3 pr-4">Branch Title</th>
                    <th className="py-3 text-right">Intake</th>
                    <th className="py-3 text-right">MS Seats</th>
                    <th className="py-3 text-right">EWS</th>
                    <th className="py-3 text-right">TFWS</th>
                    <th className="py-3 text-right">Minority</th>
                    <th className="py-3 text-right">All India</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-700 dark:text-slate-350">
                  {college.choices.map((choice: any) => (
                    <tr key={choice.choiceCode} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/15">
                      <td className="py-4 pr-4 font-semibold text-slate-800 dark:text-slate-200">
                        {choice.course.name}
                        <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">Code: {choice.choiceCode}</span>
                      </td>
                      <td className="py-4 text-right font-bold text-slate-800 dark:text-white">{choice.sanctionedIntake || 60}</td>
                      <td className="py-4 text-right">{choice.msSeats || 0}</td>
                      <td className="py-4 text-right font-semibold text-indigo-650 dark:text-indigo-400">{choice.ewsSeats || 0}</td>
                      <td className="py-4 text-right font-semibold text-purple-650 dark:text-purple-400">{choice.tfwsSeats || 0}</td>
                      <td className="py-4 text-right">{choice.minoritySeats || 0}</td>
                      <td className="py-4 text-right">{choice.allIndiaSeats || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: FEES */}
        {activeTab === 'fees' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-panel rounded-3xl p-6 shadow-md space-y-6">
              <h2 className="text-lg font-bold text-slate-850 dark:text-white border-l-4 border-indigo-600 pl-2">Annual Tuition Fees</h2>
              
              <div className="divide-y divide-slate-100 dark:divide-slate-900 text-xs">
                <div className="flex justify-between py-3">
                  <span className="font-semibold text-slate-600">Open Category Tuition Fees</span>
                  <span className="font-bold text-slate-800 dark:text-white">₹{(college.fees || 0).toLocaleString()}/year</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="font-semibold text-slate-600">OBC Category Fees (50% Waiver)</span>
                  <span className="font-bold text-slate-800 dark:text-white">₹{((college.fees || 0) * 0.5).toLocaleString()}/year</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="font-semibold text-slate-600">SC / ST Category Fees (100% Waiver)</span>
                  <span className="font-bold text-slate-800 dark:text-white">₹{((college.fees || 0) * 0.1).toLocaleString()}/year (Excl. dev charges)</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="font-semibold text-slate-600">EWS / TFWS Waiver Option Fees</span>
                  <span className="font-bold text-slate-850 dark:text-white">₹{((college.fees || 0) * 0.15).toLocaleString()}/year</span>
                </div>
              </div>
            </div>

            {/* Hostel Facility Info card */}
            <div className="glass-panel rounded-3xl p-6 shadow-md h-fit space-y-4">
              <h2 className="text-base font-bold text-slate-850 dark:text-white flex items-center gap-2">
                <Home className="h-5 w-5 text-indigo-600" /> Hostel Facilities
              </h2>
              
              <div className="text-xs space-y-3.5">
                <div className="flex justify-between items-center">
                  <span>Hostel Option</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${college.hasHostel ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                    {college.hasHostel ? 'Available' : 'Not Available'}
                  </span>
                </div>
                
                {college.hasHostel && (
                  <>
                    <div className="flex justify-between">
                      <span>Annual Charges</span>
                      <span className="font-bold text-slate-850 dark:text-white">₹{(college.hostelFees || 0).toLocaleString()}/year</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mess Charges</span>
                      <span className="font-bold text-slate-850 dark:text-white">₹24,000/year (Typical)</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
