'use client';
import React from 'react';
import { motion } from 'framer-motion';

export default function JobFeedPage() {
  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Job Feed</h1>
          <p className="text-gray-400 mt-2">Recently discovered opportunities matched to your profile.</p>
        </div>
        <div className="flex gap-3">
          <select className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none pr-10 relative">
            <option>All Matches</option>
            <option>&gt; 90% Match</option>
            <option>&gt; 80% Match</option>
          </select>
          <button className="bg-white/10 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-white/20 transition-all">
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
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
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
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
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
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
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
    <motion.div 
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-white/20 transition-all duration-300"
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/10">
            <span className="text-xl font-bold text-white">{company.charAt(0)}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{role}</h3>
            <p className="text-sm text-gray-400 mt-1">{company} • {location}</p>
            <div className="flex gap-2 mt-3">
              <span className="px-2.5 py-1 rounded-full bg-white/5 text-xs text-gray-300 border border-white/10">{type}</span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 text-xs text-gray-300 border border-white/10">{posted}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Match</span>
            <div className={`px-3 py-1 rounded-full border ${score >= 90 ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
              <span className="font-bold">{score}</span>
            </div>
          </div>
          
          <button 
            className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
              isApplied 
                ? 'bg-white/10 text-gray-400 cursor-default' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]'
            }`}
          >
            {isApplied ? 'Applied' : 'Auto Apply'}
          </button>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Opportunity</p>
          <p className={`text-sm font-semibold ${opportunity === 'High' ? 'text-green-400' : 'text-yellow-400'}`}>{opportunity}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Hiring Prob.</p>
          <p className="text-sm text-white font-medium">{probability}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Competition</p>
          <p className="text-sm text-white font-medium">{competition}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Action</p>
          <p className="text-sm text-blue-400 font-medium">{action}</p>
        </div>
      </div>
    </motion.div>
  );
}
