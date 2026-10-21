/**
 * NammaKannada API Client
 * Central API layer — all requests go through here.
 * Configure NEXT_PUBLIC_API_BASE_URL in .env.local
 */

import { QuizResult } from '@/types';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL !== undefined
    ? process.env.NEXT_PUBLIC_API_BASE_URL
    : typeof window !== 'undefined'
    ? ''
    : 'http://127.0.0.1:8000';

export interface ApiError extends Error {
  status?: number;
  detail?: string;
}

// Generic fetcher for SWR
export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const err: ApiError = new Error(`API error ${res.status}: ${res.statusText}`);
    err.status = res.status;
    try {
      const body = await res.json();
      err.detail = body.detail;
    } catch {
      // Ignore JSON parse errors on non-JSON response
    }
    throw err;
  }
  return res.json();
}

// POST / PATCH fetcher for SWR mutation or direct calls
export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    let detailMsg: string | undefined;
    try {
      const body = await res.json();
      detailMsg = body.detail;
    } catch {
      // Ignore JSON parse errors on non-JSON response
    }
    const message =
      detailMsg ||
      (res.status === 502 || res.status === 503
        ? 'Translation service is temporarily unavailable. Please verify your connection or try again shortly.'
        : `Request failed (HTTP ${res.status})`);

    const err: ApiError = new Error(message);
    err.status = res.status;
    err.detail = detailMsg;
    throw err;
  }
  return res.json();
}

// Typed API URL builders
export const api = {
  categories: {
    list: () => `${BASE_URL}/api/v1/categories`,
    get: (id: number) => `${BASE_URL}/api/v1/categories/${id}`,
    detail: (id: number) => `${BASE_URL}/api/v1/categories/${id}`,
    scenarios: (id: number) => `${BASE_URL}/api/v1/categories/${id}/scenarios`,
  },
  scenarios: {
    get: (id: number) => `${BASE_URL}/api/v1/scenarios/${id}`,
    detail: (id: number) => `${BASE_URL}/api/v1/scenarios/${id}`,
    phrases: (id: number) => `${BASE_URL}/api/v1/scenarios/${id}/phrases`,
    conversation: (id: number) => `${BASE_URL}/api/v1/scenarios/${id}/conversation`,
    quiz: (id: number) => `${BASE_URL}/api/v1/scenarios/${id}/quiz`,
    submitQuiz: (id: number) => `${BASE_URL}/api/v1/scenarios/${id}/quiz/submit`,
  },
  phrases: {
    get: (id: number) => `${BASE_URL}/api/v1/phrases/${id}`,
    detail: (id: number) => `${BASE_URL}/api/v1/phrases/${id}`,
    search: (q: string) => `${BASE_URL}/api/v1/phrases/search?q=${encodeURIComponent(q)}`,
  },
  offline: {
    manifest: () => `${BASE_URL}/api/v1/offline/manifest`,
  },
  admin: {
    content: () => `${BASE_URL}/api/v1/admin/content`,
    createPhrase: () => `${BASE_URL}/api/v1/admin/content/phrases`,
    updatePhrase: (id: number) => `${BASE_URL}/api/v1/admin/content/phrases/${id}`,
    submitReview: (id: number) => `${BASE_URL}/api/v1/admin/content/phrases/${id}/submit-review`,
    approve: (id: number) => `${BASE_URL}/api/v1/admin/content/phrases/${id}/approve`,
    publish: (id: number) => `${BASE_URL}/api/v1/admin/content/phrases/${id}/publish`,
    archive: (id: number) => `${BASE_URL}/api/v1/admin/content/phrases/${id}/archive`,
  },
  voice: {
    translate: () => `${BASE_URL}/api/v1/voice/translate`,
    transcribe: () => `${BASE_URL}/api/v1/voice/transcribe`,
    status: () => `${BASE_URL}/api/v1/voice/status`,
  },
};

export interface TranslationResponse {
  translated_text: string;
  source_language: string;
  target_language: string;
  provider?: string;
  transliteration?: string | null;
}

/**
 * Send text for bidirectional English <-> Kannada translation.
 */
export async function translateVoiceText(
  text: string,
  sourceLanguage: 'en' | 'kn',
  targetLanguage: 'en' | 'kn'
): Promise<TranslationResponse> {
  return apiFetch<TranslationResponse>(api.voice.translate(), {
    method: 'POST',
    body: JSON.stringify({
      text,
      source_language: sourceLanguage,
      target_language: targetLanguage,
    }),
  });
}

/**
 * Submit quiz answers and get server-side scored results.
 */
export async function submitQuiz(
  scenarioId: number,
  answers: Array<{ question_id: number; selected_option_id: number }>
): Promise<QuizResult> {
  return apiFetch<QuizResult>(`${BASE_URL}/api/v1/scenarios/${scenarioId}/quiz/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}

