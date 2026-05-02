import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  BedDouble,
  Maximize,
  Calendar,
  Building2,
  ChevronRight,
  Heart,
  Share2,
  Printer,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Separator } from '@/shared/components/ui/separator';
import { formatPrice, formatArea, formatDate, getLocalizedName } from '@/shared/utils/formatters';
import { cn } from '@/shared/lib/utils';
import { PropertyGallery } from '../components/PropertyGallery';
import { PropertyAmenities } from '../components/PropertyAmenities';
import { PropertyContact } from '../components/PropertyContact';
import { PropertyMap } from '../components/PropertyMap';
import { useGetPropertyQuery, useGetPropertyImagesQuery } from '../properties.api';
import { useFavorites } from '@/shared/hooks/useFavorites';
import { SEO } from '@/shared/components/SEO';

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation(['properties', 'common']);
  const lang = i18n.language;

  const { data: propertyData, isLoading, isError } = useGetPropertyQuery(id!);
  const { data: imagesData } = useGetPropertyImagesQuery(id!);
  const { isFavorite, toggleFavorite } = useFavorites();
  const propertyIsFavorite = id ? isFavorite(id) : false;

  const property = propertyData?.data;
  const images = imagesData?.data || property?.images || [];
  const locationPrecisionMessage =
    property?.location_precision === 'postal_code'
      ? t('properties:map.approximatePostalCode')
      : property?.location_precision === 'city'
        ? t('properties:map.approximateCity')
        : property?.location_precision === 'canton'
          ? t('properties:map.approximateCanton')
          : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="mb-4 h-8 w-64" />
          <Skeleton className="aspect-video w-full rounded-xl" />
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div>
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto flex flex-col items-center justify-center px-4 py-20">
          <Building2 className="h-16 w-16 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold">{t('properties:detail.notFound')}</h1>
          <p className="mt-2 text-muted-foreground">{t('properties:detail.notFoundDescription')}</p>
          <Button asChild className="mt-6">
            <Link to={`/${i18n.language}/properties`}>{t('properties:detail.backToList')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={property.title}
        description={property.description?.slice(0, 160)}
        image={images?.[0]?.url}
      />
      {/* Breadcrumb */}
      <div className="border-b bg-white">
        <div className="container mx-auto  max-w-7xl px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to={`/${i18n.language}`} className="hover:text-primary">
              {t('common:nav.home')}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link to={`/${i18n.language}/properties`} className="hover:text-primary">
              {t('common:nav.properties')}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="truncate text-foreground">{property.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto  max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={property.transaction_type === 'rent' ? 'primary' : 'default'}>
                {t(`common:transaction.${property.transaction_type}`)}
              </Badge>
              {property.category && (
                <Badge variant="outline">{getLocalizedName(property.category.name, lang)}</Badge>
              )}
            </div>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl">{property.title}</h1>
            <div className="mt-2 flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {property.address}
                {property.city && `, ${getLocalizedName(property.city.name, lang)}`}
                {property.canton && ` (${property.canton.code})`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => id && toggleFavorite(id)}
              className={cn(
                propertyIsFavorite && 'text-red-500 border-red-200 bg-red-50 hover:bg-red-100'
              )}
            >
              <Heart className={cn('h-4 w-4', propertyIsFavorite && 'fill-current')} />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Image gallery */}
        
        <div className="h-100 md:h-140">
          <PropertyGallery images={images} title={property.title} />
        </div>

        {/* Main content */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Left column - Details */}
          <div className="space-y-8 lg:col-span-2">
            {/* Price and key features */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('properties:detail.price')}</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatPrice(property.price, property.currency)}
                    {property.transaction_type === 'rent' && (
                      <span className="text-lg font-normal text-muted-foreground">
                        {' '}
                        /{t('common:month')}
                      </span>
                    )}
                  </p>
                  {property.additional_costs && property.additional_costs > 0 && (
                    <p className="text-sm text-muted-foreground">
                      + {formatPrice(property.additional_costs, property.currency)}{' '}
                      {t('properties:detail.additionalCosts')}
                    </p>
                  )}
                </div>

                <div className="flex gap-6">
                  {property.rooms !== undefined && property.rooms > 0 && (
                    <div className="text-center">
                      <BedDouble className="mx-auto h-6 w-6 text-primary" />
                      <p className="mt-1 text-lg font-semibold">{property.rooms}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('common:rooms', { count: property.rooms })}
                      </p>
                    </div>
                  )}
                  {property.surface !== undefined && property.surface > 0 && (
                    <div className="text-center">
                      <Maximize className="mx-auto h-6 w-6 text-primary" />
                      <p className="mt-1 text-lg font-semibold">{formatArea(property.surface)}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('properties:detail.surface')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">{t('properties:detail.description')}</h2>
              <Separator className="my-4" />
              <div className="prose prose-gray max-w-none">
                <p className="whitespace-pre-line text-muted-foreground">{property.description}</p>
              </div>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <PropertyAmenities amenityIds={property.amenities} />
              </div>
            )}

            {/* Location details */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">{t('properties:detail.location')}</h2>
              <Separator className="my-4" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">{t('properties:detail.address')}</p>
                  <p className="font-medium">{property.address}</p>
                </div>
                {property.city && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('properties:detail.city')}</p>
                    <p className="font-medium">{getLocalizedName(property.city.name, lang)}</p>
                  </div>
                )}
                {property.canton && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('properties:detail.canton')}</p>
                    <p className="font-medium">
                      {getLocalizedName(property.canton.name, lang)} ({property.canton.code})
                    </p>
                  </div>
                )}
                {property.postal_code && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('properties:detail.postalCode')}
                    </p>
                    <p className="font-medium">{property.postal_code}</p>
                  </div>
                )}
              </div>

              {locationPrecisionMessage && (
                <div className="mt-4 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {locationPrecisionMessage}
                </div>
              )}

              {/* Map */}
              <div className="mt-6">
                <PropertyMap
                  lat={property.latitude}
                  lng={property.longitude}
                  address={property.address}
                />
              </div>
            </div>

            {/* Proximity / Nearby */}
            {property.proximity && Object.keys(property.proximity).length > 0 && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold">{t('properties:detail.nearby')}</h2>
                <Separator className="my-4" />
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(property.proximity).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground">{key}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {property.published_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {t('properties:detail.publishedOn')}{' '}
                    {formatDate(property.published_at, i18n.language)}
                  </span>
                </div>
              )}
              <div>
                <span>
                  {t('properties:detail.reference')}: {property.external_id}
                </span>
              </div>
            </div>
          </div>

          {/* Right column - Contact form */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <PropertyContact property={property} />
          </div>
        </div>
      </div>
    </div>
  );
}
