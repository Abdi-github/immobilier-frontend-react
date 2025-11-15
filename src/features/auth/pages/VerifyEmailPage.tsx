import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { AuthLayout } from '../components/AuthLayout';
import { useVerifyEmailMutation, useResendVerificationMutation } from '../auth.api';

/**
 * Email Verification Page
 * Handles the email verification link: /verify-email?token=xxx
 * Also allows resending the verification email
 */
export function VerifyEmailPage() {
  const { t, i18n } = useTranslation('auth');
  const [searchParams] = useSearchParams();
  const lang = i18n.language;
  const token = searchParams.get('token') || '';

  const [verifyStatus, setVerifyStatus] = useState<'verifying' | 'success' | 'error' | 'no-token'>(
    token ? 'verifying' : 'no-token'
  );
  const [resendEmail, setResendEmail] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);

  const [verifyEmail, { error: verifyError }] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: isResending, error: resendError }] =
    useResendVerificationMutation();

  // Auto-verify when token is present
  useEffect(() => {
    if (!token) return;

    const doVerify = async () => {
      try {
        await verifyEmail({ token }).unwrap();
        setVerifyStatus('success');
      } catch {
        setVerifyStatus('error');
      }
    };

    doVerify();
  }, [token, verifyEmail]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    try {
      await resendVerification({ email: resendEmail }).unwrap();
      setResendSuccess(true);
    } catch {
      // Error handled by RTK Query
    }
  };

  const getVerifyErrorMessage = () => {
    if (!verifyError)
      return t('verifyEmail.errorGeneric', 'Verification failed. The link may have expired.');
    if ('data' in verifyError) {
      const apiError = verifyError.data as { message?: string };
      return (
        apiError?.message ||
        t('verifyEmail.errorGeneric', 'Verification failed. The link may have expired.')
      );
    }
    return t('errors.network', 'Network error. Please try again.');
  };

  const getResendErrorMessage = () => {
    if (!resendError) return null;
    if ('data' in resendError) {
      const apiError = resendError.data as { message?: string };
      return (
        apiError?.message || t('verifyEmail.resendError', 'Failed to resend verification email.')
      );
    }
    return t('errors.network', 'Network error. Please try again.');
  };

  // Verifying in progress
  if (verifyStatus === 'verifying') {
    return (
      <AuthLayout
        title={t('verifyEmail.title', 'Email Verification')}
        subtitle={t('verifyEmail.subtitle', 'Verifying your email address')}
      >
        <div className="text-center py-12">
          <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {t('verifyEmail.verifying', 'Verifying your email...')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('verifyEmail.pleaseWait', 'Please wait while we verify your email address.')}
          </p>
        </div>
      </AuthLayout>
    );
  }

  // Verification success
  if (verifyStatus === 'success') {
    return (
      <AuthLayout
        title={t('verifyEmail.title', 'Email Verification')}
        subtitle={t('verifyEmail.subtitle', 'Verifying your email address')}
      >
        <div className="text-center py-8">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {t('verifyEmail.successTitle', 'Email Verified!')}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {t(
              'verifyEmail.successMessage',
              'Your email has been successfully verified. You can now log in to your account.'
            )}
          </p>
          <Link to={`/${lang}/sign-in`}>
            <Button className="w-full">{t('verifyEmail.loginNow', 'Log in now')}</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // Verification error
  if (verifyStatus === 'error') {
    return (
      <AuthLayout
        title={t('verifyEmail.title', 'Email Verification')}
        subtitle={t('verifyEmail.subtitle', 'Verifying your email address')}
      >
        <div className="text-center py-8">
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {t('verifyEmail.errorTitle', 'Verification Failed')}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">{getVerifyErrorMessage()}</p>

          {/* Resend form */}
          <div className="border-t pt-6 mt-6">
            <h4 className="text-sm font-medium mb-4">
              {t('verifyEmail.resendTitle', 'Need a new verification email?')}
            </h4>
            {resendSuccess ? (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm text-green-600">
                  {t('verifyEmail.resendSuccess', 'Verification email sent! Check your inbox.')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleResend} className="space-y-3">
                <Input
                  type="email"
                  placeholder={t('form.emailPlaceholder', 'Enter your email')}
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                  disabled={isResending}
                  className="h-11"
                />
                {resendError && <p className="text-sm text-red-600">{getResendErrorMessage()}</p>}
                <Button type="submit" variant="outline" className="w-full" disabled={isResending}>
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('common.sending', 'Sending...')}
                    </>
                  ) : (
                    t('verifyEmail.resendButton', 'Resend Verification Email')
                  )}
                </Button>
              </form>
            )}
          </div>

          <div className="mt-6">
            <Link to={`/${lang}/sign-in`} className="text-sm text-primary hover:underline">
              {t('verifyEmail.backToLogin', 'Back to Login')}
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // No token - show resend form
  return (
    <AuthLayout
      title={t('verifyEmail.title', 'Email Verification')}
      subtitle={t('verifyEmail.subtitle', 'Verify your email address')}
    >
      <div className="py-6">
        <div className="text-center mb-6">
          <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {t('verifyEmail.checkInbox', 'Check your inbox')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t(
              'verifyEmail.checkInboxDescription',
              'We sent a verification link to your email address. Click the link in the email to verify your account.'
            )}
          </p>
        </div>

        {/* Resend form */}
        <div className="border-t pt-6">
          <h4 className="text-sm font-medium mb-4 text-center">
            {t('verifyEmail.didntReceive', "Didn't receive the email?")}
          </h4>
          {resendSuccess ? (
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-3 mx-auto">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-green-600">
                {t('verifyEmail.resendSuccess', 'Verification email sent! Check your inbox.')}
              </p>
            </div>
          ) : (
            <form onSubmit={handleResend} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="resend-email">{t('form.email', 'Email address')}</Label>
                <Input
                  id="resend-email"
                  type="email"
                  placeholder={t('form.emailPlaceholder', 'Enter your email')}
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                  disabled={isResending}
                  className="h-11"
                />
              </div>
              {resendError && <p className="text-sm text-red-600">{getResendErrorMessage()}</p>}
              <Button
                type="submit"
                className="w-full"
                disabled={isResending || !resendEmail.trim()}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.sending', 'Sending...')}
                  </>
                ) : (
                  t('verifyEmail.resendButton', 'Resend Verification Email')
                )}
              </Button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link to={`/${lang}/sign-in`} className="text-sm text-primary hover:underline">
            {t('verifyEmail.backToLogin', 'Back to Login')}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
