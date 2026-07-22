"use client"

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { 
  Search, Building2, Clock, ExternalLink, Zap, 
  Briefcase, MapPin, RefreshCw, CheckCircle, AlertCircle,
  TrendingUp, Filter, ChevronDown, Tag
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

type Job = {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  postedAt: string;
  company: { name: string; logoUrl?: string };
  analyses: { scoreTotal: number; explanation?: string }[];
};

type DiscoverResult = {
  message: string;
  keywords: string[];
  inserted: number;
  total: number;
};

function SearchPageContent() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoverResult, setDiscoverResult] = useState<DiscoverResult | null>(null);
  const [discoverError, setDiscoverError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchJobs = useCallback(async (searchQuery = query, sortBy = sort) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/auth/login'); return; }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/jobs/search?query=${encodeURIComponent(searchQuery)}&sort=${sortBy}&limit=30`,
        { headers: { 'Authorization': `Bearer ${session.access_token}` } }
      );

      if (res.ok) {
        const json = await res.json();
        setJobs(json.data || []);
        setTotal(json.meta?.total || 0);
      } else {
        setFetchError(`Backend returned ${res.status}. Is the server running on port 3001?`);
      }
    } catch (err: any) {
      console.error('fetchJobs error:', err);
      setFetchError('Cannot reach the backend. Make sure the dev server is running.');
    } finally {
      setIsLoading(false);
    }
  }, [query, sort, supabase, router]);

  const handleDiscover = useCallback(async () => {
    setIsDiscovering(true);
    setDiscoverResult(null);
    setDiscoverError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/auth/login'); return; }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/discover`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const result = await res.json();
        setDiscoverResult(result);
        await fetchJobs(); // Refresh the list
      } else {
        const err = await res.json().catch(() => ({}));
        setDiscoverError(err.message || 'Discovery failed. Please try again.');
      }
    } catch (err: any) {
      setDiscoverError(err.message || 'Network error. Is the backend running?');
    } finally {
      setIsDiscovering(false);
    }
  }, [supabase, router, fetchJobs]);

  useEffect(() => {
    fetchJobs();
    
    // Auto-discover if coming from successful resume review page
    if (searchParams.get('discover') === 'true') {
      // Clear URL parameter so refreshes don't re-trigger it
      const newUrl = window.location.pathname;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
      
      handleDiscover();
    }
  }, [sort, searchParams, handleDiscover]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(query, sort);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (score >= 60) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (score >= 40) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const getSourceBadge = (source: string) => {
    const map: Record<string, { label: string; color: string }> = {
      remotive: { label: 'Remotive', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
      arbeitnow: { label: 'ArbeitNow', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
      greenhouse: { label: 'Greenhouse', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
      lever: { label: 'Lever', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
      ashby: { label: 'Ashby', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
    };
    const key = ((source || '').split('-')[0] || '').toLowerCase();
    const info = map[key] || { label: source || 'Job Board', color: 'bg-white/10 text-gray-300 border-white/10' };
    return <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${info.color}`}>{info.label}</span>;
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Job Discovery</h1>
          <p className="text-gray-400 mt-1">
            {total > 0 ? `${total} curated jobs matched to your profile` : 'Discover jobs matched to your resume'}
          </p>
        </div>

        {/* Discover Button */}
        <button
          id="discover-jobs-btn"
          onClick={handleDiscover}
          disabled={isDiscovering}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all shadow-[0_0_20px_rgba(124,58,237,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isDiscovering ? (
            <><RefreshCw className="w-5 h-5 animate-spin" /> Scraping Jobs...</>
          ) : (
            <><Zap className="w-5 h-5" /> Discover New Jobs</>
          )}
        </button>
      </div>

      {/* Discovery Feedback Banner */}
      {discoverResult && (
        <div className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
          <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-emerald-300 font-semibold">{discoverResult.message}</p>
            <p className="text-emerald-400/70 text-sm mt-1">
              Searched for: {discoverResult.keywords.join(' · ')}
            </p>
          </div>
        </div>
      )}
      {discoverError && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-red-300">{discoverError}</p>
        </div>
      )}
      {fetchError && (
        <div className="flex items-center justify-between gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-amber-300 text-sm">{fetchError}</p>
          </div>
          <button
            onClick={() => fetchJobs()}
            className="shrink-0 px-4 py-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-medium rounded-lg hover:bg-amber-500/30 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search + Filter Bar */}
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            id="job-search-input"
            placeholder="Search by title, company, or skill..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>
        <select
          value={sort}
          onChange={e => { setSort(e.target.value); fetchJobs(query, e.target.value); }}
          className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white cursor-pointer focus:outline-none focus:border-indigo-500"
        >
          <option value="newest">Newest First</option>
          <option value="best_match">Best Match</option>
        </select>
        <button
          type="submit"
          id="job-search-btn"
          className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition shadow-[0_0_15px_rgba(99,102,241,0.3)]"
        >
          Search
        </button>
      </form>

      {/* Results */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
          </div>
          <p className="text-gray-400">Loading jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
            <Briefcase className="w-10 h-10 text-gray-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">No Jobs Found</h3>
            <p className="text-gray-500 mt-1">Click <strong className="text-violet-400">Discover New Jobs</strong> to scrape live postings matched to your resume.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => {
            const analysis = job.analyses?.[0];
            const score = analysis?.scoreTotal;

            return (
              <div
                key={job.id}
                className="group bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-indigo-500/40 hover:bg-white/[0.05] transition-all duration-200 flex flex-col md:flex-row gap-6"
              >
                {/* Left: Job Info */}
                <div className="flex-1 space-y-3 min-w-0">
                  {/* Title Row */}
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-lg font-bold text-white group-hover:text-indigo-300 transition leading-tight">
                      {job.title}
                    </h2>
                    {score != null && score > 0 && (
                      <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(score)}`}>
                        <TrendingUp className="w-3 h-3" />
                        {score}% Match
                      </div>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1.5 text-gray-300 font-medium">
                      <Building2 className="w-4 h-4" />
                      {job.company?.name || 'Unknown Company'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      Remote
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {timeAgo(job.postedAt)}
                    </span>
                    {getSourceBadge(job.source)}
                  </div>

                  {/* Description Preview */}
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                {/* Right: Actions */}
                <div className="flex md:flex-col items-center md:items-stretch gap-3 md:w-36 shrink-0">
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    id={`apply-btn-${job.id}`}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-500 transition shadow-[0_0_12px_rgba(99,102,241,0.25)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                  >
                    Apply <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
}

export default function JobSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="relative w-16 h-16 animate-pulse">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
        </div>
        <p className="text-gray-400">Loading Job Discovery...</p>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
