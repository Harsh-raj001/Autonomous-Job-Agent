'use client'

import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.name.endsWith('.docx'))) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError("Please upload a PDF or DOCX file.");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.docx'))) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please upload a PDF or DOCX file.");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to upload a resume.");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resume/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ filePath: data.path })
      });

      if (!response.ok) throw new Error("Failed to trigger resume parsing.");
      router.push(`/upload/review?file=${encodeURIComponent(data.path)}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 md:p-12 max-w-3xl mx-auto space-y-10 min-h-[calc(100vh-64px)] flex flex-col justify-center relative z-10">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-xs font-bold tracking-widest uppercase text-glass-olive mb-3">AI Processing</p>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight" style={{ fontFamily: 'var(--font-lora)' }}>Upload Your Resume</h1>
        <p className="text-muted-foreground mt-4 text-lg font-medium">We'll automatically extract your experience, skills, and projects.</p>
      </motion.header>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
        className={`glass-panel border-2 border-dashed rounded-3xl p-12 md:p-20 text-center transition-all duration-300 ${file ? 'border-glass-olive bg-white/80' : 'border-white/50 hover:border-glass-olive/40 hover:bg-white/80'}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
      >
        <input 
          type="file" 
          id="resume-upload" 
          className="hidden" 
          accept=".pdf,.docx" 
          onChange={handleFileInput}
        />
        
        {!file ? (
          <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center space-y-6">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center border border-white/50 shadow-sm"
            >
              <UploadCloud className="w-10 h-10 text-glass-olive" />
            </motion.div>
            <div>
              <p className="text-foreground font-bold text-xl mb-2">Click to upload or drag and drop</p>
              <p className="text-muted-foreground text-sm font-medium">PDF or DOCX (max 5MB)</p>
            </div>
          </label>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center space-y-8">
            <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-glass-olive/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-glass-olive" />
              <FileText className="w-10 h-10 text-glass-olive" />
            </div>
            <div>
              <p className="text-foreground font-bold text-2xl mb-2">{file.name}</p>
              <p className="text-muted-foreground font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            
            {error && (
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-2 text-destructive bg-white/95 px-5 py-3 rounded-xl border border-destructive/20 shadow-sm font-medium text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm pt-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFile(null)}
                disabled={isUploading}
                className="flex-1 px-6 py-3.5 rounded-full border border-white/50 bg-white/40 text-foreground font-semibold hover:bg-white transition-colors disabled:opacity-50 text-sm shadow-sm"
              >
                Cancel
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 px-6 py-3.5 rounded-full bg-glass-olive text-white font-semibold hover:bg-glass-olive/90 transition-colors shadow-[0_4px_14px_0_rgba(85,107,47,0.39)] flex items-center justify-center gap-2 disabled:opacity-70 text-sm"
              >
                {isUploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Uploading</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> Process</>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
