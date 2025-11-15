/**
 * Alerts Page Component
 * Displays and manages user's property alerts
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  MapPin,
  Home,
  DollarSign,
  BedDouble,
  Maximize,
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
import { Switch } from '@/shared/components/ui/switch';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { formatPrice } from '@/shared/utils/formatters';
import {
  useGetAlertsQuery,
  useDeleteAlertMutation,
  useToggleAlertMutation,
} from '../dashboard.api';
import type { PropertyAlert } from '../dashboard.types';
import { CreateAlertForm } from '../components/CreateAlertForm';

export function AlertsPage() {
  const { t } = useTranslation('dashboard');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<PropertyAlert | null>(null);

  const { data: alerts, isLoading } = useGetAlertsQuery();
  const [deleteAlert, { isLoading: isDeleting }] = useDeleteAlertMutation();
  const [toggleAlert, { isLoading: isToggling }] = useToggleAlertMutation();

  const handleDelete = async (id: string) => {
    try {
      await deleteAlert(id).unwrap();
      toast.success(t('alerts.deleteSuccess'));
    } catch {
      toast.error(t('alerts.deleteError'));
    }
  };

  const handleToggle = async (id: string, is_active: boolean) => {
    try {
      await toggleAlert({ id, is_active }).unwrap();
      toast.success(is_active ? t('alerts.activateSuccess') : t('alerts.pauseSuccess'));
    } catch {
      toast.error(t('alerts.toggleError'));
    }
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    toast.success(t('alerts.createSuccess'));
  };

  const handleEditSuccess = () => {
    setEditingAlert(null);
    toast.success(t('alerts.updateSuccess'));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('alerts.title')}</h1>
          <p className="text-muted-foreground">{t('alerts.description')}</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t('alerts.createNew')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('alerts.createTitle')}</DialogTitle>
              <DialogDescription>{t('alerts.createDescription')}</DialogDescription>
            </DialogHeader>
            <CreateAlertForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      {isLoading ? (
        <AlertsSkeleton />
      ) : !alerts || alerts.length === 0 ? (
        <EmptyAlerts onCreateClick={() => setCreateDialogOpen(true)} />
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onDelete={handleDelete}
              onToggle={handleToggle}
              onEdit={() => setEditingAlert(alert)}
              isDeleting={isDeleting}
              isToggling={isToggling}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingAlert} onOpenChange={(open) => !open && setEditingAlert(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('alerts.editTitle')}</DialogTitle>
            <DialogDescription>{t('alerts.editDescription')}</DialogDescription>
          </DialogHeader>
          {editingAlert && (
            <CreateAlertForm
              alert={editingAlert}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingAlert(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Alert Card Component
interface AlertCardProps {
  alert: PropertyAlert;
  onDelete: (id: string) => void;
  onToggle: (id: string, is_active: boolean) => void;
  onEdit: () => void;
  isDeleting: boolean;
  isToggling: boolean;
}

function AlertCard({ alert, onDelete, onToggle, onEdit, isDeleting, isToggling }: AlertCardProps) {
  const { t } = useTranslation('dashboard');

  const frequencyLabel = {
    instant: t('alerts.frequency.instant'),
    daily: t('alerts.frequency.daily'),
    weekly: t('alerts.frequency.weekly'),
  }[alert.frequency];

  const getFilterBadges = () => {
    const badges: Array<{ icon: React.ReactNode; label: string }> = [];
    const filters = alert.criteria;

    if (filters.transaction_type) {
      badges.push({
        icon: <Home className="h-3 w-3" />,
        label: t(`common.transaction.${filters.transaction_type}`),
      });
    }

    if (filters.canton_id || filters.city_id) {
      badges.push({
        icon: <MapPin className="h-3 w-3" />,
        label: filters.city_id ? t('alerts.filters.citySet') : t('alerts.filters.cantonSet'),
      });
    }

    if (filters.price_min || filters.price_max) {
      const priceLabel =
        filters.price_min && filters.price_max
          ? `${formatPrice(filters.price_min)} - ${formatPrice(filters.price_max)}`
          : filters.price_min
            ? `${t('alerts.filters.from')} ${formatPrice(filters.price_min)}`
            : `${t('alerts.filters.to')} ${formatPrice(filters.price_max!)}`;
      badges.push({
        icon: <DollarSign className="h-3 w-3" />,
        label: priceLabel,
      });
    }

    if (filters.rooms_min || filters.rooms_max) {
      const roomsLabel =
        filters.rooms_min && filters.rooms_max
          ? `${filters.rooms_min}-${filters.rooms_max} ${t('alerts.filters.rooms')}`
          : filters.rooms_min
            ? `${filters.rooms_min}+ ${t('alerts.filters.rooms')}`
            : `${t('alerts.filters.to')} ${filters.rooms_max} ${t('alerts.filters.rooms')}`;
      badges.push({
        icon: <BedDouble className="h-3 w-3" />,
        label: roomsLabel,
      });
    }

    if (filters.surface_min || filters.surface_max) {
      const surfaceLabel =
        filters.surface_min && filters.surface_max
          ? `${filters.surface_min}-${filters.surface_max} m²`
          : filters.surface_min
            ? `${filters.surface_min}+ m²`
            : `${t('alerts.filters.to')} ${filters.surface_max} m²`;
      badges.push({
        icon: <Maximize className="h-3 w-3" />,
        label: surfaceLabel,
      });
    }

    return badges;
  };

  const filterBadges = getFilterBadges();

  return (
    <Card className={!alert.is_active ? 'opacity-60' : undefined}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Info */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{alert.name}</h3>
                  {!alert.is_active && (
                    <Badge variant="secondary">{t('alerts.status.paused')}</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {frequencyLabel}
                  {alert.match_count !== undefined && (
                    <> • {t('alerts.matchCount', { count: alert.match_count })}</>
                  )}
                </p>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {alert.is_active ? t('alerts.active') : t('alerts.paused')}
                </span>
                <Switch
                  checked={alert.is_active}
                  onCheckedChange={(checked) => onToggle(alert.id, checked)}
                  disabled={isToggling}
                />
              </div>
            </div>

            {/* Filter badges */}
            {filterBadges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filterBadges.map((badge, index) => (
                  <Badge key={index} variant="outline" className="gap-1">
                    {badge.icon}
                    <span>{badge.label}</span>
                  </Badge>
                ))}
              </div>
            )}

            {/* Dates */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>
                {t('alerts.createdAt', {
                  date: new Date(alert.created_at).toLocaleDateString(),
                })}
              </span>
              {alert.last_sent_at && (
                <span>
                  {t('alerts.lastSent', {
                    date: new Date(alert.last_sent_at).toLocaleDateString(),
                  })}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:flex-col">
            <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
              <Edit2 className="h-4 w-4" />
              <span className="sm:hidden">{t('common.edit')}</span>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-red-600 hover:text-red-700"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span className="sm:hidden">{t('common.delete')}</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('alerts.deleteConfirmTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('alerts.deleteConfirmDescription')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(alert.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {t('common.delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Empty state
interface EmptyAlertsProps {
  onCreateClick: () => void;
}

function EmptyAlerts({ onCreateClick }: EmptyAlertsProps) {
  const { t } = useTranslation('dashboard');

  return (
    <Card className="py-16">
      <CardContent className="text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Bell className="h-8 w-8 text-muted-foreground" />
        </div>
        <CardHeader className="p-0">
          <CardTitle className="text-xl">{t('alerts.empty.title')}</CardTitle>
          <CardDescription className="max-w-sm mx-auto">
            {t('alerts.empty.description')}
          </CardDescription>
        </CardHeader>
        <Button onClick={onCreateClick} className="mt-6 gap-2">
          <Plus className="h-4 w-4" />
          {t('alerts.empty.createFirst')}
        </Button>
      </CardContent>
    </Card>
  );
}

// Loading skeleton
function AlertsSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-28" />
                </div>
                <Skeleton className="h-3 w-48" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
