/**
 * Local storage for offline phrase content (IndexedDB via localStorage fallback)
 */

const OFFLINE_KEY = 'nammakannada_offline_content';
const OFFLINE_VERSION_KEY = 'nammakannada_offline_version';
const LEGACY_OFFLINE_KEY = 'nammaconnect_offline_content';
const LEGACY_OFFLINE_VERSION_KEY = 'nammaconnect_offline_version';

export function saveOfflineContent(data: object): void {
  try {
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(data));
    localStorage.setItem(OFFLINE_VERSION_KEY, new Date().toISOString());
  } catch (e) {
    console.warn('Failed to save offline content:', e);
  }
}

export function getOfflineContent(): object | null {
  try {
    let raw = localStorage.getItem(OFFLINE_KEY);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_OFFLINE_KEY);
      if (raw) {
        try {
          localStorage.setItem(OFFLINE_KEY, raw);
        } catch {}
      }
    }
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getOfflineVersion(): string | null {
  try {
    return localStorage.getItem(OFFLINE_VERSION_KEY) || localStorage.getItem(LEGACY_OFFLINE_VERSION_KEY);
  } catch {
    return null;
  }
}

export function clearOfflineContent(): void {
  try {
    localStorage.removeItem(OFFLINE_KEY);
    localStorage.removeItem(OFFLINE_VERSION_KEY);
    localStorage.removeItem(LEGACY_OFFLINE_KEY);
    localStorage.removeItem(LEGACY_OFFLINE_VERSION_KEY);
  } catch {}
}
