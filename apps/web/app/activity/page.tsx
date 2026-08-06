'use client';

import React, { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  Activity, 
  CheckCircle2, 
  FileText, 
  Briefcase, 
  TrendingUp, 
  Send,
  Layers,
  Sparkles,
  Clock,
  CircleDot,
  Loader2
} from 'lucide-react';

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

// Simple animated counter component
const AnimatedCounter = ({ value, label, icon: Icon }: { value: number, label: string, icon: any }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    
    let totalDuration = 1500;
    let incrementTime = (totalDuration / end);
    
    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
        <Icon className="w-24 h-24" />
      </div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="w-10 h-10 rounded-full bg-glass-olive/10 flex items-center justify-center text-glass-olive">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="relative z-10">
        <h3 className="text-3xl font-bold text-foreground mb-1">{count}</h3>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  );
};

export default function ActivityPage() {
  const resumeTasks = [
    { label: "Resume uploaded", completed: true },
    { label: "Skills extracted", completed: true },
    { label: "ATS score calculated", completed: true },
    { label: "Resume optimized", completed: true },
  ];

  const pipelineStages = [
    { label: "Discover Jobs", status: "complete" },
    { label: "Resume Matching", status: "running" },
    { label: "Cover Letter", status: "waiting" },
    { label: "Review", status: "pending" },
    { label: "Apply", status: "ready" },
  ];

  const insights = [
    { role: "Frontend Engineer", match: 92 },
    { role: "Product Analyst", match: 87 },
    { role: "Business Analyst", match: 84 },
  ];

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-10 min-h-[calc(100vh-64px)] relative z-10 pb-20">
      
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col border-b border-white/40 pb-6"
      >
        <p className="text-xs font-bold tracking-widest uppercase text-glass-olive mb-3">Live Dashboard</p>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground flex items-center gap-4 tracking-tight" style={{ fontFamily: 'var(--font-lora)' }}>
          <Activity className="w-8 h-8 text-glass-olive hidden md:block" />
          Activity & Insights
        </h1>
        <p className="text-muted-foreground mt-4 font-medium text-lg max-w-2xl">
          Real-time view of your application pipeline and AI-driven insights.
        </p>
      </motion.header>

      <motion.div 
        variants={container} 
        initial="hidden" 
        animate="show" 
        className="grid grid-cols-1 md:grid-cols-12 gap-8"
      >
        
        {/* Left Column: Pipeline & Insights */}
        <div className="md:col-span-8 space-y-8">
          
          {/* Application Pipeline */}
          <section>
            <motion.div variants={item} className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-glass-olive" />
              <h2 className="text-xl font-bold text-foreground">Application Pipeline</h2>
            </motion.div>
            <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <AnimatedCounter value={124} label="Jobs Found" icon={Briefcase} />
              <AnimatedCounter value={38} label="Matched Jobs" icon={Activity} />
              <AnimatedCounter value={15} label="Ready for Review" icon={FileText} />
              <AnimatedCounter value={9} label="Submitted" icon={Send} />
            </motion.div>
          </section>

          {/* AI Insights */}
          <section>
            <motion.div variants={item} className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-glass-olive" />
              <h2 className="text-xl font-bold text-foreground">AI Insights</h2>
            </motion.div>
            
            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Role Matches */}
              <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-5">Your resume matches</h3>
                <div className="space-y-4">
                  {insights.map((insight, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-foreground text-sm">{insight.role}</span>
                        <span className="font-bold text-glass-olive text-sm">{insight.match}%</span>
                      </div>
                      <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${insight.match}%` }}
                          transition={{ duration: 1, delay: 0.5 + (idx * 0.2) }}
                          className="h-full bg-glass-olive rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvement Suggestion */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center bg-gradient-to-br from-white/40 to-glass-olive/5 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-glass-olive/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                <h3 className="text-sm font-bold text-glass-olive uppercase tracking-wider mb-3">Improvement Suggestion</h3>
                <p className="text-lg font-medium text-foreground leading-snug">
                  Add <span className="font-bold">measurable achievements</span> to your recent roles to improve matching.
                </p>
              </div>

            </motion.div>
          </section>
        </div>

        {/* Right Column: Status & Queue */}
        <div className="md:col-span-4 space-y-8">
          
          {/* Resume Status */}
          <section>
            <motion.div variants={item} className="glass-panel rounded-2xl p-6 relative overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-foreground">Resume Status</h2>
                <div className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-bold tracking-wide uppercase flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Active
                </div>
              </div>
              
              <div className="space-y-4">
                {resumeTasks.map((task, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-glass-olive shrink-0 mt-0.5" />
                    <span className="font-medium text-foreground text-sm">{task.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-glass-charcoal/10 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Clock className="w-4 h-4" />
                Last analyzed: 2 minutes ago
              </div>
            </motion.div>
          </section>

          {/* Automation Queue */}
          <section>
            <motion.div variants={item} className="glass-panel rounded-2xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">Queue Status</h2>
              
              <div className="space-y-0 relative">
                <div className="absolute left-2.5 top-3 bottom-4 w-px bg-glass-charcoal/10" />
                
                {pipelineStages.map((stage, idx) => {
                  let Icon = CircleDot;
                  let colorClass = "text-muted-foreground";
                  let bgClass = "bg-white";
                  let statusText = "";

                  if (stage.status === "complete") {
                    Icon = CheckCircle2;
                    colorClass = "text-glass-olive";
                    statusText = "✓ Complete";
                  } else if (stage.status === "running") {
                    Icon = Loader2;
                    colorClass = "text-blue-500";
                    statusText = "Running...";
                  } else if (stage.status === "waiting") {
                    statusText = "Waiting";
                  } else if (stage.status === "pending") {
                    statusText = "Pending";
                  } else if (stage.status === "ready") {
                    statusText = "Ready";
                  }

                  return (
                    <div key={idx} className="flex items-start gap-4 pb-6 relative z-10">
                      <div className={`mt-0.5 relative z-10 w-5 h-5 rounded-full flex items-center justify-center ${bgClass} shadow-sm border border-glass-charcoal/10`}>
                        <Icon className={`w-3.5 h-3.5 ${colorClass} ${stage.status === 'running' ? 'animate-spin' : ''}`} />
                      </div>
                      <div className="flex-1 flex justify-between items-center -mt-0.5">
                        <span className={`font-semibold text-sm ${stage.status === 'complete' || stage.status === 'running' ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {stage.label}
                        </span>
                        <span className={`text-xs font-bold ${colorClass}`}>
                          {statusText}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </section>
          
        </div>
      </motion.div>
    </div>
  );
}
