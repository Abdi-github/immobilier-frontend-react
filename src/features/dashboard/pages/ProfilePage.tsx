/**
 * Profile Page Component
 * Displays and allows editing of user profile information
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Camera, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { updateUser } from '@/features/auth/auth.slice';
import { useUpdateProfileMutation, useUploadAvatarMutation } from '../dashboard.api';

// Validation schema
const profileSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const { t } = useTranslation('dashboard');
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isEditing, setIsEditing] = useState(false);

  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
    },
  });

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.avatar.invalidType'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('profile.avatar.tooLarge'));
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const result = await uploadAvatar(formData).unwrap();
      dispatch(updateUser({ avatar_url: result.avatar_url }));
      toast.success(t('profile.avatar.uploadSuccess'));
    } catch (error) {
      toast.error(t('profile.avatar.uploadError'));
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const updatedUser = await updateProfile(data).unwrap();
      dispatch(updateUser(updatedUser));
      toast.success(t('profile.updateSuccess'));
      setIsEditing(false);
      reset(data);
    } catch (error) {
      toast.error(t('profile.updateError'));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
    });
  };

  if (!user) {
    return <ProfileSkeleton />;
  }

  const userInitials =
    user.first_name && user.last_name
      ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
      : user.email?.[0]?.toUpperCase() || 'U';

  const userTypeLabel =
    {
      end_user: 'profile.userType.endUser',
      owner: 'profile.userType.owner',
      agent: 'profile.userType.agent',
      agency_admin: 'profile.userType.agencyAdmin',
      platform_admin: 'profile.userType.platformAdmin',
      super_admin: 'profile.userType.superAdmin',
    }[user.user_type] || 'profile.userType.endUser';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('profile.title')}</h1>
        <p className="text-muted-foreground">{t('profile.description')}</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('profile.personalInfo')}
          </CardTitle>
          <CardDescription>{t('profile.personalInfoDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar_url} alt={user.first_name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isUploadingAvatar}
                />
              </label>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">
                {user.first_name} {user.last_name}
              </h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{t(userTypeLabel)}</Badge>
                {user.email_verified && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {t('profile.emailVerified')}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Profile Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="first_name">{t('profile.fields.firstName')}</Label>
                {isEditing ? (
                  <>
                    <Input id="first_name" {...register('first_name')} disabled={isUpdating} />
                    {errors.first_name && (
                      <p className="text-sm text-red-500">{errors.first_name.message}</p>
                    )}
                  </>
                ) : (
                  <p className="py-2 text-sm">{user.first_name}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="last_name">{t('profile.fields.lastName')}</Label>
                {isEditing ? (
                  <>
                    <Input id="last_name" {...register('last_name')} disabled={isUpdating} />
                    {errors.last_name && (
                      <p className="text-sm text-red-500">{errors.last_name.message}</p>
                    )}
                  </>
                ) : (
                  <p className="py-2 text-sm">{user.last_name}</p>
                )}
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {t('profile.fields.email')}
                  </span>
                </Label>
                <p className="py-2 text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">{t('profile.emailReadOnly')}</p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {t('profile.fields.phone')}
                  </span>
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    disabled={isUpdating}
                    placeholder="+41 XX XXX XX XX"
                  />
                ) : (
                  <p className="py-2 text-sm">
                    {user.phone || (
                      <span className="text-muted-foreground">{t('profile.notProvided')}</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isUpdating}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={isUpdating || !isDirty}>
                    {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {t('common.save')}
                  </Button>
                </>
              ) : (
                <Button type="button" onClick={() => setIsEditing(true)}>
                  {t('profile.editProfile')}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.accountInfo')}</CardTitle>
          <CardDescription>{t('profile.accountInfoDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('profile.fields.memberSince')}
              </dt>
              <dd className="text-sm mt-1">
                {new Date(user.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('profile.fields.accountStatus')}
              </dt>
              <dd className="mt-1">
                <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                  {user.status === 'active'
                    ? t('profile.status.active')
                    : t('profile.status.inactive')}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('profile.fields.preferredLanguage')}
              </dt>
              <dd className="text-sm mt-1 capitalize">{user.preferred_language}</dd>
            </div>
            {(user.agency || user.agency_id) && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {t('profile.fields.agency')}
                </dt>
                <dd className="text-sm mt-1">{user.agency?.name || user.agency_id}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

// Loading skeleton
function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
