import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useGetAgenciesQuery } from '../agencies.api';
import { useGetCantonsQuery, useGetCitiesQuery } from '@/features/locations/locations.api';
import { AgencyCard } from '../components/AgencyCard';
import { AgencySearchInput, SearchResult } from '../components/AgencySearchInput';
import { getLocalizedName } from '@/shared/utils/formatters';
import { SEO } from '@/shared/components/SEO';

export function AgenciesPage() {
  const { t, i18n } = useTranslation(['agencies', 'common']);
  const lang = i18n.language;
  const [searchParams, setSearchParams] = useSearchParams();

  // Get search params
  const cantonId = searchParams.get('canton_id') || '';
  const cityId = searchParams.get('city_id') || '';
  const agencySearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;

  // State for search inputs
  const [agencyNameSearch, setAgencyNameSearch] = useState(agencySearch);

  // Fetch data for location names
  const { data: cantonsData } = useGetCantonsQuery();
  const { data: citiesData } = useGetCitiesQuery();
  const cantons = cantonsData?.data || [];
  const cities = citiesData?.data || [];

  // Determine if we should show results (only if location or search is provided)
  const hasSearchCriteria = !!(cantonId || cityId || agencySearch);

  // Query params for agencies - only query if we have search criteria
  const queryParams = hasSearchCriteria
    ? {
        page: currentPage,
        limit,
        search: agencySearch || undefined,
        canton_id: cantonId || undefined,
        city_id: cityId || undefined,
      }
    : undefined;

  // Fetch agencies only when we have search criteria
  const {
    data: agenciesData,
    isLoading,
    isFetching,
  } = useGetAgenciesQuery(queryParams, {
    skip: !hasSearchCriteria,
  });

  const agencies = agenciesData?.data || [];
  const pagination = agenciesData?.meta;
  const totalPages = pagination?.totalPages || 1;

  // Get location names for display
  const locationInfo = useMemo(() => {
    if (cityId) {
      const city = cities.find((c) => (c.id || c._id) === cityId);
      if (city) {
        const canton = cantons.find((c) => (c.id || c._id) === city.canton_id);
        return {
          type: 'city' as const,
          name: getLocalizedName(city.name, lang),
          cantonName: canton ? getLocalizedName(canton.name, lang) : '',
          cantonCode: canton?.code || '',
        };
      }
    }
    if (cantonId) {
      const canton = cantons.find((c) => (c.id || c._id) === cantonId);
      if (canton) {
        return {
          type: 'canton' as const,
          name: getLocalizedName(canton.name, lang),
          cantonCode: canton.code,
        };
      }
    }
    return null;
  }, [cantonId, cityId, cantons, cities, lang]);

  // Handle location selection from autocomplete
  const handleLocationSelect = (result: SearchResult) => {
    const newParams = new URLSearchParams();
    if (result.type === 'canton') {
      newParams.set('canton_id', result.id);
    } else {
      newParams.set('city_id', result.id);
    }
    if (agencyNameSearch) {
      newParams.set('search', agencyNameSearch);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  // Handle agency name search
  const handleAgencySearch = () => {
    const newParams = new URLSearchParams(searchParams);
    if (agencyNameSearch) {
      newParams.set('search', agencyNameSearch);
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear all filters
  const handleClearSearch = () => {
    setAgencyNameSearch('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={t('agencies:seo.title', 'Real Estate Agencies in Switzerland')}
        description={t(
          'agencies:seo.description',
          'Find trusted real estate agencies across Switzerland. Browse agency profiles, property listings, and contact information.'
        )}
      />
      {/* Hero Banner with Search */}
      <div
        className="relative bg-cover bg-center"
        style={{
          backgroundImage:
            'linear-gradient(rgba(26, 26, 46, 0.7), rgba(26, 26, 46, 0.8)), url("https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80")',
          minHeight: hasSearchCriteria ? '200px' : '400px',
        }}
      >
        <div className="mx-auto max-w-4xl px-4 py-12">
          {!hasSearchCriteria && (
            <h1 className="mb-8 text-center text-3xl font-bold text-white md:text-4xl">
              {t('hero.title', 'Find the agency that suits you best')}
            </h1>
          )}

          {/* Search Form */}
          <div className="flex flex-col gap-3 md:flex-row md:gap-4">
            {/* Location Search with Autocomplete */}
            <AgencySearchInput onSelect={handleLocationSelect} lang={lang} className="flex-1" />

            {/* Agency Name Search */}
            <div className="relative flex-1">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder={t('search.agencyNamePlaceholder', 'Agency name')}
                value={agencyNameSearch}
                onChange={(e) => setAgencyNameSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAgencySearch()}
                className="h-12 bg-white pl-10"
              />
            </div>

            {/* Search Button */}
            <Button onClick={handleAgencySearch} className="h-12 px-6" disabled={isFetching}>
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {!hasSearchCriteria && (
            <p className="mt-4 text-center text-sm text-white/80">
              {t(
                'search.hint',
                'Search by city, ZIP or canton to display the corresponding agencies.'
              )}
            </p>
          )}
        </div>
      </div>

      {/* Results Section - Only show when we have search criteria */}
      {hasSearchCriteria && (
        <div className="mx-auto max-w-5xl px-4 py-8">
          {/* Breadcrumbs */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
            <Link to={`/${lang}`} className="hover:text-primary">
              {t('common:navigation.home', 'Home')}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              to={`/${lang}/agencies`}
              className="hover:text-primary"
              onClick={handleClearSearch}
            >
              {t('agencies:breadcrumbs.agencies', 'Agencies')}
            </Link>
            {locationInfo && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-900">{locationInfo.name}</span>
              </>
            )}
          </nav>

          {/* Results Header */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {locationInfo
                ? locationInfo.type === 'canton'
                  ? t('results.titleCanton', 'immobilier.ch agencies in {{name}} canton', {
                      name: locationInfo.name,
                    })
                  : t('results.titleCity', 'immobilier.ch agencies in {{name}}', {
                      name: locationInfo.name,
                    })
                : agencySearch
                  ? t('results.titleSearch', 'Search results for "{{search}}"', {
                      search: agencySearch,
                    })
                  : t('results.titleAll', 'All agencies')}
            </h2>

            {pagination && (
              <p className="mt-2 text-sm text-gray-600">
                {t('results.showing', 'Showing {{from}}-{{to}} of {{total}} agencies', {
                  from: (currentPage - 1) * limit + 1,
                  to: Math.min(currentPage * limit, pagination.total),
                  total: pagination.total,
                })}
              </p>
            )}
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 rounded-lg border bg-white p-4">
                  <Skeleton className="h-20 w-20 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : agencies.length === 0 ? (
            /* Empty State */
            <div className="rounded-lg border bg-white p-8 text-center">
              <Building2 className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {t('results.noResults', 'No agencies found')}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {t('results.noResultsHint', 'Try adjusting your search criteria')}
              </p>
              <Button variant="outline" className="mt-4" onClick={handleClearSearch}>
                {t('results.clearSearch', 'Clear search')}
              </Button>
            </div>
          ) : (
            /* Agency List */
            <div className="space-y-4">
              {agencies.map((agency) => (
                <AgencyCard key={agency.id} agency={agency} lang={lang} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isFetching}
              >
                <ChevronLeft className="h-4 w-4" />
                {t('common:pagination.previous', 'Previous')}
              </Button>

              <div className="flex items-center gap-1">
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  let page: number;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      disabled={isFetching}
                      className="min-w-10"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isFetching}
              >
                {t('common:pagination.next', 'Next')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Landing Content - Only show when no search criteria */}
      {!hasSearchCriteria && (
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="text-center">
            <Building2 className="mx-auto h-16 w-16 text-gray-300" />
            <h2 className="mt-6 text-2xl font-semibold text-gray-900">
              {t('landing.title', 'Search for real estate agencies')}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-gray-600">
              {t(
                'landing.description',
                'Enter a city or canton name in the search box above to find real estate agencies in your area. You can also search by agency name.'
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
