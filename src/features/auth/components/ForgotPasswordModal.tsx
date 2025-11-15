import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useForgotPasswordMutation } from '../auth.api';

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Forgot Password Modal
 * Allows users to request a password reset email
 */
export function ForgotPasswordModal({ open, onOpenChange }: ForgotPasswordModalProps) {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [forgotPassword, { isLoading, error }] = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) return;

    try {
      await forgotPassword({ email }).unwrap();
      setSuccess(true);
    } catch {
      // Error is handled by RTK Query
    }
  };

  const handleClose = () => {
    setEmail('');
    setSuccess(false);
    onOpenChange(false);
  };

  const getErrorMessage = () => {
    if (!error) return null;
    if ('data' in error) {
      const apiError = error.data as { message?: string };
      return apiError?.message || t('errors.forgotPassword', 'Failed to send reset email');
    }
    return t('errors.network', 'Network error. Please try again.');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {t('forgotPassword.title', 'Reset your password')}
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            {t(
              'forgotPassword.description',
              'Please enter the e-mail address of your user account. A link to change your password will be sent directly to you.'
            )}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('forgotPassword.successTitle', 'Email sent!')}
              </h3>
              <p className="text-sm text-gray-600">
                {t(
                  'forgotPassword.successMessage',
                  'If an account exists for this email, you will receive a password reset link shortly.'
                )}
              </p>
            </div>
            <DialogFooter className="mt-6">
              <Button onClick={handleClose} className="w-full">
                {t('common.close', 'Close')}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">{t('form.email', 'Email address')} *</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder={t('form.emailPlaceholder', 'Enter your email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  disabled={isLoading}
                />
              </div>

              {error && <p className="text-sm text-red-600">{getErrorMessage()}</p>}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={isLoading || !email.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.sending', 'Sending...')}
                  </>
                ) : (
                  t('forgotPassword.submit', 'Submit')
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ForgotPasswordModal;
