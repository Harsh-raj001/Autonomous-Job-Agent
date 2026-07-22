"use client"

import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

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
      
      if (!user) {
        throw new Error("You must be logged in to upload a resume.");
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Automatically trigger the BullMQ resume parsing pipeline
      // We would hit our backend API here to trigger the parsing.
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resume/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          filePath: data.path,
        })
      });

      if (!response.ok) {
        throw new Error("Failed to trigger resume parsing.");
      }

      // Redirect to review page
      router.push(`/upload/review?file=${encodeURIComponent(data.path)}`);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 md:p-12 max-w-3xl mx-auto space-y-10 min-h-screen flex flex-col justify-center">
      <header className="text-center">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Upload Your Resume</h1>
        <p className="text-gray-400 mt-3 text-lg">We'll automatically extract your experience, skills, and projects.</p>
      </header>

      <div 
        className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all ${file ? 'border-blue-500 bg-blue-500/10' : 'border-white/20 bg-black/40 hover:border-white/40 hover:bg-white/5'} backdrop-blur-md relative`}
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
          <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <UploadCloud className="w-10 h-10 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-medium text-lg">Click to upload or drag and drop</p>
              <p className="text-gray-400 text-sm mt-1">PDF or DOCX (max 5MB)</p>
            </div>
          </label>
        ) : (
          <div className="flex flex-col items-center space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-xl">{file.name}</p>
              <p className="text-gray-400 text-sm mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
            
            <div className="flex gap-4 w-full max-w-xs pt-4">
              <button 
                onClick={() => setFile(null)}
                disabled={isUploading}
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Process
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
