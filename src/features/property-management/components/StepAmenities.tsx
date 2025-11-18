/**
 * Step 4: Amenities Selection
 * Select property amenities/features
 */

import { useTranslation } from 'react-i18next';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { usePropertyForm } from '../context/PropertyFormContext';
import { useGetAmenitiesQuery } from '@/features/locations/locations.api';
import type { SupportedLanguage } from '@/features/auth/auth.types';

// Helper to get translated name
function getTranslatedName(
  name: string | Record<SupportedLanguage, string>,
  language: SupportedLanguage
): string {
  if (typeof name === 'string') return name;
  return name[language] || name.en || Object.values(name)[0] || '';
}

// Group amenities by category (if available)
function groupAmenities<T extends { category?: string }>(amenities: T[]): Record<string, T[]> {
  return amenities.reduce(
    (groups, amenity) => {
      const category = amenity.category || 'general';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(amenity);
      return groups;
    },
    {} as Record<string, T[]>
  );
}

// Category display names
const categoryNames: Record<string, Record<SupportedLanguage, string>> = {
  general: {
    en: 'General Features',
    fr: 'Caractéristiques générales',
    de: 'Allgemeine Merkmale',
    it: 'Caratteristiche generali',
  },
  interior: { en: 'Interior', fr: 'Intérieur', de: 'Innenausstattung', it: 'Interni' },
  exterior: { en: 'Exterior', fr: 'Extérieur', de: 'Außenbereich', it: 'Esterni' },
  building: { en: 'Building', fr: 'Immeuble', de: 'Gebäude', it: 'Edificio' },
  parking: {
    en: 'Parking & Transport',
    fr: 'Parking & Transport',
    de: 'Parken & Verkehr',
    it: 'Parcheggio & Trasporti',
  },
  security: { en: 'Security', fr: 'Sécurité', de: 'Sicherheit', it: 'Sicurezza' },
  energy: {
    en: 'Energy & Environment',
    fr: 'Énergie & Environnement',
    de: 'Energie & Umwelt',
    it: 'Energia & Ambiente',
  },
  accessibility: {
    en: 'Accessibility',
    fr: 'Accessibilité',
    de: 'Barrierefreiheit',
    it: 'Accessibilità',
  },
};

export function StepAmenities() {
  const { t, i18n } = useTranslation('property');
  const currentLang = i18n.language as SupportedLanguage;
  const { state, toggleAmenity } = usePropertyForm();

  // Fetch amenities
  const { data: amenitiesData, isLoading, error } = useGetAmenitiesQuery();
  const amenities = amenitiesData?.data || [];

  // Group amenities by category
  const groupedAmenities = groupAmenities(amenities);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-gray-600">
          {t('form.amenities.loading', 'Loading amenities...')}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{t('form.amenities.error', 'Failed to load amenities')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          {t('form.amenities.title', 'Property Features')}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {t(
            'form.amenities.subtitle',
            'Select all amenities and features that apply to your property.'
          )}
        </p>
      </div>

      {/* Selected count */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-900">
          <span className="font-semibold">{state.amenities.length}</span>{' '}
          {t('form.amenities.selectedCount', 'features selected')}
        </p>
      </div>

      {/* Amenity groups */}
      <div className="space-y-8">
        {Object.entries(groupedAmenities).map(([category, categoryAmenities]) => (
          <div key={category} className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              {categoryNames[category]?.[currentLang] || category}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categoryAmenities.map((amenity) => {
                const isSelected = state.amenities.includes(amenity.id);
                const displayName = getTranslatedName(amenity.name, currentLang);

                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.id)}
                    className={cn(
                      'relative flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left',
                      'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                      isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white'
                    )}
                  >
                    {/* Checkbox indicator */}
                    <div
                      className={cn(
                        'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                        isSelected ? 'bg-primary border-primary' : 'border-gray-300 bg-white'
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>

                    {/* Amenity name */}
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isSelected ? 'text-primary' : 'text-gray-700'
                      )}
                    >
                      {displayName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state if no amenities */}
      {(!amenities || amenities.length === 0) && (
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-2 text-gray-600">
            {t('form.amenities.noAmenities', 'No amenities available')}
          </p>
        </div>
      )}

      {/* Tip */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          <strong>{t('common.tip', 'Tip')}:</strong>{' '}
          {t(
            'form.amenities.tip',
            'Properties with more detailed amenities get up to 40% more inquiries. Be thorough!'
          )}
        </p>
      </div>
    </div>
  );
}

export default StepAmenities;
