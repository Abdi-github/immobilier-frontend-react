import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from './auth.types';
import { authApi } from './auth.api';

// Storage keys
const TOKEN_KEY = 'immobilier_token';
const REFRESH_TOKEN_KEY = 'immobilier_refresh_token';
const USER_KEY = 'immobilier_user';

// Get initial state from localStorage
const getInitialState = (): AuthState => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    const user = userStr ? JSON.parse(userStr) : null;

    return {
      user,
      token,
      refreshToken,
      isAuthenticated: !!token && !!user,
      isLoading: false,
    };
  } catch {
    return {
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    };
  }
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        refreshToken: string;
      }>
    ) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;

      // Persist to localStorage
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem(USER_KEY, JSON.stringify(state.user));
      }
    },

    updateTokens: (state, action: PayloadAction<{ token: string; refreshToken: string }>) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem(TOKEN_KEY, action.payload.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, action.payload.refreshToken);
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      // Clear localStorage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Handle login success
    builder.addMatcher(authApi.endpoints.login.matchFulfilled, (state, { payload }) => {
      if (payload.success && payload.data) {
        const { user, tokens } = payload.data;
        state.user = user;
        state.token = tokens.access_token;
        state.refreshToken = tokens.refresh_token;
        state.isAuthenticated = true;
        state.isLoading = false;

        localStorage.setItem(TOKEN_KEY, tokens.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    });

    // Handle register success
    builder.addMatcher(authApi.endpoints.register.matchFulfilled, (state, { payload }) => {
      if (payload.success && payload.data) {
        const { user, tokens } = payload.data;
        state.user = user;
        state.token = tokens.access_token;
        state.refreshToken = tokens.refresh_token;
        state.isAuthenticated = true;
        state.isLoading = false;

        localStorage.setItem(TOKEN_KEY, tokens.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    });

    // Handle logout success
    builder.addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    });

    // Handle refresh token success
    builder.addMatcher(authApi.endpoints.refreshToken.matchFulfilled, (state, { payload }) => {
      if (payload.success && payload.data) {
        const { tokens } = payload.data;
        state.token = tokens.access_token;
        state.refreshToken = tokens.refresh_token;

        localStorage.setItem(TOKEN_KEY, tokens.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
      }
    });

    // Handle getMe success
    builder.addMatcher(authApi.endpoints.getMe.matchFulfilled, (state, { payload }) => {
      if (payload.success && payload.data) {
        state.user = payload.data;
        state.isAuthenticated = true;
        localStorage.setItem(USER_KEY, JSON.stringify(payload.data));
      }
    });
  },
});

export const { setCredentials, updateUser, updateTokens, logout, setLoading } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
