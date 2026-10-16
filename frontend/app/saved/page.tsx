'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  Volume2,
  Trash2,
  Search,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

import { useBookmarks } from '@/hooks/useBookmarks';
import { EmptyState } from '@/components/ui/EmptyState';

export default function SavedPhrasesPage() {
  const { bookmarks, removeBookmark } = useBookmarks();
  const [searchQuery, setSearchQuery] = useState('');

  // Speech pronunciation helper
  const speakKannada = (text?: string | null) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'kn-IN';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  // Filter bookmarks by search query
  const filteredBookmarks = useMemo(() => {
    if (!searchQuery.trim()) return bookmarks;
    const q = searchQuery.toLowerCase();
    return bookmarks.filter(
      (b) =>
        b.kannadaText?.toLowerCase().includes(q) ||
        b.englishMeaning?.toLowerCase().includes(q) ||
        b.transliteration?.toLowerCase().includes(q) ||
        b.scenarioTitle?.toLowerCase().includes(q) ||
        b.categoryName?.toLowerCase().includes(q)
    );
  }, [bookmarks, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Header Banner */}
      <div className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
                  <Bookmark className="h-3.5 w-3.5 fill-amber-400" />
                  <span>Personal Collection</span>
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
                Saved Phrases
              </h1>
              <p className="mt-1 text-sm text-slate-400 sm:text-base">
                Your bookmarked Kannada expressions for quick reference in daily life.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-amber-500/20 transition hover:from-amber-400 hover:to-amber-500 self-start sm:self-auto"
            >
              <BookOpen className="h-4 w-4" />
              <span>Browse More Phrases</span>
            </Link>
          </div>

          {/* Search bar inside header if bookmarks exist */}
          {bookmarks.length > 0 && (
            <div className="mt-6 max-w-md">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter saved phrases by Kannada, English, or topic..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {bookmarks.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={<Bookmark className="h-8 w-8 text-amber-400" />}
              title="No Saved Phrases Yet"
              description="Tap the bookmark icon on any phrase while browsing or practicing scenarios to save it here for quick everyday reference."
              actionHref="/"
              actionLabel="Explore Everyday Scenarios"
            />
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-slate-400">
              No saved phrases match &quot;{searchQuery}&quot;.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-sm font-semibold text-amber-400 hover:underline"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>Saved Items ({filteredBookmarks.length})</span>
            </div>

            {/* Grid of Saved Phrase Cards */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredBookmarks.map((phrase) => (
                <div
                  key={phrase.phraseId}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm transition-all duration-150 hover:border-slate-700 hover:bg-slate-850 hover:shadow-xl"
                >
                  <div>
                    {/* Top tags + actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {phrase.categoryName && (
                          <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                            {phrase.categoryName}
                          </span>
                        )}
                        {phrase.scenarioTitle && (
                          <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400 border border-amber-500/20">
                            {phrase.scenarioTitle}
                          </span>
                        )}
                      </div>

                      {/* Remove Bookmark Button */}
                      <button
                        type="button"
                        onClick={() => removeBookmark(phrase.phraseId)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                        title="Remove from saved"
                        aria-label="Remove from saved"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Kannada Text */}
                    <div className="mt-4 flex items-start justify-between gap-2">
                      <h2 className="text-xl font-bold text-amber-300 sm:text-2xl">
                        {phrase.kannadaText}
                      </h2>
                      <button
                        type="button"
                        onClick={() => speakKannada(phrase.kannadaText)}
                        className="rounded-lg bg-slate-800 p-2 text-slate-300 transition hover:bg-slate-700 hover:text-amber-400"
                        title="Pronounce phrase"
                        aria-label="Pronounce phrase"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Transliteration */}
                    {phrase.transliteration && (
                      <p className="mt-1 font-mono text-xs text-slate-400 italic">
                        {phrase.transliteration}
                      </p>
                    )}

                    {/* English Meaning */}
                    <p className="mt-2.5 text-sm font-medium text-white">
                      {phrase.englishMeaning}
                    </p>

                    {/* Context note if available */}
                    {phrase.context && (
                      <p className="mt-2 rounded-lg bg-slate-950/60 p-2 text-xs text-slate-400">
                        <span className="font-semibold text-slate-300">Usage: </span>
                        {phrase.context}
                      </p>
                    )}
                  </div>

                  {/* Card Footer: Detail Link */}
                  <div className="mt-5 border-t border-slate-800/80 pt-3 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Saved {new Date(phrase.savedAt).toLocaleDateString()}
                    </span>

                    <Link
                      href={`/phrases/${phrase.phraseId}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
                    >
                      <span>Full Details</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
