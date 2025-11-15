import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Bed, Maximize, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { getLocalizedName } from '@/shared/utils/formatters';
import type { Property } from '../properties.types';

interface PropertyCardGridProps {
  property: Property;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

/**
 * Format price in Swiss style: CHF 3'500.-
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

/**
 * Property card for grid layout - matches immobilier.ch design
 * Features image carousel with left/right arrows
 */
export function PropertyCardGrid({ 
  property, 
  onFavorite,
  isFavorite = false,
}: PropertyCardGridProps) {
  const { i18n } = useTranslation('properties');
  const lang = i18n.language;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  
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
    images,
    agency,
    published_at,
  } = property;

  const propertyImages = images?.length ? images : [];
  const isNew = isNewProperty(published_at);
  const cityName = city ? getLocalizedName(city.name, lang) : '';
  const categoryName = category ? getLocalizedName(category.name, lang) : '';
  const detailUrl = `/${lang}/properties/${id}`;
  
  // Get current image or placeholder
  const currentImage = propertyImages[currentImageIndex];
  const hasMultipleImages = propertyImages.length > 1;

  // Navigate to previous image
  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? propertyImages.length - 1 : prev - 1
    );
  };

  // Navigate to next image
  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === propertyImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <Link 
      to={detailUrl}
      className="group block overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-lg"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Image section with carousel */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {currentImage?.url ? (
          <img
            src={currentImage.url}
            alt={`${title} - Image ${currentImageIndex + 1}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Building2 className="h-12 w-12 text-gray-300" />
          </div>
        )}
        
        {/* Carousel navigation arrows - visible on hover */}
        {hasMultipleImages && (
          <>
            {/* Left arrow */}
            <button
              onClick={handlePrevImage}
              className={cn(
                'absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md transition-opacity hover:bg-white',
                isHovering ? 'opacity-100' : 'opacity-0'
              )}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {/* Right arrow */}
            <button
              onClick={handleNextImage}
              className={cn(
                'absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md transition-opacity hover:bg-white',
                isHovering ? 'opacity-100' : 'opacity-0'
              )}
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
        
        {/* Badges - TOP or NEW */}
        <div className="absolute left-3 top-3">
          {isNew && (
            <span className="rounded bg-green-500 px-2 py-1 text-xs font-semibold text-white">
              NEW
            </span>
          )}
        </div>
        
        {/* Favorite button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 h-9 w-9 rounded-full bg-white/80 hover:bg-white"
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            onFavorite?.(id);
          }}
        >
          <Heart className={cn('h-5 w-5', isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600')} />
        </Button>
        
        {/* Image counter/dots indicator */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {propertyImages.length <= 5 ? (
              // Show dots for 5 or fewer images
              propertyImages.map((_, idx) => (
                <button
                  key={idx}
                  className={cn(
                    'h-2 w-2 rounded-full transition-colors',
                    idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  )}
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))
            ) : (
              // Show counter for more than 5 images
              <span className="rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white">
                {currentImageIndex + 1} / {propertyImages.length}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content section */}
      <div className="p-4">
        {/* Price */}
        <div className="text-lg font-bold text-[#1a1a2e]">
          {formatSwissPrice(price, currency)}
          {transaction_type === 'rent' && (
            <span className="font-normal text-gray-600">/month</span>
          )}
          {additional_costs && additional_costs > 0 && (
            <span className="ml-1 text-sm font-normal text-gray-500">
              (+{additional_costs}.- costs)
            </span>
          )}
        </div>
        
        {/* Property type and rooms */}
        <p className="mt-1 text-sm text-gray-700">
          {categoryName} {rooms && `${rooms} rooms`}
        </p>
        
        {/* Location */}
        <p className="mt-1 truncate text-sm text-gray-500">
          {cityName}{address ? `, ${address}` : ''}
        </p>
        
        {/* Features row with icons - matches immobilier.ch */}
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            {surface && (
              <div className="flex items-center gap-1">
                <Maximize className="h-4 w-4" />
                <span>{surface} m²</span>
              </div>
            )}
            {rooms && (
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                <span>{rooms}</span>
              </div>
            )}
          </div>
          
          {/* Agency logo */}
          {agency && (
            <div className="shrink-0">
              {agency.logo_url ? (
                <img 
                  src={agency.logo_url} 
                  alt={agency.name || 'Agency'} 
                  className="h-8 max-w-[80px] object-contain"
                />
              ) : (
                <div className="flex h-8 items-center rounded bg-gray-100 px-2 text-xs text-gray-500">
                  {agency.name?.slice(0, 10) || 'Agency'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
