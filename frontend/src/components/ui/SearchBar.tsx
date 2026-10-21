'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Search, X, Loader2, BookOpen, ChevronRight } from 'lucide-react';
import { PhraseSearchResult } from '@/types';
import { api, fetcher } from '@/lib/api';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  placeholder = 'Search phrases in Kannada or English...',
  className = '',
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce query by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const shouldFetch = debouncedQuery.length >= 2;
  const searchUrl = shouldFetch ? api.phrases.search(debouncedQuery) : null;

  const { data: results, error, isLoading } = useSWR<PhraseSearchResult[]>(
    searchUrl,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const handleSelect = (phraseId: number) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/phrases/${phraseId}`);
  };

  const handleClear = () => {
    setQuery('');
    setDebouncedQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const showDropdown =
    isOpen && debouncedQuery.length >= 2;

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-2xl ${className}`}
    >
      {/* Search Input Container */}
      <div className="relative flex items-center">
        <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400">
          <Search className="h-5 w-5 text-amber-400/80 transition-colors" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          placeholder={placeholder}
          aria-label="Search phrases"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls="search-results-list"
          role="combobox"
          className="w-full rounded-xl border border-[#E2E8F0] bg-white py-3 pl-11 pr-10 text-sm text-slate-900 placeholder-slate-500 shadow-sm backdrop-blur-md transition-all duration-150 focus:border-amber-500/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:border-slate-700/60 dark:bg-slate-900/90 dark:text-white dark:placeholder-slate-400 dark:shadow-inner dark:focus:bg-slate-900"
        />

        {/* Clear or Loading Icon */}
        <div className="absolute right-3 flex items-center gap-1.5">
          {isLoading && shouldFetch && (
            <Loader2 className="h-4 w-4 animate-spin text-amber-500 dark:text-amber-400" />
          )}
          {query && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Results */}
      {showDropdown && (
        <div
          id="search-results-list"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-[#E2E8F0] bg-white/95 p-2 shadow-xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-100 dark:border-slate-700/70 dark:bg-slate-900/95 dark:shadow-2xl"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 py-8 text-sm text-slate-600 dark:text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin text-amber-500 dark:text-amber-400" />
              <span>Searching phrases...</span>
            </div>
          ) : error ? (
            <div className="py-6 text-center text-sm text-red-500 dark:text-red-300">
              Unable to search phrases at this time.
            </div>
          ) : results && results.length > 0 ? (
            <div className="flex flex-col gap-1">
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Found {results.length} {results.length === 1 ? 'phrase' : 'phrases'}
              </div>
              {results.map((phrase) => (
                <button
                  key={phrase.id}
                  type="button"
                  onClick={() => handleSelect(phrase.id)}
                  className="group flex w-full items-start justify-between gap-3 rounded-lg p-3 text-left transition-colors hover:bg-amber-50/60 focus:bg-amber-50/60 focus:outline-none dark:hover:bg-slate-800/80 dark:focus:bg-slate-800/80"
                >
                  <div className="flex-1 min-w-0">
                    {/* Kannada & Transliteration */}
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-base font-semibold text-amber-600 group-hover:text-amber-700 transition-colors dark:text-amber-400 dark:group-hover:text-amber-300">
                        {phrase.kannada_text}
                      </span>
                      {phrase.transliteration && (
                        <span className="text-xs italic text-slate-500 dark:text-slate-400">
                          ({phrase.transliteration})
                        </span>
                      )}
                    </div>

                    {/* English Meaning */}
                    <p className="mt-1 text-sm text-[#172554] font-medium line-clamp-1 dark:text-slate-200">
                      {phrase.english_meaning}
                    </p>

                    {/* Scenario / Category Tag */}
                    {(phrase.scenario_title || phrase.category_name) && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400/80">
                        <BookOpen className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {[phrase.category_name, phrase.scenario_title]
                            .filter(Boolean)
                            .join(' • ')}
                        </span>
                      </div>
                    )}
                  </div>

                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-600 dark:text-slate-500 dark:group-hover:text-amber-400" />
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-slate-600 dark:text-slate-400">
              <p>No phrases found for &ldquo;{debouncedQuery}&rdquo;</p>
              <p className="mt-1 text-xs text-slate-500">
                Try searching for words like &ldquo;namaskara&rdquo;, &ldquo;coffee&rdquo;, or &ldquo;auto&rdquo;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
