'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { 
  Search, Building2, Clock, ExternalLink, Sparkles,
  MapPin, CheckCircle, AlertCircle, TrendingUp
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
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
        await fetchJobs();
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
    
    if (searchParams.get('discover') === 'true') {
      const newUrl = window.location.pathname;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
      handleDiscover();
    }
  }, [sort, searchParams, handleDiscover]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(query, sort);
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
    <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-10 min-h-[calc(100vh-64px)] relative z-10">
      
      <motion.header 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/30 pb-6"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-bold tracking-widest uppercase text-glass-olive mb-3">Discovery</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight" style={{ fontFamily: 'var(--font-lora)' }}>
            Job Search
          </h1>
          <p className="text-muted-foreground mt-4 font-medium text-lg">
            {total > 0 ? `${total} curated jobs matched to your profile.` : 'Discover jobs matched to your resume.'}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDiscover}
          disabled={isDiscovering}
          className="glass-floating text-glass-charcoal px-6 py-3 rounded-full font-semibold text-sm flex items-center gap-2 group shrink-0"
        >
          {isDiscovering ? (
            <><div className="w-4 h-4 border-2 border-glass-olive/30 border-t-glass-olive rounded-full animate-spin" /> Scraping Jobs...</>
          ) : (
            <><Sparkles className="w-4 h-4 text-glass-olive group-hover:rotate-12 transition-transform" /> Discover New Jobs</>
          )}
        </motion.button>
      </motion.header>

      {discoverResult && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-4 p-5 glass-panel rounded-xl border border-glass-olive/20">
          <CheckCircle className="w-5 h-5 text-glass-olive mt-0.5 shrink-0" />
          <div>
            <p className="text-foreground font-bold">{discoverResult.message}</p>
            <p className="text-muted-foreground text-sm mt-1 font-medium">
              Searched for: {discoverResult.keywords.join(' · ')}
            </p>
          </div>
        </motion.div>
      )}

      <motion.form 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        onSubmit={handleSearch} 
        className="flex flex-col md:flex-row gap-4 glass-panel p-3 rounded-2xl"
      >
        <div className="flex-1 relative flex items-center">
          <Search className="w-5 h-5 absolute left-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, company, or skill..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent border-none py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:ring-0 focus:outline-none font-medium"
          />
        </div>
        <div className="h-10 w-px bg-white/40 hidden md:block self-center" />
        <select
          value={sort}
          onChange={e => { setSort(e.target.value); fetchJobs(query, e.target.value); }}
          className="bg-transparent border-none py-3 px-4 text-foreground cursor-pointer focus:ring-0 focus:outline-none font-medium appearance-none min-w-[140px]"
        >
          <option value="newest">Newest First</option>
          <option value="best_match">Best Match</option>
        </select>
      </motion.form>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-4 h-4 rounded-full bg-glass-olive animate-pulse" />
          <p className="text-muted-foreground font-medium text-sm">Curating opportunities...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center glass-panel rounded-3xl border-dashed">
          <div className="w-12 h-12 rounded-full bg-glass-cream flex items-center justify-center mb-4">
            <Search className="w-5 h-5 text-glass-olive" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-lora)' }}>No Jobs Found</h3>
          <p className="text-muted-foreground text-sm font-medium">Try adjusting your search or click Discover New Jobs.</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4">
          {jobs.map((job) => {
            const analysis = job.analyses?.[0];
            const score = analysis?.scoreTotal;

            return (
              <motion.div
                variants={item}
                key={job.id}
                whileHover={{ scale: 1.01, y: -2 }}
                className="group glass-panel rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center"
              >
                <div className="w-12 h-12 rounded-xl bg-glass-cream border border-glass-olive/10 flex items-center justify-center shrink-0">
                  <span className="font-bold text-glass-olive text-lg">{job.company?.name?.charAt(0) || '?'}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-lg font-bold text-foreground truncate group-hover:text-glass-olive transition-colors">
                      {job.title}
                    </h2>
                    {score != null && score > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-glass-cream text-glass-olive text-[10px] uppercase tracking-wider font-bold border border-glass-olive/20 shrink-0 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {score}% Match
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5 text-foreground">
                      <Building2 className="w-3.5 h-3.5" />
                      {job.company?.name || 'Unknown'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Remote
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> {timeAgo(job.postedAt)}
                    </span>
                  </div>
                </div>

                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:w-auto px-6 py-2.5 bg-glass-olive text-white font-semibold rounded-full shadow-[0_4px_14px_0_rgba(85,107,47,0.39)] transition-all text-sm flex items-center justify-center gap-2 shrink-0 group/btn"
                >
                  View Role <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </motion.a>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

export default function JobSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center relative z-10">
        <div className="w-4 h-4 rounded-full bg-glass-olive animate-pulse" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
