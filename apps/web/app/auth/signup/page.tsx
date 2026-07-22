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
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/30 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/30 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Create Account</h1>
            <p className="text-gray-400 text-sm">Join Autopilot to automate your job search.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium text-center">
              {error}
            </div>
          )}

          {success ? (
            <div className="mb-6 p-6 bg-green-500/10 border border-green-500/20 rounded-2xl text-center space-y-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Mail className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-white font-bold text-lg">Check your email</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                We've sent a confirmation link to <span className="text-white font-medium">{email}</span>. Please click the link to activate your account.
              </p>
              <button 
                onClick={() => router.push('/auth/login')}
                className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold transition-colors w-full"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="Jane Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-2 group shadow-[0_0_20px_rgba(37,99,235,0.2)]"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {!success && (
            <p className="mt-8 text-center text-sm text-gray-400 font-medium">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-white hover:text-blue-400 transition-colors font-bold border-b border-transparent hover:border-blue-400">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
