/**
 * Auth Slice Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  setCredentials,
  updateUser,
  updateTokens,
  logout,
  setLoading,
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthToken,
  selectAuthLoading,
} from '@/features/auth/auth.slice';
import { baseApi } from '@/shared/api/baseApi';
import type { User } from '@/features/auth/auth.types';

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

const mockUser: User = {
  id: 'user-1',
  email: 'test@immobilier.ch',
  first_name: 'Test',
  last_name: 'User',
  user_type: 'end_user',
  preferred_language: 'en',
  status: 'active',
  email_verified: true,
  created_at: '2025-01-01T00:00:00.000Z',
  roles: ['end_user'],
  permissions: [],
};

function createAuthStore() {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });
}

describe('authSlice', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('starts unauthenticated when no stored credentials', () => {
      const store = createAuthStore();
      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setCredentials', () => {
    it('sets user, tokens, and isAuthenticated', () => {
      const store = createAuthStore();
      store.dispatch(
        setCredentials({
          user: mockUser,
          token: 'access-token',
          refreshToken: 'refresh-token',
        })
      );

      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('access-token');
      expect(state.refreshToken).toBe('refresh-token');
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('persists credentials to localStorage', () => {
      const store = createAuthStore();
      store.dispatch(
        setCredentials({
          user: mockUser,
          token: 'access-token',
          refreshToken: 'refresh-token',
        })
      );

      expect(localStorageMock.setItem).toHaveBeenCalledWith('immobilier_token', 'access-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'immobilier_refresh_token',
        'refresh-token'
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'immobilier_user',
        JSON.stringify(mockUser)
      );
    });
  });

  describe('updateUser', () => {
    it('partially updates user data', () => {
      const store = createAuthStore();
      store.dispatch(
        setCredentials({
          user: mockUser,
          token: 'token',
          refreshToken: 'refresh',
        })
      );

      store.dispatch(updateUser({ first_name: 'Updated', last_name: 'Name' }));
      const state = store.getState().auth;
      expect(state.user?.first_name).toBe('Updated');
      expect(state.user?.last_name).toBe('Name');
      expect(state.user?.email).toBe(mockUser.email); // unchanged
    });

    it('does nothing if no user is set', () => {
      const store = createAuthStore();
      store.dispatch(updateUser({ first_name: 'Updated' }));
      expect(store.getState().auth.user).toBeNull();
    });
  });

  describe('updateTokens', () => {
    it('updates tokens in state and localStorage', () => {
      const store = createAuthStore();
      store.dispatch(
        setCredentials({ user: mockUser, token: 'old-token', refreshToken: 'old-refresh' })
      );

      store.dispatch(updateTokens({ token: 'new-token', refreshToken: 'new-refresh' }));

      const state = store.getState().auth;
      expect(state.token).toBe('new-token');
      expect(state.refreshToken).toBe('new-refresh');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('immobilier_token', 'new-token');
    });
  });

  describe('logout', () => {
    it('clears all auth state', () => {
      const store = createAuthStore();
      store.dispatch(setCredentials({ user: mockUser, token: 'token', refreshToken: 'refresh' }));

      store.dispatch(logout());

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('removes credentials from localStorage', () => {
      const store = createAuthStore();
      store.dispatch(setCredentials({ user: mockUser, token: 'token', refreshToken: 'refresh' }));
      vi.clearAllMocks();

      store.dispatch(logout());

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('immobilier_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('immobilier_refresh_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('immobilier_user');
    });
  });

  describe('setLoading', () => {
    it('sets the loading flag', () => {
      const store = createAuthStore();
      store.dispatch(setLoading(true));
      expect(store.getState().auth.isLoading).toBe(true);

      store.dispatch(setLoading(false));
      expect(store.getState().auth.isLoading).toBe(false);
    });
  });

  describe('selectors', () => {
    it('selectCurrentUser returns user', () => {
      const store = createAuthStore();
      store.dispatch(setCredentials({ user: mockUser, token: 'token', refreshToken: 'refresh' }));
      expect(selectCurrentUser(store.getState())).toEqual(mockUser);
    });

    it('selectIsAuthenticated returns auth status', () => {
      const store = createAuthStore();
      expect(selectIsAuthenticated(store.getState())).toBe(false);
      store.dispatch(setCredentials({ user: mockUser, token: 'token', refreshToken: 'refresh' }));
      expect(selectIsAuthenticated(store.getState())).toBe(true);
    });

    it('selectAuthToken returns token', () => {
      const store = createAuthStore();
      store.dispatch(
        setCredentials({ user: mockUser, token: 'my-token', refreshToken: 'refresh' })
      );
      expect(selectAuthToken(store.getState())).toBe('my-token');
    });

    it('selectAuthLoading returns loading state', () => {
      const store = createAuthStore();
      expect(selectAuthLoading(store.getState())).toBe(false);
      store.dispatch(setLoading(true));
      expect(selectAuthLoading(store.getState())).toBe(true);
    });
  });
});
