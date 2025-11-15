import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  useGetPopularCitiesQuery,
  type PopularCity,
  type MultiLangName,
} from '@/features/locations/locations.api';

type SupportedLang = 'en' | 'fr' | 'de' | 'it';

/** Extract a display string from a name that may be a string or multilingual object */
const getLocalizedName = (name: string | MultiLangName, lang: string): string => {
  if (typeof name === 'string') return name;
  return name[lang as SupportedLang] || name.en || name.fr || '';
};

export function CityListings() {
  const { t, i18n } = useTranslation('home');
  const [showAll, setShowAll] = useState(false);
  const lang = i18n.language;

  const { data: citiesData, isLoading } = useGetPopularCitiesQuery();

  const cities: PopularCity[] = citiesData?.data || [];
  const displayCities = showAll ? cities : cities.slice(0, 6);

  if (isLoading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-4 w-96 mx-auto mt-2" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!cities.length) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-[#1a1a2e] md:text-3xl">
            {t('cityListings.title', 'Discover properties by city')}
          </h2>
          <p className="mt-2 text-gray-600">
            {t('cityListings.subtitle', "Browse real estate in Switzerland's most popular cities")}
          </p>
        </div>

        {/* City tiles - alternating 1/3 + 2/3 layout on md+ */}
        <div className="flex flex-col gap-4">
          {Array.from({ length: Math.ceil(displayCities.length / 2) }, (_, rowIdx) => {
            const first = displayCities[rowIdx * 2];
            const second = displayCities[rowIdx * 2 + 1];
            const isEvenRow = rowIdx % 2 === 0;

            return (
              <div key={rowIdx} className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {first && (
                  <CityTile
                    city={first}
                    lang={lang}
                    className={isEvenRow ? 'md:col-span-1' : 'md:col-span-2'}
                    toRentLabel={t('cityListings.toRent', 'to rent')}
                    toBuyLabel={t('cityListings.toBuy', 'to buy')}
                  />
                )}
                {second && (
                  <CityTile
                    city={second}
                    lang={lang}
                    className={isEvenRow ? 'md:col-span-2' : 'md:col-span-1'}
                    toRentLabel={t('cityListings.toRent', 'to rent')}
                    toBuyLabel={t('cityListings.toBuy', 'to buy')}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* See more button */}
        {!showAll && cities.length > 6 && (
          <div className="mt-8 text-center">
            <Button variant="outline" onClick={() => setShowAll(true)} className="gap-2">
              {t('cityListings.seeMore', 'See other cities')}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

interface CityTileProps {
  city: PopularCity;
  lang: string;
  className?: string;
  toRentLabel: string;
  toBuyLabel: string;
}

function CityTile({ city, lang, className, toRentLabel, toBuyLabel }: CityTileProps) {
  const placeholderImage =
    'https://res.cloudinary.com/dzyyygr1x/image/upload/v1770906733/Gen%C3%A8ve_t33k2z.jpg';
  const cityName = getLocalizedName(city.name, lang);
  const cantonName = getLocalizedName(city.canton_name, lang);

  return (
    <div className={`group relative overflow-hidden rounded-xl min-h-[200px] ${className ?? ''}`}>
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={city.image_url || placeholderImage}
          alt={cityName}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
      </div>

      {/* Content overlay */}
      <div className="relative flex h-full flex-col justify-end p-5">
        {/* City name & canton */}
        <h3 className="text-xl font-bold text-white md:text-2xl">{cityName}</h3>
        <span className="text-sm text-white/80">
          {cantonName} ({city.canton_code})
        </span>

        {/* Property count links */}
        <div className="mt-3 flex flex-wrap gap-3">
          {city.rent_count > 0 && (
            <Link
              to={`/${lang}/properties?transaction_type=rent&city_name=${encodeURIComponent(cityName)}`}
              className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              {city.rent_count} {toRentLabel}
            </Link>
          )}
          {city.buy_count > 0 && (
            <Link
              to={`/${lang}/properties?transaction_type=buy&city_name=${encodeURIComponent(cityName)}`}
              className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              {city.buy_count} {toBuyLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
