import {
  getBookmarks,
  addBookmark,
  removeBookmark,
  isBookmarked,
  clearBookmarks,
  getProgress,
  markConversationComplete,
  markQuizComplete,
} from '@/lib/storage';

describe('Storage utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('handles bookmarks lifecycle without duplicates', () => {
    expect(getBookmarks()).toEqual([]);

    const samplePhrase = {
      phraseId: 42,
      kannadaText: 'ನಮಸ್ಕಾರ',
      englishMeaning: 'Hello',
      transliteration: 'Namaskara',
      context: 'General greeting',
      scenarioTitle: 'Basic Greetings',
      categoryName: 'General',
      savedAt: new Date().toISOString(),
    };

    addBookmark(samplePhrase);
    expect(isBookmarked(42)).toBe(true);
    expect(getBookmarks()).toHaveLength(1);

    // Attempting to add duplicate should not duplicate
    addBookmark(samplePhrase);
    expect(getBookmarks()).toHaveLength(1);

    // Removal
    removeBookmark(42);
    expect(isBookmarked(42)).toBe(false);
    expect(getBookmarks()).toHaveLength(0);

    // Clear all
    addBookmark(samplePhrase);
    clearBookmarks();
    expect(getBookmarks()).toHaveLength(0);
  });

  it('tracks progress for conversations and quizzes accurately', () => {
    expect(getProgress()).toEqual([]);

    markConversationComplete(1, 'Taking a City Bus', 'Transportation');
    const p1 = getProgress();
    expect(p1).toHaveLength(1);
    expect(p1[0].scenarioId).toBe(1);
    expect(p1[0].completedConversation).toBe(true);
    expect(p1[0].completedQuiz).toBe(false);

    markQuizComplete(1, 'Taking a City Bus', 'Transportation', 4, 4);
    const p2 = getProgress();
    expect(p2).toHaveLength(1);
    expect(p2[0].completedQuiz).toBe(true);
    expect(p2[0].quizScore).toBe(4);
    expect(p2[0].quizTotal).toBe(4);
  });
});
