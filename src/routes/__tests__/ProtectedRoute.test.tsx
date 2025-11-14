/**
 * ProtectedRoute Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@/shared/api/baseApi';
import languageReducer from '@/shared/state/language.slice';
import authReducer from '@/features/auth/auth.slice';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

function createStoreWithAuth(isAuthenticated: boolean) {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      language: languageReducer,
      auth: authReducer,
    },
    middleware: (gD) => gD().concat(baseApi.middleware),
    preloadedState: {
      auth: {
        user: isAuthenticated
          ? {
              id: '1',
              email: 'test@test.com',
              first_name: 'Test',
              last_name: 'User',
              user_type: 'end_user' as const,
              preferred_language: 'en' as const,
              status: 'active',
              email_verified: true,
              created_at: '2025-01-01',
              roles: [],
              permissions: [],
            }
          : null,
        token: isAuthenticated ? 'token' : null,
        refreshToken: isAuthenticated ? 'refresh' : null,
        isAuthenticated,
        isLoading: false,
      },
    },
  });
}

function renderProtected(isAuthenticated: boolean) {
  const store = createStoreWithAuth(isAuthenticated);
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/en/dashboard']}>
        <Routes>
          <Route
            path="/:lang/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/:lang/sign-in" element={<div>Sign In Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    renderProtected(true);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to sign-in when not authenticated', () => {
    renderProtected(false);
    expect(screen.getByText('Sign In Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('shows loading spinner when auth is loading', () => {
    const store = configureStore({
      reducer: {
        [baseApi.reducerPath]: baseApi.reducer,
        language: languageReducer,
        auth: authReducer,
      },
      middleware: (gD) => gD().concat(baseApi.middleware),
      preloadedState: {
        auth: {
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: true,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/en/dashboard']}>
          <Routes>
            <Route
              path="/:lang/dashboard"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Should show spinner, not content or redirect
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign In Page')).not.toBeInTheDocument();
  });
});
