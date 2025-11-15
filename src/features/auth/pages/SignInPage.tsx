import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { AuthLayout } from '../components/AuthLayout';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';
import { useLoginMutation } from '../auth.api';

/**
 * Sign In Page
 * Similar to immobilier.ch/en/sign-in
 */
export function SignInPage() {
  const { t, i18n } = useTranslation('auth');
  const navigate = useNavigate();
  const location = useLocation();
  const lang = i18n.language;

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  // RTK Query mutation
  const [login, { isLoading, error }] = useLoginMutation();

  // Get redirect URL from location state or default to home
  const from = (location.state as { from?: string })?.from || `/${lang}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) return;

    try {
      await login({ email, password }).unwrap();
      navigate(from, { replace: true });
    } catch {
      // Error is handled by RTK Query
    }
  };

  const getErrorMessage = () => {
    if (!error) return null;
    if ('data' in error) {
      const apiError = error.data as { message?: string };
      return apiError?.message || t('errors.login', 'Invalid email or password');
    }
    return t('errors.network', 'Network error. Please try again.');
  };

  return (
    <AuthLayout
      title={t('signIn.title', 'Account')}
      subtitle={t('signIn.subtitle', 'Log in or register to access your services')}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            {t('form.email', 'Email address')} *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder={t('form.emailPlaceholder', 'Enter your email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={isLoading}
            className="h-11"
          />
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            {t('form.password', 'Password')} *
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('form.passwordPlaceholder', 'Enter your password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={isLoading}
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{getErrorMessage()}</p>
          </div>
        )}

        {/* Login button */}
        <Button
          type="submit"
          className="w-full h-11 text-base font-semibold"
          disabled={isLoading || !email.trim() || !password.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('signIn.loggingIn', 'Logging in...')}
            </>
          ) : (
            t('signIn.submit', 'Log in')
          )}
        </Button>

        {/* Forgot password button */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setForgotPasswordOpen(true)}
            className="text-sm text-primary hover:underline"
          >
            {t('signIn.forgotPassword', 'Forgot your password?')}
          </button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">{t('signIn.or', 'or')}</span>
          </div>
        </div>

        {/* Register link */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            {t('signIn.noAccount', "Don't have an account?")}
          </p>
          <Link
            to={`/${lang}/create-an-account`}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {t('signIn.createAccount', 'Create an account')}
          </Link>
        </div>
      </form>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen} />
    </AuthLayout>
  );
}

export default SignInPage;
