/**
 * Agency Detail Page
 * Displays full agency profile with properties, map, and contact information.
 */

import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { SEO } from '@/shared/components/SEO';
import { useGetAgencyQuery } from '../agencies.api';
import { useGetPropertiesQuery } from '@/features/properties/properties.api';
import { PropertyCardGrid } from '@/features/properties/components/PropertyCardGrid';
import { useFavorites } from '@/shared/hooks/useFavorites';

export function AgencyDetailPage() {
  const { id, lang } = useParams<{ id: string; lang: string }>();
  const { t, i18n } = useTranslation(['agencies', 'common']);
  const currentLang = lang || i18n.language;
  const { isFavorite, toggleFavorite } = useFavorites();

  const { data: agencyData, isLoading, isError } = useGetAgencyQuery(id!, { skip: !id });
  const agency = agencyData?.data;

  const { data: propertiesData, isLoading: propertiesLoading } = useGetPropertiesQuery(
    { agency_id: id, limit: 6 },
    { skip: !id }
  );
  const properties = propertiesData?.data || [];

  const getCityName = (): string => {
    if (!agency?.city) return '';
    if (typeof agency.city === 'string') return agency.city;
    if (agency.city.name) {
      return (
        agency.city.name[currentLang] ||
        agency.city.name['en'] ||
        Object.values(agency.city.name)[0] ||
        ''
      );
    }
    return '';
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Skeleton className="mb-4 h-8 w-64" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !agency) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Building2 className="mb-4 h-16 w-16 text-gray-300" />
        <h2 className="mb-2 text-xl font-bold">{t('agencies:notFound', 'Agency not found')}</h2>
        <p className="mb-6 text-muted-foreground">
          {t(
            'agencies:notFoundDesc',
            'The agency you are looking for does not exist or has been removed.'
          )}
        </p>
        <Button asChild>
          <Link to={`/${currentLang}/agencies`}>
            {t('agencies:backToList', 'Back to agencies')}
          </Link>
        </Button>
      </div>
    );
  }

  const isVerified = agency.is_verified || agency.verified;
  const cityName = getCityName();
  const websiteUrl = agency.website?.startsWith('http')
    ? agency.website
    : `https://${agency.website}`;

  return (
    <>
      <SEO
        title={agency.name}
        description={`${agency.name} — Real estate agency in ${cityName}, Switzerland. ${agency.total_properties} properties available.`}
      />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to={`/${currentLang}`} className="hover:text-primary">
            {t('common:nav.home', 'Home')}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to={`/${currentLang}/agencies`} className="hover:text-primary">
            {t('agencies:title', 'Agencies')}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{agency.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Agency header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-6">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border bg-gray-50">
                    {agency.logo ? (
                      <img
                        src={agency.logo}
                        alt={agency.name}
                        className="h-full w-full rounded-lg object-contain p-2"
                      />
                    ) : (
                      <Building2 className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold">{agency.name}</h1>
                      {isVerified && (
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {t('agencies:verified', 'Verified')}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {agency.address}, {agency.postal_code} {cityName}
                        {agency.canton && ` (${agency.canton.code})`}
                      </span>
                    </div>

                    {agency.total_properties > 0 && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {agency.total_properties}
                        </span>{' '}
                        {t('agencies:activeListings', 'active listings')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Properties */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{t('agencies:listings', 'Listings')}</span>
                  {agency.total_properties > 6 && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/${currentLang}/properties?agency_id=${id}`}>
                        {t('common:actions.viewAll', 'View all')} →
                      </Link>
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {propertiesLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-72 w-full rounded-lg" />
                    ))}
                  </div>
                ) : properties.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {properties.map((property) => (
                      <PropertyCardGrid
                        key={property.id}
                        property={property}
                        onFavorite={toggleFavorite}
                        isFavorite={isFavorite(property.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-muted-foreground">
                    {t('agencies:noListings', 'No active listings at the moment.')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar — Contact */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('agencies:contactInfo', 'Contact Information')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {agency.contact_person && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('agencies:contactPerson', 'Contact person')}
                    </p>
                    <p className="font-medium">{agency.contact_person}</p>
                  </div>
                )}

                <Separator />

                {agency.phone && (
                  <a
                    href={`tel:${agency.phone}`}
                    className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted"
                  >
                    <Phone className="h-5 w-5 text-primary" />
                    <span>{agency.phone}</span>
                  </a>
                )}

                {agency.email && (
                  <a
                    href={`mailto:${agency.email}`}
                    className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted"
                  >
                    <Mail className="h-5 w-5 text-primary" />
                    <span className="truncate">{agency.email}</span>
                  </a>
                )}

                {agency.website && (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted"
                  >
                    <Globe className="h-5 w-5 text-primary" />
                    <span className="truncate">{agency.website}</span>
                    <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
                  </a>
                )}

                <Separator />

                <Button className="w-full gap-2" asChild>
                  <a href={agency.email ? `mailto:${agency.email}` : '#'}>
                    <Mail className="h-4 w-4" />
                    {t('agencies:sendMessage', 'Send a message')}
                  </a>
                </Button>

                {agency.phone && (
                  <Button variant="outline" className="w-full gap-2" asChild>
                    <a href={`tel:${agency.phone}`}>
                      <Phone className="h-4 w-4" />
                      {t('agencies:callNow', 'Call now')}
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Quick info */}
            <Card>
              <CardContent className="pt-6">
                <dl className="space-y-3 text-sm">
                  {agency.canton && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">{t('agencies:canton', 'Canton')}</dt>
                      <dd className="font-medium">{agency.canton.code}</dd>
                    </div>
                  )}
                  {cityName && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">{t('agencies:city', 'City')}</dt>
                      <dd className="font-medium">{cityName}</dd>
                    </div>
                  )}
                  {agency.postal_code && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">
                        {t('agencies:postalCode', 'Postal code')}
                      </dt>
                      <dd className="font-medium">{agency.postal_code}</dd>
                    </div>
                  )}
                  {agency.created_at && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">
                        {t('agencies:memberSince', 'Member since')}
                      </dt>
                      <dd className="font-medium">
                        {new Date(agency.created_at).toLocaleDateString(currentLang, {
                          year: 'numeric',
                          month: 'long',
                        })}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
