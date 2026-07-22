"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { CheckCircle2, XCircle, Loader2, Activity, Database, Server, Settings } from 'lucide-react';

interface CheckStatus {
  id: string;
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  icon: React.ReactNode;
}

export default function DiagnosisPage() {
  const [checks, setChecks] = useState<CheckStatus[]>([
    {
      id: 'env',
      name: 'Environment Variables',
      status: 'pending',
      message: 'Checking .env.local variables...',
      icon: <Settings className="w-5 h-5 text-gray-400" />
    },
    {
      id: 'supabase',
      name: 'Supabase Connectivity',
      status: 'pending',
      message: 'Pinging Supabase backend...',
      icon: <Database className="w-5 h-5 text-gray-400" />
    },
    {
      id: 'backend',
      name: 'NestJS Backend Connectivity',
      status: 'pending',
      message: 'Pinging /health endpoint...',
      icon: <Server className="w-5 h-5 text-gray-400" />
    }
  ]);

  const updateCheck = (id: string, status: 'success' | 'error', message: string) => {
    setChecks(prev => prev.map(check => check.id === id ? { ...check, status, message } : check));
  };

  useEffect(() => {
    const runDiagnostics = async () => {
      // 1. Check Environment Variables
      let envError = '';
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) envError += 'Missing NEXT_PUBLIC_SUPABASE_URL. ';
      if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) envError += 'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. ';
      if (!process.env.NEXT_PUBLIC_API_URL) envError += 'Missing NEXT_PUBLIC_API_URL. ';
      
      if (envError) {
        updateCheck('env', 'error', envError);
      } else {
        updateCheck('env', 'success', `Variables loaded. API URL: ${process.env.NEXT_PUBLIC_API_URL}`);
      }

      // 2. Check Supabase Connectivity
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

      // 3. Check Backend Connectivity
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
    <div className="p-8 md:p-12 max-w-4xl mx-auto space-y-10">
      <header className="flex flex-col border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-500" />
          System Diagnosis
        </h1>
        <p className="text-gray-400 mt-2">
          Real-time health checks for the frontend, backend, and database connections.
        </p>
      </header>

      <div className="space-y-4">
        {checks.map((check) => (
          <div key={check.id} className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm flex items-start gap-4 transition-all duration-300 hover:bg-white/10">
            <div className="pt-1">
              {check.status === 'pending' && <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />}
              {check.status === 'success' && <CheckCircle2 className="w-6 h-6 text-green-500" />}
              {check.status === 'error' && <XCircle className="w-6 h-6 text-red-500" />}
            </div>
            
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {check.icon}
                {check.name}
              </h2>
              <div className={`mt-2 text-sm p-3 rounded-lg border font-mono whitespace-pre-wrap ${
                check.status === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                check.status === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                'bg-blue-500/10 border-blue-500/30 text-blue-400'
              }`}>
                {check.message}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center pt-8 border-t border-white/10">
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/40 transition font-mono text-sm"
        >
          Rerun Diagnostics
        </button>
      </div>
    </div>
  );
}
