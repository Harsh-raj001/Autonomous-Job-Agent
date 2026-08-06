"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ExternalLink, Briefcase, Plus, Activity, Clock, FileText, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }
      setUser(session.user);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/search?limit=3`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setJobs(json.data || []);
      }
    };
    loadUser();
  }, [router, supabase]);

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-10 min-h-[calc(100vh-64px)] relative z-10">
      
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-glass-olive">
              <span className="w-1.5 h-1.5 rounded-full bg-glass-olive animate-pulse" />
              Agent Active
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight" style={{ fontFamily: 'var(--font-lora)' }}>
            Welcome back, {firstName}.
          </h1>
          <p className="text-muted-foreground mt-4 font-medium text-lg">
            Elevate is currently scanning 12 networks for your next role.
          </p>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/upload')}
          className="glass-floating text-glass-charcoal px-6 py-3 rounded-full font-semibold text-sm flex items-center gap-2 group shrink-0"
        >
          <Plus className="w-4 h-4 text-glass-olive group-hover:rotate-90 transition-transform duration-300" />
          New Resume
        </motion.button>
      </motion.header>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Jobs Analyzed', value: '1,492', icon: Activity },
          { label: 'Auto-Applications Sent', value: '47', icon: ArrowRight },
          { label: 'Pending Review', value: '12', icon: Clock },
        ].map((metric, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 + i * 0.1 }}
            className="glass-panel p-6 rounded-3xl flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-500"
          >
            <div className="flex items-center gap-3 mb-6">
              <metric.icon className="w-5 h-5 text-glass-olive" />
              <p className="text-sm font-semibold text-muted-foreground">{metric.label}</p>
            </div>
            <p className="text-4xl font-bold text-foreground" style={{ fontFamily: 'var(--font-lora)' }}>{metric.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Matches */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="pt-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-lora)' }}>Recent Matches</h2>
          <button onClick={() => router.push('/search')} className="text-sm font-semibold text-glass-olive hover:text-glass-gold transition-colors">
            View all →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {jobs.length === 0 ? (
            <div className="col-span-3 glass-panel p-12 text-center rounded-3xl">
              <div className="w-12 h-12 rounded-full bg-glass-cream flex items-center justify-center mx-auto mb-4 border border-glass-olive/20">
                <Briefcase className="w-5 h-5 text-glass-olive" />
              </div>
              <p className="text-foreground font-semibold mb-1">No matches yet</p>
              <p className="text-muted-foreground text-sm font-medium">Elevate is scanning the web right now.</p>
            </div>
          ) : (
            jobs.map((job, i) => {
              const analysis = job.analyses?.[0];
              const score = analysis?.scoreTotal || 0;
              return (
                <motion.div 
                  key={job.id}
                  whileHover={{ y: -4 }}
                  className="glass-panel p-6 rounded-3xl flex flex-col justify-between group cursor-pointer"
                  onClick={() => window.open(job.url, '_blank')}
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-glass-cream border border-glass-olive/20 flex items-center justify-center shrink-0">
                        <span className="font-bold text-glass-olive">{job.company?.name?.charAt(0) || '?'}</span>
                      </div>
                      <div className="px-2.5 py-1 rounded-full bg-glass-cream/80 text-glass-olive text-xs font-bold border border-glass-olive/10">
                        {score}%
                      </div>
                    </div>
                    <h3 className="font-bold text-foreground leading-tight mb-1 group-hover:text-glass-olive transition-colors">{job.title}</h3>
                    <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {job.company?.name || 'Unknown'}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/40 flex items-center justify-between">
                    <span className="text-xs font-semibold text-glass-charcoal flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> Auto-tailored
                    </span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-glass-olive transition-colors" />
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.section>

    </div>
  );
}
