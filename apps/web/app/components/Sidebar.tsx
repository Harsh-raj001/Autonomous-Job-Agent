"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { LogOut, Home, Search, Bookmark, Upload, Activity } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

function MagneticLink({ children, href, isActive, onClick }: { children: React.ReactNode, href?: string, isActive?: boolean, onClick?: () => void }) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (!ref.current) return;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const center = { x: left + width / 2, y: top + height / 2 };
    
    // Calculate distance from center (damped heavily so it doesn't move too far)
    const distanceX = (e.clientX - center.x) * 0.1;
    const distanceY = (e.clientY - center.y) * 0.1;
    
    x.set(distanceX);
    y.set(distanceY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const classes = `relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-300 text-sm font-medium z-10 overflow-hidden ${
    isActive
      ? 'text-glass-olive'
      : 'text-muted-foreground hover:text-foreground'
  }`;

  const inner = (
    <>
      {isActive && (
        <motion.div 
          layoutId="sidebar-active" 
          className="absolute inset-0 bg-glass-olive/10 rounded-xl z-[-1]" 
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      {!isActive && (
        <div className="absolute inset-0 bg-glass-charcoal/5 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl z-[-1]" />
      )}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} legacyBehavior>
        <motion.a
          ref={ref as any}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ x: mouseXSpring, y: mouseYSpring }}
          className={classes}
        >
          {inner}
        </motion.a>
      </Link>
    );
  }

  return (
    <motion.button
      ref={ref as any}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: mouseXSpring, y: mouseYSpring }}
      className={`w-full ${classes}`}
      onClick={onClick}
    >
      {inner}
    </motion.button>
  );
}

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

  if (pathname.startsWith('/auth')) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  const navItems = [
    { name: 'Dashboard',    href: '/',          icon: Home },
    { name: 'Job Search',   href: '/search',    icon: Search },
    { name: 'Review Queue', href: '/review',    icon: Bookmark },
    { name: 'Upload Resume',href: '/upload',    icon: Upload },
    { name: 'Activity & Insights',href: '/activity', icon: Activity },
  ];

  return (
    <aside className="w-64 hidden md:flex flex-col shrink-0 p-4 sticky top-0 h-screen z-50">
      <div className="flex-1 glass-floating rounded-2xl flex flex-col p-4 shadow-xl">
        
        {/* Brand */}
        <div className="px-2 pb-6 pt-2">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-glass-olive" />
            <span
              className="text-xl font-bold text-glass-charcoal tracking-tight"
              style={{ fontFamily: 'var(--font-lora, Lora, Georgia, serif)' }}
            >
              Elevate
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 relative">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <MagneticLink key={item.name} href={item.href} isActive={isActive}>
                <Icon className={`w-4 h-4 shrink-0 transition-colors duration-300 ${isActive ? 'text-glass-olive' : 'text-muted-foreground group-hover:text-foreground'}`} />
                {item.name}
              </MagneticLink>
            );
          })}
        </nav>

        {/* User Panel */}
        {user && (
          <div className="pt-4 mt-4 border-t border-glass-charcoal/10 space-y-1">
            <div className="flex items-center gap-3 px-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-glass-olive/10 border border-glass-olive/20 flex items-center justify-center text-glass-olive font-bold text-sm shrink-0">
                {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-foreground truncate">{user.user_metadata?.full_name || 'User'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <MagneticLink onClick={handleLogout}>
              <LogOut className="w-4 h-4 shrink-0" />
              Sign Out
            </MagneticLink>
          </div>
        )}
      </div>
    </aside>
  );
}
