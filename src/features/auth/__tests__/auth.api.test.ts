/**
 * Auth API endpoint tests
 */

import { describe, it, expect } from 'vitest';
import { authApi } from '@/features/auth/auth.api';

// Ensure endpoints are injected
authApi;

describe('authApi', () => {
  it('has login mutation', () => {
    expect(authApi.endpoints.login).toBeDefined();
  });

  it('has register mutation', () => {
    expect(authApi.endpoints.register).toBeDefined();
  });

  it('has logout mutation', () => {
    expect(authApi.endpoints.logout).toBeDefined();
  });

  it('has refreshToken mutation', () => {
    expect(authApi.endpoints.refreshToken).toBeDefined();
  });

  it('has getMe query', () => {
    expect(authApi.endpoints.getMe).toBeDefined();
  });

  it('has forgotPassword mutation', () => {
    expect(authApi.endpoints.forgotPassword).toBeDefined();
  });

  it('has resetPassword mutation', () => {
    expect(authApi.endpoints.resetPassword).toBeDefined();
  });

  it('has verifyEmail mutation', () => {
    expect(authApi.endpoints.verifyEmail).toBeDefined();
  });

  it('has resendVerification mutation', () => {
    expect(authApi.endpoints.resendVerification).toBeDefined();
  });

  it('exports all hooks', () => {
    const {
      useLoginMutation,
      useRegisterMutation,
      useLogoutMutation,
      useRefreshTokenMutation,
      useGetMeQuery,
      useForgotPasswordMutation,
      useResetPasswordMutation,
      useVerifyEmailMutation,
      useResendVerificationMutation,
    } = authApi;

    expect(typeof useLoginMutation).toBe('function');
    expect(typeof useRegisterMutation).toBe('function');
    expect(typeof useLogoutMutation).toBe('function');
    expect(typeof useRefreshTokenMutation).toBe('function');
    expect(typeof useGetMeQuery).toBe('function');
    expect(typeof useForgotPasswordMutation).toBe('function');
    expect(typeof useResetPasswordMutation).toBe('function');
    expect(typeof useVerifyEmailMutation).toBe('function');
    expect(typeof useResendVerificationMutation).toBe('function');
  });
});
