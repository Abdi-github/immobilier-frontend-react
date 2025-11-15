import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, Link } from 'react-router-dom';
import { Bell, MapPin, List, ChevronRight, ChevronLeft, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { cn } from '@/shared/lib/utils';
import { PropertyCardGrid } from '../components/PropertyCardGrid';
import { PropertyTypeFilter } from '../components/PropertyTypeFilter';
import { LocationFilter, SelectedLocation } from '../components/LocationFilter';
import {
  MinMaxFilter,
  PRICE_OPTIONS_RENT,
  PRICE_OPTIONS_BUY,
  ROOMS_OPTIONS,
  SURFACE_OPTIONS,
  formatSwissPrice,
  formatRooms,
  formatSurface,
} from '../components/MinMaxFilter';
import { useGetPropertiesQuery } from '../properties.api';
import {
  useGetCategoriesQuery,
  useGetCantonsQuery,
  useGetCitiesQuery,
} from '@/features/locations/locations.api';
import { getLocalizedName } from '@/shared/utils/formatters';
import { useFavorites } from '@/shared/hooks/useFavorites';
import { SEO } from '@/shared/components/SEO';

export function PropertiesPage() {
  const { t, i18n } = useTranslation(['properties', 'common']);
  const [searchParams, setSearchParams] = useSearchParams();
  const lang = i18n.language;

  // Favorites hook for heart button
  const { isFavorite, toggleFavorite } = useFavorites();

  // Fetch categories for filter
  const { data: categoriesData } = useGetCategoriesQuery();
  const categories = categoriesData?.data || [];

  // Fetch locations for reconstructing selected locations
  const { data: cantonsData } = useGetCantonsQuery();
  const { data: citiesData } = useGetCitiesQuery();
  const cantons = cantonsData?.data || [];
  const cities = citiesData?.data || [];

  // Parse selected category IDs from URL (supports multi-select)
  const selectedCategoryIds = searchParams.get('category_id')?.split(',').filter(Boolean) || [];

  // Parse selected locations from URL
  const selectedLocations: SelectedLocation[] = useMemo(() => {
    const locations: SelectedLocation[] = [];

    // Get canton IDs from URL (comma-separated)
    const cantonIds = searchParams.get('canton_id')?.split(',').filter(Boolean) || [];
    cantonIds.forEach((cantonId) => {
      const canton = cantons.find((c) => (c.id || c._id) === cantonId);
      if (canton) {
        locations.push({
          id: canton.id || canton._id || cantonId,
          name: getLocalizedName(canton.name, lang),
          type: 'canton',
          cantonCode: canton.code,
        });
      }
    });

    // Get city IDs from URL (comma-separated)
    const cityIds = searchParams.get('city_id')?.split(',').filter(Boolean) || [];
    cityIds.forEach((cityId) => {
      const city = cities.find((c) => (c.id || c._id) === cityId);
      if (city) {
        const canton = cantons.find((c) => (c.id || c._id) === city.canton_id);
        locations.push({
          id: city.id || city._id || cityId,
          name: getLocalizedName(city.name, lang),
          type: 'city',
          postalCode: city.postal_code,
          cantonCode: canton?.code,
        });
      }
    });

    return locations;
  }, [searchParams, cantons, cities, lang]);

  // Build query params from URL - use API param names (price_min, rooms_min, etc.)
  const queryParams = {
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: parseInt(searchParams.get('limit') || '21', 10),
    transaction_type: searchParams.get('transaction_type') as 'rent' | 'buy' | undefined,
    section: searchParams.get('section') as 'residential' | 'commercial' | undefined,
    category_id: searchParams.get('category_id') || undefined,
    canton_id: searchParams.get('canton_id') || undefined,
    city_id: searchParams.get('city_id') || undefined,
    price_min: searchParams.get('price_min')
      ? parseInt(searchParams.get('price_min')!, 10)
      : undefined,
    price_max: searchParams.get('price_max')
      ? parseInt(searchParams.get('price_max')!, 10)
      : undefined,
    rooms_min: searchParams.get('rooms_min')
      ? parseFloat(searchParams.get('rooms_min')!)
      : undefined,
    rooms_max: searchParams.get('rooms_max')
      ? parseFloat(searchParams.get('rooms_max')!)
      : undefined,
    surface_min: searchParams.get('surface_min')
      ? parseInt(searchParams.get('surface_min')!, 10)
      : undefined,
    surface_max: searchParams.get('surface_max')
      ? parseInt(searchParams.get('surface_max')!, 10)
      : undefined,
    sort_by: searchParams.get('sort_by') || 'published_at',
    sort_order: (searchParams.get('sort_order') || 'desc') as 'asc' | 'desc',
    q: searchParams.get('q') || undefined,
    status: 'PUBLISHED',
  };

  const { data, isLoading, isError, isFetching } = useGetPropertiesQuery(queryParams);

  const transactionType = searchParams.get('transaction_type') || 'rent';
  const currentSort = `${queryParams.sort_by}-${queryParams.sort_order}`;
  // Use 'meta' from API response (the actual field name)
  const pagination = data?.meta;
  const properties = data?.data || [];

  // Handlers
  const handleTransactionChange = (type: 'rent' | 'buy') => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('transaction_type', type);
    newParams.set('page', '1');
    // Clear price filters when switching between rent/buy since price ranges differ
    newParams.delete('price_min');
    newParams.delete('price_max');
    setSearchParams(newParams);
  };

  // Handle location filter changes
  const handleLocationsChange = useCallback(
    (locations: SelectedLocation[]) => {
      const newParams = new URLSearchParams(searchParams);

      // Separate cantons and cities
      const cantonIds = locations.filter((l) => l.type === 'canton').map((l) => l.id);
      const cityIds = locations.filter((l) => l.type === 'city').map((l) => l.id);

      // Update URL params
      if (cantonIds.length > 0) {
        newParams.set('canton_id', cantonIds.join(','));
      } else {
        newParams.delete('canton_id');
      }

      if (cityIds.length > 0) {
        newParams.set('city_id', cityIds.join(','));
      } else {
        newParams.delete('city_id');
      }

      newParams.set('page', '1');
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const handleCategoryChange = useCallback(
    (categoryIds: string[]) => {
      const newParams = new URLSearchParams(searchParams);
      if (categoryIds.length === 0) {
        newParams.delete('category_id');
      } else {
        newParams.set('category_id', categoryIds.join(','));
      }
      newParams.set('page', '1');
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const handlePriceMinChange = useCallback(
    (value: number | undefined) => {
      const newParams = new URLSearchParams(searchParams);
      if (value === undefined) {
        newParams.delete('price_min');
      } else {
        newParams.set('price_min', value.toString());
      }
      newParams.set('page', '1');
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const handlePriceMaxChange = useCallback(
    (value: number | undefined) => {
      const newParams = new URLSearchParams(searchParams);
      if (value === undefined) {
        newParams.delete('price_max');
      } else {
        newParams.set('price_max', value.toString());
      }
      newParams.set('page', '1');
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const handleRoomsMinChange = useCallback(
    (value: number | undefined) => {
      const newParams = new URLSearchParams(searchParams);
      if (value === undefined) {
        newParams.delete('rooms_min');
      } else {
        newParams.set('rooms_min', value.toString());
      }
      newParams.set('page', '1');
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const handleRoomsMaxChange = useCallback(
    (value: number | undefined) => {
      const newParams = new URLSearchParams(searchParams);
      if (value === undefined) {
        newParams.delete('rooms_max');
      } else {
        newParams.set('rooms_max', value.toString());
      }
      newParams.set('page', '1');
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const handleSurfaceMinChange = useCallback(
    (value: number | undefined) => {
      const newParams = new URLSearchParams(searchParams);
      if (value === undefined) {
        newParams.delete('surface_min');
      } else {
        newParams.set('surface_min', value.toString());
      }
      newParams.set('page', '1');
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const handleSurfaceMaxChange = useCallback(
    (value: number | undefined) => {
      const newParams = new URLSearchParams(searchParams);
      if (value === undefined) {
        newParams.delete('surface_max');
      } else {
        newParams.set('surface_max', value.toString());
      }
      newParams.set('page', '1');
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const handleSortChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    const [sortBy, sortOrder] = value.split('-');
    if (sortBy) newParams.set('sort_by', sortBy);
    if (sortOrder) newParams.set('sort_order', sortOrder);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    if (!pagination) return [];
    const pages: (number | string)[] = [];
    const total = pagination.totalPages;
    const current = pagination.page;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={t('properties:seo.title', 'Properties for Rent & Sale in Switzerland')}
        description={t(
          'properties:seo.description',
          'Browse apartments, houses and commercial properties available for rent and sale across Switzerland.'
        )}
      />
      {/* Top Search Bar - immobilier.ch style */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          {/* Transaction type toggle + Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Rent/Buy Toggle */}
            <div className="flex overflow-hidden rounded-full border border-gray-300">
              <button
                className={cn(
                  'px-6 py-2 text-sm font-medium transition-colors',
                  transactionType === 'rent'
                    ? 'bg-[#1a1a2e] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                )}
                onClick={() => handleTransactionChange('rent')}
              >
                {t('properties:filters.rent', 'Rent')}
              </button>
              <button
                className={cn(
                  'px-6 py-2 text-sm font-medium transition-colors',
                  transactionType === 'buy'
                    ? 'bg-[#1a1a2e] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                )}
                onClick={() => handleTransactionChange('buy')}
              >
                {t('properties:filters.buy', 'Buy')}
              </button>
            </div>

            {/* Category multi-select dropdown with checkboxes */}
            <PropertyTypeFilter
              categories={categories}
              selectedIds={selectedCategoryIds}
              onChange={handleCategoryChange}
              lang={lang}
            />

            {/* Location multi-select dropdown */}
            <LocationFilter
              selectedLocations={selectedLocations}
              onLocationsChange={handleLocationsChange}
              lang={lang}
            />

            {/* Price min-max dropdown */}
            <MinMaxFilter
              label={
                transactionType === 'rent'
                  ? t('properties:filters.rentAmount', 'Rent amount')
                  : t('properties:filters.price', 'Price')
              }
              minValue={queryParams.price_min}
              maxValue={queryParams.price_max}
              onMinChange={handlePriceMinChange}
              onMaxChange={handlePriceMaxChange}
              options={transactionType === 'rent' ? PRICE_OPTIONS_RENT : PRICE_OPTIONS_BUY}
              formatValue={formatSwissPrice}
            />

            {/* Rooms min-max dropdown */}
            <MinMaxFilter
              label={t('properties:filters.rooms', 'Rooms')}
              minValue={queryParams.rooms_min}
              maxValue={queryParams.rooms_max}
              onMinChange={handleRoomsMinChange}
              onMaxChange={handleRoomsMaxChange}
              options={ROOMS_OPTIONS}
              formatValue={formatRooms}
            />

            {/* Surface min-max dropdown */}
            <MinMaxFilter
              label={t('properties:filters.surface', 'Surface')}
              minValue={queryParams.surface_min}
              maxValue={queryParams.surface_max}
              onMinChange={handleSurfaceMinChange}
              onMaxChange={handleSurfaceMaxChange}
              options={SURFACE_OPTIONS}
              formatValue={formatSurface}
            />

            {/* Spacer */}
            <div className="flex-1" />

            {/* Create alert button */}
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              {t('properties:list.createAlert', 'Create your e-mail alert')}
            </Button>
          </div>
        </div>
      </div>

      {/* Secondary toolbar - Results count, List/Map toggle, Sort */}
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          {/* Results count */}
          <div className="text-sm text-gray-600">
            {pagination ? (
              <span>
                {t(
                  'properties:list.resultsRange',
                  '{{start}}-{{end}} of {{total}} properties found',
                  {
                    start: (pagination.page - 1) * pagination.limit + 1,
                    end: Math.min(pagination.page * pagination.limit, pagination.total),
                    total: pagination.total.toLocaleString('de-CH'), // Swiss format with apostrophe
                  }
                )}
              </span>
            ) : (
              <Skeleton className="h-4 w-32" />
            )}
          </div>

          {/* List/Map toggle + Sort */}
          <div className="flex items-center gap-4">
            {/* List/Map toggle */}
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 text-sm font-medium text-primary">
                <List className="h-4 w-4" />
                {t('properties:list.listView', 'List')}
              </button>
              <Link
                to={`/${lang}/properties/map`}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary"
              >
                <MapPin className="h-4 w-4" />
                {t('properties:list.map', 'Map')}
              </Link>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{t('properties:list.sort', 'Sort')} :</span>
              <Select value={currentSort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-36 border-0 bg-transparent p-0 text-sm font-medium text-primary shadow-none focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="is_top-desc">
                    {t('properties:sort.topOffers', 'TOP offers')}
                  </SelectItem>
                  <SelectItem value="published_at-desc">
                    {t('properties:sort.newest', 'Newest listed')}
                  </SelectItem>
                  <SelectItem value="published_at-asc">
                    {t('properties:sort.oldest', 'Oldest listed')}
                  </SelectItem>
                  <SelectItem value="price-asc">
                    {t('properties:sort.priceAsc', 'Price (ascending)')}
                  </SelectItem>
                  <SelectItem value="price-desc">
                    {t('properties:sort.priceDesc', 'Price (descending)')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main content - full width, no sidebar, 3 columns on large screens */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Location breadcrumb/title */}
        <h2 className="mb-4 text-sm text-gray-600">
          {transactionType === 'rent'
            ? t('properties:list.rentIn', 'Rent in Switzerland')
            : t('properties:list.buyIn', 'Buy in Switzerland')}
        </h2>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="overflow-hidden rounded-lg bg-white shadow-sm">
                <Skeleton className="aspect-4/3 w-full" />
                <div className="space-y-3 p-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-40" />
                  <div className="flex gap-4 pt-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-red-600">
              {t('common:errors.loadFailed', 'Failed to load properties')}
            </p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              {t('common:actions.retry', 'Retry')}
            </Button>
          </div>
        )}

        {/* Properties grid - 3 columns on large screens like immobilier.ch */}
        {!isLoading && !isError && properties.length > 0 && (
          <div
            className={cn(
              'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3',
              isFetching && 'opacity-60'
            )}
          >
            {properties.map((property) => (
              <PropertyCardGrid
                key={property.id}
                property={property}
                onFavorite={toggleFavorite}
                isFavorite={isFavorite(property.id)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && properties.length === 0 && (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {t('properties:list.noResults', 'No properties found')}
            </h3>
            <p className="mt-2 text-gray-600">
              {t('properties:list.noResultsHint', 'Try adjusting your search criteria')}
            </p>
          </div>
        )}

        {/* Email alert banner - after first page results */}
        {!isLoading && properties.length > 0 && pagination && pagination.page === 1 && (
          <div className="my-6 flex items-center justify-between rounded-lg bg-[#1a1a2e] p-4 text-white">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5" />
              <span className="text-sm">
                {t('properties:list.alertBanner.subtitle', 'Receive new properties by email')}
              </span>
            </div>
            <Button size="sm" className="bg-white text-[#1a1a2e] hover:bg-gray-100">
              {t('properties:list.alertBanner.cta', 'Create your e-mail alert')}
            </Button>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-1">
              {/* Previous button */}
              <Button
                variant="ghost"
                size="sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page numbers */}
              {getPageNumbers().map((pageNum, idx) =>
                pageNum === '...' ? (
                  <span key={`dots-${idx}`} className="px-2 text-gray-400">
                    ...
                  </span>
                ) : (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handlePageChange(pageNum as number)}
                    className={cn(
                      'min-w-8',
                      pagination.page === pageNum && 'bg-primary text-white'
                    )}
                  >
                    {pageNum}
                  </Button>
                )
              )}

              {/* Next button */}
              <Button
                variant="ghost"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                <span className="mr-1">{t('common:pagination.next', 'Next')}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Page indicator */}
            <p className="text-sm text-gray-500">
              {t('properties:list.pageIndicator', 'Page {{current}} on {{total}}', {
                current: pagination.page,
                total: pagination.totalPages,
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
