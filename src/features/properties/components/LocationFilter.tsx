import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, MapPin, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { cn } from '@/shared/lib/utils';
import { useGetCantonsQuery, useGetCitiesQuery } from '@/features/locations/locations.api';
import { getLocalizedName } from '@/shared/utils/formatters';

// Location types
export type LocationType = 'city' | 'canton';

export interface SelectedLocation {
  id: string;
  name: string;
  type: LocationType;
  postalCode?: string;
  cantonCode?: string;
}

interface LocationFilterProps {
  selectedLocations: SelectedLocation[];
  onLocationsChange: (locations: SelectedLocation[]) => void;
  lang: string;
}

export function LocationFilter({
  selectedLocations,
  onLocationsChange,
  lang,
}: LocationFilterProps) {
  const { t } = useTranslation('properties');
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch cantons and cities
  const { data: cantonsData } = useGetCantonsQuery();
  const { data: citiesData } = useGetCitiesQuery();

  const cantons = cantonsData?.data || [];
  const cities = citiesData?.data || [];

  // Filter results based on search query
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) {
      // Show popular cantons by default when no search
      return cantons.slice(0, 8).map((canton) => ({
        id: canton.id || canton._id || '',
        name: getLocalizedName(canton.name, lang),
        type: 'canton' as LocationType,
        cantonCode: canton.code,
      }));
    }

    const query = searchQuery.toLowerCase().trim();
    const results: SelectedLocation[] = [];

    // Search cities by name or postal code
    cities.forEach((city) => {
      const cityName = getLocalizedName(city.name, lang).toLowerCase();
      const postalCode = city.postal_code || '';

      if (cityName.includes(query) || postalCode.includes(query)) {
        // Find canton for this city
        const canton = cantons.find((c) => (c.id || c._id) === city.canton_id);
        results.push({
          id: city.id || city._id || '',
          name: getLocalizedName(city.name, lang),
          type: 'city' as LocationType,
          postalCode: city.postal_code,
          cantonCode: canton?.code,
        });
      }
    });

    // Search cantons by name
    cantons.forEach((canton) => {
      const cantonName = getLocalizedName(canton.name, lang).toLowerCase();
      if (cantonName.includes(query)) {
        results.push({
          id: canton.id || canton._id || '',
          name: getLocalizedName(canton.name, lang),
          type: 'canton' as LocationType,
          cantonCode: canton.code,
        });
      }
    });

    // Remove duplicates and limit results
    return results.slice(0, 20);
  }, [searchQuery, cantons, cities, lang]);

  // Check if location is already selected
  const isSelected = useCallback(
    (id: string) => {
      return selectedLocations.some((loc) => loc.id === id);
    },
    [selectedLocations]
  );

  // Add location
  const handleAddLocation = useCallback(
    (location: SelectedLocation) => {
      if (!isSelected(location.id)) {
        onLocationsChange([...selectedLocations, location]);
      }
      setSearchQuery('');
    },
    [selectedLocations, onLocationsChange, isSelected]
  );

  // Remove location
  const handleRemoveLocation = useCallback(
    (id: string) => {
      onLocationsChange(selectedLocations.filter((loc) => loc.id !== id));
    },
    [selectedLocations, onLocationsChange]
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className={cn(
            'h-auto min-h-10 min-w-50 justify-between gap-2 px-3 py-2',
            selectedLocations.length > 0 && 'bg-gray-50'
          )}
        >
          <div className="flex flex-1 flex-wrap items-center gap-1">
            {selectedLocations.length === 0 ? (
              <>
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">{t('filters.location', 'Location')}</span>
              </>
            ) : (
              <>
                {selectedLocations.map((location) => (
                  <span
                    key={location.id}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                  >
                    {location.name}
                    {location.type === 'city' && location.cantonCode && (
                      <span className="text-gray-500">({location.cantonCode})</span>
                    )}
                    {location.type === 'canton' && <span className="text-gray-500">(Canton)</span>}
                    <span
                      aria-label={t('filters.removeLocation', 'Remove location')}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveLocation(location.id);
                      }}
                      className="ml-0.5 inline-flex rounded-full p-0.5 hover:bg-primary/20"
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </span>
                ))}
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Plus className="h-3 w-3" />
                  {t('filters.addLocation', 'Add')}
                </span>
              </>
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="start">
        {/* Search input */}
        <div className="border-b p-3">
          <Input
            type="text"
            placeholder={t('filters.searchLocation', 'Search city, postal code or canton...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
            autoFocus
          />
        </div>

        {/* Results list */}
        <div className="max-h-72 overflow-y-auto p-2">
          {filteredResults.length === 0 ? (
            <p className="p-3 text-center text-sm text-gray-500">
              {t('filters.noLocationsFound', 'No locations found')}
            </p>
          ) : (
            <div className="space-y-1">
              {filteredResults.map((location) => (
                <button
                  key={`${location.type}-${location.id}`}
                  onClick={() => handleAddLocation(location)}
                  disabled={isSelected(location.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm',
                    isSelected(location.id) ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="font-medium">{location.name}</span>
                      {'postalCode' in location && location.postalCode && (
                        <span className="ml-2 text-gray-500">{location.postalCode}</span>
                      )}
                    </div>
                  </div>
                  <span
                    className={cn(
                      'text-xs',
                      location.type === 'canton'
                        ? 'rounded bg-blue-100 px-1.5 py-0.5 text-blue-700'
                        : 'text-gray-400'
                    )}
                  >
                    {location.type === 'canton'
                      ? t('filters.canton', 'Canton')
                      : location.cantonCode || ''}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear all button */}
        {selectedLocations.length > 0 && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-gray-500"
              onClick={() => onLocationsChange([])}
            >
              {t('filters.clearLocations', 'Clear all locations')}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
