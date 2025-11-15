/**
 * Favorites Page Component
 * Displays and manages user's favorite properties
 */

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Heart,
  MapPin,
  BedDouble,
  Maximize,
  Trash2,
  ExternalLink,
  Search,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import { cn } from '@/shared/lib/utils';
import { formatPrice } from '@/shared/utils/formatters';
import { useGetFavoritesQuery, useRemoveFavoriteMutation } from '../dashboard.api';
import type { Favorite } from '../dashboard.types';

export function FavoritesPage() {
  const { t } = useTranslation('dashboard');
  const { lang } = useParams<{ lang: string }>();
  const [page, setPage] = useState(1);

  const { data: favoritesData, isLoading, isFetching } = useGetFavoritesQuery({ page, limit: 12 });
  const [removeFavorite, { isLoading: isRemoving }] = useRemoveFavoriteMutation();

  const favorites = favoritesData?.data ?? [];
  const pagination = favoritesData?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  const handleRemoveFavorite = async (propertyId: string) => {
    try {
      await removeFavorite(propertyId).unwrap();
      toast.success(t('favorites.removeSuccess'));
    } catch {
      toast.error(t('favorites.removeError'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('favorites.title')}</h1>
          <p className="text-muted-foreground">
            {pagination?.total
              ? t('favorites.count', { count: pagination.total })
              : t('favorites.description')}
          </p>
        </div>
        <Link to={`/${lang}/properties`}>
          <Button variant="outline" className="gap-2">
            <Search className="h-4 w-4" />
            {t('favorites.browseMore')}
          </Button>
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <FavoritesSkeleton />
      ) : favorites.length === 0 ? (
        <EmptyFavorites lang={lang || 'en'} />
      ) : (
        <>
          {/* Favorites Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((favorite) => (
              <FavoriteCard
                key={favorite.id}
                favorite={favorite}
                lang={lang || 'en'}
                onRemove={handleRemoveFavorite}
                isRemoving={isRemoving}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isFetching}
              >
                {t('common.previous')}
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setPage(p)}
                    disabled={isFetching}
                  >
                    {p}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isFetching}
              >
                {t('common.next')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Favorite Card Component
interface FavoriteCardProps {
  favorite: Favorite;
  lang: string;
  onRemove: (propertyId: string) => void;
  isRemoving: boolean;
}

function FavoriteCard({ favorite, lang, onRemove, isRemoving }: FavoriteCardProps) {
  const { t } = useTranslation('dashboard');
  const property = favorite.property;

  if (!property) {
    return null;
  }

  const detailUrl = `/${lang}/properties/${property.id}`;
  const isAvailable = property.status === 'PUBLISHED';

  return (
    <Card className={cn('group overflow-hidden', !isAvailable && 'opacity-70')}>
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Link to={detailUrl}>
          <img
            src={property.primary_image_url || '/images/placeholder-property.jpg'}
            alt={property.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Transaction badge */}
        <Badge
          variant={property.transaction_type === 'rent' ? 'secondary' : 'default'}
          className="absolute left-3 top-3"
        >
          {t(`common.transaction.${property.transaction_type}`)}
        </Badge>

        {/* Status badge if not available */}
        {!isAvailable && (
          <Badge variant="destructive" className="absolute right-3 top-3">
            {t('favorites.propertyUnavailable')}
          </Badge>
        )}

        {/* Remove button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 bottom-3 bg-white/90 hover:bg-white text-red-500 hover:text-red-600"
              disabled={isRemoving}
            >
              {isRemoving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('favorites.removeConfirmTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('favorites.removeConfirmDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onRemove(property.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                {t('favorites.removeConfirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        {/* Price */}
        <div className="text-lg font-bold text-primary">
          {formatPrice(property.price, property.currency)}
          {property.transaction_type === 'rent' && (
            <span className="text-sm font-normal text-muted-foreground">
              {' '}
              / {t('common.month')}
            </span>
          )}
        </div>

        {/* Title */}
        <Link to={detailUrl}>
          <h3 className="font-semibold hover:text-primary line-clamp-1 mt-1">{property.title}</h3>
        </Link>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {property.city?.name}
            {property.canton?.code && `, ${property.canton.code}`}
          </span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          {property.rooms && (
            <div className="flex items-center gap-1">
              <BedDouble className="h-4 w-4" />
              <span>{property.rooms}</span>
            </div>
          )}
          {property.surface && (
            <div className="flex items-center gap-1">
              <Maximize className="h-4 w-4" />
              <span>{property.surface} m²</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Link to={detailUrl} className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <ExternalLink className="h-4 w-4" />
              {t('favorites.viewProperty')}
            </Button>
          </Link>
        </div>

        {/* Saved date */}
        <p className="text-xs text-muted-foreground mt-3">
          {t('favorites.savedOn', {
            date: new Date(favorite.created_at).toLocaleDateString(),
          })}
        </p>
      </CardContent>
    </Card>
  );
}

// Empty state
function EmptyFavorites({ lang }: { lang: string }) {
  const { t } = useTranslation('dashboard');

  return (
    <Card className="py-16">
      <CardContent className="text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Heart className="h-8 w-8 text-muted-foreground" />
        </div>
        <CardHeader className="p-0">
          <CardTitle className="text-xl">{t('favorites.empty.title')}</CardTitle>
          <CardDescription className="max-w-sm mx-auto">
            {t('favorites.empty.description')}
          </CardDescription>
        </CardHeader>
        <Link to={`/${lang}/properties`} className="mt-6 inline-block">
          <Button className="gap-2">
            <Search className="h-4 w-4" />
            {t('favorites.empty.browseProperties')}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// Loading skeleton
function FavoritesSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-[4/3] w-full" />
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
