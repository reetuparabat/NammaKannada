'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  HelpCircle,
  BookOpen,
  Volume2,
  Sparkles,
} from 'lucide-react';

import { Quiz, QuizResult, Scenario } from '@/types';
import { ApiError, api, fetcher, submitQuiz } from '@/lib/api';
import { markQuizComplete } from '@/lib/storage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';

export default function QuizPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const scenarioId = Number(params.id);

  // Fetch quiz for scenario
  const {
    data: quiz,
    error: quizError,
    isLoading: quizLoading,
    mutate: mutateQuiz,
  } = useSWR<Quiz>(
    scenarioId ? api.scenarios.quiz(scenarioId) : null,
    fetcher
  );

  // Fetch scenario details for title/category metadata
  const { data: scenario } = useSWR<Scenario>(
    scenarioId ? api.scenarios.get(scenarioId) : null,
    fetcher
  );

  // State: current question index
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Map of question_id -> selected_option_id
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  // Quiz submission & results state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const questions = useMemo(() => quiz?.questions || [], [quiz]);
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  const currentSelectedOptionId = currentQuestion
    ? selectedAnswers[currentQuestion.id]
    : undefined;

  // Speak Kannada pronunciation helper
  const speakKannada = (text?: string | null) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'kn-IN';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  // Option selection handler
  const handleSelectOption = (optionId: number) => {
    if (!currentQuestion) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Submit quiz handler
  const handleSubmit = async () => {
    if (!scenarioId || questions.length === 0) return;

    // Build answer payload
    const answersPayload = questions.map((q) => ({
      question_id: q.id,
      selected_option_id: selectedAnswers[q.id] || 0,
    }));

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitQuiz(scenarioId, answersPayload);
      setQuizResult(result);

      // Save progress to local storage
      const scenarioTitle = scenario?.title || `Scenario #${scenarioId}`;
      const categoryName = scenario ? `Category #${scenario.category_id}` : 'General';
      markQuizComplete(
        scenarioId,
        scenarioTitle,
        categoryName,
        result.score,
        result.total
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit quiz. Please try again.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Retry quiz handler
  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setQuizResult(null);
    setSubmitError(null);
  };

  if (quizLoading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
        <LoadingSpinner message="Loading scenario quiz..." />
      </div>
    );
  }

  if (quizError || !quiz) {
    const is404 = (quizError as ApiError)?.status === 404 || 
                  (quizError as ApiError)?.detail?.toLowerCase()?.includes('not found');

    if (is404) {
      return (
        <div className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl">
            <EmptyState
              icon={<HelpCircle className="h-10 w-10 text-amber-400" />}
              title="Quiz Under Curation"
              description={`Assessment questions for ${scenario?.title ? `"${scenario.title}"` : 'this scenario'} are currently being curated by our linguistic team. In the meantime, try practicing the guided dialogue or reviewing the essential phrases!`}
              actionHref={`/practice/${scenarioId}`}
              actionLabel="Practice Conversation Instead"
            />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/scenarios/${scenarioId}`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-850 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
              >
                <BookOpen className="h-4 w-4 text-amber-400" />
                <span>View Scenario Phrases</span>
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Browse All Scenarios</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          <ErrorMessage
            title="Quiz Unavailable"
            message={
              quizError?.message ||
              'Unable to load quiz for this scenario. Please verify the backend is running.'
            }
            onRetry={() => mutateQuiz()}
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

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          <EmptyState
            icon={<HelpCircle className="h-8 w-8 text-amber-400" />}
            title="No Quiz Questions Available"
            description="Questions for this scenario are currently being curated."
            actionHref={`/practice/${scenarioId}`}
            actionLabel="Practice Conversation Instead"
          />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/scenarios/${scenarioId}`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-850 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
            >
              <BookOpen className="h-4 w-4 text-amber-400" />
              <span>View Scenario Phrases</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: RESULTS VIEW (Once submitted)
  // -------------------------------------------------------------
  if (quizResult) {
    const isPassed = quizResult.passed;

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
        {/* Top Header */}
        <div className="border-b border-slate-800 bg-slate-900/90 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Quiz Results
                </span>
                <h1 className="text-base font-bold text-white sm:text-lg">
                  {scenario?.title || `Scenario #${scenarioId}`}
                </h1>
              </div>
            </div>

            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
              <span>Retry Quiz</span>
            </button>
          </div>
        </div>

        {/* Results Body */}
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          {/* Score Summary Card */}
          <div
            className={`relative overflow-hidden rounded-3xl border p-6 text-center shadow-2xl sm:p-10 ${
              isPassed
                ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-950'
                : 'border-amber-500/40 bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950'
            }`}
          >
            {/* Ambient Glow */}
            <div
              className={`pointer-events-none absolute inset-0 -z-10 blur-3xl opacity-20 ${
                isPassed ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />

            <div
              className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border text-3xl shadow-xl ${
                isPassed
                  ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-400'
                  : 'border-amber-500/40 bg-amber-500/20 text-amber-400'
              }`}
            >
              {isPassed ? <Award className="h-10 w-10" /> : <Sparkles className="h-10 w-10" />}
            </div>

            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                isPassed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {isPassed ? 'Passed Successfully!' : 'Keep Practicing!'}
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              {quizResult.score} / {quizResult.total}
            </h2>

            <p className="mt-1 text-base font-medium text-slate-300">
              Score: <span className="font-bold text-amber-400">{Math.round(quizResult.percentage)}%</span>
            </p>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
              {isPassed
                ? 'Excellent work! You have shown strong comprehension of everyday Kannada phrases for this situation.'
                : 'Good effort! Review the detailed answer explanations below or repeat the interactive conversation practice to improve.'}
            </p>

            {/* Quick Action Buttons */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-slate-950 shadow-md shadow-amber-500/20 transition hover:from-amber-400 hover:to-amber-500 active:scale-95 sm:w-auto"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Retry Quiz</span>
              </button>

              <Link
                href={`/practice/${scenarioId}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white sm:w-auto"
              >
                <BookOpen className="h-4 w-4 text-amber-400" />
                <span>Review Practice Dialogue</span>
              </Link>

              <Link
                href="/"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-5 py-3 font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white sm:w-auto"
              >
                <span>Back to Home</span>
              </Link>
            </div>
          </div>

          {/* Detailed Question Review Breakdown */}
          <div className="mt-10 space-y-6">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Answer Review & Explanations ({quizResult.answers.length} Questions)
            </h3>

            {quizResult.answers.map((ans, idx) => {
              const originalQuestion = questions.find((q) => q.id === ans.question_id);
              const selectedOption = originalQuestion?.options.find(
                (o) => o.id === ans.selected_option_id
              );
              const correctOption = originalQuestion?.options.find(
                (o) => o.id === ans.correct_option_id
              );

              return (
                <div
                  key={ans.question_id}
                  className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                    ans.is_correct
                      ? 'border-emerald-500/30 bg-emerald-950/10'
                      : 'border-red-500/30 bg-red-950/10'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-slate-300">
                        Q{idx + 1}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          ans.is_correct
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {ans.is_correct ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Correct</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Incorrect</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="mt-3">
                    {originalQuestion?.question_kannada && (
                      <p className="text-lg font-semibold text-amber-300 sm:text-xl">
                        {originalQuestion.question_kannada}
                      </p>
                    )}
                    <p className="mt-1 text-base text-white">
                      {ans.question_text || originalQuestion?.question_text}
                    </p>
                  </div>

                  {/* Options Comparison */}
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {/* User Selection */}
                    <div
                      className={`rounded-xl border p-3 ${
                        ans.is_correct
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                          : 'border-red-500/40 bg-red-500/10 text-red-200'
                      }`}
                    >
                      <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                        Your Answer:
                      </span>
                      <p className="mt-1 font-semibold text-white">
                        {selectedOption?.option_kannada || selectedOption?.option_text || (
                          <span className="italic text-slate-400">No answer selected</span>
                        )}
                      </p>
                      {selectedOption?.option_kannada && selectedOption.option_text && (
                        <p className="text-xs text-slate-300 mt-0.5">
                          {selectedOption.option_text}
                        </p>
                      )}
                    </div>

                    {/* Correct Answer */}
                    <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-emerald-200">
                      <span className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Correct Answer:
                      </span>
                      <p className="mt-1 font-semibold text-emerald-200">
                        {correctOption?.option_kannada || correctOption?.option_text || 'Correct Option'}
                      </p>
                      {correctOption?.option_kannada && correctOption.option_text && (
                        <p className="text-xs text-slate-300 mt-0.5">
                          {correctOption.option_text}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Explanation Note */}
                  {ans.explanation && (
                    <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-sm text-slate-300">
                      <span className="block text-xs font-semibold uppercase text-amber-400">
                        Explanation:
                      </span>
                      <p className="mt-0.5">{ans.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: ACTIVE QUIZ VIEW (Question by question)
  // -------------------------------------------------------------
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);
  const isFinalQuestion = currentIndex === totalQuestions - 1;
  const isAnswered = currentSelectedOptionId !== undefined;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
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
                Scenario Quiz
              </span>
              <h1 className="text-sm font-bold text-white sm:text-base">
                {scenario?.title || `Scenario #${scenarioId}`}
              </h1>
            </div>
          </div>

          <span className="text-xs font-mono font-semibold text-slate-400">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-1.5 w-full bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Body */}
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {submitError && (
          <div className="mb-6">
            <ErrorMessage
              title="Submission Error"
              message={submitError}
              onRetry={handleSubmit}
            />
          </div>
        )}

        {/* Question Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
              Question {currentIndex + 1}
            </span>

            {currentQuestion?.question_kannada && (
              <button
                type="button"
                onClick={() => speakKannada(currentQuestion.question_kannada)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-amber-400 transition hover:bg-slate-700"
                title="Listen to Kannada question"
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span>Listen</span>
              </button>
            )}
          </div>

          {/* Prominent Question Text */}
          <div className="mt-4">
            {currentQuestion?.question_kannada && (
              <p className="text-2xl font-bold text-amber-300 sm:text-3xl">
                {currentQuestion.question_kannada}
              </p>
            )}
            <h2 className="mt-2 text-lg font-medium text-white sm:text-xl">
              {currentQuestion?.question_text}
            </h2>
          </div>

          {/* Clickable Option Cards */}
          <div className="mt-8 space-y-3">
            {currentQuestion?.options.map((opt) => {
              const isSelected = currentSelectedOptionId === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all duration-150 active:scale-[0.99] ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/15 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/40'
                      : 'border-slate-800 bg-slate-850 hover:border-slate-700 hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {opt.option_kannada && (
                        <p
                          className={`text-lg font-medium ${
                            isSelected ? 'text-amber-300' : 'text-slate-100'
                          }`}
                        >
                          {opt.option_kannada}
                        </p>
                      )}
                      <p
                        className={`text-sm ${
                          isSelected ? 'text-amber-100 font-medium' : 'text-slate-300'
                        }`}
                      >
                        {opt.option_text}
                      </p>
                    </div>

                    {/* Radio Indicator */}
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500 text-slate-950 font-bold'
                          : 'border-slate-600 bg-slate-800'
                      }`}
                    >
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-slate-950" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          {isFinalQuestion ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !isAnswered}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition hover:from-amber-400 hover:to-amber-500 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit Quiz</span>
                  <Award className="h-4 w-4" />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-slate-950 shadow-md shadow-amber-500/20 transition hover:from-amber-400 hover:to-amber-500 active:scale-95"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
