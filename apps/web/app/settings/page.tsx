'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';

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

export default function SettingsPage() {
  return (
    <div className="p-8 md:p-12 max-w-4xl mx-auto space-y-10 min-h-[calc(100vh-64px)] relative z-10">
      <motion.header 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-white/40 pb-6"
      >
        <p className="text-xs font-bold tracking-widest uppercase text-glass-olive mb-3">Preferences</p>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight" style={{ fontFamily: 'var(--font-lora)' }}>Settings</h1>
        <p className="text-muted-foreground mt-4 font-medium text-lg">Manage your Elevate preferences and thresholds.</p>
      </motion.header>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        
        {/* Profile Settings */}
        <motion.section variants={item} className="glass-panel p-8 md:p-10 rounded-3xl">
          <h2 className="text-xl font-bold text-foreground mb-8">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-glass-charcoal uppercase tracking-wider">First Name</label>
              <input type="text" className="w-full bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl px-5 py-3.5 text-foreground focus:outline-none focus:border-glass-olive focus:ring-1 focus:ring-glass-olive transition-all font-medium shadow-sm" defaultValue="John" />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold text-glass-charcoal uppercase tracking-wider">Last Name</label>
              <input type="text" className="w-full bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl px-5 py-3.5 text-foreground focus:outline-none focus:border-glass-olive focus:ring-1 focus:ring-glass-olive transition-all font-medium shadow-sm" defaultValue="Smith" />
            </div>
            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-bold text-glass-charcoal uppercase tracking-wider">LinkedIn URL</label>
              <input type="url" className="w-full bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl px-5 py-3.5 text-foreground focus:outline-none focus:border-glass-olive focus:ring-1 focus:ring-glass-olive transition-all font-medium shadow-sm" defaultValue="https://linkedin.com/in/johnsmith" />
            </div>
          </div>
        </motion.section>

        {/* Elevate Engine Settings */}
        <motion.section variants={item} className="glass-panel p-8 md:p-10 rounded-3xl relative overflow-hidden">
          {/* Subtle background glow for this specific card */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-glass-olive/5 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-xl font-bold text-foreground mb-3 relative z-10 flex items-center gap-3">
            Elevate Engine 
            <span className="px-2.5 py-0.5 rounded-full bg-glass-cream/80 text-glass-olive text-[10px] uppercase tracking-wider font-bold border border-glass-olive/20 shadow-sm">Active</span>
          </h2>
          <p className="text-base text-muted-foreground mb-10 relative z-10 font-medium">Configure how the agent applies to jobs on your behalf.</p>
          
          <div className="space-y-10 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/40 pb-8">
              <div>
                <h3 className="font-bold text-foreground text-lg">Auto-Apply Threshold</h3>
                <p className="text-sm text-muted-foreground mt-2 font-medium max-w-md">Minimum match score required to trigger an automatic application.</p>
              </div>
              <div className="flex items-center gap-5 shrink-0">
                <input type="range" min="50" max="100" defaultValue="80" className="w-32 md:w-48 accent-glass-olive cursor-pointer" />
                <span className="text-sm font-bold text-glass-olive bg-white/80 px-4 py-2 rounded-xl border border-white shadow-sm">80%</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/40 pb-8">
              <div>
                <h3 className="font-bold text-foreground text-lg">Daily Application Limit</h3>
                <p className="text-sm text-muted-foreground mt-2 font-medium max-w-md">Maximum number of jobs to auto-apply to per day.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <input type="number" defaultValue="10" className="w-20 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-glass-olive focus:ring-1 focus:ring-glass-olive transition-all text-center font-bold text-base shadow-sm" />
                <span className="text-muted-foreground text-sm font-bold uppercase tracking-wider">jobs / day</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-6">
              <div>
                <h3 className="font-bold text-foreground text-lg">Daily Digest Emails</h3>
                <p className="text-sm text-muted-foreground mt-2 font-medium max-w-md">Receive a summary of discovered and applied jobs.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-12 h-7 bg-white/40 border border-white/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-glass-olive shadow-sm"></div>
              </label>
            </div>
          </div>
        </motion.section>
        
        <motion.div variants={item} className="flex justify-end pt-4">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="glass-floating text-white bg-glass-olive px-8 py-3.5 rounded-full font-semibold transition-all shadow-[0_4px_14px_0_rgba(85,107,47,0.39)] text-sm"
          >
            Save Changes
          </motion.button>
        </motion.div>

      </motion.div>
    </div>
  );
}
