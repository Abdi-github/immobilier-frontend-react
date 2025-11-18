/**
 * Step 2: Location
 * Canton, city, address, and postal code
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import { usePropertyForm } from '../context/PropertyFormContext';
import { useGetCantonsQuery, useGetCitiesByCantonQuery } from '@/features/locations/locations.api';
import type { SupportedLanguage } from '@/features/auth/auth.types';

// Helper to get localized name
function getLocalizedName(name: string | Record<string, string>, lang: SupportedLanguage): string {
  if (typeof name === 'string') return name;
  return name[lang] || name.en || Object.values(name)[0] || '';
}

export function StepLocation() {
  const { t, i18n } = useTranslation('property');
  const lang = i18n.language as SupportedLanguage;
  const { state, errors, setField, clearError } = usePropertyForm();

  // Fetch cantons
  const { data: cantonsData, isLoading: cantonsLoading } = useGetCantonsQuery();
  const cantons = cantonsData?.data || [];

  // Fetch cities based on selected canton
  const { data: citiesData, isLoading: citiesLoading } = useGetCitiesByCantonQuery(
    state.canton_id || '',
    { skip: !state.canton_id }
  );
  const cities = citiesData?.data || [];

  // Reset city when canton changes
  useEffect(() => {
    if (state.canton_id && state.city_id) {
      // Check if current city belongs to selected canton
      const cityBelongsToCanton = cities?.some((c) => c.id === state.city_id);
      if (cities && !cityBelongsToCanton) {
        setField('city_id', '');
      }
    }
  }, [state.canton_id, cities, state.city_id, setField]);

  const handleCantonChange = (value: string) => {
    setField('canton_id', value);
    setField('city_id', ''); // Reset city when canton changes
    clearError('canton_id');
  };

  const handleCityChange = (value: string) => {
    setField('city_id', value);
    clearError('city_id');

    // Auto-fill postal code if city has it
    const selectedCity = cities?.find((c) => c.id === value);
    if (selectedCity?.postal_codes && selectedCity.postal_codes.length > 0) {
      const firstPostalCode = selectedCity.postal_codes[0];
      if (firstPostalCode) {
        setField('postal_code', firstPostalCode);
      }
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setField('address', e.target.value);
    clearError('address');
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setField('postal_code', e.target.value);
  };

  // Sort cantons alphabetically
  const sortedCantons = cantons
    ? [...cantons].sort((a, b) =>
        getLocalizedName(a.name, lang).localeCompare(getLocalizedName(b.name, lang))
      )
    : [];

  // Sort cities alphabetically
  const sortedCities = cities
    ? [...cities].sort((a, b) =>
        getLocalizedName(a.name, lang).localeCompare(getLocalizedName(b.name, lang))
      )
    : [];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          {t('form.location.title', 'Property Location')}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {t('form.location.subtitle', 'Specify where your property is located.')}
        </p>
      </div>

      {/* Canton and City Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Canton */}
        <div className="space-y-2">
          <Label htmlFor="canton">{t('form.location.canton', 'Canton')} *</Label>
          {cantonsLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={state.canton_id} onValueChange={handleCantonChange}>
              <SelectTrigger id="canton" className={cn(errors.canton_id && 'border-red-500')}>
                <SelectValue placeholder={t('form.location.selectCanton', 'Select canton')} />
              </SelectTrigger>
              <SelectContent>
                {sortedCantons.map((canton) => (
                  <SelectItem key={canton.id} value={canton.id}>
                    {canton.code} - {getLocalizedName(canton.name, lang)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {errors.canton_id && <p className="text-sm text-red-500">{errors.canton_id}</p>}
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">{t('form.location.city', 'City')} *</Label>
          {citiesLoading && state.canton_id ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={state.city_id}
              onValueChange={handleCityChange}
              disabled={!state.canton_id}
            >
              <SelectTrigger id="city" className={cn(errors.city_id && 'border-red-500')}>
                <SelectValue
                  placeholder={
                    state.canton_id
                      ? t('form.location.selectCity', 'Select city')
                      : t('form.location.selectCantonFirst', 'Select canton first')
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {sortedCities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {getLocalizedName(city.name, lang)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {errors.city_id && <p className="text-sm text-red-500">{errors.city_id}</p>}
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">{t('form.location.address', 'Street Address')} *</Label>
        <Textarea
          id="address"
          value={state.address}
          onChange={handleAddressChange}
          placeholder={t('form.location.addressPlaceholder', 'e.g. Bahnhofstrasse 123, 4th floor')}
          className={cn('resize-none', errors.address && 'border-red-500')}
          rows={2}
        />
        <p className="text-xs text-gray-500">
          {t(
            'form.location.addressHint',
            'Include street name, building number, and floor/unit if applicable.'
          )}
        </p>
        {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
      </div>

      {/* Postal Code */}
      <div className="space-y-2 max-w-xs">
        <Label htmlFor="postalCode">{t('form.location.postalCode', 'Postal Code')}</Label>
        <Input
          id="postalCode"
          value={state.postal_code}
          onChange={handlePostalCodeChange}
          placeholder="e.g. 8001"
          maxLength={10}
        />
      </div>

      {/* Map Preview (Placeholder) */}
      <div className="mt-6">
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center bg-gray-50">
          <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">
            {t('form.location.mapPreview', 'Map preview will be shown here based on the address')}
          </p>
          {state.address && state.city_id && (
            <p className="text-sm text-gray-400 mt-2">
              {state.address}
              {state.postal_code && `, ${state.postal_code}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default StepLocation;
