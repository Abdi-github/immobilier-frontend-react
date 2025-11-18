/**
 * Step 3: Property Details
 * Title, description, rooms, and surface area
 */

import { useTranslation } from 'react-i18next';
import { FileText, BedDouble, Maximize } from 'lucide-react';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { cn } from '@/shared/lib/utils';
import { usePropertyForm } from '../context/PropertyFormContext';

// Language flag mapping
const languageFlags: Record<string, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  de: '🇩🇪',
  it: '🇮🇹',
};

const languageNames: Record<string, string> = {
  en: 'English',
  fr: 'French',
  de: 'German',
  it: 'Italian',
};

export function StepDetails() {
  const { t } = useTranslation('property');
  const { state, errors, setField, clearError } = usePropertyForm();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setField('title', e.target.value);
    clearError('title');
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setField('description', e.target.value);
    clearError('description');
  };

  const handleRoomsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setField('rooms', value);
  };

  const handleSurfaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setField('surface', value);
  };

  const characterCount = state.description.length;
  const minCharacters = 20;
  const recommendedCharacters = 500;

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          {t('form.details.title', 'Property Details')}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {t(
            'form.details.subtitle',
            'Describe your property to attract potential tenants or buyers.'
          )}
        </p>
      </div>

      {/* Language Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{languageFlags[state.source_language]}</span>
          <div>
            <p className="font-medium text-blue-900">
              {t('form.details.writingIn', 'Writing in')} {languageNames[state.source_language]}
            </p>
            <p className="text-sm text-blue-700">
              {t(
                'form.details.translationNote',
                'Your content will be automatically translated to other languages after submission.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">{t('form.details.propertyTitle', 'Property Title')} *</Label>
        <Input
          id="title"
          value={state.title}
          onChange={handleTitleChange}
          placeholder={t(
            'form.details.titlePlaceholder',
            'e.g. Charming 3.5 room apartment with lake view'
          )}
          maxLength={150}
          className={cn(errors.title && 'border-red-500')}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{t('form.details.titleHint', 'Make it descriptive and appealing')}</span>
          <span>{state.title.length}/150</span>
        </div>
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          {t('form.details.description', 'Property Description')} *
        </Label>
        <Textarea
          id="description"
          value={state.description}
          onChange={handleDescriptionChange}
          placeholder={t(
            'form.details.descriptionPlaceholder',
            'Describe the property features, layout, surroundings, and what makes it special...'
          )}
          className={cn('min-h-[200px] resize-y', errors.description && 'border-red-500')}
          rows={8}
        />
        <div className="flex justify-between items-center text-xs">
          <span
            className={cn(
              characterCount < minCharacters
                ? 'text-red-500'
                : characterCount < recommendedCharacters
                  ? 'text-yellow-600'
                  : 'text-green-600'
            )}
          >
            {characterCount < minCharacters
              ? t('form.details.minCharacters', `Minimum ${minCharacters} characters required`)
              : characterCount < recommendedCharacters
                ? t(
                    'form.details.recommendedCharacters',
                    `${recommendedCharacters - characterCount} more characters recommended`
                  )
                : t('form.details.goodLength', 'Good description length!')}
          </span>
          <span className="text-gray-500">{characterCount} characters</span>
        </div>
        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
      </div>

      {/* Rooms and Surface */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rooms */}
        <div className="space-y-2">
          <Label htmlFor="rooms" className="flex items-center gap-2">
            <BedDouble className="h-4 w-4" />
            {t('form.details.rooms', 'Number of Rooms')}
          </Label>
          <Input
            id="rooms"
            type="text"
            inputMode="decimal"
            value={state.rooms}
            onChange={handleRoomsChange}
            placeholder="e.g. 3.5"
          />
          <p className="text-xs text-gray-500">
            {t(
              'form.details.roomsHint',
              'Swiss standard: half rooms count (e.g., 3.5 = 3 rooms + kitchen)'
            )}
          </p>
        </div>

        {/* Surface */}
        <div className="space-y-2">
          <Label htmlFor="surface" className="flex items-center gap-2">
            <Maximize className="h-4 w-4" />
            {t('form.details.surface', 'Surface Area')} (m²)
          </Label>
          <div className="relative">
            <Input
              id="surface"
              type="text"
              inputMode="numeric"
              value={state.surface}
              onChange={handleSurfaceChange}
              placeholder="e.g. 85"
              className="pr-12"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">m²</span>
          </div>
          <p className="text-xs text-gray-500">
            {t('form.details.surfaceHint', 'Total living area in square meters')}
          </p>
        </div>
      </div>

      {/* Writing Tips */}
      <div className="bg-gray-50 rounded-lg p-4 mt-6">
        <h3 className="font-medium text-gray-900 mb-2">
          {t('form.details.writingTips', 'Writing Tips')}
        </h3>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>
            {t('form.details.tip1', 'Highlight unique features (view, location, renovations)')}
          </li>
          <li>{t('form.details.tip2', 'Mention nearby amenities (transport, schools, shops)')}</li>
          <li>{t('form.details.tip3', 'Be honest about the condition and any limitations')}</li>
          <li>
            {t(
              'form.details.tip4',
              'Use clear, professional language - avoid ALL CAPS or excessive punctuation!!!'
            )}
          </li>
        </ul>
      </div>
    </div>
  );
}

export default StepDetails;
