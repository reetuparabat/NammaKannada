/**
 * localStorage-based bookmark storage for saved phrases.
 * Also handles progress tracking for conversations and quizzes.
 * Designed to be replaced with server-side sync later.
 */
import { SavedPhrase, ScenarioProgress } from '@/types';

// ─── Bookmark storage ────────────────────────────────────────────────

const STORAGE_KEY = 'nammakannada_bookmarks';
const LEGACY_STORAGE_KEY = 'nammaconnect_bookmarks';

export function getBookmarks(): SavedPhrase[] {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) {
        try {
          localStorage.setItem(STORAGE_KEY, raw);
        } catch {}
      }
    }
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addBookmark(phrase: SavedPhrase): void {
  const bookmarks = getBookmarks();
  // Prevent duplicates
  if (bookmarks.some((b) => b.phraseId === phrase.phraseId)) return;
  bookmarks.push({ ...phrase, savedAt: new Date().toISOString() });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (e) {
    console.warn('Could not save bookmark:', e);
  }
}

export function removeBookmark(phraseId: number): void {
  const bookmarks = getBookmarks().filter((b) => b.phraseId !== phraseId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch {}
}

export function isBookmarked(phraseId: number): boolean {
  return getBookmarks().some((b) => b.phraseId === phraseId);
}

export function clearBookmarks(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {}
}

// ─── Progress tracking ───────────────────────────────────────────────

const PROGRESS_KEY = 'nammakannada_progress';
const LEGACY_PROGRESS_KEY = 'nammaconnect_progress';

export function getProgress(): ScenarioProgress[] {
  try {
    let raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_PROGRESS_KEY);
      if (raw) {
        try {
          localStorage.setItem(PROGRESS_KEY, raw);
        } catch {}
      }
    }
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProgress(list: ScenarioProgress[]): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Could not save progress:', e);
  }
}

function upsertProgress(
  scenarioId: number,
  update: Partial<ScenarioProgress>
): void {
  const all = getProgress();
  const idx = all.findIndex((p) => p.scenarioId === scenarioId);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...update, lastAccessedAt: new Date().toISOString() };
  } else {
    all.push({
      scenarioId,
      scenarioTitle: update.scenarioTitle ?? '',
      categoryName: update.categoryName ?? '',
      completedConversation: update.completedConversation ?? false,
      completedQuiz: update.completedQuiz ?? false,
      quizScore: update.quizScore ?? null,
      quizTotal: update.quizTotal ?? null,
      lastAccessedAt: new Date().toISOString(),
    });
  }
  saveProgress(all);
}

export function markConversationComplete(
  scenarioId: number,
  scenarioTitle?: string,
  categoryName?: string
): void {
  upsertProgress(scenarioId, {
    completedConversation: true,
    scenarioTitle,
    categoryName,
  });
}

export function markQuizComplete(
  scenarioId: number,
  param2?: string | number,
  param3?: string | number,
  param4?: number | string,
  param5?: number | string
): void {
  let title = '';
  let category = '';
  let score: number | null = null;
  let total: number | null = null;

  if (typeof param2 === 'string') {
    title = param2;
    category = typeof param3 === 'string' ? param3 : '';
    score = typeof param4 === 'number' ? param4 : null;
    total = typeof param5 === 'number' ? param5 : null;
  } else if (typeof param2 === 'number') {
    score = param2;
    total = typeof param3 === 'number' ? param3 : null;
    title = typeof param4 === 'string' ? param4 : '';
    category = typeof param5 === 'string' ? param5 : '';
  }

  upsertProgress(scenarioId, {
    completedQuiz: true,
    quizScore: score,
    quizTotal: total,
    scenarioTitle: title,
    categoryName: category,
  });
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(LEGACY_PROGRESS_KEY);
  } catch {}
}

