/**
 * Step 6: Review & Submit
 * Final review of all property information before submission
 */

import { useTranslation } from 'react-i18next';
import {
  CheckCircle,
  FileText,
  MapPin,
  Home,
  Sparkles,
  Camera,
  Edit,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { cn } from '@/shared/lib/utils';
import { usePropertyForm } from '../context/PropertyFormContext';
import {
  useGetCategoriesQuery,
  useGetCantonsQuery,
  useGetCitiesByCantonQuery,
  useGetAmenitiesQuery,
} from '@/features/locations/locations.api';
import type { SupportedLanguage } from '@/features/auth/auth.types';
import { formatPrice } from '@/shared/utils/formatters';

// Helper to get translated name
function getTranslatedName(
  name: string | Record<SupportedLanguage, string> | undefined,
  language: SupportedLanguage
): string {
  if (!name) return '';
  if (typeof name === 'string') return name;
  return name[language] || name.en || Object.values(name)[0] || '';
}

// Language info
const languageInfo: Record<SupportedLanguage, { flag: string; name: string }> = {
  en: { flag: '🇬🇧', name: 'English' },
  fr: { flag: '🇫🇷', name: 'French' },
  de: { flag: '🇩🇪', name: 'German' },
  it: { flag: '🇮🇹', name: 'Italian' },
};

interface ReviewSectionProps {
  icon: React.ReactNode;
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}

function ReviewSection({ icon, title, onEdit, children }: ReviewSectionProps) {
  const { t } = useTranslation('property');

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onEdit} className="text-primary">
          <Edit className="h-4 w-4 mr-1" />
          {t('form.review.edit', 'Edit')}
        </Button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

interface ReviewItemProps {
  label: string;
  value: string | React.ReactNode;
  className?: string;
}

function ReviewItem({ label, value, className }: ReviewItemProps) {
  return (
    <div className={cn('flex justify-between py-2', className)}>
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}

export function StepReview() {
  const { t, i18n } = useTranslation('property');
  const currentLang = i18n.language as SupportedLanguage;
  const { state, errors, goToStep } = usePropertyForm();

  // Fetch reference data
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: cantonsData } = useGetCantonsQuery();
  const { data: citiesData } = useGetCitiesByCantonQuery(state.canton_id, {
    skip: !state.canton_id,
  });
  const { data: amenitiesData } = useGetAmenitiesQuery();

  const categories = categoriesData?.data || [];
  const cantons = cantonsData?.data || [];
  const cities = citiesData?.data || [];
  const amenities = amenitiesData?.data || [];

  // Find selected items
  const selectedCategory = categories.find((c) => c.id === state.category_id);
  const selectedCanton = cantons.find((c) => c.id === state.canton_id);
  const selectedCity = cities.find((c) => c.id === state.city_id);
  const selectedAmenities = amenities.filter((a) => state.amenities.includes(a.id));

  // Check if all required fields are filled
  const hasBasicInfo = state.category_id && state.transaction_type && state.price;
  const hasLocation = state.canton_id && state.city_id && state.address;
  const hasDetails = state.title && state.description;

  const isComplete = hasBasicInfo && hasLocation && hasDetails;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <CheckCircle className="h-6 w-6 text-primary" />
          {t('form.review.title', 'Review Your Property')}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {t('form.review.subtitle', 'Please review all information before submitting.')}
        </p>
      </div>

      {/* Completeness indicator */}
      {!isComplete && (
        <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <p className="text-sm text-amber-800">
            {t(
              'form.review.incomplete',
              'Some required information is missing. Please complete all sections before submitting.'
            )}
          </p>
        </div>
      )}

      {/* Step 1: Basic Info */}
      <ReviewSection
        icon={<Home className="h-5 w-5 text-primary" />}
        title={t('form.steps.basicInfo', 'Basic Information')}
        onEdit={() => goToStep(1)}
      >
        <div className="space-y-1">
          <ReviewItem
            label={t('form.review.sourceLanguage', 'Content Language')}
            value={
              <span className="flex items-center gap-1">
                {languageInfo[state.source_language].flag}{' '}
                {languageInfo[state.source_language].name}
              </span>
            }
          />
          <Separator />
          <ReviewItem
            label={t('form.review.category', 'Category')}
            value={selectedCategory ? getTranslatedName(selectedCategory.name, currentLang) : '-'}
          />
          <Separator />
          <ReviewItem
            label={t('form.review.transactionType', 'Listing Type')}
            value={
              state.transaction_type === 'rent'
                ? t('form.basicInfo.rent', 'For Rent')
                : t('form.basicInfo.buy', 'For Sale')
            }
          />
          <Separator />
          <ReviewItem
            label={t('form.review.price', 'Price')}
            value={
              state.price ? (
                <span>
                  {formatPrice(Number(state.price), 'CHF')}
                  {state.transaction_type === 'rent' && (
                    <span className="text-gray-500 font-normal">
                      {' '}
                      / {t('common.month', 'month')}
                    </span>
                  )}
                </span>
              ) : (
                '-'
              )
            }
          />
          {state.additional_costs && (
            <>
              <Separator />
              <ReviewItem
                label={t('form.review.additionalCosts', 'Additional Costs')}
                value={`${formatPrice(Number(state.additional_costs), 'CHF')} / ${t('common.month', 'month')}`}
              />
            </>
          )}
        </div>
      </ReviewSection>

      {/* Step 2: Location */}
      <ReviewSection
        icon={<MapPin className="h-5 w-5 text-primary" />}
        title={t('form.steps.location', 'Location')}
        onEdit={() => goToStep(2)}
      >
        <div className="space-y-1">
          <ReviewItem
            label={t('form.review.canton', 'Canton')}
            value={selectedCanton ? getTranslatedName(selectedCanton.name, currentLang) : '-'}
          />
          <Separator />
          <ReviewItem
            label={t('form.review.city', 'City')}
            value={selectedCity ? getTranslatedName(selectedCity.name, currentLang) : '-'}
          />
          <Separator />
          <ReviewItem label={t('form.review.address', 'Address')} value={state.address || '-'} />
          {state.postal_code && (
            <>
              <Separator />
              <ReviewItem
                label={t('form.review.postalCode', 'Postal Code')}
                value={state.postal_code}
              />
            </>
          )}
        </div>
      </ReviewSection>

      {/* Step 3: Details */}
      <ReviewSection
        icon={<FileText className="h-5 w-5 text-primary" />}
        title={t('form.steps.details', 'Property Details')}
        onEdit={() => goToStep(3)}
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">{t('form.review.propertyTitle', 'Title')}</p>
            <p className="font-medium text-gray-900">{state.title || '-'}</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm text-gray-600 mb-1">
              {t('form.review.description', 'Description')}
            </p>
            <p className="text-gray-900 whitespace-pre-wrap line-clamp-4">
              {state.description || '-'}
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <ReviewItem
              label={t('form.review.rooms', 'Rooms')}
              value={state.rooms ? `${state.rooms} ${t('common.rooms', 'rooms')}` : '-'}
            />
            <ReviewItem
              label={t('form.review.surface', 'Surface')}
              value={state.surface ? `${state.surface} m²` : '-'}
            />
          </div>
        </div>
      </ReviewSection>

      {/* Step 4: Amenities */}
      <ReviewSection
        icon={<Sparkles className="h-5 w-5 text-primary" />}
        title={t('form.steps.amenities', 'Features & Amenities')}
        onEdit={() => goToStep(4)}
      >
        {selectedAmenities.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedAmenities.map((amenity) => (
              <span
                key={amenity.id}
                className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
              >
                {getTranslatedName(amenity.name, currentLang)}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">{t('form.review.noAmenities', 'No amenities selected')}</p>
        )}
      </ReviewSection>

      {/* Step 5: Images */}
      <ReviewSection
        icon={<Camera className="h-5 w-5 text-primary" />}
        title={t('form.steps.images', 'Photos')}
        onEdit={() => goToStep(5)}
      >
        {state.imageFiles.length > 0 ? (
          <div>
            <p className="text-sm text-gray-600 mb-3">
              {state.imageFiles.length} {t('form.review.imagesCount', 'photos ready to upload')}
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {state.imagePreviews.slice(0, 8).map((preview, index) => (
                <div
                  key={preview}
                  className={cn(
                    'aspect-square rounded-lg overflow-hidden border-2',
                    index === 0 ? 'border-primary' : 'border-gray-200'
                  )}
                >
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {state.imageFiles.length > 8 && (
                <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                  <span className="text-sm text-gray-600">+{state.imageFiles.length - 8}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-5 w-5" />
            <p>
              {t('form.review.noImages', 'No photos added. Properties with photos get more views.')}
            </p>
          </div>
        )}
      </ReviewSection>

      {/* Submission notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">
          {t('form.review.whatHappensNext', 'What happens next?')}
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• {t('form.review.step1', 'Your property will be saved as a draft')}</li>
          <li>• {t('form.review.step2', 'Images will be uploaded to our secure servers')}</li>
          <li>
            •{' '}
            {t('form.review.step3', 'Content will be automatically translated to other languages')}
          </li>
          <li>• {t('form.review.step4', 'You can submit for approval when ready')}</li>
        </ul>
      </div>

      {/* Global error */}
      {errors.submit && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}
    </div>
  );
}

export default StepReview;
