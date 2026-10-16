/**
 * Local progress tracking (anonymous, stored in localStorage)
 * Designed so server-based sync can be added later.
 */
import { ScenarioProgress } from '@/types';

const PROGRESS_KEY = 'nammakannada_progress';
const LEGACY_PROGRESS_KEY = 'nammaconnect_progress';

export function getAllProgress(): ScenarioProgress[] {
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

export function getScenarioProgress(scenarioId: number): ScenarioProgress | null {
  const all = getAllProgress();
  return all.find((p) => p.scenarioId === scenarioId) ?? null;
}

export function upsertProgress(update: Partial<ScenarioProgress> & { scenarioId: number }): void {
  const all = getAllProgress();
  const idx = all.findIndex((p) => p.scenarioId === update.scenarioId);
  if (idx >= 0) {
    all[idx] = {
      ...all[idx],
      ...update,
      lastAccessedAt: new Date().toISOString(),
    };
  } else {
    all.push({
      scenarioId: update.scenarioId,
      scenarioTitle: update.scenarioTitle ?? '',
      categoryName: update.categoryName ?? '',
      completedConversation: update.completedConversation ?? false,
      completedQuiz: update.completedQuiz ?? false,
      quizScore: update.quizScore ?? null,
      quizTotal: update.quizTotal ?? null,
      lastAccessedAt: new Date().toISOString(),
    });
  }
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn('Could not save progress:', e);
  }
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(LEGACY_PROGRESS_KEY);
  } catch {}
}
