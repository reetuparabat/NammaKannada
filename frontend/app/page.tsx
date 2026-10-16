'use client';

import React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
  Bus,
  ShoppingBag,
  GraduationCap,
  HeartPulse,
  Utensils,
  Briefcase,
  BookOpen,
  MapPin,
  ArrowRight,
  Sparkles,
  Compass,
  MessageSquare,
  Award,
  Smartphone,
  Layers,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Category } from '@/types';
import { api, fetcher } from '@/lib/api';
import { SearchBar } from '@/components/ui/SearchBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';

// Icon mapping helper for categories
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Bus,
  ShoppingBag,
  GraduationCap,
  HeartPulse,
  Utensils,
  Briefcase,
  BookOpen,
  MapPin,
  Store: ShoppingBag,
  Hospital: HeartPulse,
  School: GraduationCap,
  Car: Bus,
  Navigation: Compass,
  Layers,
};

function getCategoryIcon(iconName: string): React.ComponentType<{ className?: string }> {
  if (!iconName) return BookOpen;
  if (ICON_MAP[iconName]) return ICON_MAP[iconName];
  const dynamicIcon = (LucideIcons as Record<string, unknown>)[iconName] as
    | React.ComponentType<{ className?: string }>
    | undefined;
  return dynamicIcon || BookOpen;
}

export default function HomePage() {
  const { data: categories, error, isLoading, mutate } = useSWR<Category[]>(
    api.categories.list(),
    fetcher
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 py-16 sm:py-24">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 transform">
          <div className="h-[350px] w-[600px] rounded-full bg-amber-500/10 blur-[120px]" />
        </div>
        <div className="pointer-events-none absolute right-10 top-20">
          <div className="h-56 w-56 rounded-full bg-amber-600/5 blur-[90px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400 backdrop-blur-md mb-6 shadow-sm shadow-amber-500/10">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Practical Kannada For Real Life</span>
          </div>

          {/* Titles */}
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
            Namma<span className="text-amber-400">Connect</span>
          </h1>

          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="kannada-text text-2xl font-bold text-amber-400/95 sm:text-3xl">
              ನಮ್ಮ ಕನೆಕ್ಟ್
            </span>
          </div>

          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 sm:text-lg sm:leading-relaxed">
            Learn practical Kannada designed for students, new residents, and daily commuters in Karnataka. 
            Speak confidently with bus conductors, auto drivers, shopkeepers, and campus peers.
          </p>

          {/* Search Bar */}
          <div className="mx-auto mt-8 max-w-2xl">
            <SearchBar placeholder="Search phrases e.g. 'How much is the ticket?', 'ಬಸ್', 'ಎಲ್ಲಿಗೆ'..." />
          </div>

          {/* Quick learning highlights */}
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 text-left">
            <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 backdrop-blur-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Situation Based</p>
                <p className="text-[11px] text-slate-400">Travel, market, campus & health</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 backdrop-blur-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Guided Dialogues</p>
                <p className="text-[11px] text-slate-400">Interactive conversational practice</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 backdrop-blur-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Interactive Quizzes</p>
                <p className="text-[11px] text-slate-400">Instant feedback & scoring</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 backdrop-blur-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Offline Ready</p>
                <p className="text-[11px] text-slate-400">Access saved phrases anywhere</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Categories Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <span>Categories</span>
              <span>•</span>
              <span className="font-normal text-amber-300">ವಿಭಾಗಗಳು</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Everyday Situations
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Choose a context to start learning essential phrases and guided conversations.
            </p>
          </div>
          {categories && categories.length > 0 && (
            <span className="text-xs font-medium text-slate-400">
              Showing {categories.length} learning modules
            </span>
          )}
        </div>

        {/* State Handling */}
        {isLoading && (
          <div className="py-16">
            <LoadingSpinner size="lg" message="Loading learning categories..." />
          </div>
        )}

        {error && (
          <div className="py-8">
            <ErrorMessage
              title="Unable to load categories"
              message={
                error.message ||
                'Could not connect to the backend server. Please verify the API is running on localhost:8000.'
              }
              onRetry={() => mutate()}
            />
          </div>
        )}

        {!isLoading && !error && categories && categories.length === 0 && (
          <div className="py-8">
            <EmptyState
              title="No categories found"
              description="No learning categories have been published yet. Please check back later."
            />
          </div>
        )}

        {/* Categories Grid */}
        {!isLoading && !error && categories && categories.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const IconComponent = getCategoryIcon(category.icon);

              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/50 hover:bg-slate-900 hover:shadow-xl hover:shadow-amber-500/5"
                >
                  {/* Subtle top amber highlight gradient */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-500/0 to-transparent transition-all duration-300 group-hover:via-amber-500/70" />

                  <div>
                    {/* Top row: Icon and scenario count */}
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400 transition-colors duration-300 group-hover:border-amber-500/40 group-hover:bg-amber-500/20 group-hover:text-amber-300 shadow-sm">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <span className="inline-flex items-center rounded-full border border-slate-700/60 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-300">
                        {category.scenario_count}{' '}
                        {category.scenario_count === 1 ? 'scenario' : 'scenarios'}
                      </span>
                    </div>

                    {/* Category Title */}
                    <h3 className="mt-5 text-xl font-bold tracking-tight text-white transition-colors duration-200 group-hover:text-amber-300">
                      {category.name}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-400 group-hover:text-slate-300">
                      {category.description}
                    </p>
                  </div>

                  {/* Card Footer Link */}
                  <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4 text-xs font-semibold text-amber-400 transition-colors group-hover:text-amber-300">
                    <span>Explore Scenarios</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
