'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Compass, 
  MapPin, 
  Building, 
  BookOpen, 
  DollarSign, 
  Briefcase, 
  Award,
  Heart,
  Plus,
  Check,
  ChevronRight,
  Filter
} from 'lucide-react';

export default function PredictorPage() {
  const router = useRouter();
  // Candidate Profile State
  const [percentile, setPercentile] = useState('95.0');
  const [category, setCategory] = useState('OPEN');
  const [gender, setGender] = useState('MALE');
  const [homeUniversity, setHomeUniversity] = useState('Savitribai Phule Pune University');
  const [isTfws, setIsTfws] = useState(false);
  const [isPwd, setIsPwd] = useState(false);
  const [isDefense, setIsDefense] = useState(false);

  // Filters State
  const [round, setRound] = useState('3');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Results & Loading
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'Safe' | 'Moderate' | 'Dream'>('Moderate');
  const [favourites, setFavourites] = useState<string[]>([]);
  const [preferenceList, setPreferenceList] = useState<string[]>([]);
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);

  // Constants
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

  const districts = ['ALL', 'Pune', 'Mumbai', 'Thane', 'Nagpur', 'Amravati', 'Nashik', 'Sangli', 'Kolhapur', 'Satara', 'Chhatrapati Sambhajinagar'];
  const branches = [
    { code: 'ALL', name: 'All Branches' },
    { code: '2421', name: 'Computer Science & Engineering' },
    { code: '2461', name: 'Information Technology' },
    { code: '3721', name: 'Electronics & Telecommunication' },
    { code: '2512', name: 'Artificial Intelligence & Data Science' },
    { code: '1911', name: 'Civil Engineering' },
    { code: '6121', name: 'Mechanical Engineering' },
    { code: '2931', name: 'Electrical Engineering' },
  ];

  // Try to load cached user profile on mount
  useEffect(() => {
    const cachedUser = localStorage.getItem('cap_user');
    if (cachedUser) {
      const u = JSON.parse(cachedUser);
      setPercentile(u.percentile.toString());
      setCategory(u.category);
      setGender(u.gender);
      setHomeUniversity(u.homeUniversity);
      setIsTfws(u.isTfws);
      setIsPwd(u.isPwd);
      setIsDefense(u.isDefense);
      setHasLoadedProfile(true);
    }
    fetchFavourites();
    fetchPreferenceList();
  }, []);

  // Run prediction automatically when profile changes
  useEffect(() => {
    handlePredict();
  }, [homeUniversity, category, gender, round, selectedBranch, selectedDistrict, selectedType]);

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

  const handlePredict = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          percentile: parseFloat(percentile),
          category,
          gender,
          homeUniversity,
          isTfws,
          isPwd,
          isDefense,
          round: parseInt(round),
          courseCode: selectedBranch,
          district: selectedDistrict,
          collegeType: selectedType
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Admissions query failed');
      } else {
        setPredictions(data.predictions || []);
      }
    } catch (err) {
      setError('Connection failure. Please retry.');
    } finally {
      setLoading(false);
    }
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
      } else {
        // Redirect to login if unauthorized
        router.push('/auth/login');
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

  // Filter predictions by text query (supporting acronyms / short form)
  const filteredPredictions = predictions.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    
    const normQ = q.replace(/[^a-z0-9]/g, '');
    const normCollege = item.collegeName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normCourse = item.courseName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    return normCollege.includes(normQ) ||
           item.choiceCode.includes(q) ||
           normCourse.includes(normQ);
  });

  const tabResults = filteredPredictions.filter(item => item.status === activeTab);

  return (
    <div className="space-y-8 w-full">
      <div className="space-y-2">
        <h1 className="text-3xl font-black font-display text-slate-850 dark:text-white flex items-center gap-2">
          <Compass className="h-8 w-8 text-indigo-600 animate-spin-slow" /> CAP Option Predictor
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Calculate your admission probabilities based on standard CET quotas, categories, and rounds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form Panel: Profile Settings */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-6 h-fit lg:sticky lg:top-20 shadow-md">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
            <Filter className="h-5 w-5 text-indigo-600" /> Candidate Profile
          </h2>

          <form onSubmit={handlePredict} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">MHT CET Percentile</label>
              <input
                type="number"
                step="0.0001"
                required
                value={percentile}
                onChange={e => setPercentile(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white/50 dark:border-slate-800 dark:bg-slate-900/50 focus:ring-2 focus:ring-indigo-500 text-sm focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-xs focus:outline-none"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Gender</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-xs focus:outline-none"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Home University</label>
              <select
                value={homeUniversity}
                onChange={e => setHomeUniversity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-xs focus:outline-none"
              >
                {universities.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTfws}
                  onChange={e => setIsTfws(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-xs font-semibold">TFWS Seat Applicant</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPwd}
                  onChange={e => setIsPwd(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-xs font-semibold">Persons with Disabilities (PWD)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefense}
                  onChange={e => setIsDefense(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-xs font-semibold">Defense Personnel Child</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-sm transition duration-200 shadow-md shadow-indigo-500/10 disabled:opacity-50 mt-2"
            >
              {loading ? 'Re-calculating...' : 'Refresh Predictions'}
            </button>
          </form>
        </div>

        {/* Right Panel: Results lists & Tabs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Top filter row */}
          <div className="glass-panel rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">CAP Round</label>
              <select
                value={round}
                onChange={e => setRound(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none"
              >
                <option value="1">Round 1 Cutoffs</option>
                <option value="2">Round 2 Cutoffs</option>
                <option value="3">Round 3 Cutoffs</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Preferred Branch</label>
              <select
                value={selectedBranch}
                onChange={e => setSelectedBranch(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none"
              >
                {branches.map(b => (
                  <option key={b.code} value={b.code}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">District</label>
              <select
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none"
              >
                {districts.map(d => (
                  <option key={d} value={d}>{d === 'ALL' ? 'All Districts' : d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">College Type</label>
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none"
              >
                <option value="ALL">All Types</option>
                <option value="Government">Government Only</option>
                <option value="Private">Private Only</option>
              </select>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search predicted colleges or branch names..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm"
            />
          </div>

          {/* Safe / Moderate / Dream Tabs */}
          <div className="flex gap-2 p-1 bg-slate-200/50 dark:bg-slate-900/50 rounded-xl w-full">
            {(['Safe', 'Moderate', 'Dream'] as const).map(tab => {
              const count = filteredPredictions.filter(p => p.status === tab).length;
              const isActive = activeTab === tab;
              const colorClasses = {
                Safe: isActive ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-emerald-600 dark:text-slate-300',
                Moderate: isActive ? 'bg-amber-500 text-white shadow-md' : 'text-slate-600 hover:text-amber-500 dark:text-slate-300',
                Dream: isActive ? 'bg-rose-500 text-white shadow-md' : 'text-slate-600 hover:text-rose-600 dark:text-slate-300'
              }[tab];
              
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${colorClasses}`}
                >
                  {tab} Choices ({count})
                </button>
              );
            })}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-sm border border-rose-200/50">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading prediction metrics...</p>
            </div>
          ) : tabResults.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center text-slate-500">
              <Compass className="h-12 w-12 text-slate-300 mx-auto mb-3 animate-pulse" />
              <p className="font-semibold text-slate-600 dark:text-slate-400">No {activeTab} colleges match your profile & filters.</p>
              <p className="text-xs text-slate-400 mt-1">Try raising your search percentile or modifying branch location filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {tabResults.map((item, idx) => {
                const isFav = favourites.includes(item.choiceCode);
                const inPref = preferenceList.includes(item.choiceCode);
                
                return (
                  <div key={idx} className="glass-panel rounded-2xl p-5 hover:shadow-md transition-all duration-300 border border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      
                      {/* Left Block: College / Branch detail */}
                      <div className="space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 tracking-wider">
                            Code: {item.choiceCode}
                          </span>
                          {item.isAutonomous && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                              Autonomous
                            </span>
                          )}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            {item.collegeType}
                          </span>
                        </div>
                        
                        <h3 className="text-base font-black text-slate-800 dark:text-white leading-tight">
                          <Link href={`/colleges/${item.collegeCode}`} className="hover:underline hover:text-indigo-600 dark:hover:text-indigo-400">
                            {item.collegeName}
                          </Link>
                        </h3>

                        <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1"><BookOpen className="h-4 w-4 text-slate-400" /> {item.courseName}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-slate-400" /> {item.district}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-x-6 gap-y-1.5 pt-2 text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5 text-slate-400" /> Fees: ₹{(item.fees || 0).toLocaleString()}/yr</span>
                          {item.avgPackage && (
                            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold"><Briefcase className="h-3.5 w-3.5 text-indigo-500" /> Avg Salary: {item.avgPackage} LPA</span>
                          )}
                        </div>
                      </div>

                      {/* Right Block: Cutoff, Score & Actions */}
                      <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-4 shrink-0 sm:border-l sm:border-slate-200 sm:dark:border-slate-800 sm:pl-6 min-w-[130px]">
                        
                        {/* Match metrics */}
                        <div className="text-right space-y-1">
                          <div className="text-xs font-bold text-slate-400">Match Score</div>
                          <div className={`text-2xl font-black ${
                            activeTab === 'Safe' ? 'text-emerald-500' : activeTab === 'Moderate' ? 'text-amber-500' : 'text-rose-500'
                          }`}>
                            {item.predictionScore}%
                          </div>
                          <div className="text-[10px] text-slate-500 font-semibold">Cutoff: {item.avgCutoff}%ile</div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => toggleFavourite(item.choiceCode)}
                            className={`p-2 rounded-lg border transition-all duration-200 ${
                              isFav 
                                ? 'bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-950/20 dark:border-rose-900/50' 
                                : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-400 hover:text-rose-500'
                            }`}
                            title="Add to Favourites"
                          >
                            <Heart className={`h-4.5 w-4.5 ${isFav ? 'fill-current' : ''}`} />
                          </button>

                          <button
                            onClick={() => togglePreference(item.choiceCode)}
                            className={`flex items-center justify-center p-2 rounded-lg border transition-all duration-200 ${
                              inPref 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/50' 
                                : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-500 hover:text-emerald-600'
                            }`}
                            title={inPref ? "In Preference List" : "Add to Preference List"}
                          >
                            {inPref ? <Check className="h-4.5 w-4.5" /> : <Plus className="h-4.5 w-4.5" />}
                          </button>

                          <Link
                            href={`/colleges/${item.collegeCode}`}
                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200"
                            title="View Details"
                          >
                            <ChevronRight className="h-4.5 w-4.5" />
                          </Link>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
