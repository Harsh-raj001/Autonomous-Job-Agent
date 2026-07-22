import React from 'react';

export default function ApplicationsPage() {
  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-10">
      <header>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Applications</h1>
        <p className="text-gray-400 mt-2">Track the status of your manual and automated job applications.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatusFilter label="All" count={42} active />
        <StatusFilter label="Applied" count={35} />
        <StatusFilter label="Interviewing" count={4} />
        <StatusFilter label="Rejected" count={3} />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/40">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date Applied</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <ApplicationRow 
                company="Stripe" 
                role="Product Manager" 
                method="Auto" 
                date="Oct 12, 2026" 
                status="Interviewing" 
              />
              <ApplicationRow 
                company="Airbnb" 
                role="Data Analyst" 
                method="Manual" 
                date="Oct 10, 2026" 
                status="Applied" 
              />
              <ApplicationRow 
                company="Uber" 
                role="Business Analyst" 
                method="Auto" 
                date="Oct 08, 2026" 
                status="Rejected" 
              />
              <ApplicationRow 
                company="Vercel" 
                role="Software Engineer" 
                method="Auto" 
                date="Oct 05, 2026" 
                status="Applied" 
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusFilter({ label, count, active = false }: { label: string, count: number, active?: boolean }) {
  return (
    <button className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${active ? 'bg-blue-500/10 border-blue-500/50' : 'bg-black/40 border-white/5 hover:border-white/20'}`}>
      <span className={`font-medium ${active ? 'text-blue-400' : 'text-gray-400'}`}>{label}</span>
      <span className={`px-2 py-1 rounded-md text-xs font-bold ${active ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-gray-400'}`}>{count}</span>
    </button>
  );
}

function ApplicationRow({ company, role, method, date, status }: any) {
  const statusColors: any = {
    'Applied': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Interviewing': 'bg-green-500/10 text-green-400 border-green-500/20',
    'Rejected': 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="px-6 py-4 font-bold text-white">{company}</td>
      <td className="px-6 py-4 text-gray-300">{role}</td>
      <td className="px-6 py-4">
        <span className="px-2.5 py-1 rounded-md bg-white/5 text-xs font-medium text-gray-400 border border-white/10">
          {method}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-400">{date}</td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
          {status}
        </span>
      </td>
    </tr>
  );
}
