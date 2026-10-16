'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  ArrowLeft,
  RotateCcw,
  Volume2,
  CheckCircle2,
  MessageSquare,
  ChevronRight,
  Award,
  BookOpen,
} from 'lucide-react';

import { Conversation, ConversationStep, ConversationOption, Scenario } from '@/types';
import { ApiError, api, fetcher } from '@/lib/api';
import { markConversationComplete } from '@/lib/storage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';

interface HistoryItem {
  step: ConversationStep;
  selectedOption?: ConversationOption;
}

export default function PracticePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const scenarioId = Number(params.id);

  // Fetch conversation data
  const {
    data: conversation,
    error: convError,
    isLoading: convLoading,
    mutate: mutateConv,
  } = useSWR<Conversation>(
    scenarioId ? api.scenarios.conversation(scenarioId) : null,
    fetcher
  );

  // Also fetch scenario details for category/scenario name & metadata
  const { data: scenario } = useSWR<Scenario>(
    scenarioId ? api.scenarios.get(scenarioId) : null,
    fetcher
  );

  // Build steps map for O(1) lookup
  const stepsMap = useMemo(() => {
    const map = new Map<number, ConversationStep>();
    if (conversation?.steps) {
      conversation.steps.forEach((step) => {
        map.set(step.id, step);
      });
    }
    return map;
  }, [conversation]);

  // Sorted steps for sequential display_order lookup if options have no next_step_id
  const sortedSteps = useMemo(() => {
    if (!conversation?.steps) return [];
    return [...conversation.steps].sort((a, b) => a.display_order - b.display_order);
  }, [conversation]);

  const [currentStepId, setCurrentStepId] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [hasMarkedComplete, setHasMarkedComplete] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversation start step
  useEffect(() => {
    if (conversation) {
      const initialStepId =
        conversation.start_step_id ??
        (conversation.steps.length > 0 ? conversation.steps[0].id : null);
      setCurrentStepId(initialStepId);
      setHistory([]);
      setIsCompleted(false);
      setHasMarkedComplete(false);
    }
  }, [conversation]);

  // Scroll to bottom whenever messages or current step changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, currentStepId, isCompleted]);

  // Current active step
  const currentStep = useMemo(() => {
    if (currentStepId === null) return null;
    return stepsMap.get(currentStepId) || null;
  }, [currentStepId, stepsMap]);

  // Mark completion if current step is 'end'
  useEffect(() => {
    if (currentStep?.step_type === 'end' && !hasMarkedComplete) {
      setIsCompleted(true);
      setHasMarkedComplete(true);
      if (scenarioId) {
        const title = scenario?.title || conversation?.title || 'Scenario';
        const category = scenario ? `Category #${scenario.category_id}` : 'General';
        markConversationComplete(scenarioId, title, category);
      }
    }
  }, [currentStep, hasMarkedComplete, scenarioId, scenario, conversation]);

  // Speech synthesis helper
  const speakKannada = (text?: string | null) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'kn-IN';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  // Find next step in display order when no explicit next_step_id is provided
  const getNextStepByOrder = (current: ConversationStep): ConversationStep | null => {
    const currentIndex = sortedSteps.findIndex((s) => s.id === current.id);
    if (currentIndex >= 0 && currentIndex + 1 < sortedSteps.length) {
      return sortedSteps[currentIndex + 1];
    }
    return null;
  };

  // Handle option selection
  const handleOptionSelect = (option: ConversationOption) => {
    if (!currentStep) return;

    // Add current exchange to history
    setHistory((prev) => [
      ...prev,
      {
        step: currentStep,
        selectedOption: option,
      },
    ]);

    // Determine next step
    if (option.next_step_id && stepsMap.has(option.next_step_id)) {
      const nextStep = stepsMap.get(option.next_step_id)!;
      setCurrentStepId(nextStep.id);
      if (nextStep.step_type === 'end') {
        setIsCompleted(true);
      }
    } else {
      // Look for next step in order
      const nextStep = getNextStepByOrder(currentStep);
      if (nextStep) {
        setCurrentStepId(nextStep.id);
        if (nextStep.step_type === 'end') {
          setIsCompleted(true);
        }
      } else {
        // No further steps -> mark finished
        setCurrentStepId(null);
        setIsCompleted(true);
        if (!hasMarkedComplete && scenarioId) {
          setHasMarkedComplete(true);
          const title = scenario?.title || conversation?.title || 'Scenario';
          const category = scenario ? `Category #${scenario.category_id}` : 'General';
          markConversationComplete(scenarioId, title, category);
        }
      }
    }
  };

  // Handle continuing when a step has no options (e.g. narrator or prompt)
  const handleContinue = () => {
    if (!currentStep) return;

    setHistory((prev) => [
      ...prev,
      {
        step: currentStep,
      },
    ]);

    const nextStep = getNextStepByOrder(currentStep);
    if (nextStep) {
      setCurrentStepId(nextStep.id);
      if (nextStep.step_type === 'end') {
        setIsCompleted(true);
      }
    } else {
      setCurrentStepId(null);
      setIsCompleted(true);
      if (!hasMarkedComplete && scenarioId) {
        setHasMarkedComplete(true);
        const title = scenario?.title || conversation?.title || 'Scenario';
        const category = scenario ? `Category #${scenario.category_id}` : 'General';
        markConversationComplete(scenarioId, title, category);
      }
    }
  };

  // Restart conversation
  const handleRestart = () => {
    if (conversation) {
      const initialStepId =
        conversation.start_step_id ??
        (conversation.steps.length > 0 ? conversation.steps[0].id : null);
      setCurrentStepId(initialStepId);
      setHistory([]);
      setIsCompleted(false);
      setHasMarkedComplete(false);
    }
  };

  if (convLoading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
        <LoadingSpinner message="Loading conversation practice..." />
      </div>
    );
  }

  if (convError || !conversation) {
    const is404 = (convError as ApiError)?.status === 404 || 
                  (convError as ApiError)?.detail?.toLowerCase()?.includes('not found');

    if (is404) {
      return (
        <div className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl">
            <EmptyState
              icon={<MessageSquare className="h-10 w-10 text-amber-400" />}
              title="Practice Dialogue in Development"
              description={`A guided conversation for ${scenario?.title ? `"${scenario.title}"` : 'this scenario'} is currently being curated by our linguistic team. In the meantime, you can explore the essential phrases or try another scenario!`}
              actionHref={`/scenarios/${scenarioId}`}
              actionLabel="View Scenario Phrases"
            />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/quiz/${scenarioId}`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-850 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
              >
                <Award className="h-4 w-4 text-amber-400" />
                <span>Try Scenario Quiz</span>
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
            title="Conversation Unavailable"
            message={
              convError?.message ||
              'Unable to load conversation practice for this scenario. Please verify the backend is running.'
            }
            onRetry={() => mutateConv()}
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

  if (conversation.steps.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          <EmptyState
            icon={<MessageSquare className="h-8 w-8 text-amber-400" />}
            title="No Conversation Steps Yet"
            description="This scenario does not have guided conversation steps configured yet."
            actionHref={`/scenarios/${scenarioId}`}
            actionLabel="View Scenario Phrases"
          />
          <div className="mt-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Browse Other Scenarios</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Speaker badge helper
  const getSpeakerBadge = (speaker: string) => {
    const s = speaker.toLowerCase();
    if (s === 'user' || s === 'you') {
      return {
        label: 'You (ನೀವು)',
        bg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
        avatarBg: 'bg-amber-500 text-slate-950',
      };
    }
    if (s === 'narrator') {
      return {
        label: 'Scenario Context',
        bg: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
        avatarBg: 'bg-purple-600 text-white',
      };
    }
    return {
      label: speaker.charAt(0).toUpperCase() + speaker.slice(1),
      bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
      avatarBg: 'bg-emerald-600 text-white',
    };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
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
              <div className="flex items-center gap-2">
                <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Interactive Practice
                </span>
              </div>
              <h1 className="text-base font-bold text-white sm:text-lg">
                {conversation.title || scenario?.title || 'Guided Practice'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
              title="Restart Conversation"
            >
              <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Restart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Conversation Container */}
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {conversation.description && (
          <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
            <p>{conversation.description}</p>
          </div>
        )}

        {/* Message Stream */}
        <div className="space-y-6">
          {/* 1. PAST HISTORY */}
          {history.map((item, idx) => {
            const speakerInfo = getSpeakerBadge(item.step.speaker);
            const isUser = item.step.speaker.toLowerCase() === 'user';
            const isNarrator = item.step.speaker.toLowerCase() === 'narrator';

            return (
              <div key={`history-${idx}`} className="space-y-3">
                {/* Step Prompt/Message */}
                <div
                  className={`flex gap-3 ${
                    isNarrator
                      ? 'justify-center'
                      : isUser
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-4 sm:max-w-[78%] ${
                      isNarrator
                        ? 'border border-purple-500/30 bg-purple-950/20 text-purple-200'
                        : isUser
                        ? 'border border-amber-500/30 bg-amber-950/20 text-amber-100'
                        : 'border border-slate-800 bg-slate-900 text-slate-200 shadow-md'
                    }`}
                  >
                    {/* Speaker Header */}
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${speakerInfo.bg}`}
                      >
                        {speakerInfo.label}
                      </span>
                      {item.step.message_kannada && (
                        <button
                          type="button"
                          onClick={() => speakKannada(item.step.message_kannada)}
                          className="rounded p-1 text-slate-400 hover:text-amber-400"
                          title="Listen to pronunciation"
                          aria-label="Listen to pronunciation"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Kannada text if present */}
                    {item.step.message_kannada && (
                      <p className="text-lg font-medium text-amber-300 sm:text-xl">
                        {item.step.message_kannada}
                      </p>
                    )}

                    {/* Transliteration */}
                    {item.step.message_transliteration && (
                      <p className="mt-1 text-xs font-mono text-slate-400 italic">
                        {item.step.message_transliteration}
                      </p>
                    )}

                    {/* English Message */}
                    <p className="mt-1.5 text-sm text-slate-300">
                      {item.step.message}
                    </p>
                  </div>
                </div>

                {/* Selected option bubble (if user made a choice) */}
                {item.selectedOption && (
                  <div className="flex justify-end pr-2">
                    <div className="max-w-[80%] rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-right">
                      <span className="block text-xs font-semibold uppercase text-amber-400">
                        Your response:
                      </span>
                      {item.selectedOption.option_kannada && (
                        <p className="text-base font-medium text-amber-200">
                          {item.selectedOption.option_kannada}
                        </p>
                      )}
                      {item.selectedOption.option_transliteration && (
                        <p className="text-xs font-mono text-amber-300/80 italic">
                          {item.selectedOption.option_transliteration}
                        </p>
                      )}
                      <p className="text-sm text-white">
                        {item.selectedOption.option_text}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* 2. CURRENT STEP (Active) */}
          {currentStep && !isCompleted && (
            <div className="space-y-4 pt-2">
              {/* Current Prompt Message */}
              {(() => {
                const speakerInfo = getSpeakerBadge(currentStep.speaker);
                const isNarrator = currentStep.speaker.toLowerCase() === 'narrator';
                const isUser = currentStep.speaker.toLowerCase() === 'user';

                return (
                  <div
                    className={`flex gap-3 ${
                      isNarrator
                        ? 'justify-center'
                        : isUser
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl p-5 shadow-lg ring-1 transition-all sm:max-w-[80%] ${
                        isNarrator
                          ? 'border border-purple-500/40 bg-purple-950/30 ring-purple-500/20 text-purple-200'
                          : isUser
                          ? 'border border-amber-500/40 bg-amber-950/30 ring-amber-500/20 text-amber-100'
                          : 'border border-slate-700 bg-slate-900 ring-amber-500/10 text-slate-200'
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${speakerInfo.bg}`}
                        >
                          {speakerInfo.label}
                        </span>
                        {currentStep.message_kannada && (
                          <button
                            type="button"
                            onClick={() => speakKannada(currentStep.message_kannada)}
                            className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-1 text-xs text-amber-400 hover:bg-slate-700"
                            title="Listen"
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                            <span>Listen</span>
                          </button>
                        )}
                      </div>

                      {currentStep.message_kannada && (
                        <p className="text-xl font-medium text-amber-300 sm:text-2xl">
                          {currentStep.message_kannada}
                        </p>
                      )}

                      {currentStep.message_transliteration && (
                        <p className="mt-1 text-sm font-mono text-slate-400 italic">
                          {currentStep.message_transliteration}
                        </p>
                      )}

                      <p className="mt-2 text-sm sm:text-base text-slate-300">
                        {currentStep.message}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Interactive Options Area */}
              {currentStep.options && currentStep.options.length > 0 ? (
                <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Choose your response:
                  </h2>
                  <div className="space-y-3">
                    {currentStep.options.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleOptionSelect(option)}
                        className="group w-full rounded-xl border border-slate-700 bg-slate-850 p-4 text-left transition-all duration-150 hover:border-amber-500 hover:bg-slate-800 hover:shadow-lg hover:shadow-amber-500/10 active:scale-[0.99]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            {option.option_kannada && (
                              <p className="text-base font-semibold text-amber-300 group-hover:text-amber-200">
                                {option.option_kannada}
                              </p>
                            )}
                            {option.option_transliteration && (
                              <p className="mt-0.5 text-xs font-mono text-slate-400 italic">
                                {option.option_transliteration}
                              </p>
                            )}
                            <p className="mt-1 text-sm text-slate-300">
                              {option.option_text}
                            </p>
                          </div>
                          <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-amber-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Step with no options -> Continue button */
                currentStep.step_type !== 'end' && (
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleContinue}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-400 hover:to-amber-500 active:scale-95"
                    >
                      <span>Continue</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )
              )}
            </div>
          )}

          {/* 3. COMPLETION STATE */}
          {(isCompleted || currentStep?.step_type === 'end') && (
            <div className="mt-8 overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 p-6 text-center shadow-2xl sm:p-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/40 bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="h-9 w-9" />
              </div>

              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
                Conversation Completed!
              </span>

              <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                ಅಭಿನಂದನೆಗಳು! (Congratulations!)
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-300 sm:text-base">
                {currentStep?.step_type === 'end'
                  ? currentStep.message
                  : 'You successfully completed this guided dialogue. Your progress has been saved.'}
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href={`/quiz/${scenarioId}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-base font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:from-amber-400 hover:to-amber-500 active:scale-95 sm:w-auto"
                >
                  <Award className="h-5 w-5" />
                  <span>Take Quiz Now</span>
                </Link>

                <button
                  type="button"
                  onClick={handleRestart}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white sm:w-auto"
                >
                  <RotateCcw className="h-4 w-4 text-amber-400" />
                  <span>Practice Again</span>
                </button>

                <Link
                  href="/"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-5 py-3.5 text-sm font-semibold text-slate-400 transition hover:bg-slate-800 hover:text-white sm:w-auto"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>All Scenarios</span>
                </Link>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>
    </div>
  );
}
