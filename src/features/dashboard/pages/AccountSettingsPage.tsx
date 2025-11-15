/**
 * Account Settings Page Component
 * Allows users to change password and manage notification preferences
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Lock, Bell, Globe, Loader2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import { Separator } from '@/shared/components/ui/separator';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { updateUser, logout } from '@/features/auth/auth.slice';
import { setLanguage } from '@/shared/state/language.slice';
import {
  useChangePasswordMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useDeactivateAccountMutation,
} from '../dashboard.api';
import type { SupportedLanguage } from '@/features/auth/auth.types';

// Password validation schema
const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase, one lowercase, and one number'
      ),
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

const SUPPORTED_LANGUAGES: { value: SupportedLanguage; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'it', label: 'Italiano', flag: '🇮🇹' },
];

export function AccountSettingsPage() {
  const { t } = useTranslation('dashboard');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const currentLanguage = useAppSelector((state) => state.language.current);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: settings, isLoading: isLoadingSettings } = useGetSettingsQuery();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [updateSettings, { isLoading: isUpdatingSettings }] = useUpdateSettingsMutation();
  const [deactivateAccount, { isLoading: isDeactivating }] = useDeactivateAccountMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      await changePassword(data).unwrap();
      toast.success(t('settings.password.changeSuccess'));
      reset();
    } catch (error: unknown) {
      const apiError = error as { data?: { message?: string } };
      toast.error(apiError.data?.message || t('settings.password.changeError'));
    }
  };

  const handleLanguageChange = async (newLanguage: SupportedLanguage) => {
    try {
      await updateSettings({ language: newLanguage }).unwrap();
      dispatch(updateUser({ preferred_language: newLanguage }));
      dispatch(setLanguage(newLanguage));
      toast.success(t('settings.language.updateSuccess'));
    } catch {
      toast.error(t('settings.language.updateError'));
    }
  };

  const handleNotificationChange = async (key: string, value: boolean) => {
    if (!settings) return;

    try {
      await updateSettings({
        notifications: {
          ...settings.notifications,
          [key]: value,
        },
      }).unwrap();
      toast.success(t('settings.notifications.updateSuccess'));
    } catch {
      toast.error(t('settings.notifications.updateError'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.description')}</p>
      </div>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t('settings.language.title')}
          </CardTitle>
          <CardDescription>{t('settings.language.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <Label htmlFor="language">{t('settings.language.select')}</Label>
            <Select
              value={user?.preferred_language || currentLanguage}
              onValueChange={handleLanguageChange}
              disabled={isUpdatingSettings}
            >
              <SelectTrigger id="language" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Password Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {t('settings.password.title')}
          </CardTitle>
          <CardDescription>{t('settings.password.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="current_password">{t('settings.password.current')}</Label>
              <div className="relative">
                <Input
                  id="current_password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  {...register('current_password')}
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.current_password && (
                <p className="text-sm text-red-500">{errors.current_password.message}</p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new_password">{t('settings.password.new')}</Label>
              <div className="relative">
                <Input
                  id="new_password"
                  type={showNewPassword ? 'text' : 'password'}
                  {...register('new_password')}
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.new_password && (
                <p className="text-sm text-red-500">{errors.new_password.message}</p>
              )}
              <p className="text-xs text-muted-foreground">{t('settings.password.requirements')}</p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm_password">{t('settings.password.confirm')}</Label>
              <div className="relative">
                <Input
                  id="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirm_password')}
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-sm text-red-500">{errors.confirm_password.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('settings.password.change')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('settings.notifications.title')}
          </CardTitle>
          <CardDescription>{t('settings.notifications.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingSettings ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-64 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-11 bg-muted rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {/* Email notifications */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.notifications.newProperties')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.notifications.newPropertiesDesc')}
                    </p>
                  </div>
                  <Switch
                    checked={settings?.notifications?.email_new_properties ?? false}
                    onCheckedChange={(value) =>
                      handleNotificationChange('email_new_properties', value)
                    }
                    disabled={isUpdatingSettings}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.notifications.priceChanges')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.notifications.priceChangesDesc')}
                    </p>
                  </div>
                  <Switch
                    checked={settings?.notifications?.email_price_changes ?? false}
                    onCheckedChange={(value) =>
                      handleNotificationChange('email_price_changes', value)
                    }
                    disabled={isUpdatingSettings}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.notifications.favoritesUpdates')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.notifications.favoritesUpdatesDesc')}
                    </p>
                  </div>
                  <Switch
                    checked={settings?.notifications?.email_favorites_updates ?? false}
                    onCheckedChange={(value) =>
                      handleNotificationChange('email_favorites_updates', value)
                    }
                    disabled={isUpdatingSettings}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.notifications.newsletter')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.notifications.newsletterDesc')}
                    </p>
                  </div>
                  <Switch
                    checked={settings?.notifications?.email_newsletter ?? false}
                    onCheckedChange={(value) => handleNotificationChange('email_newsletter', value)}
                    disabled={isUpdatingSettings}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {t('settings.danger.title')}
          </CardTitle>
          <CardDescription>{t('settings.danger.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">{t('settings.danger.deleteAccount')}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('settings.danger.deleteConfirmTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('settings.danger.deleteConfirmDescription')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isDeactivating}
                  onClick={async () => {
                    try {
                      await deactivateAccount().unwrap();
                      toast.success(
                        t('settings.danger.deleteSuccess', 'Account deactivated successfully')
                      );
                      dispatch(logout());
                      navigate(`/${currentLanguage}`);
                    } catch (error: unknown) {
                      const err = error as { data?: { message?: string } };
                      toast.error(
                        err?.data?.message ||
                          t('settings.danger.deleteError', 'Failed to deactivate account')
                      );
                    }
                  }}
                >
                  {t('settings.danger.deleteConfirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
