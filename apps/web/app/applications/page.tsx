import React from 'react';

export default function ApplicationsPage() {
  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-10 min-h-[calc(100vh-64px)] bg-background font-sans">
      <header>
        <h1 className="text-4xl font-semibold text-foreground tracking-tight">Applications</h1>
        <p className="text-muted-foreground mt-2 font-medium">Track the status of your manual and automated job applications.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatusFilter label="All" count={42} active />
        <StatusFilter label="Applied" count={35} />
        <StatusFilter label="Interviewing" count={4} />
        <StatusFilter label="Rejected" count={3} />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date Applied</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
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
    <button className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${active ? 'bg-secondary border-foreground/20' : 'bg-card border-border hover:border-foreground/10 hover:bg-secondary/50'}`}>
      <span className={`font-semibold ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
      <span className={`px-2 py-1 rounded-md text-xs font-bold ${active ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground'}`}>{count}</span>
    </button>
  );
}

function ApplicationRow({ company, role, method, date, status }: any) {
  const statusColors: any = {
    'Applied': 'bg-secondary text-foreground border-border',
    'Interviewing': 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20',
    'Rejected': 'bg-destructive/10 text-destructive border-destructive/20',
  };

  return (
    <tr className="hover:bg-secondary/50 transition-colors">
      <td className="px-6 py-4 font-semibold text-foreground">{company}</td>
      <td className="px-6 py-4 text-muted-foreground font-medium">{role}</td>
      <td className="px-6 py-4">
        <span className="px-2.5 py-1 rounded-md bg-secondary text-xs font-semibold text-foreground border border-border">
          {method}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-muted-foreground font-medium">{date}</td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[status] || 'bg-secondary text-muted-foreground border-border'}`}>
          {status}
        </span>
      </td>
    </tr>
  );
}
