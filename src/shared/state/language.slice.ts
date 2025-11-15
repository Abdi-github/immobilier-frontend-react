import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SupportedLanguage = 'en' | 'fr' | 'de' | 'it';

interface LanguageState {
  current: SupportedLanguage;
  supported: SupportedLanguage[];
}

const getInitialLanguage = (): SupportedLanguage => {
  // Check localStorage first
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('i18nextLng') : null;
  if (stored && ['en', 'fr', 'de', 'it'].includes(stored)) {
    return stored as SupportedLanguage;
  }

  // Check URL path
  const pathLang =
    typeof window !== 'undefined' ? (window.location.pathname.split('/')[1] ?? '') : '';
  if (['en', 'fr', 'de', 'it'].includes(pathLang)) {
    return pathLang as SupportedLanguage;
  }

  // Default to English
  return 'en';
};

const initialState: LanguageState = {
  current: getInitialLanguage(),
  supported: ['en', 'fr', 'de', 'it'],
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<SupportedLanguage>) => {
      state.current = action.payload;
      localStorage.setItem('i18nextLng', action.payload);
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
