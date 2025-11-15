/**
 * Create/Edit Alert Form Component
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  useGetCantonsQuery,
  useGetCategoriesQuery,
  type MultiLangName,
} from '@/features/locations/locations.api';
import { useCreateAlertMutation, useUpdateAlertMutation } from '../dashboard.api';
import type { PropertyAlert, CreateAlertRequest } from '../dashboard.types';

// Helper to get localized name from MultiLangName object
const getLocalizedName = (name: MultiLangName | string | undefined, lang: string): string => {
  if (!name) return '';
  if (typeof name === 'string') return name;
  return name[lang as keyof MultiLangName] || name.en || '';
};

// Validation schema
const alertSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  frequency: z.enum(['instant', 'daily', 'weekly']),
  transaction_type: z.enum(['rent', 'buy', '']).optional(),
  category_id: z.string().optional(),
  canton_id: z.string().optional(),
  price_min: z.coerce.number().min(0).optional().or(z.literal('')),
  price_max: z.coerce.number().min(0).optional().or(z.literal('')),
  rooms_min: z.coerce.number().min(0).optional().or(z.literal('')),
  rooms_max: z.coerce.number().min(0).optional().or(z.literal('')),
  surface_min: z.coerce.number().min(0).optional().or(z.literal('')),
  surface_max: z.coerce.number().min(0).optional().or(z.literal('')),
});

type AlertFormData = z.infer<typeof alertSchema>;

interface CreateAlertFormProps {
  alert?: PropertyAlert;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateAlertForm({ alert, onSuccess, onCancel }: CreateAlertFormProps) {
  const { t, i18n } = useTranslation('dashboard');
  const isEditing = !!alert;

  const { data: cantonsData } = useGetCantonsQuery(undefined);
  const { data: categoriesData } = useGetCategoriesQuery(undefined);

  const [createAlert, { isLoading: isCreating }] = useCreateAlertMutation();
  const [updateAlert, { isLoading: isUpdating }] = useUpdateAlertMutation();

  const isLoading = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AlertFormData>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      name: alert?.name || '',
      frequency: alert?.frequency || 'daily',
      transaction_type: alert?.criteria.transaction_type || '',
      category_id: alert?.criteria.category_id || '',
      canton_id: alert?.criteria.canton_id || '',
      price_min: alert?.criteria.price_min || '',
      price_max: alert?.criteria.price_max || '',
      rooms_min: alert?.criteria.rooms_min || '',
      rooms_max: alert?.criteria.rooms_max || '',
      surface_min: alert?.criteria.surface_min || '',
      surface_max: alert?.criteria.surface_max || '',
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: AlertFormData) => {
    // Build criteria object, excluding empty values
    const criteria: CreateAlertRequest['criteria'] = {};

    if (data.transaction_type) {
      criteria.transaction_type = data.transaction_type as 'rent' | 'buy';
    }
    if (data.category_id) criteria.category_id = data.category_id;
    if (data.canton_id) criteria.canton_id = data.canton_id;
    if (data.price_min !== undefined && data.price_min !== '')
      criteria.price_min = Number(data.price_min);
    if (data.price_max !== undefined && data.price_max !== '')
      criteria.price_max = Number(data.price_max);
    if (data.rooms_min !== undefined && data.rooms_min !== '')
      criteria.rooms_min = Number(data.rooms_min);
    if (data.rooms_max !== undefined && data.rooms_max !== '')
      criteria.rooms_max = Number(data.rooms_max);
    if (data.surface_min !== undefined && data.surface_min !== '')
      criteria.surface_min = Number(data.surface_min);
    if (data.surface_max !== undefined && data.surface_max !== '')
      criteria.surface_max = Number(data.surface_max);

    try {
      if (isEditing) {
        await updateAlert({
          id: alert.id,
          data: {
            name: data.name,
            frequency: data.frequency,
            criteria,
          },
        }).unwrap();
      } else {
        await createAlert({
          name: data.name,
          frequency: data.frequency,
          criteria,
        }).unwrap();
      }
      onSuccess();
    } catch {
      // Error is handled by the parent component
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Alert Name */}
      <div className="space-y-2">
        <Label htmlFor="name">{t('alerts.form.name')}</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder={t('alerts.form.namePlaceholder')}
          disabled={isLoading}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      {/* Frequency */}
      <div className="space-y-2">
        <Label>{t('alerts.form.frequency')}</Label>
        <Select
          value={watchedValues.frequency}
          onValueChange={(value) => setValue('frequency', value as 'instant' | 'daily' | 'weekly')}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('alerts.form.selectFrequency')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="instant">{t('alerts.frequency.instant')}</SelectItem>
            <SelectItem value="daily">{t('alerts.frequency.daily')}</SelectItem>
            <SelectItem value="weekly">{t('alerts.frequency.weekly')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium mb-4">{t('alerts.form.filters')}</h4>

        {/* Transaction Type */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t('alerts.form.transactionType')}</Label>
            <Select
              value={watchedValues.transaction_type || 'all'}
              onValueChange={(value) =>
                setValue('transaction_type', value === 'all' ? '' : (value as 'rent' | 'buy' | ''))
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('alerts.form.anyTransaction')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('alerts.form.anyTransaction')}</SelectItem>
                <SelectItem value="rent">{t('common.transaction.rent')}</SelectItem>
                <SelectItem value="buy">{t('common.transaction.buy')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>{t('alerts.form.category')}</Label>
            <Select
              value={watchedValues.category_id || 'all'}
              onValueChange={(value) => setValue('category_id', value === 'all' ? '' : value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('alerts.form.anyCategory')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('alerts.form.anyCategory')}</SelectItem>
                {categoriesData?.data?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {getLocalizedName(category.name, i18n.language)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2 mt-4">
          <Label>{t('alerts.form.location')}</Label>
          <Select
            value={watchedValues.canton_id || 'all'}
            onValueChange={(value) => setValue('canton_id', value === 'all' ? '' : value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('alerts.form.anyLocation')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('alerts.form.anyLocation')}</SelectItem>
              {cantonsData?.data?.map((canton) => (
                <SelectItem key={canton.id} value={canton.id}>
                  {getLocalizedName(canton.name, i18n.language)} ({canton.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <div className="space-y-2">
            <Label htmlFor="price_min">{t('alerts.form.priceMin')}</Label>
            <Input
              id="price_min"
              type="number"
              {...register('price_min')}
              placeholder="0"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price_max">{t('alerts.form.priceMax')}</Label>
            <Input
              id="price_max"
              type="number"
              {...register('price_max')}
              placeholder={t('alerts.form.noLimit')}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Rooms Range */}
        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <div className="space-y-2">
            <Label htmlFor="rooms_min">{t('alerts.form.roomsMin')}</Label>
            <Input
              id="rooms_min"
              type="number"
              {...register('rooms_min')}
              placeholder="0"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rooms_max">{t('alerts.form.roomsMax')}</Label>
            <Input
              id="rooms_max"
              type="number"
              {...register('rooms_max')}
              placeholder={t('alerts.form.noLimit')}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Surface Range */}
        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <div className="space-y-2">
            <Label htmlFor="surface_min">{t('alerts.form.surfaceMin')}</Label>
            <Input
              id="surface_min"
              type="number"
              {...register('surface_min')}
              placeholder="0"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="surface_max">{t('alerts.form.surfaceMax')}</Label>
            <Input
              id="surface_max"
              type="number"
              {...register('surface_max')}
              placeholder={t('alerts.form.noLimit')}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEditing ? t('alerts.form.update') : t('alerts.form.create')}
        </Button>
      </div>
    </form>
  );
}
