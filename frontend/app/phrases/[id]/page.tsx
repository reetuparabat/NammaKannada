'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  ArrowLeft,
  Bookmark,
  Volume2,
  Sparkles,
  Info,
  MessageSquare,
  Award,
  Check,
  Share2,
} from 'lucide-react';

import { Phrase, Scenario, SavedPhrase } from '@/types';
import { api, fetcher } from '@/lib/api';
import { useBookmarks } from '@/hooks/useBookmarks';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { PronunciationTrainer } from '@/components/learning/PronunciationTrainer';

export default function PhraseDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const phraseId = Number(params.id);

  // Fetch phrase details
  const {
    data: phrase,
    error: phraseError,
    isLoading: phraseLoading,
    mutate: mutatePhrase,
  } = useSWR<Phrase>(
    phraseId ? api.phrases.get(phraseId) : null,
    fetcher
  );

  // Fetch parent scenario details if available
  const { data: scenario } = useSWR<Scenario>(
    phrase?.scenario_id ? api.scenarios.get(phrase.scenario_id) : null,
    fetcher
  );

  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = phrase ? isBookmarked(phrase.id) : false;

  const [copied, setCopied] = useState(false);

  // Pronunciation helper
  const speakKannada = (text?: string | null) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'kn-IN';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  // Toggle bookmark wrapper
  const handleToggleBookmark = () => {
    if (!phrase) return;
    const item: SavedPhrase = {
      phraseId: phrase.id,
      kannadaText: phrase.kannada_text,
      englishMeaning: phrase.english_meaning,
      transliteration: phrase.transliteration,
      context: phrase.context,
      scenarioTitle: scenario?.title || null,
      categoryName: scenario ? `Category #${scenario.category_id}` : null,
      savedAt: new Date().toISOString(),
    };
    toggleBookmark(item);
  };

  // Copy phrase to clipboard
  const handleCopyPhrase = () => {
    if (!phrase || typeof navigator === 'undefined') return;
    const textToCopy = `${phrase.kannada_text} (${phrase.transliteration}) — "${phrase.english_meaning}"`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (phraseLoading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
        <LoadingSpinner message="Loading phrase details..." />
      </div>
    );
  }

  if (phraseError || !phrase) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          <ErrorMessage
            title="Phrase Not Found"
            message={
              phraseError?.message ||
              'Unable to find the requested phrase. It may have been unpublished or removed.'
            }
            onRetry={() => mutatePhrase()}
          />
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      {/* Top Header */}
      <div className="sticky top-0 z-20 border-b border-slate-800 bg-slate-900/90 py-3.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
              title="Go Back"
              aria-label="Go Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Phrase Detail
              </span>
              <h1 className="text-sm font-bold text-white sm:text-base truncate max-w-xs sm:max-w-md">
                {scenario?.title || 'Everyday Expression'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy button */}
            <button
              type="button"
              onClick={handleCopyPhrase}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
              title="Copy phrase"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-slate-400" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Bookmark button */}
            <button
              type="button"
              onClick={handleToggleBookmark}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                bookmarked
                  ? 'border-amber-500/50 bg-amber-500/20 text-amber-300'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title={bookmarked ? 'Saved in collection' : 'Save phrase'}
            >
              <Bookmark
                className={`h-3.5 w-3.5 ${bookmarked ? 'fill-amber-400 text-amber-400' : ''}`}
              />
              <span>{bookmarked ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-sm sm:p-10">
          {/* Metadata pill */}
          <div className="flex flex-wrap items-center gap-2">
            {scenario && (
              <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
                {scenario.title}
              </span>
            )}
            {phrase.formality_note && (
              <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300 border border-purple-500/20">
                {phrase.formality_note}
              </span>
            )}
          </div>

          {/* Large Kannada Text with Audio */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-3xl font-extrabold text-amber-300 tracking-tight sm:text-4xl md:text-5xl">
              {phrase.kannada_text}
            </h2>

            <button
              type="button"
              onClick={() => speakKannada(phrase.kannada_text)}
              className="inline-flex items-center gap-2 self-start rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition hover:from-amber-400 hover:to-amber-500 active:scale-95 sm:self-auto shrink-0"
              title="Listen to native pronunciation"
            >
              <Volume2 className="h-5 w-5" />
              <span>Pronounce</span>
            </button>
          </div>

          {/* Transliteration */}
          {phrase.transliteration && (
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-3 font-mono text-sm sm:text-base text-amber-200/90">
              <span className="text-xs uppercase text-slate-500 block mb-0.5">
                Pronunciation Guide:
              </span>
              <span>{phrase.transliteration}</span>
            </div>
          )}

          {/* English Meaning */}
          <div className="mt-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              English Meaning:
            </span>
            <p className="mt-1 text-xl font-semibold text-white sm:text-2xl">
              &ldquo;{phrase.english_meaning}&rdquo;
            </p>
          </div>

          {/* Context & Cultural Usage */}
          {phrase.context && (
            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <Info className="h-4 w-4" />
                <span>When and How to Use</span>
              </div>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                {phrase.context}
              </p>
            </div>
          )}

          {/* Example Dialogue / Situation */}
          {phrase.example && (
            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <Sparkles className="h-4 w-4" />
                <span>Example in Context</span>
              </div>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed italic">
                &ldquo;{phrase.example}&rdquo;
              </p>
            </div>
          )}

          {/* Formality & Etiquette Note */}
          {phrase.formality_note && (
            <div className="mt-5 rounded-2xl border border-purple-500/20 bg-purple-950/20 p-5">
              <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm">
                <Info className="h-4 w-4" />
                <span>Politeness &amp; Formality</span>
              </div>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                {phrase.formality_note}
              </p>
            </div>
          )}

          {/* Interactive Pronunciation & Speech Coach */}
          <div className="mt-8">
            <PronunciationTrainer
              kannadaText={phrase.kannada_text}
              transliteration={phrase.transliteration}
            />
          </div>

          {/* Action CTAs: Practice & Quiz */}
          {phrase.scenario_id && (
            <div className="mt-10 border-t border-slate-800 pt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Practice in Real Scenario
              </h3>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/practice/${phrase.scenario_id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-bold text-slate-950 shadow-md shadow-amber-500/20 transition hover:from-amber-400 hover:to-amber-500 active:scale-95"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Start Guided Practice</span>
                </Link>

                <Link
                  href={`/quiz/${phrase.scenario_id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
                >
                  <Award className="h-4 w-4 text-amber-400" />
                  <span>Take Scenario Quiz</span>
                </Link>

                <Link
                  href="/saved"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-5 py-3 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  <Bookmark className="h-4 w-4" />
                  <span>View All Saved</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
