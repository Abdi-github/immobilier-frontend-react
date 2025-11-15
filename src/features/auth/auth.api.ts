import { baseApi } from '@/shared/api/baseApi';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenRequest,
  TokensResponse,
  User,
} from './auth.types';

// API Response interface
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Login with email and password
     */
    login: builder.mutation<ApiResponse<AuthResponse>, LoginRequest>({
      query: (credentials) => ({
        url: '/public/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    /**
     * Register a new user
     */
    register: builder.mutation<ApiResponse<AuthResponse>, RegisterRequest>({
      query: (data) => ({
        url: '/public/auth/register',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),

    /**
     * Logout user
     */
    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/public/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    /**
     * Refresh access token
     */
    refreshToken: builder.mutation<ApiResponse<{ tokens: TokensResponse }>, RefreshTokenRequest>({
      query: (body) => ({
        url: '/public/auth/refresh',
        method: 'POST',
        body,
      }),
    }),

    /**
     * Get current user profile
     */
    getMe: builder.query<ApiResponse<User>, void>({
      query: () => '/public/auth/me',
      providesTags: ['Auth'],
    }),

    /**
     * Request password reset email
     */
    forgotPassword: builder.mutation<ApiResponse<{ message: string }>, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/public/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),

    /**
     * Reset password with token
     */
    resetPassword: builder.mutation<ApiResponse<{ message: string }>, ResetPasswordRequest>({
      query: (data) => ({
        url: '/public/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),

    /**
     * Verify email with token
     */
    verifyEmail: builder.mutation<ApiResponse<{ message: string }>, { token: string }>({
      query: (data) => ({
        url: '/public/auth/verify-email',
        method: 'POST',
        body: data,
      }),
    }),

    /**
     * Resend verification email
     */
    resendVerification: builder.mutation<ApiResponse<{ message: string }>, { email: string }>({
      query: (data) => ({
        url: '/public/auth/resend-verification',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
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
