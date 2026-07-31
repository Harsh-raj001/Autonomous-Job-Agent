import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

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
          <main className="flex-1 flex flex-col overflow-y-auto relative z-10 bg-[#09090b]">
            <div className="flex-1 flex flex-col">
              {children}
            </div>
            <Footer />
          </main>
        </div>
      </body>
    </html>
  );
}
