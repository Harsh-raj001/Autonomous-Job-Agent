"use client"

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Loader2, CheckCircle2, ChevronRight, Briefcase, GraduationCap, Code, AlertCircle, RefreshCw } from 'lucide-react';

const POLL_INTERVAL_MS = 3000;
const MAX_WAIT_MS = 3 * 60 * 1000; // 3 minutes max

function ReviewPageContent() {
  const searchParams = useSearchParams();
  const filePath = searchParams.get('file');
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const startTimeRef = useRef(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!filePath) {
      setError('No file path provided. Please re-upload your resume.');
      setIsLoading(false);
      return;
    }

    // Elapsed time counter for display
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    const checkStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setError('Authentication required. Please log in again.');
          setIsLoading(false);
          cleanup();
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/resume/status?filePath=${encodeURIComponent(filePath)}`,
          { headers: { 'Authorization': `Bearer ${session.access_token}` } },
        );

        if (!res.ok) {
          console.error('Status endpoint returned', res.status);
          return; // keep polling, don't stop on transient HTTP errors
        }

        const data = await res.json();
        console.log('[ReviewPage] Poll result:', data);

        if (data.status === 'COMPLETED' && data.parsedData) {
          setParsedData(data.parsedData);
          setIsLoading(false);
          cleanup();
        } else if (data.status === 'FAILED') {
          setError(data.error || 'Resume parsing failed. Please try uploading again.');
          setIsLoading(false);
          cleanup();
        }
        // Otherwise keep polling (status === 'PROCESSING')

        // Safety timeout: if we've been polling for too long, stop and show error
        if (Date.now() - startTimeRef.current > MAX_WAIT_MS) {
          setError(
            'Parsing is taking too long (3+ minutes). The AI service may be overloaded. Please try again.',
          );
          setIsLoading(false);
          cleanup();
        }
      } catch (err: any) {
        console.error('[ReviewPage] Polling error:', err);
        // Network errors are transient — keep polling
      }
    };

    // Run immediately, then on interval
    checkStatus();
    intervalRef.current = setInterval(checkStatus, POLL_INTERVAL_MS);

    return cleanup;
  }, [filePath]);

  function cleanup() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  const handleConfirm = () => {
    router.push('/search?discover=true');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-white">Analyzing Your Resume</h2>
        <p className="text-gray-400 max-w-md">
          Our AI engine is reading your PDF to extract structured data (Experience, Education, Skills, and Projects).
          This usually takes 10–30 seconds...
        </p>
        <p className="text-gray-500 text-sm font-mono">{elapsedSeconds}s elapsed</p>
        {elapsedSeconds > 40 && (
          <p className="text-amber-400 text-sm max-w-sm">
            ⏳ Taking a bit longer than usual — the AI model may be warming up. Hang tight...
          </p>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Parsing Failed</h2>
        <p className="text-red-400 max-w-md">{error}</p>
        <button
          onClick={() => router.push('/upload')}
          className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 max-w-4xl mx-auto space-y-10">
      <header className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
            Resume Parsed Successfully
          </h1>
          <p className="text-gray-400 mt-2">Review the extracted information before starting the job discovery engine.</p>
        </div>
        <button
          onClick={handleConfirm}
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-2"
        >
          Confirm & Discover Jobs
          <ChevronRight className="w-5 h-5" />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Experience */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-400" />
            Experience
          </h2>
          <div className="space-y-6">
            {(parsedData?.experience || []).map((exp: any, i: number) => (
              <div key={i} className="border-l-2 border-blue-500/30 pl-4">
                <h3 className="font-bold text-white">{exp.title}</h3>
                <p className="text-blue-400 text-sm font-medium">
                  {exp.company} &bull; {exp.startDate} – {exp.endDate}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-400 list-disc list-inside">
                  {(exp.achievements || []).slice(0, 3).map((ach: string, j: number) => (
                    <li key={j}>{ach}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-8">
          {/* Skills */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-400" />
              Extracted Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                ...(parsedData?.tools || []),
                ...(parsedData?.frameworks || []),
                ...(parsedData?.domainExpertise || []),
              ].map((skill: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm rounded-lg"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Education */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-400" />
              Education
            </h2>
            <div className="space-y-4">
              {(parsedData?.education || []).map((edu: any, i: number) => (
                <div key={i}>
                  <h3 className="font-bold text-white">{edu.degree}</h3>
                  <p className="text-purple-400 text-sm font-medium">
                    {edu.institution} &bull; {edu.year}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Certifications */}
          {(parsedData?.certifications || []).length > 0 && (
            <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-white mb-4">Certifications</h2>
              <ul className="space-y-2">
                {(parsedData.certifications || []).map((cert: string, i: number) => (
                  <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    {cert}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
}

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="relative w-16 h-16 animate-pulse">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
        </div>
        <p className="text-gray-400">Loading Resume Review...</p>
      </div>
    }>
      <ReviewPageContent />
    </Suspense>
  );
}
