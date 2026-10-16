/**
 * NammaKannada IndexedDB Offline Storage Client
 * Provides robust asynchronous offline storage for Kannada phrases & manifest.
 * Includes graceful localStorage fallback if IndexedDB is blocked/unavailable.
 */

import { OfflineContent, OfflinePhrase } from '@/types';

const DB_NAME = 'nammakannada_offline_db';
const DB_VERSION = 1;
const STORE_MANIFEST = 'manifest';
const STORE_PHRASES = 'phrases';

const BACKUP_STORAGE_KEY = 'nammakannada_offline_phrasebook';
const BACKUP_SYNC_TIME_KEY = 'nammakannada_offline_synced_at';
const LEGACY_BACKUP_STORAGE_KEY = 'nammaconnect_offline_phrasebook';
const LEGACY_BACKUP_SYNC_TIME_KEY = 'nammaconnect_offline_synced_at';

export interface StoredManifestRecord {
  key: string;
  data: OfflineContent;
  syncedAt: string;
}

export interface StoredPhraseRecord extends OfflinePhrase {
  scenario_id?: number;
  category_id?: number;
}

/**
 * Check if IndexedDB is available in the browser runtime
 */
export function isIndexedDbSupported(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

/**
 * Opens or upgrades the IndexedDB database
 */
export function openOfflineDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDbSupported()) {
      return reject(new Error('IndexedDB not supported'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_MANIFEST)) {
        db.createObjectStore(STORE_MANIFEST, { keyPath: 'key' });
      }

      if (!db.objectStoreNames.contains(STORE_PHRASES)) {
        const phraseStore = db.createObjectStore(STORE_PHRASES, { keyPath: 'id' });
        phraseStore.createIndex('scenario_id', 'scenario_id', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
  });
}

/**
 * Persist the entire offline manifest and indexed phrases into IndexedDB
 */
export async function saveOfflineManifest(data: OfflineContent): Promise<{ syncedAt: string }> {
  const syncedAt = new Date().toISOString();

  // Try saving to IndexedDB first
  try {
    const db = await openOfflineDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORE_MANIFEST, STORE_PHRASES], 'readwrite');
      const manifestStore = transaction.objectStore(STORE_MANIFEST);
      const phrasesStore = transaction.objectStore(STORE_PHRASES);

      transaction.onerror = () => reject(transaction.error || new Error('Transaction failed'));
      transaction.oncomplete = () => resolve();

      // Put manifest
      manifestStore.put({
        key: 'latest',
        data,
        syncedAt,
      });

      // Clear existing phrases and insert new
      phrasesStore.clear();
      data.categories.forEach((cat) => {
        cat.scenarios.forEach((scen) => {
          scen.phrases.forEach((phr) => {
            phrasesStore.put({
              ...phr,
              scenario_id: scen.id,
              category_id: cat.id,
            });
          });
        });
      });
    });
  } catch (err) {
    console.warn('IndexedDB write failed, applying localStorage fallback:', err);
  }

  // Also maintain localStorage fallback backup
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(BACKUP_SYNC_TIME_KEY, syncedAt);
    }
  } catch (lsErr) {
    console.warn('LocalStorage backup failed:', lsErr);
  }

  return { syncedAt };
}

/**
 * Retrieve offline manifest and sync timestamp from IndexedDB (or fallback to localStorage)
 */
export async function getOfflineManifest(): Promise<{ data: OfflineContent; syncedAt: string } | null> {
  // 1. Try IndexedDB
  try {
    const db = await openOfflineDb();
    const result = await new Promise<StoredManifestRecord | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_MANIFEST, 'readonly');
      const store = tx.objectStore(STORE_MANIFEST);
      const req = store.get('latest');

      req.onsuccess = () => resolve(req.result as StoredManifestRecord | undefined);
      req.onerror = () => reject(req.error);
    });

    if (result && result.data) {
      return {
        data: result.data,
        syncedAt: result.syncedAt,
      };
    }
  } catch (err) {
    console.warn('IndexedDB read failed, falling back to localStorage:', err);
  }

  // 2. Fallback to localStorage (with backward compatibility)
  try {
    if (typeof window !== 'undefined') {
      let stored = localStorage.getItem(BACKUP_STORAGE_KEY);
      let storedTime = localStorage.getItem(BACKUP_SYNC_TIME_KEY);
      if (!stored) {
        stored = localStorage.getItem(LEGACY_BACKUP_STORAGE_KEY);
        storedTime = localStorage.getItem(LEGACY_BACKUP_SYNC_TIME_KEY);
      }
      if (stored) {
        return {
          data: JSON.parse(stored) as OfflineContent,
          syncedAt: storedTime || new Date().toISOString(),
        };
      }
    }
  } catch (lsErr) {
    console.warn('LocalStorage fallback read failed:', lsErr);
  }

  return null;
}

/**
 * Completely clear cached offline data from both IndexedDB and localStorage
 */
export async function clearOfflineData(): Promise<void> {
  // Clear IndexedDB
  try {
    const db = await openOfflineDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_MANIFEST, STORE_PHRASES], 'readwrite');
      tx.objectStore(STORE_MANIFEST).clear();
      tx.objectStore(STORE_PHRASES).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB clear warning:', err);
  }

  // Clear localStorage (both active and legacy keys)
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(BACKUP_STORAGE_KEY);
      localStorage.removeItem(BACKUP_SYNC_TIME_KEY);
      localStorage.removeItem(LEGACY_BACKUP_STORAGE_KEY);
      localStorage.removeItem(LEGACY_BACKUP_SYNC_TIME_KEY);
    }
  } catch (lsErr) {
    console.warn('LocalStorage clear warning:', lsErr);
  }
}
