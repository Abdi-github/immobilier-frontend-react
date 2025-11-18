/**
 * Step 1: Basic Info
 * Category, transaction type, and pricing
 */

import { useTranslation } from 'react-i18next';
import { Home, Building2, DollarSign } from 'lucide-react';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
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
import { useGetCategoriesQuery } from '@/features/locations/locations.api';
import type { SupportedLanguage } from '@/features/auth/auth.types';

// Helper to get localized name
function getLocalizedName(name: string | Record<string, string>, lang: SupportedLanguage): string {
  if (typeof name === 'string') return name;
  return name[lang] || name.en || Object.values(name)[0] || '';
}

export function StepBasicInfo() {
  const { t, i18n } = useTranslation('property');
  const lang = i18n.language as SupportedLanguage;
  const { state, errors, setField, clearError } = usePropertyForm();

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery();
  const categories = categoriesData?.data || [];

  // Group categories by section
  const residentialCategories = categories.filter((c) => c.section === 'residential');
  const commercialCategories = categories.filter((c) => c.section === 'commercial');

  // Currently selected section based on category
  const selectedCategory = categories.find((c) => c.id === state.category_id);
  // Section is used for potential future filtering
  void selectedCategory?.section;

  const handleCategoryChange = (categoryId: string) => {
    setField('category_id', categoryId);
    clearError('category_id');
  };

  const handleTransactionChange = (value: string) => {
    setField('transaction_type', value as 'rent' | 'buy');
    clearError('transaction_type');
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setField('price', value);
    clearError('price');
  };

  const handleAdditionalCostsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setField('additional_costs', value);
  };

  const handleLanguageChange = (value: string) => {
    setField('source_language', value as SupportedLanguage);
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          {t('form.basicInfo.title', 'Basic Information')}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {t(
            'form.basicInfo.subtitle',
            'Start by selecting the property type and pricing details.'
          )}
        </p>
      </div>

      {/* Source Language */}
      <div className="space-y-2">
        <Label>{t('form.basicInfo.sourceLanguage', 'Content Language')} *</Label>
        <p className="text-sm text-gray-500">
          {t(
            'form.basicInfo.sourceLanguageHint',
            'Select the language you will write the property description in.'
          )}
        </p>
        <Select value={state.source_language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder={t('form.basicInfo.selectLanguage', 'Select language')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">🇬🇧 English</SelectItem>
            <SelectItem value="fr">🇫🇷 Français</SelectItem>
            <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
            <SelectItem value="it">🇮🇹 Italiano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transaction Type */}
      <div className="space-y-3">
        <Label>{t('form.basicInfo.transactionType', 'What do you want to do?')} *</Label>
        <RadioGroup
          value={state.transaction_type}
          onValueChange={handleTransactionChange}
          className="flex gap-4"
        >
          <label
            className={cn(
              'flex items-center gap-3 px-6 py-4 border-2 rounded-lg cursor-pointer transition-all',
              state.transaction_type === 'rent'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <RadioGroupItem value="rent" />
            <span className="font-medium">{t('form.basicInfo.rent', 'Rent out')}</span>
          </label>
          <label
            className={cn(
              'flex items-center gap-3 px-6 py-4 border-2 rounded-lg cursor-pointer transition-all',
              state.transaction_type === 'buy'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <RadioGroupItem value="buy" />
            <span className="font-medium">{t('form.basicInfo.sell', 'Sell')}</span>
          </label>
        </RadioGroup>
        {errors.transaction_type && (
          <p className="text-sm text-red-500">{errors.transaction_type}</p>
        )}
      </div>

      {/* Category Selection */}
      <div className="space-y-4">
        <Label>{t('form.basicInfo.category', 'Property Type')} *</Label>

        {categoriesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            {/* Residential Categories */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Home className="h-4 w-4" />
                {t('form.basicInfo.residential', 'Residential')}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {residentialCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategoryChange(category.id)}
                    className={cn(
                      'p-4 border-2 rounded-lg text-left transition-all hover:shadow-sm',
                      state.category_id === category.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className="font-medium text-gray-900">
                      {getLocalizedName(category.name, lang)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Commercial Categories */}
            <div className="space-y-2 mt-6">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Building2 className="h-4 w-4" />
                {t('form.basicInfo.commercial', 'Commercial')}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {commercialCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategoryChange(category.id)}
                    className={cn(
                      'p-4 border-2 rounded-lg text-left transition-all hover:shadow-sm',
                      state.category_id === category.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className="font-medium text-gray-900">
                      {getLocalizedName(category.name, lang)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        {errors.category_id && <p className="text-sm text-red-500">{errors.category_id}</p>}
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          {t('form.basicInfo.pricing', 'Pricing')}
        </Label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">
              {state.transaction_type === 'rent'
                ? t('form.basicInfo.monthlyRent', 'Monthly Rent')
                : t('form.basicInfo.salePrice', 'Sale Price')}{' '}
              (CHF) *
            </Label>
            <div className="relative">
              <Input
                id="price"
                type="text"
                inputMode="numeric"
                value={state.price}
                onChange={handlePriceChange}
                placeholder={state.transaction_type === 'rent' ? 'e.g. 2500' : 'e.g. 850000'}
                className={cn('pl-12', errors.price && 'border-red-500')}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">CHF</span>
            </div>
            {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
          </div>

          {/* Additional Costs */}
          <div className="space-y-2">
            <Label htmlFor="additionalCosts">
              {t('form.basicInfo.additionalCosts', 'Additional Costs')} (CHF)
            </Label>
            <div className="relative">
              <Input
                id="additionalCosts"
                type="text"
                inputMode="numeric"
                value={state.additional_costs}
                onChange={handleAdditionalCostsChange}
                placeholder="e.g. 200"
                className="pl-12"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">CHF</span>
            </div>
            <p className="text-xs text-gray-500">
              {t('form.basicInfo.additionalCostsHint', 'Include utilities, maintenance fees, etc.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StepBasicInfo;
