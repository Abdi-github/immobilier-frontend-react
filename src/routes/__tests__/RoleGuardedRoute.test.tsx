/**
 * RoleGuardedRoute Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@/shared/api/baseApi';
import languageReducer from '@/shared/state/language.slice';
import authReducer from '@/features/auth/auth.slice';
import { RoleGuardedRoute } from '@/routes/RoleGuardedRoute';
import type { UserType } from '@/features/auth/auth.types';

function createStoreWithRole(userType: UserType | null) {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      language: languageReducer,
      auth: authReducer,
    },
    middleware: (gD) => gD().concat(baseApi.middleware),
    preloadedState: {
      auth: {
        user: userType
          ? {
              id: '1',
              email: 'test@test.com',
              first_name: 'Test',
              last_name: 'User',
              user_type: userType,
              preferred_language: 'en' as const,
              status: 'active',
              email_verified: true,
              created_at: '2025-01-01',
              roles: [],
              permissions: [],
            }
          : null,
        token: userType ? 'token' : null,
        refreshToken: userType ? 'refresh' : null,
        isAuthenticated: !!userType,
        isLoading: false,
      },
    },
  });
}

function renderRoleGuarded(
  userType: UserType | null,
  allowedTypes: UserType[],
  redirectTo?: string
) {
  const store = createStoreWithRole(userType);
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/en/dashboard/manage']}>
        <Routes>
          <Route
            path="/:lang/dashboard/manage"
            element={
              <RoleGuardedRoute allowedTypes={allowedTypes} redirectTo={redirectTo}>
                <div>Agent Content</div>
              </RoleGuardedRoute>
            }
          />
          <Route path="/:lang/sign-in" element={<div>Sign In Page</div>} />
          <Route path="/:lang/dashboard/profile" element={<div>Profile Page</div>} />
          <Route path="/:lang/custom-redirect" element={<div>Custom Redirect</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe('RoleGuardedRoute', () => {
  it('renders children when user has allowed role', () => {
    renderRoleGuarded('agent', ['agent', 'agency_admin']);
    expect(screen.getByText('Agent Content')).toBeInTheDocument();
  });

  it('renders children when user has any of the allowed roles', () => {
    renderRoleGuarded('agency_admin', ['agent', 'agency_admin']);
    expect(screen.getByText('Agent Content')).toBeInTheDocument();
  });

  it('redirects to sign-in when no user is present', () => {
    renderRoleGuarded(null, ['agent']);
    expect(screen.getByText('Sign In Page')).toBeInTheDocument();
  });

  it('redirects to dashboard profile when user has wrong role', () => {
    renderRoleGuarded('end_user', ['agent', 'agency_admin']);
    expect(screen.getByText('Profile Page')).toBeInTheDocument();
    expect(screen.queryByText('Agent Content')).not.toBeInTheDocument();
  });

  it('redirects to custom path when specified', () => {
    renderRoleGuarded('end_user', ['super_admin'], '/en/custom-redirect');
    expect(screen.getByText('Custom Redirect')).toBeInTheDocument();
  });

  it('allows super_admin when super_admin is in allowedTypes', () => {
    renderRoleGuarded('super_admin', ['super_admin', 'platform_admin']);
    expect(screen.getByText('Agent Content')).toBeInTheDocument();
  });
});
