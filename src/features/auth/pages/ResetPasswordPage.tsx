import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { AuthLayout } from '../components/AuthLayout';
import { useResetPasswordMutation } from '../auth.api';

/**
 * Reset Password Page
 * Handles the password reset link from email: /reset-password?token=xxx
 */
export function ResetPasswordPage() {
  const { t, i18n } = useTranslation('auth');
  const [searchParams] = useSearchParams();
  const lang = i18n.language;
  const token = searchParams.get('token') || '';

  // Form state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  // RTK Query mutation
  const [resetPassword, { isLoading, error }] = useResetPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (password.length < 8) {
      setValidationError(t('validation.passwordLength', 'Password must be at least 8 characters'));
      return;
    }

    if (password !== confirmPassword) {
      setValidationError(t('validation.passwordMismatch', 'Passwords do not match'));
      return;
    }

    if (!token) {
      setValidationError(t('resetPassword.invalidToken', 'Invalid or missing reset token'));
      return;
    }

    try {
      await resetPassword({ token, password }).unwrap();
      setSuccess(true);
    } catch {
      // Error handled by RTK Query
    }
  };

  const getErrorMessage = () => {
    if (validationError) return validationError;
    if (!error) return null;
    if ('data' in error) {
      const apiError = error.data as { message?: string };
      return (
        apiError?.message ||
        t('resetPassword.error', 'Failed to reset password. The link may have expired.')
      );
    }
    return t('errors.network', 'Network error. Please try again.');
  };

  // No token provided
  if (!token) {
    return (
      <AuthLayout
        title={t('resetPassword.title', 'Reset Password')}
        subtitle={t('resetPassword.subtitle', 'Create a new password for your account')}
      >
        <div className="text-center py-8">
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {t('resetPassword.invalidToken', 'Invalid or missing reset token')}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {t(
              'resetPassword.invalidTokenDescription',
              'The password reset link is invalid or has expired. Please request a new one.'
            )}
          </p>
          <Link to={`/${lang}/sign-in`}>
            <Button>{t('resetPassword.backToLogin', 'Back to Login')}</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // Success state
  if (success) {
    return (
      <AuthLayout
        title={t('resetPassword.title', 'Reset Password')}
        subtitle={t('resetPassword.subtitle', 'Create a new password for your account')}
      >
        <div className="text-center py-8">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {t('resetPassword.successTitle', 'Password Reset Successfully!')}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {t(
              'resetPassword.successMessage',
              'Your password has been updated. You can now log in with your new password.'
            )}
          </p>
          <Link to={`/${lang}/sign-in`}>
            <Button className="w-full">{t('resetPassword.loginNow', 'Log in now')}</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={t('resetPassword.title', 'Reset Password')}
      subtitle={t('resetPassword.subtitle', 'Create a new password for your account')}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* New Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            {t('resetPassword.newPassword', 'New Password')} *
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('resetPassword.newPasswordPlaceholder', 'Enter your new password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={isLoading}
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            {t('resetPassword.confirmPassword', 'Confirm New Password')} *
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder={t(
                'resetPassword.confirmPasswordPlaceholder',
                'Confirm your new password'
              )}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              disabled={isLoading}
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Password requirements */}
        <p className="text-xs text-muted-foreground">
          {t('resetPassword.requirements', 'Password must be at least 8 characters long.')}
        </p>

        {/* Error message */}
        {getErrorMessage() && <p className="text-sm text-red-600">{getErrorMessage()}</p>}

        {/* Submit button */}
        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('resetPassword.resetting', 'Resetting...')}
            </>
          ) : (
            t('resetPassword.submit', 'Reset Password')
          )}
        </Button>

        {/* Back to login */}
        <div className="text-center">
          <Link to={`/${lang}/sign-in`} className="text-sm text-primary hover:underline">
            {t('resetPassword.backToLogin', 'Back to Login')}
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
