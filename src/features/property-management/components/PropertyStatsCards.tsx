/**
 * Property Stats Cards
 * Displays property statistics overview at the top of My Properties page
 */

import { useTranslation } from 'react-i18next';
import { FileText, Clock, CheckCircle, Globe, XCircle, Archive, Building2 } from 'lucide-react';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import type { PropertyStats } from '../property-management.types';

interface PropertyStatsCardsProps {
  stats: PropertyStats | undefined;
  isLoading: boolean;
  activeFilter: string;
  onFilterChange: (status: string) => void;
}

const statItems = [
  { key: 'total', icon: Building2, color: 'text-gray-700', bg: 'bg-gray-100', filterValue: '' },
  { key: 'draft', icon: FileText, color: 'text-gray-500', bg: 'bg-gray-50', filterValue: 'DRAFT' },
  {
    key: 'pending',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    filterValue: 'PENDING_APPROVAL',
  },
  {
    key: 'approved',
    icon: CheckCircle,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    filterValue: 'APPROVED',
  },
  {
    key: 'published',
    icon: Globe,
    color: 'text-green-600',
    bg: 'bg-green-50',
    filterValue: 'PUBLISHED',
  },
  {
    key: 'rejected',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    filterValue: 'REJECTED',
  },
  {
    key: 'archived',
    icon: Archive,
    color: 'text-gray-400',
    bg: 'bg-gray-50',
    filterValue: 'ARCHIVED',
  },
] as const;

export function PropertyStatsCards({
  stats,
  isLoading,
  activeFilter,
  onFilterChange,
}: PropertyStatsCardsProps) {
  const { t } = useTranslation('dashboard');

  const labelMap: Record<string, string> = {
    total: t('myProperties.stats.total', 'All'),
    draft: t('myProperties.stats.draft', 'Drafts'),
    pending: t('myProperties.stats.pending', 'Pending'),
    approved: t('myProperties.stats.approved', 'Approved'),
    published: t('myProperties.stats.published', 'Published'),
    rejected: t('myProperties.stats.rejected', 'Rejected'),
    archived: t('myProperties.stats.archived', 'Archived'),
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {statItems.map((item) => {
        const Icon = item.icon;
        const count = stats?.[item.key as keyof PropertyStats] ?? 0;
        const isActive = activeFilter === item.filterValue;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onFilterChange(item.filterValue)}
            className={cn(
              'flex flex-col items-center justify-center p-3 rounded-lg border transition-all',
              'hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30',
              isActive
                ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                : 'border-gray-200 bg-white hover:border-gray-300'
            )}
          >
            <Icon className={cn('h-5 w-5 mb-1', isActive ? 'text-primary' : item.color)} />
            <span className={cn('text-2xl font-bold', isActive ? 'text-primary' : 'text-gray-900')}>
              {count}
            </span>
            <span className={cn('text-xs', isActive ? 'text-primary' : 'text-gray-500')}>
              {labelMap[item.key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
