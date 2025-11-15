import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

const SORT_OPTIONS = [
  { value: 'published_at:desc', label: 'sortOptions.newest' },
  { value: 'published_at:asc', label: 'sortOptions.oldest' },
  { value: 'price:asc', label: 'sortOptions.priceLowHigh' },
  { value: 'price:desc', label: 'sortOptions.priceHighLow' },
  { value: 'surface:desc', label: 'sortOptions.surfaceLargest' },
  { value: 'rooms:desc', label: 'sortOptions.mostRooms' },
];

export function PropertySort() {
  const { t } = useTranslation('properties');
  const [searchParams, setSearchParams] = useSearchParams();

  const currentSort = `${searchParams.get('sort_by') || 'published_at'}:${searchParams.get('sort_order') || 'desc'}`;

  const handleSortChange = (value: string) => {
    const parts = value.split(':');
    const sortBy = parts[0] || 'published_at';
    const sortOrder = parts[1] || 'desc';
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort_by', sortBy);
    newParams.set('sort_order', sortOrder);
    setSearchParams(newParams);
  };

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder={t('sort.placeholder')} />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {t(option.label)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
