'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  Building, 
  DollarSign, 
  Briefcase, 
  Award,
  Globe,
  Home,
  CheckCircle,
  ExternalLink,
  SlidersHorizontal
} from 'lucide-react';

export default function SearchPage() {
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination State
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [isAutonomous, setIsAutonomous] = useState('ALL');
  const [hasHostel, setHasHostel] = useState('ALL');
  const [selectedBranch, setSelectedBranch] = useState('ALL');

  const districts = ['ALL', 'Pune', 'Mumbai', 'Thane', 'Nagpur', 'Amravati', 'Nashik', 'Sangli', 'Kolhapur', 'Satara', 'Chhatrapati Sambhajinagar'];
  const branches = [
    { code: 'ALL', name: 'All Branches' },
    { code: '2421', name: 'Computer Science & Engineering' },
    { code: '2461', name: 'Information Technology' },
    { code: '3721', name: 'Electronics & Telecommunication' },
    { code: '2512', name: 'AI & Data Science' },
    { code: '1911', name: 'Civil Engineering' },
    { code: '6121', name: 'Mechanical Engineering' },
  ];

  useEffect(() => {
    fetchColleges(true);
  }, [selectedDistrict, selectedType, isAutonomous, hasHostel, selectedBranch]);

  const fetchColleges = async (reset = false) => {
    setLoading(true);
    setError('');
    const targetOffset = reset ? 0 : offset;
    if (reset) {
      setOffset(0);
      setHasMore(true);
    }
    
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedDistrict !== 'ALL') params.append('district', selectedDistrict);
      if (selectedType !== 'ALL') params.append('type', selectedType);
      if (isAutonomous !== 'ALL') params.append('isAutonomous', isAutonomous);
      if (hasHostel !== 'ALL') params.append('hasHostel', hasHostel);
      if (selectedBranch !== 'ALL') params.append('branch', selectedBranch);
      
      params.append('limit', '50');
      params.append('offset', targetOffset.toString());

      const res = await fetch(`/api/colleges?${params.toString()}`);
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to fetch colleges');
      } else {
        const newColleges = data.colleges || [];
        if (targetOffset === 0) {
          setColleges(newColleges);
        } else {
          setColleges(prev => [...prev, ...newColleges]);
        }
        if (newColleges.length < 50) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (err) {
      setError('Connection failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCollegesWithOffset = async (currentOffset: number) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedDistrict !== 'ALL') params.append('district', selectedDistrict);
      if (selectedType !== 'ALL') params.append('type', selectedType);
      if (isAutonomous !== 'ALL') params.append('isAutonomous', isAutonomous);
      if (hasHostel !== 'ALL') params.append('hasHostel', hasHostel);
      if (selectedBranch !== 'ALL') params.append('branch', selectedBranch);
      
      params.append('limit', '50');
      params.append('offset', currentOffset.toString());

      const res = await fetch(`/api/colleges?${params.toString()}`);
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to fetch colleges');
      } else {
        const newColleges = data.colleges || [];
        setColleges(prev => [...prev, ...newColleges]);
        if (newColleges.length < 50) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (err) {
      setError('Connection failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchColleges(true);
  };

  const handleLoadMore = () => {
    const nextOffset = offset + 50;
    setOffset(nextOffset);
    fetchCollegesWithOffset(nextOffset);
  };

  return (
    <div className="space-y-8 w-full">
      <div className="space-y-2">
        <h1 className="text-3xl font-black font-display text-slate-850 dark:text-white flex items-center gap-2">
          <Building className="h-8 w-8 text-indigo-600" /> College Directory
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Search and filter all engineering colleges in Maharashtra including placements, accreditations, and annual fees.
        </p>
      </div>

      {/* Main Search & Filters Block */}
      <div className="glass-panel rounded-3xl p-6 shadow-md space-y-6">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by college name, code, city, or university..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-28 py-3 rounded-2xl border border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition duration-200 shadow-md shadow-indigo-500/10"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <SlidersHorizontal className="h-3 w-3" /> District
            </label>
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
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <SlidersHorizontal className="h-3 w-3" /> College Type
            </label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="Government">Government</option>
              <option value="Government Aided">Government Aided</option>
              <option value="Private">Private</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <SlidersHorizontal className="h-3 w-3" /> Autonomy
            </label>
            <select
              value={isAutonomous}
              onChange={e => setIsAutonomous(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none"
            >
              <option value="ALL">All Colleges</option>
              <option value="true">Autonomous Only</option>
              <option value="false">Non-Autonomous Only</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <SlidersHorizontal className="h-3 w-3" /> Hostel
            </label>
            <select
              value={hasHostel}
              onChange={e => setHasHostel(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none"
            >
              <option value="ALL">All Colleges</option>
              <option value="true">Hostel Available</option>
              <option value="false">No Hostel</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <SlidersHorizontal className="h-3 w-3" /> Branch offered
            </label>
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
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-sm border border-rose-200/50">
          {error}
        </div>
      )}

      {loading && colleges.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading directory listings...</p>
        </div>
      ) : colleges.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-500">
          <SlidersHorizontal className="h-12 w-12 text-slate-300 mx-auto mb-3 animate-pulse" />
          <p className="font-semibold text-slate-600 dark:text-slate-400">No colleges match your filtering criteria.</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting district, type, or search queries.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {colleges.map((college, idx) => (
            <div key={idx} className="glass-panel rounded-2xl p-6 hover:shadow-md transition-all duration-300 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              
              <div className="space-y-4">
                {/* Header tags */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Code: {college.code}
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    {college.type}
                  </span>
                  {college.isAutonomous && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                      Autonomous
                    </span>
                  )}
                  {college.naacRating && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                      NAAC: {college.naacRating}
                    </span>
                  )}
                  {college.nbaAccredited && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      NBA
                    </span>
                  )}
                </div>

                {/* College Title */}
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-white leading-snug">
                    <Link href={`/colleges/${college.code}`} className="hover:underline hover:text-indigo-600 dark:hover:text-indigo-400">
                      {college.name}
                    </Link>
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {college.city}, {college.district}
                  </p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-100 dark:border-slate-900 text-xs">
                  <div className="space-y-1">
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Tuition Fees</p>
                    <p className="text-slate-700 dark:text-slate-200 font-bold flex items-center"><DollarSign className="h-3.5 w-3.5 text-slate-400" /> ₹{(college.fees || 0).toLocaleString()}/yr</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Avg Package</p>
                    <p className="text-slate-700 dark:text-slate-200 font-bold flex items-center"><Briefcase className="h-3.5 w-3.5 text-slate-400" /> {college.avgPackage ? `${college.avgPackage} LPA` : 'N/A'}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Placement Rate</p>
                    <p className="text-slate-700 dark:text-slate-200 font-bold flex items-center"><CheckCircle className="h-3.5 w-3.5 text-slate-400" /> {college.placementPercentage ? `${college.placementPercentage}%` : 'N/A'}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Hostel Facility</p>
                    <p className="text-slate-700 dark:text-slate-200 font-bold flex items-center"><Home className="h-3.5 w-3.5 text-slate-400" /> {college.hasHostel ? `Available (₹${(college.hostelFees || 0).toLocaleString()}/yr)` : 'No'}</p>
                  </div>
                </div>

                {/* Branches Offered List */}
                <div className="space-y-1">
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Offered CAP Branches ({college.choices.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {college.choices.slice(0, 3).map((ch: any, i: number) => (
                      <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                        {ch.course.name}
                      </span>
                    ))}
                    {college.choices.length > 3 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 text-slate-500">
                        +{college.choices.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-900 flex justify-between items-center text-xs">
                {college.website ? (
                  <a 
                    href={college.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 font-semibold"
                  >
                    <Globe className="h-4 w-4" /> Visit Website <ExternalLink className="h-3 w-3" />
                  </a>
                ) : <span />}

                <Link
                  href={`/colleges/${college.code}`}
                  className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 transition duration-200"
                >
                  View Details & Cutoffs
                </Link>
              </div>

            </div>
          ))}
        </div>
        
        {hasMore && !loading && colleges.length >= 50 && (
          <div className="flex justify-center pt-8">
            <button
              onClick={handleLoadMore}
              className="px-6 py-3 font-semibold text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-slate-900 dark:hover:bg-slate-850 border border-indigo-200/50 dark:border-slate-800 rounded-xl transition duration-200 shadow-md shadow-indigo-500/5 hover:shadow-indigo-500/10 cursor-pointer"
            >
              Load More Colleges
            </button>
          </div>
        )}
        
        {loading && colleges.length > 0 && (
          <div className="flex justify-center pt-8 text-sm text-slate-500 dark:text-slate-400">
            Loading next page...
          </div>
        )}
        </>
      )}
    </div>
  );
}
