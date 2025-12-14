/**
 * Test utilities — provides a custom render with Redux store and router.
 */

import { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore, type PreloadedState } from '@reduxjs/toolkit';
import { baseApi } from '@/shared/api/baseApi';
import languageReducer from '@/shared/state/language.slice';
import authReducer from '@/features/auth/auth.slice';
import type { RootState } from '@/app/store';

/**
 * Create a test store with optional preloaded state
 */
export function createTestStore(preloadedState?: PreloadedState<Partial<RootState>>) {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      language: languageReducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
    preloadedState: preloadedState as PreloadedState<RootState>,
  });
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: PreloadedState<Partial<RootState>>;
  store?: ReturnType<typeof createTestStore>;
  initialRoute?: string;
}

/**
 * Custom render with all providers (Redux, Router, i18n)
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState,
    store = createTestStore(preloadedState),
    initialRoute = '/',
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[initialRoute]}>{children}</MemoryRouter>
      </Provider>
    );
  }

  return {
    store,
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

export { render, userEvent };
