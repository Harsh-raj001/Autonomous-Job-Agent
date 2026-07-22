"use client"

import React, { useState, useEffect } from 'react';
import { Bookmark, MapPin, Building2, ExternalLink, ThumbsDown, ThumbsUp, Sparkles } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function ReviewQueuePage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/review-queue`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (res.ok) {
        const json = await res.json();
        setJobs(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAction = (jobId: string, action: 'ignore' | 'apply') => {
    // Optimistic update
    setJobs(jobs.filter(j => j.id !== jobId));
    // In production, send action to backend to log application or hide job
  };

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-8">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2 flex items-center gap-3">
          <Bookmark className="w-8 h-8 text-yellow-500" />
          Review Queue
        </h1>
        <p className="text-gray-400">Jobs below your auto-apply threshold (80%) that still look promising.</p>
      </header>

      {/* Results */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-2">You're all caught up!</h3>
            <p className="text-gray-400">There are no jobs pending your review right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => {
              const analysis = job.analyses?.[0];
              const score = analysis?.scoreTotal || 0;
              const explanation = analysis?.explanation || "";
              
              return (
                <div key={job.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-white/20 transition backdrop-blur-sm flex flex-col justify-between">
                  
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-white mb-1">{job.title}</h2>
                        <div className="flex items-center gap-3 text-sm text-gray-400 font-medium">
                          <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {job.company?.name}</span>
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                        {score}% Match
                      </div>
                    </div>
                    
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                      <h4 className="text-blue-400 font-bold text-sm flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4" /> AI Analysis
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {explanation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/10">
                    <button 
                      onClick={() => handleAction(job.id, 'ignore')}
                      className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition flex items-center justify-center gap-2 font-medium"
                    >
                      <ThumbsDown className="w-4 h-4" /> Ignore
                    </button>
                    <a 
                      href={job.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => handleAction(job.id, 'apply')}
                      className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition text-center flex items-center justify-center gap-2"
                    >
                      Apply Now <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
