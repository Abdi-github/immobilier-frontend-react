import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Building2, Bed, Maximize } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { Property } from '../properties.types';

interface PropertyCardProps {
  property: Property;
  variant?: 'grid' | 'list';
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
  isNew?: boolean;
  isTop?: boolean;
}

type MultiLangName = { en: string; fr: string; de: string; it: string };

// Helper to get localized name
function getLocalizedName(name: MultiLangName | string | undefined, lang: string): string {
  if (!name) return '';
  if (typeof name === 'string') return name;
  return name[lang as keyof MultiLangName] || name.en || '';
}

// Format price in Swiss style: CHF 1'600.-
function formatSwissPrice(price: number | undefined, currency = 'CHF'): string {
  if (!price) return 'Price on request';
  const formatted = price.toLocaleString('de-CH');
  return `${currency} ${formatted}.-`;
}

export function PropertyCard({
  property,
  variant = 'grid',
  onFavorite,
  isFavorite = false,
  isNew = false,
  isTop = false,
}: PropertyCardProps) {
  const { i18n } = useTranslation(['properties', 'common']);

  const {
    id,
    title,
    price,
    currency,
    additional_costs,
    rooms,
    surface,
    address,
    transaction_type,
    category,
    city,
    canton,
    images,
  } = property;

  const primaryImage = images?.find((img) => img.is_primary) || images?.[0];
  const detailUrl = `/${i18n.language}/properties/${id}`;
  const categoryName = getLocalizedName(category?.name, i18n.language);
  const cityName = getLocalizedName(city?.name, i18n.language);

  // Determine if card should be marked as new (added in last 7 days)
  const showNewBadge = isNew;
  const showTopBadge = isTop;

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md',
        variant === 'list' && 'flex flex-row'
      )}
    >
      {/* Image section */}
      <Link
        to={detailUrl}
        className={cn(
          'relative block overflow-hidden bg-gray-100',
          variant === 'grid' ? 'aspect-[4/3]' : 'w-64 shrink-0'
        )}
      >
        {primaryImage?.url ? (
          <img
            src={primaryImage.url}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Building2 className="h-12 w-12 text-gray-300" />
          </div>
        )}

        {/* Badges - matching immobilier.ch */}
        <div className="absolute left-0 top-0 flex flex-col gap-1 p-2">
          {showNewBadge && (
            <span className="rounded bg-green-600 px-2 py-0.5 text-xs font-bold uppercase text-white">
              NEW
            </span>
          )}
          {showTopBadge && (
            <span className="rounded bg-orange-500 px-2 py-0.5 text-xs font-bold uppercase text-white">
              TOP
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFavorite?.(id);
          }}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition-all hover:bg-white"
        >
          <Heart
            className={cn(
              'h-4 w-4 transition-colors',
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'
            )}
          />
        </button>

        {/* Image count */}
        {images && images.length > 1 && (
          <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
            1 / {images.length}
          </span>
        )}
      </Link>

      {/* Content section - matching immobilier.ch layout */}
      <div className={cn('flex flex-1 flex-col p-4', variant === 'list' && 'justify-between')}>
        {/* Price - Swiss format */}
        <div className="mb-2">
          <span className="text-lg font-bold text-[#1a1a2e]">
            {formatSwissPrice(price, currency)}
            {transaction_type === 'rent' && '/month'}
          </span>
          {additional_costs && additional_costs > 0 && (
            <span className="ml-1 text-sm text-gray-500">
              (+{additional_costs}.- costs)
            </span>
          )}
        </div>

        {/* Property type and rooms */}
        <div className="mb-1 text-sm font-medium text-gray-800">
          {categoryName} {rooms && `${rooms} rooms`}
        </div>

        {/* Address */}
        <div className="mb-3 text-sm text-gray-600">
          {cityName}{address ? `, ${address}` : ''}{canton?.code ? ` (${canton.code})` : ''}
        </div>

        {/* Features row - matching immobilier.ch icons */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {surface !== undefined && surface > 0 && (
            <div className="flex items-center gap-1">
              <Maximize className="h-4 w-4" />
              <span>{surface} m²</span>
            </div>
          )}
          {rooms !== undefined && rooms > 0 && (
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{rooms}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
