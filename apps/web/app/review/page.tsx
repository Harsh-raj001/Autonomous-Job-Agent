'use client';

import React, { useEffect, useState } from 'react';
import { Bookmark, Building2, ExternalLink, ThumbsDown, Sparkles } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } }
};

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
        headers: { 'Authorization': `Bearer ${session.access_token}` }
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
    setJobs(jobs.filter(j => j.id !== jobId));
  };

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-10 min-h-[calc(100vh-64px)] relative z-10">
      
      <motion.header 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/40 pb-6"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-bold tracking-widest uppercase text-glass-olive mb-3">Attention Required</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight flex items-center gap-4" style={{ fontFamily: 'var(--font-lora)' }}>
            <Bookmark className="w-8 h-8 text-glass-olive hidden md:block" />
            Review Queue
          </h1>
          <p className="text-muted-foreground mt-4 font-medium text-lg">
            High quality matches that need your final approval before applying.
          </p>
        </div>
      </motion.header>

      {/* Results */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-4 h-4 rounded-full bg-glass-olive animate-pulse" />
            <p className="text-muted-foreground font-medium text-sm">Loading queue...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center glass-panel rounded-3xl border-dashed">
            <div className="w-12 h-12 rounded-full bg-glass-cream flex items-center justify-center mb-4 border border-glass-olive/20">
              <Sparkles className="w-5 h-5 text-glass-olive" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-lora)' }}>You're all caught up!</h3>
            <p className="text-muted-foreground text-sm font-medium">There are no jobs pending your review right now.</p>
          </div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => {
              const analysis = job.analyses?.[0];
              const score = analysis?.scoreTotal || 0;
              const explanation = analysis?.explanation || "";
              
              return (
                <motion.div 
                  variants={item}
                  whileHover={{ y: -5, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.05)" }}
                  key={job.id} 
                  className="glass-panel border-white/50 rounded-3xl p-6 md:p-8 flex flex-col justify-between group"
                >
                  <div className="space-y-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-glass-olive transition-colors leading-tight">{job.title}</h2>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                          <Building2 className="w-4 h-4" />
                          <span>{job.company?.name}</span>
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-full text-xs font-bold bg-glass-cream text-glass-olive border border-glass-olive/20 shrink-0">
                        {score}% Match
                      </div>
                    </div>
                    
                    <div className="bg-white/95 backdrop-blur-sm border border-white rounded-2xl p-5 relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 left-0 w-1 h-full bg-glass-gold" />
                      <h4 className="text-glass-charcoal font-bold text-xs uppercase tracking-wider flex items-center gap-2 mb-3">
                        <Sparkles className="w-3.5 h-3.5 text-glass-gold" /> AI Insight
                      </h4>
                      <p className="text-glass-charcoal/80 text-sm leading-relaxed font-medium">
                        {explanation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/40">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAction(job.id, 'ignore')}
                      className="flex-1 py-3 px-4 rounded-full border border-white/50 text-muted-foreground hover:bg-white hover:text-foreground transition-colors flex items-center justify-center gap-2 font-medium text-sm shadow-sm"
                    >
                      <ThumbsDown className="w-4 h-4" /> Ignore
                    </motion.button>
                    <motion.a 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={job.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => handleAction(job.id, 'apply')}
                      className="flex-1 py-3 px-4 rounded-full bg-glass-olive text-white font-semibold hover:bg-glass-olive/90 transition-all text-center flex items-center justify-center gap-2 text-sm shadow-[0_4px_14px_0_rgba(85,107,47,0.39)]"
                    >
                      Apply Now <ExternalLink className="w-4 h-4" />
                    </motion.a>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
