import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Sidebar from './components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Autopilot - Autonomous Job Discovery & Application',
  description: 'Automatically discover, score, and apply to jobs based on your parsed resume.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto relative z-10 bg-[#09090b]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
