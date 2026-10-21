import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { ServiceWorkerRegister } from '@/components/layout/ServiceWorkerRegister';
import { ThemeProvider } from '@/context/ThemeContext';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'NammaKannada | ನಮ್ಮ ಕನ್ನಡ — Everyday Kannada Learning Platform',
  description:
    'Learn practical Kannada for everyday situations: travel, shopping, healthcare, college life, and more through interactive dialogues and guided quizzes.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f59e0b" />
      </head>
      <body className="flex min-h-screen flex-col bg-[#F8FAFC] text-slate-900 selection:bg-amber-500 selection:text-slate-950 antialiased transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
        <ThemeProvider>
          <ServiceWorkerRegister />
          <Header />
          <main className="flex-1 w-full">{children}</main>
        </ThemeProvider>
        <footer className="border-t border-[#E2E8F0] bg-white/90 py-8 text-sm text-slate-600 dark:border-slate-800/80 dark:bg-slate-950/90 dark:text-slate-400">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex flex-col items-center sm:items-start gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold tracking-tight text-[#172554] dark:text-white">NammaKannada</span>
                  <span className="text-amber-500 dark:text-amber-400 font-medium">ನಮ್ಮ ಕನ್ನಡ</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ಕನ್ನಡ ಕಲಿಯಿರಿ, ಸುಲಭವಾಗಿ ಮಾತನಾಡಿ • Practical Kannada for everyday life
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400">
                <Link href="/" className="transition hover:text-amber-600 dark:hover:text-amber-400">
                  Home
                </Link>
                <Link href="/translator" className="transition hover:text-amber-600 dark:hover:text-amber-400">
                  Voice Translator
                </Link>
                <Link href="/progress" className="transition hover:text-amber-600 dark:hover:text-amber-400">
                  Progress
                </Link>
                <Link href="/saved" className="transition hover:text-amber-600 dark:hover:text-amber-400">
                  Saved Phrases
                </Link>
                <Link href="/offline" className="transition hover:text-amber-600 dark:hover:text-amber-400">
                  Offline Mode
                </Link>
                <Link href="/admin" className="transition hover:text-amber-600 dark:hover:text-amber-400">
                  Admin Portal
                </Link>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                &copy; {new Date().getFullYear()} NammaKannada. Built for Karnataka.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
