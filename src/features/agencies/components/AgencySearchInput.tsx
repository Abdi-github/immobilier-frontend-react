import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Building2 } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils';
import { useGetCantonsQuery, useGetCitiesQuery } from '@/features/locations/locations.api';
import { getLocalizedName } from '@/shared/utils/formatters';

export type SearchResultType = 'city' | 'canton';

export interface SearchResult {
  id: string;
  name: string;
  type: SearchResultType;
  cantonCode?: string;
  cantonName?: string;
}

interface AgencySearchInputProps {
  onSelect: (result: SearchResult) => void;
  placeholder?: string;
  lang: string;
  className?: string;
}

export function AgencySearchInput({
  onSelect,
  placeholder,
  lang,
  className,
}: AgencySearchInputProps) {
  const { t } = useTranslation('agencies');
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch data
  const { data: cantonsData } = useGetCantonsQuery();
  const { data: citiesData } = useGetCitiesQuery();

  const cantons = cantonsData?.data || [];
  const cities = citiesData?.data || [];

  // Filter results based on query
  const filteredResults = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];

    const searchTerm = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search cantons
    cantons.forEach((canton) => {
      const name = getLocalizedName(canton.name, lang);
      if (name.toLowerCase().includes(searchTerm)) {
        results.push({
          id: canton.id || canton._id || '',
          name: name,
          type: 'canton',
          cantonCode: canton.code,
        });
      }
    });

    // Search cities
    cities.forEach((city) => {
      const name = getLocalizedName(city.name, lang);
      const cantonId = city.canton_id;
      const canton = cantons.find((c) => (c.id || c._id) === cantonId);

      if (name.toLowerCase().includes(searchTerm)) {
        results.push({
          id: city.id || city._id || '',
          name: name,
          type: 'city',
          cantonCode: canton?.code,
          cantonName: canton ? getLocalizedName(canton.name, lang) : undefined,
        });
      }
    });

    // Sort: exact matches first, then cantons, then cities
    return results
      .sort((a, b) => {
        const aExact = a.name.toLowerCase() === searchTerm;
        const bExact = b.name.toLowerCase() === searchTerm;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        if (a.type === 'canton' && b.type === 'city') return -1;
        if (a.type === 'city' && b.type === 'canton') return 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 10);
  }, [query, cantons, cities, lang]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      setQuery('');
      setIsOpen(false);
      onSelect(result);
    },
    [onSelect]
  );

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder || t('search.locationPlaceholder', 'Where? (city, canton)')}
          className="h-12 bg-white pl-10"
        />
      </div>

      {/* Dropdown */}
      {isOpen && filteredResults.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-md border bg-white shadow-lg"
        >
          {filteredResults.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelect(result)}
              className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                {result.type === 'canton' ? (
                  <MapPin className="h-4 w-4 text-blue-500" />
                ) : (
                  <Building2 className="h-4 w-4 text-gray-400" />
                )}
                <div>
                  <span className="font-medium">{result.name}</span>
                  {result.type === 'city' && result.cantonName && (
                    <span className="ml-2 text-sm text-gray-500">- {result.cantonName}</span>
                  )}
                </div>
              </div>
              <span
                className={cn(
                  'rounded px-2 py-0.5 text-xs',
                  result.type === 'canton'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {result.type === 'canton' ? t('search.canton', 'Canton') : t('search.city', 'City')}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {isOpen && query.length >= 2 && filteredResults.length === 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border bg-white p-4 text-center text-sm text-gray-500 shadow-lg"
        >
          {t('search.noResults', 'No locations found')}
        </div>
      )}
    </div>
  );
}
