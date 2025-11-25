/**
 * useFavorites - Hook for managing favorite state across the app
 * Provides favorite IDs, toggle handler, and favorite checking
 */

import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import {
  useGetFavoriteIdsQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} from '@/features/dashboard/dashboard.api';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export function useFavorites() {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Only fetch favorite IDs when user is authenticated
  const { data: favoriteIdsData } = useGetFavoriteIdsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();

  const favoriteIds = useMemo(() => {
    return new Set<string>(favoriteIdsData || []);
  }, [favoriteIdsData]);

  const isFavorite = useCallback(
    (propertyId: string) => favoriteIds.has(propertyId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (propertyId: string) => {
      if (!isAuthenticated) {
        // Redirect to sign-in if not authenticated
        navigate(`/${i18n.language}/sign-in`, {
          state: { from: window.location.pathname },
        });
        return;
      }

      try {
        if (favoriteIds.has(propertyId)) {
          await removeFavorite(propertyId).unwrap();
          toast.success(t('favorites.removed', 'Removed from favorites'));
        } else {
          await addFavorite(propertyId).unwrap();
          toast.success(t('favorites.added', 'Added to favorites'));
        }
      } catch {
        toast.error(t('favorites.error', 'Failed to update favorites'));
      }
    },
    [isAuthenticated, favoriteIds, addFavorite, removeFavorite, navigate, i18n.language, t]
  );

  return { favoriteIds, isFavorite, toggleFavorite };
}
