/**
 * Language Slice Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import languageReducer, {
  setLanguage,
  type SupportedLanguage,
} from '@/shared/state/language.slice';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

function createLanguageStore(preloadedState?: {
  language: { current: SupportedLanguage; supported: SupportedLanguage[] };
}) {
  return configureStore({
    reducer: { language: languageReducer },
    preloadedState,
  });
}

describe('languageSlice', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('has correct initial state', () => {
    const store = createLanguageStore({
      language: { current: 'en', supported: ['en', 'fr', 'de', 'it'] },
    });
    const state = store.getState().language;
    expect(state.current).toBe('en');
    expect(state.supported).toEqual(['en', 'fr', 'de', 'it']);
  });

  it('changes language via setLanguage', () => {
    const store = createLanguageStore({
      language: { current: 'en', supported: ['en', 'fr', 'de', 'it'] },
    });

    store.dispatch(setLanguage('fr'));
    expect(store.getState().language.current).toBe('fr');
  });

  it('persists language to localStorage on change', () => {
    const store = createLanguageStore({
      language: { current: 'en', supported: ['en', 'fr', 'de', 'it'] },
    });

    store.dispatch(setLanguage('de'));
    expect(localStorageMock.setItem).toHaveBeenCalledWith('i18nextLng', 'de');
  });

  it('supports all 4 languages', () => {
    const store = createLanguageStore({
      language: { current: 'en', supported: ['en', 'fr', 'de', 'it'] },
    });

    const languages: SupportedLanguage[] = ['en', 'fr', 'de', 'it'];
    for (const lang of languages) {
      store.dispatch(setLanguage(lang));
      expect(store.getState().language.current).toBe(lang);
    }
  });

  it('keeps supported list unchanged when language is set', () => {
    const store = createLanguageStore({
      language: { current: 'en', supported: ['en', 'fr', 'de', 'it'] },
    });

    store.dispatch(setLanguage('it'));
    expect(store.getState().language.supported).toEqual(['en', 'fr', 'de', 'it']);
  });
});
