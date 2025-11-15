/**
 * My Inquiries Dashboard Page
 * Shows all property inquiries (leads) sent by the current user
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MessageSquare,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useGetMyInquiriesQuery } from '../dashboard.api';

const DEFAULT_STATUS = { icon: AlertCircle, color: 'bg-blue-100 text-blue-700', label: 'New' };

const STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  new: DEFAULT_STATUS,
  contacted: { icon: Clock, color: 'bg-yellow-100 text-yellow-700', label: 'Contacted' },
  viewing_scheduled: {
    icon: Clock,
    color: 'bg-purple-100 text-purple-700',
    label: 'Viewing Scheduled',
  },
  in_negotiation: { icon: Clock, color: 'bg-orange-100 text-orange-700', label: 'In Negotiation' },
  closed_won: { icon: CheckCircle2, color: 'bg-green-100 text-green-700', label: 'Closed (Won)' },
  closed_lost: { icon: AlertCircle, color: 'bg-gray-100 text-gray-600', label: 'Closed (Lost)' },
  spam: { icon: AlertCircle, color: 'bg-red-100 text-red-700', label: 'Spam' },
};

export function InquiriesPage() {
  const { t, i18n } = useTranslation('dashboard');
  const lang = i18n.language;
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useGetMyInquiriesQuery({ page, limit: 10 });

  const inquiries = data?.data || [];
  const pagination = data?.pagination;

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    const config = STATUS_CONFIG[normalizedStatus] ?? DEFAULT_STATUS;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`gap-1 ${config.color}`}>
        <Icon className="h-3 w-3" />
        {t(`inquiries.status.${status}`, config.label)}
      </Badge>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      lang === 'fr' ? 'fr-CH' : lang === 'de' ? 'de-CH' : lang === 'it' ? 'it-CH' : 'en-GB',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('inquiries.title', 'My Inquiries')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('inquiries.description', 'Track all the property inquiries you have sent')}
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-20 w-20 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-3" />
            <p className="text-red-600">{t('common.loadError', 'Failed to load data')}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              {t('common.retry', 'Retry')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && !isError && inquiries.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Inbox className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t('inquiries.empty.title', 'No inquiries yet')}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              {t(
                'inquiries.empty.description',
                'When you contact a property owner or agency, your inquiries will appear here.'
              )}
            </p>
            <Link to={`/${lang}/properties`}>
              <Button>{t('inquiries.empty.browseCta', 'Browse Properties')}</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Inquiries list */}
      {!isLoading && inquiries.length > 0 && (
        <div className="space-y-3">
          {inquiries.map((inquiry) => (
            <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Property image thumbnail */}
                  {inquiry.property?.images?.[0] && (
                    <Link to={`/${lang}/properties/${inquiry.property.id}`} className="shrink-0">
                      <img
                        src={inquiry.property.images[0].url}
                        alt={inquiry.property.title}
                        className="h-20 w-28 rounded-lg object-cover"
                      />
                    </Link>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {inquiry.property ? (
                          <Link
                            to={`/${lang}/properties/${inquiry.property.id}`}
                            className="font-semibold hover:text-primary line-clamp-1"
                          >
                            {inquiry.property.title}
                          </Link>
                        ) : (
                          <span className="font-semibold text-muted-foreground">
                            {t('inquiries.propertyUnavailable', 'Property no longer available')}
                          </span>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t('inquiries.sentOn', 'Sent on')} {formatDate(inquiry.created_at)}
                        </p>
                      </div>
                      {getStatusBadge(inquiry.status)}
                    </div>

                    {/* Inquiry type */}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {t(`inquiries.type.${inquiry.inquiry_type}`, inquiry.inquiry_type)}
                      </Badge>
                    </div>

                    {/* Message preview */}
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {inquiry.message}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-3">
                      {inquiry.property && (
                        <Link to={`/${lang}/properties/${inquiry.property.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                            <ExternalLink className="h-3 w-3" />
                            {t('inquiries.viewProperty', 'View Property')}
                          </Button>
                        </Link>
                      )}
                      {inquiry.first_response_at && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {t('inquiries.responded', 'Responded')}{' '}
                          {formatDate(inquiry.first_response_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {t('common.pageOf', 'Page {{current}} of {{total}}', {
              current: page,
              total: pagination.totalPages,
            })}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
