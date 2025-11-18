/**
 * My Properties Page
 * Dashboard page where agents/owners can view and manage their properties
 */

import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Building2,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { toast } from 'sonner';
import {
  useGetMyPropertiesQuery,
  useGetPropertyStatsQuery,
  useDeletePropertyMutation,
  useSubmitForApprovalMutation,
  useArchivePropertyMutation,
} from '../property-management.api';
import { PropertyListItem } from '../components/PropertyListItem';
import { PropertyStatsCards } from '../components/PropertyStatsCards';
import type { PropertyStatus } from '../property-management.types';

// Pagination defaults
const PAGE_SIZES = [10, 25, 50];

export function MyPropertiesPage() {
  const { t, i18n } = useTranslation('dashboard');
  const lang = i18n.language;

  // Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'archive' | 'delete';
    propertyId: string;
  }>({ open: false, type: 'archive', propertyId: '' });

  // API queries
  const {
    data: propertiesResponse,
    isLoading: propertiesLoading,
    isFetching: propertiesFetching,
    error: propertiesError,
    refetch: refetchProperties,
  } = useGetMyPropertiesQuery({
    page,
    limit,
    status: (statusFilter as PropertyStatus | undefined) || undefined,
    sort: sortField,
    order: sortOrder,
  });

  const { data: stats, isLoading: statsLoading } = useGetPropertyStatsQuery();

  // Mutations
  const [deleteProperty, { isLoading: isDeleting }] = useDeletePropertyMutation();
  const [submitForApproval, { isLoading: isSubmitting }] = useSubmitForApprovalMutation();
  const [archiveProperty, { isLoading: isArchiving }] = useArchivePropertyMutation();

  const properties = propertiesResponse?.data || [];
  const meta = propertiesResponse?.meta;
  const totalPages = meta?.total_pages || 1;

  // Handle status filter change (from stats cards)
  const handleStatusFilterChange = useCallback((status: string) => {
    setStatusFilter(status);
    setPage(1);
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((value: string) => {
    const [field, order] = value.split(':');
    setSortField(field);
    setSortOrder(order as 'asc' | 'desc');
    setPage(1);
  }, []);

  // Handle delete — open confirmation dialog
  const handleDelete = useCallback((propertyId: string) => {
    setConfirmDialog({ open: true, type: 'delete', propertyId });
  }, []);

  // Handle submit for approval
  const handleSubmitForApproval = useCallback(
    async (propertyId: string) => {
      try {
        await submitForApproval(propertyId).unwrap();
        toast.success(t('myProperties.submitSuccess', 'Property submitted for approval'));
      } catch {
        toast.error(t('myProperties.submitError', 'Failed to submit property for approval'));
      }
    },
    [submitForApproval, t]
  );

  // Handle archive — open confirmation dialog
  const handleArchive = useCallback((propertyId: string) => {
    setConfirmDialog({ open: true, type: 'archive', propertyId });
  }, []);

  // Handle confirmation action
  const handleConfirmAction = useCallback(async () => {
    const { type, propertyId } = confirmDialog;
    setConfirmDialog((prev) => ({ ...prev, open: false }));

    try {
      if (type === 'archive') {
        await archiveProperty(propertyId).unwrap();
        toast.success(t('myProperties.archiveSuccess', 'Property archived successfully'));
      } else {
        await deleteProperty(propertyId).unwrap();
        toast.success(t('myProperties.deleteSuccess', 'Property deleted successfully'));
      }
    } catch {
      if (type === 'archive') {
        toast.error(t('myProperties.archiveError', 'Failed to archive property'));
      } else {
        toast.error(t('myProperties.deleteError', 'Failed to delete property'));
      }
    }
  }, [confirmDialog, archiveProperty, deleteProperty, t]);

  // Loading state
  const isActioning = isDeleting || isSubmitting || isArchiving;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('myProperties.title', 'My Properties')}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('myProperties.subtitle', 'Manage your property listings')}
          </p>
        </div>
        <Button asChild>
          <Link to={`/${lang}/dashboard/properties/new`}>
            <Plus className="h-4 w-4 mr-2" />
            {t('myProperties.createNew', 'Create New Property')}
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <PropertyStatsCards
        stats={stats}
        isLoading={statsLoading}
        activeFilter={statusFilter}
        onFilterChange={handleStatusFilterChange}
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white border border-gray-200 rounded-lg p-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={t('myProperties.searchPlaceholder', 'Search properties...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Sort */}
        <Select value={`${sortField}:${sortOrder}`} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full sm:w-48">
            <ArrowUpDown className="h-4 w-4 mr-2 text-gray-400" />
            <SelectValue placeholder={t('myProperties.sortBy', 'Sort by')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at:desc">
              {t('myProperties.sort.newest', 'Newest first')}
            </SelectItem>
            <SelectItem value="created_at:asc">
              {t('myProperties.sort.oldest', 'Oldest first')}
            </SelectItem>
            <SelectItem value="price:desc">
              {t('myProperties.sort.priceHigh', 'Price: High to low')}
            </SelectItem>
            <SelectItem value="price:asc">
              {t('myProperties.sort.priceLow', 'Price: Low to high')}
            </SelectItem>
            <SelectItem value="updated_at:desc">
              {t('myProperties.sort.recentlyUpdated', 'Recently updated')}
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Items per page */}
        <Select
          value={String(limit)}
          onValueChange={(v) => {
            setLimit(Number(v));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-28">
            <SlidersHorizontal className="h-4 w-4 mr-2 text-gray-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} / {t('myProperties.page', 'page')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Refresh */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetchProperties()}
          disabled={propertiesFetching}
        >
          <RefreshCw className={`h-4 w-4 ${propertiesFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Properties list */}
      <div className="space-y-4">
        {/* Loading state */}
        {propertiesLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        )}

        {/* Error state */}
        {propertiesError && !propertiesLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {t('myProperties.errorTitle', 'Unable to load properties')}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {t('myProperties.errorDescription', 'Something went wrong. Please try again.')}
            </p>
            <Button variant="outline" onClick={() => refetchProperties()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('myProperties.retry', 'Retry')}
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!propertiesLoading && !propertiesError && properties.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-dashed border-gray-300 rounded-lg">
            <Building2 className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {statusFilter
                ? t('myProperties.noFilteredResults', 'No properties found for this filter')
                : t('myProperties.emptyTitle', 'No properties yet')}
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
              {statusFilter
                ? t(
                    'myProperties.tryDifferentFilter',
                    'Try a different filter or create a new property'
                  )
                : t(
                    'myProperties.emptyDescription',
                    'Start by creating your first property listing. It only takes a few minutes!'
                  )}
            </p>
            <div className="flex gap-3">
              {statusFilter && (
                <Button variant="outline" onClick={() => setStatusFilter('')}>
                  {t('myProperties.clearFilter', 'Clear filter')}
                </Button>
              )}
              <Button asChild>
                <Link to={`/${lang}/dashboard/properties/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('myProperties.createFirst', 'Create Property')}
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Properties */}
        {!propertiesLoading && !propertiesError && properties.length > 0 && (
          <>
            {/* Fetching overlay */}
            <div
              className={propertiesFetching || isActioning ? 'opacity-60 pointer-events-none' : ''}
            >
              {properties.map((property) => (
                <div key={property.id} className="mb-4">
                  <PropertyListItem
                    property={property}
                    onDelete={handleDelete}
                    onSubmitForApproval={handleSubmitForApproval}
                    onArchive={handleArchive}
                  />
                </div>
              ))}
            </div>

            {/* Loading indicator for fetching */}
            {(propertiesFetching || isActioning) && (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                <span className="text-sm text-gray-500">
                  {t('myProperties.updating', 'Updating...')}
                </span>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-gray-500">
                  {t('myProperties.showing', 'Showing {{from}}-{{to}} of {{total}}', {
                    from: (page - 1) * limit + 1,
                    to: Math.min(page * limit, meta?.total || 0),
                    total: meta?.total || 0,
                  })}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    {t('myProperties.previous', 'Previous')}
                  </Button>
                  <span className="text-sm text-gray-600 px-2">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    {t('myProperties.next', 'Next')}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.type === 'archive'
                ? t('myProperties.archiveDialog.title', 'Archive Property')
                : t('myProperties.deleteDialog.title', 'Delete Property')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === 'archive'
                ? t(
                    'myProperties.archiveDialog.description',
                    'Are you sure you want to archive this property? It will be hidden from public listings but can be restored later.'
                  )
                : t(
                    'myProperties.deleteDialog.description',
                    'Are you sure you want to delete this property? This action cannot be undone.'
                  )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('myProperties.confirmCancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={
                confirmDialog.type === 'delete'
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-600'
                  : ''
              }
            >
              {confirmDialog.type === 'archive'
                ? t('myProperties.confirmArchiveAction', 'Archive')
                : t('myProperties.confirmDeleteAction', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default MyPropertiesPage;
