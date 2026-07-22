"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { LogOut, Home, Search, Bookmark, Upload, Settings, Activity } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    fetchUser();
  }, [pathname, supabase.auth]);

  // Don't render sidebar on auth pages
  if (pathname.startsWith('/auth')) {
    return null;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  const navItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Job Search', href: '/search', icon: Search },
    { name: 'Review Queue', href: '/review', icon: Bookmark },
    { name: 'Upload Resume', href: '/upload', icon: Upload },
    { name: 'System Health', href: '/diagnosis', icon: Activity },
  ];

  return (
    <aside className="w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl hidden md:flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          Autopilot
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
                isActive 
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      {user && (
        <div className="p-4 border-t border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
              {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.user_metadata?.full_name || 'User'}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-bold border border-red-500/20"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}
