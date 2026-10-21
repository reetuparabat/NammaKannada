'use client';

import React, { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import {
  Wifi,
  WifiOff,
  Download,
  Trash2,
  CheckCircle2,
  Search,
  Volume2,
  ChevronDown,
  ChevronRight,
  Info,
} from 'lucide-react';

import { OfflineContent } from '@/types';
import { api, fetcher } from '@/lib/api';
import {
  getOfflineManifest,
  saveOfflineManifest,
  clearOfflineData,
} from '@/lib/indexedDb';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [cachedData, setCachedData] = useState<OfflineContent | null>(null);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Monitor network status and load offline cache from IndexedDB
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Asynchronously load from IndexedDB (with fallback)
      getOfflineManifest()
        .then((record) => {
          if (record && record.data) {
            setCachedData(record.data);
            setCachedAt(record.syncedAt);
            const exp: Record<number, boolean> = {};
            record.data.categories.forEach((c) => {
              exp[c.id] = true;
            });
            setExpandedCategories(exp);
          }
        })
        .catch((err) => {
          console.error('Failed to read offline cache from IndexedDB:', err);
        });

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Fetch online manifest when online
  const {
    data: manifestData,
    error: manifestError,
    isLoading: manifestLoading,
    mutate: mutateManifest,
  } = useSWR<OfflineContent>(
    isOnline ? api.offline.manifest() : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Active data is cachedData (offline or online) or fresh manifestData if nothing cached yet
  const displayData = cachedData || manifestData;

  // Save / Update to IndexedDB handler
  const handleSaveToOfflineDb = async () => {
    const dataToSave = manifestData || cachedData;
    if (!dataToSave || typeof window === 'undefined') return;

    setIsSaving(true);
    try {
      const { syncedAt } = await saveOfflineManifest(dataToSave);
      setCachedData(dataToSave);
      setCachedAt(syncedAt);
      setSaveSuccessMessage('Phrasebook successfully cached via IndexedDB for offline use!');
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    } catch (err) {
      console.error('IndexedDB offline save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Clear cache handler
  const handleClearCache = async () => {
    if (typeof window === 'undefined') return;
    try {
      await clearOfflineData();
      setCachedData(null);
      setCachedAt(null);
    } catch (err) {
      console.error('Failed to clear offline cache:', err);
    }
  };

  // Toggle category accordion
  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Audio pronunciation helper
  const speakKannada = (text?: string | null) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'kn-IN';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  // Filtered categories and scenarios based on search query
  const filteredCategories = useMemo(() => {
    if (!displayData?.categories) return [];
    if (!searchQuery.trim()) return displayData.categories;

    const q = searchQuery.toLowerCase();
    return displayData.categories
      .map((cat) => {
        const matchingScenarios = cat.scenarios
          .map((scen) => {
            const matchingPhrases = scen.phrases.filter(
              (p) =>
                p.kannada_text.toLowerCase().includes(q) ||
                p.english_meaning.toLowerCase().includes(q) ||
                p.transliteration.toLowerCase().includes(q) ||
                (p.context && p.context.toLowerCase().includes(q))
            );
            return {
              ...scen,
              phrases: matchingPhrases,
            };
          })
          .filter((scen) => scen.phrases.length > 0 || scen.title.toLowerCase().includes(q));

        return {
          ...cat,
          scenarios: matchingScenarios,
        };
      })
      .filter((cat) => cat.scenarios.length > 0 || cat.name.toLowerCase().includes(q));
  }, [displayData, searchQuery]);

  // Compute total phrases count
  const totalCachedPhrases = useMemo(() => {
    if (!displayData?.categories) return 0;
    return displayData.categories.reduce(
      (sum, cat) =>
        sum + cat.scenarios.reduce((scenSum, s) => scenSum + s.phrases.length, 0),
      0
    );
  }, [displayData]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-24 dark:bg-slate-950 dark:text-slate-100">
      {/* Top Header Banner */}
      <div className="border-b border-[#E2E8F0] bg-white py-10 px-4 sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {/* Network Status Pill */}
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${
                    isOnline
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20'
                      : 'bg-[#FFF9ED] text-amber-800 border-[#FDE68A] dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20'
                  }`}
                >
                  {isOnline ? (
                    <>
                      <Wifi className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Online Mode</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Offline Mode</span>
                    </>
                  )}
                </span>

                {cachedAt && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Cached: {new Date(cachedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              <h1 className="mt-2 text-2xl font-extrabold text-[#172554] tracking-tight sm:text-3xl dark:text-white">
                Offline Phrasebook
              </h1>
              <p className="mt-1 text-sm text-slate-600 sm:text-base dark:text-slate-400">
                Download verified Kannada phrases for travel, shopping, and everyday emergencies when you don&apos;t have internet.
              </p>
            </div>

            {/* Offline Action Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {manifestData && (
                <button
                  type="button"
                  onClick={handleSaveToOfflineDb}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-amber-500/20 transition hover:from-amber-400 hover:to-amber-500 active:scale-95 disabled:opacity-50"
                >
                  <Download className={`h-4 w-4 ${isSaving ? 'animate-bounce' : ''}`} />
                  <span>
                    {isSaving
                      ? 'Saving to IndexedDB...'
                      : cachedData
                      ? 'Update Offline Cache'
                      : 'Save for Offline'}
                  </span>
                </button>
              )}

              {cachedData && (
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400 dark:hover:border-red-500/30"
                  title="Clear offline cache"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Clear Cache</span>
                </button>
              )}
            </div>
          </div>

          {/* Success Banner */}
          {saveSuccessMessage && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{saveSuccessMessage}</span>
            </div>
          )}

          {/* Search bar */}
          {displayData && (
            <div className="mt-6 max-w-md">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search offline phrases in Kannada or English..."
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-900/90 dark:text-white dark:placeholder-slate-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Offline Limitations Notice */}
        <div className="mb-8 rounded-2xl border border-[#FDE68A] bg-[#FFF9ED] p-4 sm:p-5 text-sm text-slate-800 shadow-sm flex items-start gap-3 dark:border-amber-500/20 dark:bg-amber-950/20 dark:text-slate-300">
          <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold text-amber-900 text-sm dark:text-amber-300">
              Offline Capabilities &amp; Limitations
            </h2>
            <p className="mt-1 text-slate-700 text-xs sm:text-sm leading-relaxed dark:text-slate-300">
              When disconnected, your saved phrases, Kannada script, transliterations, and meanings remain 100% accessible locally.
              However, interactive multi-step branching dialogues, backend-scored quizzes, and speech audio playback require an active internet connection.
            </p>
          </div>
        </div>

        {/* Loading / Error States */}
        {manifestLoading && !cachedData && (
          <div className="py-12">
            <LoadingSpinner message="Checking offline phrase manifest..." />
          </div>
        )}

        {!displayData && manifestError && (
          <div className="py-8">
            <ErrorMessage
              title="Unable to Load Offline Manifest"
              message={
                manifestError.message ||
                'No locally cached phrases were found and the server is unreachable.'
              }
              onRetry={() => mutateManifest()}
            />
          </div>
        )}

        {/* Empty Cache State */}
        {!displayData && !manifestLoading && !manifestError && (
          <div className="py-8">
            <EmptyState
              icon={<Download className="h-8 w-8 text-amber-400" />}
              title="No Offline Phrases Stored"
              description="Connect to the internet to download the full verified phrase collection for offline access."
              actionHref="/"
              actionLabel="Return Home"
            />
          </div>
        )}

        {/* Cached Phrases Content List */}
        {displayData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>
                {displayData.categories.length} Categories • {totalCachedPhrases} Phrases Stored
              </span>
            </div>

            {filteredCategories.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p>No offline phrases matched &quot;{searchQuery}&quot;.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-sm font-semibold text-amber-400 hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredCategories.map((category) => {
                  const isExpanded = expandedCategories[category.id] !== false;

                  return (
                    <div
                      key={category.id}
                      className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
                    >
                      {/* Category Header (Collapsible) */}
                      <button
                        type="button"
                        onClick={() => toggleCategory(category.id)}
                        className="flex w-full items-center justify-between p-4 sm:p-5 text-left bg-white hover:bg-slate-50 transition dark:bg-slate-900 dark:hover:bg-slate-850"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF9ED] border border-[#FDE68A] text-amber-700 font-bold dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400">
                            {category.name.charAt(0)}
                          </div>
                          <div>
                            <h2 className="text-base font-bold text-[#172554] sm:text-lg dark:text-white">
                              {category.name}
                            </h2>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {category.scenarios.length} Scenarios
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                        </div>
                      </button>

                      {/* Scenarios & Phrases */}
                      {isExpanded && (
                        <div className="p-4 sm:p-6 space-y-6 border-t border-[#E2E8F0] dark:border-slate-800">
                          {category.scenarios.map((scenario) => (
                            <div key={scenario.id} className="space-y-3">
                              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 dark:border-slate-800/80">
                                <h3 className="text-sm font-bold text-[#172554] dark:text-amber-300">
                                  {scenario.title}
                                </h3>
                                <span className="text-xs font-mono text-slate-500">
                                  {scenario.phrases.length} phrases
                                </span>
                              </div>

                              {/* Phrases Grid */}
                              <div className="grid gap-3 sm:grid-cols-2">
                                {scenario.phrases.map((phrase) => (
                                  <div
                                    key={phrase.id}
                                    className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 transition hover:border-amber-400 hover:bg-white hover:shadow-sm dark:border-slate-800 dark:bg-slate-950/70 dark:hover:border-slate-700"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="text-lg font-bold text-[#172554] dark:text-amber-200">
                                        {phrase.kannada_text}
                                      </p>
                                      {isOnline && (
                                        <button
                                          type="button"
                                          onClick={() => speakKannada(phrase.kannada_text)}
                                          className="rounded p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400"
                                          title="Pronounce"
                                        >
                                          <Volume2 className="h-3.5 w-3.5" />
                                        </button>
                                      )}
                                    </div>

                                    {phrase.transliteration && (
                                      <p className="mt-0.5 text-xs font-mono text-amber-700 italic dark:text-slate-400">
                                        {phrase.transliteration}
                                      </p>
                                    )}

                                    <p className="mt-1.5 text-xs font-medium text-slate-800 dark:text-slate-200">
                                      {phrase.english_meaning}
                                    </p>

                                    {phrase.context && (
                                      <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
                                        <span className="font-semibold text-slate-800 dark:text-slate-300">Tip: </span>
                                        {phrase.context}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
