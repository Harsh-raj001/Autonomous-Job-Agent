'use client';
import React from 'react';
import { motion } from 'framer-motion';

export default function JobFeedPage() {
  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-10 min-h-[calc(100vh-64px)] bg-background">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight" style={{ fontFamily: 'var(--font-lora, Lora, Georgia, serif)' }}>Job Feed</h1>
          <p className="text-muted-foreground mt-2 font-medium">Recently discovered opportunities matched to your profile.</p>
        </div>
        <div className="flex gap-3">
          <select className="bg-card border border-w-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-e-brand transition-colors appearance-none pr-10 relative text-sm shadow-sm font-medium">
            <option>All Matches</option>
            <option>&gt; 90% Match</option>
            <option>&gt; 80% Match</option>
          </select>
          <button className="bg-e-brand hover:bg-e-dark text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-all shadow-md shadow-e-brand/20">
            Scan Now
          </button>
        </div>
      </header>

      <motion.div 
        className="space-y-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
          <JobCard 
            role="Senior Frontend Engineer" 
            company="Vercel" 
            location="Remote"
            type="Full-time"
            posted="2h ago"
            score={92}
            opportunity="High"
            probability="Medium"
            competition="High"
            action="Apply immediately"
            isApplied={true}
          />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
          <JobCard 
            role="Product Engineer" 
            company="Linear" 
            location="San Francisco, CA"
            type="Full-time"
            posted="5h ago"
            score={85}
            opportunity="High"
            probability="High"
            competition="Medium"
            action="Tailor resume first"
            isApplied={false}
          />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
          <JobCard 
            role="Full Stack Developer" 
            company="Supabase" 
            location="Remote"
            type="Contract"
            posted="1d ago"
            score={78}
            opportunity="Medium"
            probability="Low"
            competition="Very High"
            action="Skip"
            isApplied={false}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

function JobCard({ role, company, location, type, posted, score, opportunity, probability, competition, action, isApplied }: any) {
  return (
    <div 
      className="bg-card border border-border p-6 rounded-xl hover:shadow-sm transition-shadow duration-300"
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-w-stone rounded-lg flex items-center justify-center border border-w-border shrink-0">
            <span className="text-xl font-bold text-e-brand">{company.charAt(0)}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{role}</h3>
            <p className="text-sm text-muted-foreground mt-1 font-medium">{company} • {location}</p>
            <div className="flex gap-2 mt-3">
              <span className="px-2.5 py-1 rounded-md bg-secondary text-xs text-foreground border border-border font-medium">{type}</span>
              <span className="px-2.5 py-1 rounded-md bg-secondary text-xs text-foreground border border-border font-medium">{posted}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Match</span>
            <div className="px-3 py-1 rounded-full border border-border bg-secondary">
              <span className="font-bold text-sm text-foreground">{score}</span>
            </div>
          </div>
          
          <button 
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              isApplied 
                ? 'bg-secondary text-muted-foreground border border-border cursor-default' 
                : 'bg-e-brand hover:bg-e-dark text-white shadow-md shadow-e-brand/20'
            }`}
          >
            {isApplied ? 'Applied' : 'Auto Apply'}
          </button>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Opportunity</p>
          <p className="text-sm font-semibold text-foreground">{opportunity}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Hiring Prob.</p>
          <p className="text-sm text-foreground font-semibold">{probability}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Competition</p>
          <p className="text-sm text-foreground font-semibold">{competition}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Action</p>
          <p className="text-sm text-foreground font-semibold">{action}</p>
        </div>
      </div>
    </div>
  );
}
