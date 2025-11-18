/**
 * Property Status Badge
 * Displays a colored badge for property status
 */

import { useTranslation } from 'react-i18next';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import type { PropertyStatus } from '../property-management.types';

const statusConfig: Record<
  PropertyStatus,
  { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }
> = {
  DRAFT: { variant: 'outline', className: 'border-gray-300 text-gray-600 bg-gray-50' },
  PENDING_APPROVAL: {
    variant: 'outline',
    className: 'border-amber-400 text-amber-700 bg-amber-50',
  },
  APPROVED: { variant: 'outline', className: 'border-blue-400 text-blue-700 bg-blue-50' },
  PUBLISHED: { variant: 'default', className: 'bg-green-600 text-white hover:bg-green-700' },
  REJECTED: { variant: 'destructive', className: 'bg-red-100 text-red-700 border-red-300' },
  ARCHIVED: { variant: 'secondary', className: 'bg-gray-200 text-gray-600' },
};

interface PropertyStatusBadgeProps {
  status: PropertyStatus;
  className?: string;
}

export function PropertyStatusBadge({ status, className }: PropertyStatusBadgeProps) {
  const { t } = useTranslation('dashboard');

  const config = statusConfig[status] || statusConfig.DRAFT;

  const statusLabels: Record<PropertyStatus, string> = {
    DRAFT: t('myProperties.status.draft', 'Draft'),
    PENDING_APPROVAL: t('myProperties.status.pending', 'Pending'),
    APPROVED: t('myProperties.status.approved', 'Approved'),
    PUBLISHED: t('myProperties.status.published', 'Published'),
    REJECTED: t('myProperties.status.rejected', 'Rejected'),
    ARCHIVED: t('myProperties.status.archived', 'Archived'),
  };

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {statusLabels[status]}
    </Badge>
  );
}
