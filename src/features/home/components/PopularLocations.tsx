import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useGetCantonsQuery, type MultiLangName } from '@/features/locations/locations.api';

type SupportedLang = 'en' | 'fr' | 'de' | 'it';

// Helper to get localized name
const getLocalizedName = (name: MultiLangName | string, lang: string): string => {
  if (typeof name === 'string') return name;
  return name[lang as SupportedLang] || name.en || '';
};

// Popular cantons with images (based on real Swiss data)
const popularCantonCodes = ['ZH', 'GE', 'VD', 'BS', 'BE', 'TI'];

const cantonImages: Record<string, string> = {
  ZH: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=400&h=300&fit=crop', // Zurich
  GE: 'https://images.unsplash.com/photo-1573108724029-4c46571d6490?w=400&h=300&fit=crop', // Geneva
  VD: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=400&h=300&fit=crop', // Vaud/Lausanne
  BS: 'https://images.unsplash.com/photo-1549294413-26f195200c16?w=400&h=300&fit=crop', // Basel
  BE: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=400&h=300&fit=crop', // Bern
  TI: 'https://images.unsplash.com/photo-1583764028506-0d34d2c42a1c?w=400&h=300&fit=crop', // Ticino
};

export function PopularLocations() {
  const { t, i18n } = useTranslation(['home', 'common']);
  
  const { data, isLoading } = useGetCantonsQuery();

  // Filter to get popular cantons
  const popularCantons = data?.data?.filter((canton) =>
    popularCantonCodes.includes(canton.code)
  ) || [];

  return (
    <section className="bg-muted/50 py-16 md:py-20">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-foreground">
            {t('home:locations.title')}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {t('home:locations.subtitle')}
          </p>
        </div>

        {/* Locations grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {popularCantons.map((canton) => (
              <Link
                key={canton.id}
                to={`/${i18n.language}/properties?canton_id=${canton.id}`}
              >
                <Card className="group overflow-hidden transition-all hover:shadow-lg">
                  <div className="relative aspect-[4/3]">
                    <img
                      src={cantonImages[canton.code] || cantonImages.ZH}
                      alt={getLocalizedName(canton.name, i18n.language)}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <CardContent className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        <h3 className="text-xl font-bold">{getLocalizedName(canton.name, i18n.language)}</h3>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="bg-white/20 text-white">
                          {canton.code}
                        </Badge>
                        {canton.propertyCount !== undefined && (
                          <span className="text-sm text-white/80">
                            {canton.propertyCount} {t('common:property', { count: canton.propertyCount })}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* View all cantons link */}
        <div className="mt-8 text-center">
          <Link
            to={`/${i18n.language}/properties`}
            className="text-primary hover:underline"
          >
            {t('home:locations.viewAll')} →
          </Link>
        </div>
      </div>
    </section>
  );
}
