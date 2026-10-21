'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  BookOpen,
  MessageSquare,
  Clock,
  BarChart3,
  Flame,
} from 'lucide-react';

import { ScenarioProgress } from '@/types';
import { getProgress } from '@/lib/storage';
import { EmptyState } from '@/components/ui/EmptyState';

export default function ProgressPage() {
  const [progressList, setProgressList] = useState<ScenarioProgress[]>([]);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    setProgressList(getProgress());
  }, []);

  // Compute summary stats
  const stats = useMemo(() => {
    const totalScenarios = progressList.length;
    const completedConversations = progressList.filter(
      (p) => p.completedConversation
    ).length;
    const quizzesTaken = progressList.filter((p) => p.completedQuiz).length;

    const scoredQuizzes = progressList.filter(
      (p) => p.completedQuiz && p.quizScore !== null && p.quizTotal !== null && p.quizTotal > 0
    );

    const averageScore =
      scoredQuizzes.length > 0
        ? Math.round(
            scoredQuizzes.reduce((acc, curr) => {
              const pct = (curr.quizScore! / curr.quizTotal!) * 100;
              return acc + pct;
            }, 0) / scoredQuizzes.length
          )
        : 0;

    return {
      totalScenarios,
      completedConversations,
      quizzesTaken,
      averageScore,
    };
  }, [progressList]);

  // Format relative date helper
  const formatTimeAgo = (isoString?: string) => {
    if (!isoString) return 'Recently';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 2) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 dark:bg-slate-950 dark:text-slate-100">
      {/* Top Banner */}
      <div className="border-b border-[#E2E8F0] bg-white py-10 px-4 sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF9ED] px-3 py-1 text-xs font-semibold text-amber-800 border border-[#FDE68A] dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
                  <Flame className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Learning Journey</span>
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-extrabold text-[#172554] tracking-tight sm:text-3xl dark:text-white">
                Your Learning Progress
              </h1>
              <p className="mt-1 text-sm text-slate-600 sm:text-base dark:text-slate-400">
                Track completed conversation practices and test scores in everyday Kannada.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-amber-500/20 transition hover:from-amber-400 hover:to-amber-500 self-start sm:self-auto"
            >
              <BookOpen className="h-4 w-4" />
              <span>Explore Scenarios</span>
            </Link>
          </div>

          {/* Stats Overview Grid */}
          {mounted && progressList.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {/* Stat 1 */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-medium uppercase tracking-wider">Scenarios</span>
                  <BookOpen className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                </div>
                <div className="mt-2 text-2xl font-extrabold text-[#172554] sm:text-3xl dark:text-white">
                  {stats.totalScenarios}
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Total touched</p>
              </div>

              {/* Stat 2 */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-medium uppercase tracking-wider">Conversations</span>
                  <MessageSquare className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div className="mt-2 text-2xl font-extrabold text-emerald-600 sm:text-3xl dark:text-emerald-400">
                  {stats.completedConversations}
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Practices completed</p>
              </div>

              {/* Stat 3 */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-medium uppercase tracking-wider">Quizzes</span>
                  <Award className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                </div>
                <div className="mt-2 text-2xl font-extrabold text-amber-600 sm:text-3xl dark:text-amber-400">
                  {stats.quizzesTaken}
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Quizzes taken</p>
              </div>

              {/* Stat 4 */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-medium uppercase tracking-wider">Average Score</span>
                  <BarChart3 className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                </div>
                <div className="mt-2 text-2xl font-extrabold text-purple-600 sm:text-3xl dark:text-purple-300">
                  {stats.averageScore}%
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Across all tests</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {!mounted ? (
          <div className="py-16 text-center text-slate-400">
            <p>Loading your progress...</p>
          </div>
        ) : progressList.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={<TrendingUp className="h-8 w-8 text-amber-400" />}
              title="No Learning Progress Yet"
              description="Start practicing real-world conversations and taking quizzes to track your Kannada learning progress here."
              actionHref="/"
              actionLabel="Start Learning Now"
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#172554] tracking-tight sm:text-xl dark:text-white">
                Scenario Progress Cards ({progressList.length})
              </h2>
            </div>

            {/* Scenario Progress Cards Grid */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {progressList.map((item) => {
                const hasScore = item.quizScore !== null && item.quizTotal !== null;
                const scorePct = hasScore
                  ? Math.round((item.quizScore! / item.quizTotal!) * 100)
                  : 0;
                const isPassed = hasScore && scorePct >= 60;

                return (
                  <div
                    key={item.scenarioId}
                    className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all hover:border-amber-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-slate-700 dark:hover:bg-slate-850"
                  >
                    <div>
                      {/* Category Badge & Last Accessed */}
                      <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {item.categoryName || 'General'}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400 dark:text-slate-500">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(item.lastAccessedAt)}</span>
                        </span>
                      </div>

                      {/* Scenario Title */}
                      <h3 className="mt-3 text-base font-bold text-[#172554] tracking-tight dark:text-white">
                        {item.scenarioTitle}
                      </h3>

                      {/* Status Badges */}
                      <div className="mt-4 space-y-2">
                        {/* Conversation practice status */}
                        <div className="flex items-center justify-between rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 text-xs dark:bg-slate-950/60 dark:border-transparent">
                          <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                            <span>Conversation Practice</span>
                          </span>
                          {item.completedConversation ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">Incomplete</span>
                          )}
                        </div>

                        {/* Quiz Status */}
                        <div className="flex items-center justify-between rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 text-xs dark:bg-slate-950/60 dark:border-transparent">
                          <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <Award className="h-3.5 w-3.5 text-slate-400" />
                            <span>Knowledge Quiz</span>
                          </span>
                          {item.completedQuiz ? (
                            <div className="text-right">
                              <span
                                className={`inline-flex items-center gap-1 font-bold ${
                                  isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                                }`}
                              >
                                {item.quizScore}/{item.quizTotal} ({scorePct}%)
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">Not taken</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Links */}
                    <div className="mt-6 flex items-center gap-2 border-t border-[#E2E8F0] pt-4 dark:border-slate-800/80">
                      <Link
                        href={`/practice/${item.scenarioId}`}
                        className="flex-1 rounded-xl border border-[#E2E8F0] bg-white py-2 text-center text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white"
                      >
                        Practice
                      </Link>

                      <Link
                        href={`/quiz/${item.scenarioId}`}
                        className="flex-1 rounded-xl bg-[#FFF9ED] border border-amber-300 py-2 text-center text-xs font-semibold text-amber-800 transition hover:bg-amber-100 hover:text-amber-900 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300"
                      >
                        {item.completedQuiz ? 'Retake Quiz' : 'Take Quiz'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
