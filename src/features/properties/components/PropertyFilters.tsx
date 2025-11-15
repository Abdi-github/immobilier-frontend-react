import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/components/ui/drawer';
import { useGetCantonsQuery, useGetCategoriesQuery, useGetCitiesQuery, type MultiLangName } from '@/features/locations/locations.api';
import { PRICE_RANGES, ROOM_OPTIONS, SURFACE_OPTIONS } from '@/shared/utils/constants';

type SupportedLang = 'en' | 'fr' | 'de' | 'it';

// Helper to get localized name
const getLocalizedName = (name: MultiLangName | string, lang: string): string => {
  if (typeof name === 'string') return name;
  return name[lang as SupportedLang] || name.en || '';
};

interface PropertyFiltersProps {
  onApply?: () => void;
}

export function PropertyFilters({ onApply }: PropertyFiltersProps) {
  const { t, i18n } = useTranslation(['properties', 'common']);
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: cantonsData } = useGetCantonsQuery();
  const { data: categoriesData } = useGetCategoriesQuery();
  
  const selectedCantonId = searchParams.get('canton_id') || '';
  const { data: citiesData } = useGetCitiesQuery(
    selectedCantonId ? { canton_id: selectedCantonId } : undefined
  );

  // Get current filter values
  const transactionType = searchParams.get('transaction_type') || '';
  const categoryId = searchParams.get('category_id') || '';
  const cityId = searchParams.get('city_id') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const minRooms = searchParams.get('min_rooms') || '';
  const maxRooms = searchParams.get('max_rooms') || '';
  const minSurface = searchParams.get('min_surface') || '';
  const maxSurface = searchParams.get('max_surface') || '';

  // Count active filters
  const activeFilters = [
    transactionType,
    categoryId,
    selectedCantonId,
    cityId,
    minPrice,
    maxPrice,
    minRooms,
    maxRooms,
    minSurface,
    maxSurface,
  ].filter(Boolean).length;

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset to page 1 when filters change
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Transaction Type */}
      <div className="space-y-2">
        <Label>{t('properties:filters.transactionType')}</Label>
        <Select value={transactionType || 'all'} onValueChange={(v) => updateFilter('transaction_type', v)}>
          <SelectTrigger>
            <SelectValue placeholder={t('common:filters.all')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common:filters.all')}</SelectItem>
            <SelectItem value="rent">{t('common:transaction.rent')}</SelectItem>
            <SelectItem value="buy">{t('common:transaction.buy')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Category */}
      <div className="space-y-2">
        <Label>{t('properties:filters.category')}</Label>
        <Select value={categoryId || 'all'} onValueChange={(v) => updateFilter('category_id', v)}>
          <SelectTrigger>
            <SelectValue placeholder={t('common:filters.allTypes')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common:filters.allTypes')}</SelectItem>
            {categoriesData?.data?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {getLocalizedName(category.name, i18n.language)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Location */}
      <div className="space-y-4">
        <Label>{t('properties:filters.location')}</Label>
        
        {/* Canton */}
        <Select value={selectedCantonId || 'all'} onValueChange={(v) => {
          updateFilter('canton_id', v);
          updateFilter('city_id', 'all'); // Reset city when canton changes
        }}>
          <SelectTrigger>
            <SelectValue placeholder={t('common:filters.selectCanton')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common:filters.allCantons')}</SelectItem>
            {cantonsData?.data?.map((canton) => (
              <SelectItem key={canton.id} value={canton.id}>
                {getLocalizedName(canton.name, i18n.language)} ({canton.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* City */}
        <Select 
          value={cityId || 'all'} 
          onValueChange={(v) => updateFilter('city_id', v)}
          disabled={!selectedCantonId}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('common:filters.selectCity')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common:filters.allCities')}</SelectItem>
            {citiesData?.data?.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {getLocalizedName(city.name, i18n.language)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-4">
        <Label>{t('properties:filters.priceRange')}</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Input
              type="number"
              placeholder={t('common:filters.min')}
              value={minPrice}
              onChange={(e) => updateFilter('min_price', e.target.value)}
            />
          </div>
          <div>
            <Input
              type="number"
              placeholder={t('common:filters.max')}
              value={maxPrice}
              onChange={(e) => updateFilter('max_price', e.target.value)}
            />
          </div>
        </div>
        {/* Quick price selects */}
        <div className="flex flex-wrap gap-1">
          {PRICE_RANGES.map((range) => (
            <Badge
              key={range.label}
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-white"
              onClick={() => {
                updateFilter('min_price', range.min?.toString() || '');
                updateFilter('max_price', range.max?.toString() || '');
              }}
            >
              {range.label}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Rooms */}
      <div className="space-y-2">
        <Label>{t('properties:filters.rooms')}</Label>
        <div className="grid grid-cols-2 gap-2">
          <Select value={minRooms || 'all'} onValueChange={(v) => updateFilter('min_rooms', v)}>
            <SelectTrigger>
              <SelectValue placeholder={t('common:filters.min')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common:filters.min')}</SelectItem>
              {ROOM_OPTIONS.filter(opt => opt.value !== null).map((room) => (
                <SelectItem key={room.value} value={room.value!.toString()}>
                  {room.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={maxRooms || 'all'} onValueChange={(v) => updateFilter('max_rooms', v)}>
            <SelectTrigger>
              <SelectValue placeholder={t('common:filters.max')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common:filters.max')}</SelectItem>
              {ROOM_OPTIONS.filter(opt => opt.value !== null).map((room) => (
                <SelectItem key={room.value} value={room.value!.toString()}>
                  {room.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Surface */}
      <div className="space-y-2">
        <Label>{t('properties:filters.surface')}</Label>
        <div className="grid grid-cols-2 gap-2">
          <Select value={minSurface || 'all'} onValueChange={(v) => updateFilter('min_surface', v)}>
            <SelectTrigger>
              <SelectValue placeholder={t('common:filters.min')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common:filters.min')}</SelectItem>
              {SURFACE_OPTIONS.filter(opt => opt.value !== null).map((surface) => (
                <SelectItem key={surface.value} value={surface.value!.toString()}>
                  {surface.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={maxSurface || 'all'} onValueChange={(v) => updateFilter('max_surface', v)}>
            <SelectTrigger>
              <SelectValue placeholder={t('common:filters.max')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common:filters.max')}</SelectItem>
              {SURFACE_OPTIONS.filter(opt => opt.value !== null).map((surface) => (
                <SelectItem key={surface.value} value={surface.value!.toString()}>
                  {surface.value} m²
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop filters sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t('properties:filters.title')}</h2>
            {activeFilters > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-4 w-4" />
                {t('common:actions.clear')}
              </Button>
            )}
          </div>
          <FilterContent />
        </div>
      </aside>

      {/* Mobile filters drawer */}
      <div className="lg:hidden">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              {t('properties:filters.title')}
              {activeFilters > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilters}
                </Badge>
              )}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{t('properties:filters.title')}</DrawerTitle>
            </DrawerHeader>
            <div className="max-h-[60vh] overflow-y-auto px-4">
              <FilterContent />
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button onClick={onApply}>{t('common:actions.apply')}</Button>
              </DrawerClose>
              <Button variant="outline" onClick={clearFilters}>
                {t('common:actions.clearAll')}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}
