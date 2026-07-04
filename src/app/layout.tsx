import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CapPilot | MHT CET CAP Counselling Platform',
  description: 'An advanced, student-friendly platform with college predictors, comparison metrics, smart preference list generators, and AI counselling for MHT CET CAP admissions.',
  keywords: ['MHT CET', 'CAP Round', 'College Predictor', 'Engineering Admissions', 'COEP', 'VJTI', 'Cutoffs', 'Option Form'],
  authors: [{ name: 'Varun Bhoyar' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full scroll-smooth`}>
      <body className="flex min-h-screen flex-col font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
        
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden pointer-events-none opacity-40 dark:opacity-20">
          <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-500/30 blur-[120px]"></div>
          <div className="absolute bottom-[20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-500/25 blur-[150px]"></div>
        </div>

        {/* Global Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-grow flex flex-col w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
          {children}
        </main>

        {/* Professional Footer */}
        <footer className="glass-panel mt-auto border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                &copy; {new Date().getFullYear()} CapPilot. All rights reserved.
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                Made with ❤️ by <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold dark:from-indigo-400 dark:to-purple-400">Varun Bhoyar</span>
              </p>
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
