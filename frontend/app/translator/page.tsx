import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Languages, Mic, Sparkles, Volume2, ArrowLeft } from 'lucide-react';
import { VoiceTranslator } from '@/components/voice/VoiceTranslator';

export const metadata: Metadata = {
  title: 'Voice Translator | English ↔ Kannada — NammaKannada',
  description:
    'Bidirectional real-time speech-to-text and translation between English and Kannada. Speak naturally, translate instantly, and listen with authentic pronunciation.',
};

export default function TranslatorPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors">
      {/* Clean Ambient Hero Header */}
      <div className="relative border-b border-[#E2E8F0] dark:border-slate-800/60 bg-white/80 dark:bg-gradient-to-b dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950 py-8 sm:py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-4 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition flex items-center gap-1.5">
              <ArrowLeft className="h-3 w-3" />
              <span>Home</span>
            </Link>
            <span className="text-slate-400 dark:text-slate-600">/</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">Voice Translator</span>
          </nav>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2">
                <Languages className="h-3.5 w-3.5" />
                <span>Bidirectional AI Voice Engine • ದ್ವಿಮುಖ ಧ್ವನಿ ಅನುವಾದ</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#172554] dark:text-white">
                Voice Translator — English ↔ Kannada
              </h1>
              <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Speak naturally in English or Kannada. Real-time speech recognition, instant regional translation,
                and authentic spoken pronunciation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Translator Studio */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-2 sm:mt-6">
        <VoiceTranslator />

        {/* Minimalist 3-Step Feature Highlights */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 pt-8 border-t border-[#E2E8F0] dark:border-slate-800/60">
          <div className="rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 shadow-sm hover:shadow-md transition">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-3">
              <Mic className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-[#172554] dark:text-white">1. Dual Speech Recognition</h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Speaks in natural English or Kannada. Tuned for Indian English (<code className="text-amber-600 dark:text-amber-300 font-semibold">en-IN</code>) and Karnataka Kannada (<code className="text-amber-600 dark:text-amber-300 font-semibold">kn-IN</code>).
            </p>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 shadow-sm hover:shadow-md transition">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-[#172554] dark:text-white">2. Genuine Translation Engine</h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Authentic colloquial translations preserving local conversational nuances and full Kannada Unicode script integrity.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 shadow-sm hover:shadow-md transition">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 mb-3">
              <Volume2 className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-[#172554] dark:text-white">3. Spoken Audio Coach</h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Listen to the translated output spoken aloud. Play directly to auto drivers, shopkeepers, or bus conductors when on the move.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
