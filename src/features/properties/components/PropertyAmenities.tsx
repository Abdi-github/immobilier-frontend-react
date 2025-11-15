import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useGetAmenitiesQuery, type Amenity, type MultiLangName } from '@/features/locations/locations.api';

interface PropertyAmenitiesProps {
  amenityIds: string[];
}

// Helper to get localized name
function getLocalizedName(name: MultiLangName | string | undefined, lang: string): string {
  if (!name) return '';
  if (typeof name === 'string') return name;
  return name[lang as keyof MultiLangName] || name.en || '';
}

export function PropertyAmenities({ amenityIds }: PropertyAmenitiesProps) {
  const { t, i18n } = useTranslation('properties');
  const { data: amenitiesData, isLoading } = useGetAmenitiesQuery();

  if (!amenityIds || amenityIds.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('detail.amenities')}</h3>
        <div className="flex flex-wrap gap-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-24" />
          ))}
        </div>
      </div>
    );
  }

  // Map amenity IDs to full amenity objects
  const allAmenities = amenitiesData?.data || [];
  const propertyAmenities = amenityIds
    .map(id => allAmenities.find(a => a.id === id))
    .filter((a): a is Amenity => a !== undefined);

  if (propertyAmenities.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t('detail.amenities')}</h3>
      <div className="flex flex-wrap gap-2">
        {propertyAmenities.map((amenity) => (
          <Badge
            key={amenity.id}
            variant="secondary"
            className="gap-1 px-3 py-1.5"
          >
            <Check className="h-3.5 w-3.5 text-green-600" />
            {getLocalizedName(amenity.name, i18n.language)}
          </Badge>
        ))}
      </div>
    </div>
  );
}
