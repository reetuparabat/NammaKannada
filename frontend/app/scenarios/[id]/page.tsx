'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import {
  ChevronLeft,
  Clock,
  BookOpen,
  Bookmark,
  MessageSquare,
  Award,
  CheckCircle2,
  Volume2,
  Info,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Scenario, Phrase, Category, SavedPhrase } from '@/types';
import { api, fetcher } from '@/lib/api';
import { useBookmarks } from '@/hooks/useBookmarks';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';

export default function ScenarioDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const scenarioId = rawId ? Number(rawId) : null;
  const isValidId = scenarioId !== null && !isNaN(scenarioId);

  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [playingId, setPlayingId] = useState<number | null>(null);

  // Fetch scenario details
  const {
    data: scenario,
    error: scenarioError,
    isLoading: scenarioLoading,
    mutate: mutateScenario,
  } = useSWR<Scenario>(
    isValidId ? api.scenarios.get(scenarioId) : null,
    fetcher
  );

  // Fetch scenario's published phrases
  const {
    data: phrases,
    error: phrasesError,
    isLoading: phrasesLoading,
    mutate: mutatePhrases,
  } = useSWR<Phrase[]>(
    isValidId ? api.scenarios.phrases(scenarioId) : null,
    fetcher
  );

  // Fetch category for rich breadcrumbs & bookmarks metadata
  const { data: category } = useSWR<Category>(
    scenario?.category_id ? api.categories.get(scenario.category_id) : null,
    fetcher
  );

  const isLoading = scenarioLoading || phrasesLoading;
  const error = scenarioError || phrasesError;

  const handleRetry = () => {
    mutateScenario();
    mutatePhrases();
  };

  // Parse learning objectives JSON string safely
  const objectives: string[] = React.useMemo(() => {
    if (!scenario?.learning_objectives) return [];
    try {
      const parsed = JSON.parse(scenario.learning_objectives);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === 'string') return [parsed];
      return [];
    } catch {
      return scenario.learning_objectives
        .split('\n')
        .map((line) => line.trim().replace(/^[-*•]\s*/, ''))
        .filter(Boolean);
    }
  }, [scenario?.learning_objectives]);

  // Handle bookmarking
  const handleToggleBookmark = (phrase: Phrase) => {
    const savedItem: SavedPhrase = {
      phraseId: phrase.id,
      kannadaText: phrase.kannada_text,
      englishMeaning: phrase.english_meaning,
      transliteration: phrase.transliteration,
      context: phrase.context || null,
      scenarioTitle: scenario?.title || null,
      categoryName: category?.name || null,
      savedAt: new Date().toISOString(),
    };
    toggleBookmark(savedItem);
  };

  // Optional Web Speech synthesis helper for pronunciation
  const handleSpeak = (text: string, phraseId: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'kn-IN';
    utterance.rate = 0.85;

    setPlayingId(phraseId);
    utterance.onend = () => setPlayingId(null);
    utterance.onerror = () => setPlayingId(null);

    window.speechSynthesis.speak(utterance);
  };

  if (!isValidId) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <ErrorMessage
          title="Invalid Scenario ID"
          message="The scenario you are trying to view does not exist."
        />
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-24 text-slate-100">
      {/* Header Banner */}
      <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 py-12">
        <div className="pointer-events-none absolute right-1/3 top-0 -translate-y-1/2 transform">
          <div className="h-72 w-72 rounded-full bg-amber-500/10 blur-[110px]" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
            <Link href="/" className="transition hover:text-amber-400">
              Home
            </Link>
            <span>/</span>
            {category && (
              <>
                <Link
                  href={`/categories/${category.id}`}
                  className="transition hover:text-amber-400"
                >
                  {category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-slate-300">
              {scenario?.title || 'Scenario Details'}
            </span>
          </nav>

          {/* Scenario Overview */}
          {isLoading && !scenario ? (
            <div className="py-6">
              <LoadingSpinner size="md" message="Loading scenario..." />
            </div>
          ) : scenario ? (
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <DifficultyBadge difficulty={scenario.difficulty} size="md" />
                <div className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-800/60 px-3 py-1 text-xs text-slate-300">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span>{scenario.estimated_minutes} min lesson</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-800/60 px-3 py-1 text-xs text-slate-300">
                  <BookOpen className="h-3.5 w-3.5 text-amber-400" />
                  <span>{scenario.phrase_count} key phrases</span>
                </div>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {scenario.title}
              </h1>

              <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
                {scenario.description}
              </p>

              {/* Action Buttons Header */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href={`/practice/${scenario.id}`}
                  className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition-all duration-200 hover:from-amber-400 hover:to-amber-500 hover:shadow-xl hover:shadow-amber-500/35 active:scale-95"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Practice Conversation</span>
                </Link>

                <Link
                  href={`/quiz/${scenario.id}`}
                  className="inline-flex items-center gap-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-6 py-3 text-sm font-bold text-amber-300 backdrop-blur-sm transition-all duration-200 hover:bg-amber-500/20 hover:border-amber-400 hover:text-white active:scale-95"
                >
                  <Award className="h-4 w-4" />
                  <span>Take Quiz</span>
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 lg:px-8">
        {/* Learning Objectives Card */}
        {objectives.length > 0 && (
          <div className="mb-10 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/20 via-slate-900/60 to-slate-900/40 p-6 backdrop-blur-sm shadow-md">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Sparkles className="h-4 w-4" />
              <span>What You Will Learn</span>
            </div>
            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {objectives.map((obj, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-200">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Phrases Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <span>Key Vocabulary</span>
              <span>•</span>
              <span className="font-normal text-amber-300">ಪ್ರಮುಖ ಪದಗಳು</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">
              Phrases in This Scenario
            </h2>
          </div>
          {phrases && phrases.length > 0 && (
            <span className="text-xs font-medium text-slate-400">
              {phrases.length} phrases to learn
            </span>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-16">
            <LoadingSpinner size="lg" message="Loading lesson phrases..." />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="py-8">
            <ErrorMessage
              title="Failed to load lesson content"
              message={
                error.message ||
                'Unable to retrieve phrases for this scenario. Please verify your connection.'
              }
              onRetry={handleRetry}
            />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && phrases && phrases.length === 0 && (
          <div className="py-8">
            <EmptyState
              title="No phrases published yet"
              description="Phrases for this scenario are under editorial review. Check back soon!"
              actionHref="/"
              actionLabel="Return to Categories"
            />
          </div>
        )}

        {/* Phrases Cards List */}
        {!isLoading && !error && phrases && phrases.length > 0 && (
          <div className="space-y-4">
            {phrases.map((phrase, index) => {
              const bookmarked = isBookmarked(phrase.id);

              return (
                <div
                  key={phrase.id}
                  className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm transition-all duration-200 hover:border-amber-500/40 hover:bg-slate-900/90 hover:shadow-lg hover:shadow-amber-500/5 sm:p-6"
                >
                  {/* Subtle left accent highlight */}
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-amber-500/0 transition-colors duration-200 group-hover:bg-amber-500" />

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Phrase Index Badge & Context */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-slate-400">
                          {index + 1}
                        </span>
                        {phrase.context && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-slate-700/60 bg-slate-800/80 px-2 py-0.5 text-xs text-slate-300">
                            <Info className="h-3 w-3 text-amber-400" />
                            <span>{phrase.context}</span>
                          </span>
                        )}
                        {phrase.formality_note && (
                          <span className="inline-flex items-center rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-300">
                            {phrase.formality_note}
                          </span>
                        )}
                      </div>

                      {/* Kannada Script (Large & Prominent) */}
                      <div className="mt-3 flex items-center gap-3">
                        <p className="kannada-text font-bold text-white tracking-wide text-2xl sm:text-3xl text-amber-400/95">
                          {phrase.kannada_text}
                        </p>

                        {/* Pronunciation TTS Button */}
                        <button
                          type="button"
                          onClick={() => handleSpeak(phrase.kannada_text, phrase.id)}
                          aria-label="Listen to pronunciation"
                          title="Listen to pronunciation"
                          className={`rounded-lg p-2 text-slate-400 transition hover:bg-amber-500/10 hover:text-amber-400 ${
                            playingId === phrase.id ? 'animate-pulse text-amber-400' : ''
                          }`}
                        >
                          <Volume2 className="h-5 w-5" />
                        </button>
                      </div>

                      {/* English Transliteration (Italic) */}
                      <p className="mt-1 text-sm font-medium italic text-amber-300/80 sm:text-base">
                        &quot;{phrase.transliteration}&quot;
                      </p>

                      {/* English Meaning */}
                      <p className="mt-2 text-base font-semibold text-slate-200 sm:text-lg">
                        {phrase.english_meaning}
                      </p>

                      {/* Usage Example if available */}
                      {phrase.example && (
                        <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-400">
                          <span className="font-semibold text-slate-300">Example: </span>
                          <span>{phrase.example}</span>
                        </div>
                      )}
                    </div>

                    {/* Bookmark Toggle Button */}
                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleBookmark(phrase)}
                        aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this phrase'}
                        title={bookmarked ? 'Saved to Bookmarks' : 'Save phrase'}
                        className={`group/btn flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-150 active:scale-90 ${
                          bookmarked
                            ? 'border-amber-500/50 bg-amber-500/20 text-amber-400 shadow-md shadow-amber-500/20'
                            : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-400'
                        }`}
                      >
                        <Bookmark
                          className={`h-5 w-5 transition-transform group-hover/btn:scale-110 ${
                            bookmarked ? 'fill-amber-400 text-amber-400' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Call to Action for Practice & Quiz */}
        {scenario && (
          <div className="mt-12 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/20 p-8 text-center sm:text-left">
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div>
                <h3 className="text-xl font-bold text-white sm:text-2xl">
                  Ready to test your practical Kannada?
                </h3>
                <p className="mt-1.5 text-sm text-slate-400">
                  Practice simulated dialogues with instant response choices or take a short knowledge quiz.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={`/practice/${scenario.id}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-md shadow-amber-500/20 transition hover:bg-amber-400 active:scale-95"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Practice Dialogues</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href={`/quiz/${scenario.id}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-amber-500/50 hover:bg-slate-800 hover:text-white active:scale-95"
                >
                  <Award className="h-4 w-4 text-amber-400" />
                  <span>Take Quiz</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
