import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Maximize, Home } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { getLocalizedName } from '@/shared/utils/formatters';
import type { Property } from '../properties.types';

interface PropertyCardListingProps {
  property: Property;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

/**
 * Format price in Swiss style: CHF 3'500.-/month
 */
function formatSwissPrice(price: number, currency = 'CHF'): string {
  const formatted = price.toLocaleString('de-CH');
  return `${currency} ${formatted}.-`;
}

/**
 * Check if property is new (published within last 7 days)
 */
function isNewProperty(publishedAt?: string): boolean {
  if (!publishedAt) return false;
  const published = new Date(publishedAt);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
}

export function PropertyCardListing({
  property,
  onFavorite,
  isFavorite = false,
}: PropertyCardListingProps) {
  const { i18n } = useTranslation('properties');
  const lang = i18n.language;

  const {
    id,
    title,
    price,
    currency = 'CHF',
    additional_costs,
    rooms,
    surface,
    address,
    transaction_type,
    category,
    city,
    canton,
    images,
    agency,
    published_at,
  } = property;

  const primaryImage = images?.find((img) => img.is_primary) || images?.[0];
  const cityName = city ? getLocalizedName(city.name, lang) : '';
  const detailUrl = `/${lang}/properties/${id}`;

  const isNew = isNewProperty(published_at);
  const imageCount = images?.length || 0;

  // Category name
  const categoryName = category ? getLocalizedName(category.name, lang) : '';

  return (
    <Link
      to={detailUrl}
      className="group block overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex flex-col md:flex-row">
        {/* Image section */}
        <div className="relative h-48 w-full shrink-0 overflow-hidden md:h-auto md:w-72">
          <img
            src={primaryImage?.url || '/images/placeholder.jpg'}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-1">
            {isNew && <Badge className="bg-green-500 text-white text-xs px-2 py-0.5">NEW</Badge>}
          </div>

          {/* Favorite button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 h-8 w-8 rounded-full bg-white/90 hover:bg-white"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFavorite?.(id);
            }}
          >
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-red-500 text-red-500')} />
          </Button>

          {/* Image count */}
          {imageCount > 1 && (
            <div className="absolute bottom-3 left-3 flex gap-1">
              {Array.from({ length: Math.min(imageCount, 5) }).map((_, idx) => (
                <span
                  key={idx}
                  className={cn('h-1.5 w-1.5 rounded-full', idx === 0 ? 'bg-white' : 'bg-white/50')}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content section */}
        <div className="flex flex-1 flex-col p-4">
          {/* Price */}
          <div className="text-lg font-bold text-[#1a1a2e]">
            {formatSwissPrice(price, currency)}
            {transaction_type === 'rent' && <span className="font-normal">/month</span>}
            {additional_costs && additional_costs > 0 && (
              <span className="ml-1 text-sm font-normal text-gray-500">
                (+{formatSwissPrice(additional_costs, currency).replace('CHF ', '')} costs)
              </span>
            )}
          </div>

          {/* Property type and rooms */}
          <p className="mt-1 text-sm text-gray-700">
            {categoryName} {rooms && `${rooms} rooms`}
          </p>

          {/* Location */}
          <p className="mt-1 text-sm text-gray-500">
            {cityName}
            {address ? `, ${address}` : ''}
            {canton?.code ? ` (${canton.code})` : ''}
          </p>

          {/* Features row */}
          <div className="mt-auto flex items-center gap-4 pt-3 text-sm text-gray-600">
            {surface && (
              <div className="flex items-center gap-1">
                <Maximize className="h-4 w-4" />
                <span>
                  {surface} m<sup>2</sup>
                </span>
              </div>
            )}
            {rooms && (
              <div className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                <span>{rooms}</span>
              </div>
            )}
          </div>
        </div>

        {/* Agency logo section */}
        {agency && (
          <div className="hidden shrink-0 items-center border-l border-gray-100 p-4 md:flex">
            {agency.logo_url ? (
              <img
                src={agency.logo_url}
                alt={agency.name || 'Agency'}
                className="h-12 w-12 rounded object-contain"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-xs text-gray-500">
                {(agency.name || 'A').charAt(0)}
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
