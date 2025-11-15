import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Clock, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

/**
 * Registration Pending Page
 * Shown after professional account registration
 */
export function RegistrationPendingPage() {
  const { t, i18n } = useTranslation('auth');
  const lang = i18n.language;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse" />
          <div className="relative flex items-center justify-center w-full h-full bg-green-100 rounded-full">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('pending.title', 'Registration Submitted!')}
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 mb-6">
          {t(
            'pending.subtitle',
            'Thank you for registering as a professional. Your account is pending verification.'
          )}
        </p>

        {/* Steps */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-gray-800 mb-3">
            {t('pending.whatHappensNext', 'What happens next?')}
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <Mail className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">
                {t(
                  'pending.step1',
                  'You will receive a confirmation email with your registration details.'
                )}
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mt-0.5">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
              </div>
              <p className="text-sm text-gray-600">
                {t(
                  'pending.step2',
                  'Our team will review your information within 1-2 business days.'
                )}
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">
                {t(
                  'pending.step3',
                  'Once approved, you will receive an email to activate your account and start posting properties.'
                )}
              </p>
            </li>
          </ul>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-blue-800">
            <strong>{t('pending.questions', 'Questions?')}</strong>{' '}
            {t(
              'pending.contact',
              'Contact our support team at support@immobilier.ch if you have any questions about the verification process.'
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link to={`/${lang}`}>
            <Button className="w-full">
              {t('pending.backToHome', 'Back to Homepage')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <Link to={`/${lang}/sign-in`}>
            <Button variant="outline" className="w-full">
              {t('pending.signIn', 'Sign in with existing account')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-6 text-sm text-gray-500 text-center max-w-md">
        {t(
          'pending.footerNote',
          'Already a member and need help? Contact our support team for assistance.'
        )}
      </p>
    </div>
  );
}

export default RegistrationPendingPage;
