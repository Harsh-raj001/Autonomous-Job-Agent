'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { CheckCircle2, XCircle, Loader2, Activity, Database, Server, Settings } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

interface CheckStatus {
  id: string;
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  icon: React.ReactNode;
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function DiagnosisPage() {
  const [checks, setChecks] = useState<CheckStatus[]>([
    {
      id: 'env',
      name: 'Environment Variables',
      status: 'pending',
      message: 'Checking .env.local variables...',
      icon: <Settings className="w-5 h-5 text-muted-foreground" />
    },
    {
      id: 'supabase',
      name: 'Supabase Connectivity',
      status: 'pending',
      message: 'Pinging Supabase backend...',
      icon: <Database className="w-5 h-5 text-muted-foreground" />
    },
    {
      id: 'backend',
      name: 'NestJS Backend Connectivity',
      status: 'pending',
      message: 'Pinging /health endpoint...',
      icon: <Server className="w-5 h-5 text-muted-foreground" />
    }
  ]);

  const updateCheck = (id: string, status: 'success' | 'error', message: string) => {
    setChecks(prev => prev.map(check => check.id === id ? { ...check, status, message } : check));
  };

  useEffect(() => {
    const runDiagnostics = async () => {
      let envError = '';
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) envError += 'Missing NEXT_PUBLIC_SUPABASE_URL. ';
      if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) envError += 'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. ';
      if (!process.env.NEXT_PUBLIC_API_URL) envError += 'Missing NEXT_PUBLIC_API_URL. ';
      
      if (envError) {
        updateCheck('env', 'error', envError);
      } else {
        updateCheck('env', 'success', `Variables loaded. API URL: ${process.env.NEXT_PUBLIC_API_URL}`);
      }

      try {
        const supabase = createClient();
        const { error } = await supabase.auth.getSession();
        if (error) {
          updateCheck('supabase', 'error', `Auth Error: ${error.message}`);
        } else {
          updateCheck('supabase', 'success', 'Connected securely to Supabase.');
        }
      } catch (err: any) {
        updateCheck('supabase', 'error', `Connection failed: ${err.message || 'Unknown error'}`);
      }

      if (process.env.NEXT_PUBLIC_API_URL) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`);
          if (res.ok) {
            const data = await res.json();
            updateCheck('backend', 'success', `Connected to NestJS. Status: ${data.status}`);
          } else {
            updateCheck('backend', 'error', `HTTP Error ${res.status}: ${res.statusText}`);
          }
        } catch (err: any) {
          updateCheck('backend', 'error', `Failed to fetch: Backend might not be running on port 3001 or CORS is blocked. Details: ${err.message}`);
        }
      } else {
        updateCheck('backend', 'error', 'Skipped because NEXT_PUBLIC_API_URL is missing.');
      }
    };

    runDiagnostics();
  }, []);

  return (
    <div className="p-8 md:p-12 max-w-4xl mx-auto space-y-10 min-h-[calc(100vh-64px)] relative z-10">
      <motion.header 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col border-b border-white/40 pb-6"
      >
        <p className="text-xs font-bold tracking-widest uppercase text-glass-olive mb-3">System Health</p>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground flex items-center gap-4 tracking-tight" style={{ fontFamily: 'var(--font-lora)' }}>
          <Activity className="w-8 h-8 text-glass-olive hidden md:block" />
          Diagnosis
        </h1>
        <p className="text-muted-foreground mt-4 font-medium text-lg">
          Real-time health checks for the frontend, backend, and database connections.
        </p>
      </motion.header>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {checks.map((check) => (
          <motion.div 
            variants={item}
            key={check.id} 
            whileHover={{ scale: 1.01, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)" }}
            className="glass-panel rounded-2xl p-6 flex items-start gap-5 transition-all duration-300"
          >
            <div className="pt-1">
              {check.status === 'pending' && <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />}
              {check.status === 'success' && <CheckCircle2 className="w-6 h-6 text-glass-olive" />}
              {check.status === 'error' && <XCircle className="w-6 h-6 text-destructive" />}
            </div>
            
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-3">
                {check.name}
              </h2>
              {/* Opaque readable card for text details */}
              <div className={`text-sm p-4 rounded-xl font-mono whitespace-pre-wrap font-medium shadow-sm border ${
                check.status === 'error' ? 'bg-destructive/5 border-destructive/20 text-destructive' :
                check.status === 'success' ? 'bg-white border-white text-glass-charcoal' :
                'bg-white/50 border-white/40 text-muted-foreground'
              }`}>
                {check.message}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        className="pt-8 border-t border-white/40 flex justify-end"
      >
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.reload()} 
          className="glass-floating px-6 py-3 text-glass-charcoal font-semibold rounded-full hover:bg-white transition-colors text-sm"
        >
          Rerun Diagnostics
        </motion.button>
      </motion.div>
    </div>
  );
}
