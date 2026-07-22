'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/auth/login');
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/dashboard`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 min-h-screen items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Overview</h1>
          <p className="text-gray-400 mt-2">Welcome back. Here's what Autopilot has been doing for you.</p>
        </div>
        <button 
          onClick={() => router.push('/upload')}
          className="bg-white text-black px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-gray-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        >
          Upload New Resume
        </button>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Jobs Discovered" value={data?.stats?.jobsDiscovered || '0'} trend="Total in database" icon="🔍" />
        <StatCard title="High Matches (>80%)" value={data?.stats?.highMatches || '0'} trend="Ready to review" icon="🔥" />
        <StatCard title="Auto Applied" value={data?.stats?.autoApplied || '0'} trend="Applications submitted" icon="🚀" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Matches */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Top Matches <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs">Action Required</span>
          </h2>
          {data?.topMatches?.length === 0 ? (
            <div className="text-gray-400 py-10 text-center bg-white/5 border border-white/10 rounded-2xl">
              No top matches yet. Upload your resume and start the discovery pipeline.
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
            >
              {data?.topMatches?.map((match: any, index: number) => (
                <motion.div key={match.id || index} variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}>
                  <MatchCard {...match} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Live Activity</h2>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent">
              {data?.recentActivity?.map((activity: any, index: number) => (
                <ActivityItem key={index} {...activity} success={index === 0} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon }: { title: string, value: string | number, trend: string, icon: string }) {
  return (
    <div className="group relative bg-white/5 border border-white/10 p-6 rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-300">
      <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all"></div>
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <h3 className="text-4xl font-black text-white tracking-tight">{value}</h3>
      <p className="text-xs text-green-400 mt-2 font-medium">{trend}</p>
    </div>
  );
}

function MatchCard({ role, company, score, explanation, opportunity, probability, competition, action, url }: any) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="group bg-gradient-to-br from-white/[0.07] to-transparent border border-white/10 p-6 rounded-2xl hover:border-white/20 transition-all duration-300 flex flex-col justify-between h-full cursor-pointer"
      onClick={() => window.open(url, '_blank')}
    >
      <div>
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{role}</h3>
            <p className="text-sm text-gray-400 mt-1">{company}</p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-green-500/30 bg-green-500/10 shrink-0">
            <span className="text-sm font-bold text-green-400">{score}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Opportunity</p>
            <p className={`text-xs font-bold ${opportunity === 'High' ? 'text-green-400' : 'text-yellow-400'}`}>{opportunity}</p>
          </div>
          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Hiring Prob.</p>
            <p className="text-xs font-bold text-white">{probability}</p>
          </div>
          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Action</p>
            <p className="text-xs font-bold text-blue-400 truncate">{action}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5">
        <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
          <span className="font-semibold text-white">AI Analysis:</span> {explanation}
        </p>
      </div>
    </motion.div>
  );
}

function ActivityItem({ time, title, desc, success = false }: { time: string, title: string, desc: string, success?: boolean }) {
  return (
    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
      <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 border-[#09090b] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 
        ${success ? 'bg-green-500' : 'bg-blue-500'}`}></div>
      <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.25rem)] p-4 rounded-xl bg-black/40 border border-white/5 shadow-sm">
        <div className="flex items-center justify-between space-x-2 mb-1">
          <div className="font-bold text-white text-sm">{title}</div>
          <time className="text-xs font-medium text-gray-500">{time}</time>
        </div>
        <div className="text-xs text-gray-400">{desc}</div>
      </div>
    </div>
  );
}
