import './globals.css';
import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import SmoothScroll from './components/SmoothScroll';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const lora = Lora({ 
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'Elevate — Autonomous Job Discovery & Application',
  description: 'The AI agent that discovers, analyzes, tailors, and applies to jobs autonomously while you sleep.',
  keywords: ['job application', 'AI', 'autonomous', 'career', 'job search automation'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${lora.variable}`}>
      <body className={inter.className} suppressHydrationWarning>
        <SmoothScroll>
          {/* Ambient Background Layers */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 texture-grain" />
            <div className="ambient-blob-1" />
            <div className="ambient-blob-2" />
          </div>

          <div className="flex h-screen overflow-hidden relative z-10">
            <Sidebar />
            
            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-y-auto">
              <div className="flex-1 flex flex-col pt-4 pr-4 pb-4">
                {children}
              </div>
              <Footer />
            </main>
          </div>
        </SmoothScroll>
      </body>
    </html>
  );
}
