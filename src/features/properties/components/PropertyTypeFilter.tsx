import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { cn } from '@/shared/lib/utils';
import { getLocalizedName, MultiLangName } from '@/shared/utils/formatters';

interface Category {
  id: string;
  name: MultiLangName;
  slug?: string;
}

interface PropertyTypeFilterProps {
  categories: Category[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  lang: string;
}

/**
 * Multi-select property type filter with checkboxes - matches immobilier.ch style
 */
export function PropertyTypeFilter({
  categories,
  selectedIds,
  onChange,
  lang,
}: PropertyTypeFilterProps) {
  const { t } = useTranslation('properties');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  // Get display label
  const getDisplayLabel = () => {
    if (selectedIds.length === 0) {
      return t('filters.propertyType', 'Property type');
    }
    if (selectedIds.length === 1) {
      const selected = categories.find((cat) => cat.id === selectedIds[0]);
      return selected
        ? getLocalizedName(selected.name, lang)
        : t('filters.propertyType', 'Property type');
    }
    return `${selectedIds.length} ${t('filters.typesSelected', 'types')}`;
  };

  // Clear all selections
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dropdown from toggling
    onChange([]);
  };

  const hasValue = selectedIds.length > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-40 justify-between border-gray-300 font-normal',
          hasValue && 'border-primary text-primary'
        )}
      >
        <span className="truncate">{getDisplayLabel()}</span>
        <div className="ml-2 flex items-center gap-1">
          {hasValue && (
            <span
              role="button"
              tabIndex={0}
              className="rounded-sm p-0.5 hover:bg-gray-200"
              onClick={handleClear}
              onKeyDown={(e) => e.key === 'Enter' && handleClear(e as unknown as React.MouseEvent)}
            >
              <X className="h-3.5 w-3.5 shrink-0 opacity-70 hover:opacity-100" />
            </span>
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 opacity-50 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </Button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-md border bg-white p-2 shadow-lg">
          <div className="max-h-64 overflow-auto">
            {categories.map((category) => {
              const isSelected = selectedIds.includes(category.id);
              return (
                <label
                  key={category.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-gray-50"
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(category.id)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-gray-700">
                    {getLocalizedName(category.name, lang)}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
