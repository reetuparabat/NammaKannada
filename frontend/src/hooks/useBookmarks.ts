'use client';

import { useState, useEffect, useCallback } from 'react';
import { SavedPhrase } from '@/types';
import { getBookmarks, addBookmark, removeBookmark as removeBookmarkStorage } from '@/lib/storage';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<SavedPhrase[]>([]);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, [version]);

  const isBookmarked = useCallback(
    (phraseId: number) => {
      return bookmarks.some((b) => b.phraseId === phraseId);
    },
    [bookmarks]
  );

  const toggleBookmark = useCallback(
    (phrase: SavedPhrase) => {
      if (bookmarks.some((b) => b.phraseId === phrase.phraseId)) {
        removeBookmarkStorage(phrase.phraseId);
      } else {
        addBookmark(phrase);
      }
      setVersion((v) => v + 1);
    },
    [bookmarks]
  );

  const removeBookmark = useCallback((phraseId: number) => {
    removeBookmarkStorage(phraseId);
    setVersion((v) => v + 1);
  }, []);

  return { bookmarks, isBookmarked, toggleBookmark, removeBookmark };
}

export default useBookmarks;
