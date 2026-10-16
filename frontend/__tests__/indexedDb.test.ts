import {
  isIndexedDbSupported,
  saveOfflineManifest,
  getOfflineManifest,
  clearOfflineData,
} from '@/lib/indexedDb';
import { OfflineContent } from '@/types';

describe('IndexedDB and Offline storage', () => {
  const sampleManifest: OfflineContent = {
    version: '2.0.0',
    generated_at: new Date().toISOString(),
    categories: [
      {
        id: 1,
        name: 'Transportation',
        slug: 'transportation',
        icon: 'Bus',
        scenarios: [
          {
            id: 1,
            title: 'Taking a City Bus',
            slug: 'taking-city-bus',
            phrases: [
              {
                id: 101,
                kannada_text: 'ಬಸ್ ಸ್ಟಾಪ್ ಎಲ್ಲಿದೆ?',
                english_meaning: 'Where is the bus stop?',
                transliteration: 'Bas stop ellide?',
                context: 'Asking for stop location',
              },
            ],
          },
        ],
      },
    ],
  };

  beforeEach(async () => {
    await clearOfflineData();
  });

  it('detects indexedDB runtime support helper', () => {
    const supported = isIndexedDbSupported();
    expect(typeof supported).toBe('boolean');
  });

  it('saves and reads offline manifest with fallback support', async () => {
    const { syncedAt } = await saveOfflineManifest(sampleManifest);
    expect(syncedAt).toBeDefined();

    const result = await getOfflineManifest();
    expect(result).not.toBeNull();
    expect(result?.data.version).toBe('2.0.0');
    expect(result?.data.categories[0].name).toBe('Transportation');
    expect(result?.data.categories[0].scenarios[0].phrases[0].kannada_text).toBe(
      'ಬಸ್ ಸ್ಟಾಪ್ ಎಲ್ಲಿದೆ?'
    );

    await clearOfflineData();
    const emptyResult = await getOfflineManifest();
    expect(emptyResult).toBeNull();
  });
});
