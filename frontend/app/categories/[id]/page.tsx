'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import {
  ChevronLeft,
  Clock,
  BookOpen,
  ArrowRight,
  Bus,
  ShoppingBag,
  GraduationCap,
  HeartPulse,
  Utensils,
  Briefcase,
  Layers,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Category, Scenario } from '@/types';
import { api, fetcher } from '@/lib/api';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Bus,
  ShoppingBag,
  GraduationCap,
  HeartPulse,
  Utensils,
  Briefcase,
  BookOpen,
  Layers,
};

function getCategoryIcon(iconName?: string): React.ComponentType<{ className?: string }> {
  if (!iconName) return BookOpen;
  if (ICON_MAP[iconName]) return ICON_MAP[iconName];
  const dynamicIcon = (LucideIcons as Record<string, unknown>)[iconName] as
    | React.ComponentType<{ className?: string }>
    | undefined;
  return dynamicIcon || BookOpen;
}

export default function CategoryDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const categoryId = rawId ? Number(rawId) : null;

  const isValidId = categoryId !== null && !isNaN(categoryId);

  const {
    data: category,
    error: categoryError,
    isLoading: categoryLoading,
    mutate: mutateCategory,
  } = useSWR<Category>(
    isValidId ? api.categories.get(categoryId) : null,
    fetcher
  );

  const {
    data: scenarios,
    error: scenariosError,
    isLoading: scenariosLoading,
    mutate: mutateScenarios,
  } = useSWR<Scenario[]>(
    isValidId ? api.categories.scenarios(categoryId) : null,
    fetcher
  );

  const isLoading = categoryLoading || scenariosLoading;
  const error = categoryError || scenariosError;

  const handleRetry = () => {
    mutateCategory();
    mutateScenarios();
  };

  if (!isValidId) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <ErrorMessage
          title="Invalid Category ID"
          message="The category requested could not be identified."
        />
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(category?.icon);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Category Banner Header */}
      <section className="relative overflow-hidden border-b border-[#E2E8F0] bg-white py-12 dark:border-slate-800/80 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950">
        <div className="pointer-events-none absolute right-1/4 top-0 -translate-y-1/2 transform">
          <div className="h-64 w-64 rounded-full bg-amber-500/10 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Link
              href="/"
              className="inline-flex items-center gap-1 transition-colors hover:text-amber-600 dark:hover:text-amber-400"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>All Categories</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#172554] dark:text-slate-300">
              {category?.name || 'Category Details'}
            </span>
          </nav>

          {/* Category Info Header */}
          {isLoading && !category ? (
            <div className="py-6">
              <LoadingSpinner size="md" message="Loading category information..." />
            </div>
          ) : category ? (
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-amber-300 bg-[#FFF9ED] text-amber-600 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400 dark:shadow-amber-500/10">
                  <CategoryIcon className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-extrabold tracking-tight text-[#172554] sm:text-4xl dark:text-white">
                      {category.name}
                    </h1>
                    <span className="inline-flex items-center rounded-full border border-amber-300 bg-[#FFF9ED] px-3 py-1 text-xs font-semibold text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                      {scenarios ? scenarios.length : category.scenario_count}{' '}
                      {(scenarios ? scenarios.length : category.scenario_count) === 1
                        ? 'Scenario'
                        : 'Scenarios'}
                    </span>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
                    {category.description}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Scenarios Grid Section */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#172554] sm:text-2xl dark:text-white">
              Learning Scenarios
            </h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
              Step through real-world dialogues, review key vocabulary, and test yourself.
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-16">
            <LoadingSpinner size="lg" message="Loading scenarios..." />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="py-8">
            <ErrorMessage
              title="Unable to load scenarios"
              message={
                error.message ||
                'Failed to load scenarios for this category. Please try again.'
              }
              onRetry={handleRetry}
            />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && scenarios && scenarios.length === 0 && (
          <div className="py-8">
            <EmptyState
              title="No scenarios available yet"
              description="Scenarios are currently being curated for this category. Check back soon!"
              actionHref="/"
              actionLabel="Return to Categories"
            />
          </div>
        )}

        {/* Scenarios Grid */}
        {!isLoading && !error && scenarios && scenarios.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((scenario) => (
              <Link
                key={scenario.id}
                href={`/scenarios/${scenario.id}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70 dark:backdrop-blur-sm dark:hover:border-amber-500/50 dark:hover:bg-slate-900 dark:hover:shadow-xl"
              >
                {/* Top border accent */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-500/0 to-transparent transition-all duration-300 group-hover:via-amber-500/70" />

                <div>
                  {/* Badge & Metadata Header */}
                  <div className="flex items-center justify-between gap-2">
                    <DifficultyBadge difficulty={scenario.difficulty} />
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                      <span>{scenario.estimated_minutes} mins</span>
                    </div>
                  </div>

                  {/* Scenario Title */}
                  <h3 className="mt-4 text-xl font-bold tracking-tight text-[#172554] transition-colors duration-200 group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-300">
                    {scenario.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-300">
                    {scenario.description}
                  </p>
                </div>

                {/* Footer with Phrase count and Start button */}
                <div className="mt-6 border-t border-[#E2E8F0] pt-4 dark:border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <BookOpen className="h-3.5 w-3.5 text-amber-500" />
                      <span>{scenario.phrase_count} phrases</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 transition-colors group-hover:text-amber-700 dark:text-amber-400 dark:group-hover:text-amber-300">
                      <span>Start Learning</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
