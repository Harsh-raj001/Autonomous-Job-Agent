import React from 'react';

export default function SettingsPage() {
  return (
    <div className="p-8 md:p-12 max-w-4xl mx-auto space-y-10">
      <header>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Settings</h1>
        <p className="text-gray-400 mt-2">Manage your Autopilot preferences and thresholds.</p>
      </header>

      <div className="space-y-8">
        {/* Profile Settings */}
        <section className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
          <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">First Name</label>
              <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" defaultValue="John" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Last Name</label>
              <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" defaultValue="Smith" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-300">LinkedIn URL</label>
              <input type="url" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" defaultValue="https://linkedin.com/in/johnsmith" />
            </div>
          </div>
        </section>

        {/* Autopilot Engine Settings */}
        <section className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/20 p-8 rounded-3xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
          
          <h2 className="text-xl font-bold text-white mb-2 relative z-10 flex items-center gap-2">
            Autopilot Engine <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs">Active</span>
          </h2>
          <p className="text-sm text-gray-400 mb-6 relative z-10">Configure how the agent applies to jobs on your behalf.</p>
          
          <div className="space-y-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
              <div>
                <h3 className="font-medium text-white">Auto-Apply Threshold</h3>
                <p className="text-sm text-gray-400 mt-1">Minimum match score required to trigger an automatic application.</p>
              </div>
              <div className="flex items-center gap-4">
                <input type="range" min="50" max="100" defaultValue="80" className="w-32 accent-blue-500" />
                <span className="text-xl font-bold text-white bg-black/40 px-3 py-1 rounded-lg border border-white/10">80%</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
              <div>
                <h3 className="font-medium text-white">Daily Application Limit</h3>
                <p className="text-sm text-gray-400 mt-1">Maximum number of jobs to auto-apply to per day.</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" defaultValue="10" className="w-20 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-center font-bold" />
                <span className="text-gray-400 text-sm">jobs / day</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">Daily Digest Emails</h3>
                <p className="text-sm text-gray-400 mt-1">Receive a summary of discovered and applied jobs.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>
        </section>
        
        <div className="flex justify-end pt-4">
          <button className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
