/**
 * Property List Item
 * Card component for displaying a property in the My Properties list
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Send,
  Archive,
  MapPin,
  BedDouble,
  Maximize,
  Calendar,
  ImageIcon,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { cn } from '@/shared/lib/utils';
import { formatPrice } from '@/shared/utils/formatters';
import { PropertyStatusBadge } from './PropertyStatusBadge';
import type { PropertyResponse } from '../property-management.types';
import type { SupportedLanguage } from '@/features/auth/auth.types';

// Helper to get localized name from name object
function getLocalizedName(
  name: string | Record<string, string> | undefined,
  lang: SupportedLanguage
): string {
  if (!name) return '';
  if (typeof name === 'string') return name;
  return name[lang] || name.en || Object.values(name)[0] || '';
}

interface PropertyListItemProps {
  property: PropertyResponse;
  onDelete?: (id: string) => void;
  onSubmitForApproval?: (id: string) => void;
  onArchive?: (id: string) => void;
}

export function PropertyListItem({
  property,
  onDelete,
  onSubmitForApproval,
  onArchive,
}: PropertyListItemProps) {
  const { t, i18n } = useTranslation('dashboard');
  const lang = i18n.language as SupportedLanguage;

  const {
    id,
    status,
    transaction_type,
    price,
    currency,
    rooms,
    surface,
    address,
    created_at,
    images,
  } = property;

  // Get category / city / canton names
  const categoryName = property.category ? getLocalizedName(property.category.name, lang) : '';
  const cityName = property.city ? getLocalizedName(property.city.name, lang) : '';
  const cantonCode = property.canton?.code || '';

  // Get title from translation or fallback
  const title =
    property.translation?.title ||
    property.external_id ||
    t('myProperties.untitled', 'Untitled Property');
  const description = property.translation?.description || '';

  // Primary image
  const primaryImage = images?.find((img) => img.is_primary) || images?.[0];
  const imageCount = images?.length || 0;

  // Format date
  const createdDate = new Date(created_at).toLocaleDateString(lang, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Determine available actions based on status
  const canEdit = !['ARCHIVED'].includes(status);
  const canSubmit = ['DRAFT', 'REJECTED'].includes(status);
  const canArchive = ['PUBLISHED', 'APPROVED', 'PENDING_APPROVAL', 'DRAFT', 'REJECTED'].includes(
    status
  );
  const canDelete = ['DRAFT', 'REJECTED', 'ARCHIVED'].includes(status);
  const canView = ['PUBLISHED', 'APPROVED'].includes(status);

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full sm:w-52 h-40 sm:h-auto shrink-0 bg-gray-100">
            {primaryImage ? (
              <img src={primaryImage.url} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <ImageIcon className="h-10 w-10 mb-1" />
                <span className="text-xs">{t('myProperties.noImage', 'No image')}</span>
              </div>
            )}

            {/* Image count badge */}
            {imageCount > 0 && (
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                <ImageIcon className="h-3 w-3" />
                {imageCount}
              </div>
            )}

            {/* Transaction type */}
            <div
              className={cn(
                'absolute top-2 left-2 text-xs font-medium px-2 py-1 rounded-md',
                transaction_type === 'rent' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
              )}
            >
              {transaction_type === 'rent'
                ? t('myProperties.rent', 'For Rent')
                : t('myProperties.sale', 'For Sale')}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col">
            {/* Header row: Status + Actions */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <PropertyStatusBadge status={status} />
                {categoryName && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {categoryName}
                  </span>
                )}
              </div>

              {/* Actions dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canView && (
                    <DropdownMenuItem asChild>
                      <Link to={`/${lang}/properties/${id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        {t('myProperties.actions.view', 'View Public Page')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {canEdit && (
                    <DropdownMenuItem asChild>
                      <Link to={`/${lang}/dashboard/properties/${id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        {t('myProperties.actions.edit', 'Edit')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {canSubmit && (
                    <DropdownMenuItem onClick={() => onSubmitForApproval?.(id)}>
                      <Send className="h-4 w-4 mr-2" />
                      {t('myProperties.actions.submit', 'Submit for Approval')}
                    </DropdownMenuItem>
                  )}
                  {canArchive && (
                    <DropdownMenuItem onClick={() => onArchive?.(id)}>
                      <Archive className="h-4 w-4 mr-2" />
                      {t('myProperties.actions.archive', 'Archive')}
                    </DropdownMenuItem>
                  )}
                  {(canDelete || canArchive) && <DropdownMenuSeparator />}
                  {canDelete && (
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={() => onDelete?.(id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('myProperties.actions.delete', 'Delete')}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Title */}
            <Link
              to={
                canEdit ? `/${lang}/dashboard/properties/${id}/edit` : `/${lang}/properties/${id}`
              }
              className="font-semibold text-gray-900 hover:text-primary line-clamp-1 mb-1"
            >
              {title}
            </Link>

            {/* Description preview */}
            {description && (
              <p className="text-sm text-gray-500 line-clamp-1 mb-2">{description}</p>
            )}

            {/* Location */}
            {(cityName || address) && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="line-clamp-1">
                  {cityName}
                  {cantonCode && `, ${cantonCode}`}
                  {!cityName && address}
                </span>
              </div>
            )}

            {/* Bottom row: Price + Features + Date */}
            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-4">
                {/* Price */}
                <span className="font-bold text-primary">
                  {formatPrice(price, currency || 'CHF')}
                  {transaction_type === 'rent' && (
                    <span className="text-xs font-normal text-gray-500"> /mo</span>
                  )}
                </span>

                {/* Rooms */}
                {rooms != null && rooms > 0 && (
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <BedDouble className="h-3.5 w-3.5" />
                    {rooms}
                  </span>
                )}

                {/* Surface */}
                {surface != null && surface > 0 && (
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <Maximize className="h-3.5 w-3.5" />
                    {surface} m²
                  </span>
                )}
              </div>

              {/* Date */}
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="h-3 w-3" />
                {createdDate}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
