"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Mail, Lock, ArrowRight, Loader2, User } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // If email confirmation is required, session will be null
      if (data.session) {
        router.push('/');
        router.refresh();
      } else {
        setSuccess(true);
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-w-border p-8 rounded-2xl shadow-sm relative overflow-hidden">
        
        <div className="relative z-10">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-e-brand" />
              <span className="text-xs font-bold uppercase tracking-widest text-e-brand">Elevate</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2" style={{ fontFamily: 'var(--font-lora, Lora, Georgia, serif)' }}>Create your account.</h1>
            <p className="text-muted-foreground text-sm font-medium">Start your autonomous job search tonight.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm font-medium text-center">
              {error}
            </div>
          )}

          {success ? (
            <div className="mb-6 p-6 bg-secondary border border-border rounded-xl text-center space-y-4">
              <div className="w-12 h-12 bg-background border border-border rounded-full flex items-center justify-center mx-auto mb-2">
                <Mail className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="text-foreground font-semibold text-lg">Check your email</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We've sent a confirmation link to <span className="text-foreground font-semibold">{email}</span>. Please click the link to activate your account.
              </p>
              <button 
                onClick={() => router.push('/auth/login')}
                className="mt-4 px-6 py-2 bg-foreground hover:bg-foreground/90 text-background rounded-md text-sm font-medium transition-colors w-full"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-md py-2.5 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground transition-all text-sm"
                    placeholder="Jane Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-md py-2.5 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground transition-all text-sm"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-md py-2.5 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground transition-all text-sm"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-e-brand hover:bg-e-dark text-white font-semibold py-3 px-4 rounded-full transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-2 group shadow-md shadow-e-brand/20 text-sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {!success && (
            <p className="mt-8 text-center text-sm text-muted-foreground font-medium">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-foreground hover:text-foreground/80 transition-colors font-semibold border-b border-transparent hover:border-foreground">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
