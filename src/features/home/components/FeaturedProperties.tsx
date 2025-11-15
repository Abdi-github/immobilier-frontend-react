import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { PropertyCard } from '@/features/properties/components/PropertyCard';
import { useGetPropertiesQuery } from '@/features/properties/properties.api';

export function FeaturedProperties() {
  const { t, i18n } = useTranslation(['home', 'common']);
  
  const { data, isLoading, isError } = useGetPropertiesQuery({
    limit: 6,
    status: 'PUBLISHED',
  });

  if (isError) {
    return null;
  }

  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-4">
        {/* Section header - matching immobilier.ch style */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#1a1a2e]">
              {t('home:featured.title', 'Latest properties')}
            </h2>
          </div>
          <Button variant="link" asChild className="text-primary p-0">
            <Link to={`/${i18n.language}/properties`} className="gap-1">
              {t('home:featured.viewAll', 'View all properties')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Properties grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-4 pt-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data?.data?.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!data?.data || data.data.length === 0) && (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-600">
              {t('home:featured.noProperties', 'No properties available at the moment.')}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
