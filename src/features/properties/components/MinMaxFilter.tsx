import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils';

interface MinMaxOption {
  value: number;
  label: string;
}

interface MinMaxFilterProps {
  label: string;
  minValue?: number;
  maxValue?: number;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
  options: MinMaxOption[];
  unit?: string;
  formatValue?: (value: number) => string;
}

/**
 * Min/Max filter dropdown - matches immobilier.ch style
 * Has two text inputs for min/max and a list of preset values
 */
export function MinMaxFilter({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  options,
  unit: _unit = '',
  formatValue,
}: MinMaxFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localMin, setLocalMin] = useState(minValue?.toString() || '');
  const [localMax, setLocalMax] = useState(maxValue?.toString() || '');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Apply values when closing
        applyValues();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [localMin, localMax]);

  // Sync local state with props
  useEffect(() => {
    setLocalMin(minValue?.toString() || '');
    setLocalMax(maxValue?.toString() || '');
  }, [minValue, maxValue]);

  const applyValues = () => {
    const min = localMin ? parseInt(localMin, 10) : undefined;
    const max = localMax ? parseInt(localMax, 10) : undefined;

    if (min !== minValue) onMinChange(min);
    if (max !== maxValue) onMaxChange(max);
  };

  const handleOptionClick = (value: number, target: 'min' | 'max') => {
    if (target === 'min') {
      setLocalMin(value.toString());
      onMinChange(value);
    } else {
      setLocalMax(value.toString());
      onMaxChange(value);
    }
  };

  // Get display label
  const getDisplayLabel = () => {
    if (minValue && maxValue) {
      const minStr = formatValue ? formatValue(minValue) : minValue.toString();
      const maxStr = formatValue ? formatValue(maxValue) : maxValue.toString();
      return `${minStr} - ${maxStr}`;
    }
    if (minValue) {
      const minStr = formatValue ? formatValue(minValue) : minValue.toString();
      return `${minStr}+`;
    }
    if (maxValue) {
      const maxStr = formatValue ? formatValue(maxValue) : maxValue.toString();
      return `≤ ${maxStr}`;
    }
    return label;
  };

  const hasValue = minValue !== undefined || maxValue !== undefined;

  // Clear all values
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dropdown from toggling
    setLocalMin('');
    setLocalMax('');
    onMinChange(undefined);
    onMaxChange(undefined);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-auto min-w-32 justify-between border-gray-300 font-normal',
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
        <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-md border bg-white shadow-lg">
          {/* Min/Max inputs */}
          <div className="flex gap-2 border-b p-3">
            <div className="flex-1">
              <Input
                placeholder="Min"
                value={localMin}
                onChange={(e) => setLocalMin(e.target.value.replace(/\D/g, ''))}
                onBlur={applyValues}
                onKeyDown={(e) => e.key === 'Enter' && applyValues()}
                className="h-9 text-sm"
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Max"
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value.replace(/\D/g, ''))}
                onBlur={applyValues}
                onKeyDown={(e) => e.key === 'Enter' && applyValues()}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Preset options - two columns */}
          <div className="grid max-h-48 grid-cols-2 gap-0 overflow-auto">
            <div className="border-r">
              <p className="bg-gray-50 px-2 py-1 text-xs font-medium text-gray-500">Min</p>
              {options.map((option) => (
                <button
                  key={`min-${option.value}`}
                  className={cn(
                    'w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50',
                    minValue === option.value && 'bg-primary/10 font-medium text-primary'
                  )}
                  onClick={() => handleOptionClick(option.value, 'min')}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div>
              <p className="bg-gray-50 px-2 py-1 text-xs font-medium text-gray-500">Max</p>
              {options.map((option) => (
                <button
                  key={`max-${option.value}`}
                  className={cn(
                    'w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50',
                    maxValue === option.value && 'bg-primary/10 font-medium text-primary'
                  )}
                  onClick={() => handleOptionClick(option.value, 'max')}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Predefined options for common use cases
export const PRICE_OPTIONS_RENT: MinMaxOption[] = [
  { value: 400, label: 'CHF 400' },
  { value: 600, label: 'CHF 600' },
  { value: 800, label: 'CHF 800' },
  { value: 1000, label: "CHF 1'000" },
  { value: 1200, label: "CHF 1'200" },
  { value: 1400, label: "CHF 1'400" },
  { value: 1600, label: "CHF 1'600" },
  { value: 1800, label: "CHF 1'800" },
  { value: 2000, label: "CHF 2'000" },
  { value: 2500, label: "CHF 2'500" },
  { value: 3000, label: "CHF 3'000" },
  { value: 4000, label: "CHF 4'000" },
  { value: 5000, label: "CHF 5'000" },
  { value: 6000, label: "CHF 6'000" },
  { value: 8000, label: "CHF 8'000" },
];

export const PRICE_OPTIONS_BUY: MinMaxOption[] = [
  { value: 200000, label: "CHF 200'000" },
  { value: 300000, label: "CHF 300'000" },
  { value: 400000, label: "CHF 400'000" },
  { value: 500000, label: "CHF 500'000" },
  { value: 600000, label: "CHF 600'000" },
  { value: 800000, label: "CHF 800'000" },
  { value: 1000000, label: "CHF 1'000'000" },
  { value: 1500000, label: "CHF 1'500'000" },
  { value: 2000000, label: "CHF 2'000'000" },
  { value: 3000000, label: "CHF 3'000'000" },
];

export const ROOMS_OPTIONS: MinMaxOption[] = [
  { value: 1, label: '1 room' },
  { value: 1.5, label: '1.5 rooms' },
  { value: 2, label: '2 rooms' },
  { value: 2.5, label: '2.5 rooms' },
  { value: 3, label: '3 rooms' },
  { value: 3.5, label: '3.5 rooms' },
  { value: 4, label: '4 rooms' },
  { value: 4.5, label: '4.5 rooms' },
  { value: 5, label: '5 rooms' },
  { value: 6, label: '6 rooms' },
  { value: 7, label: '7 rooms' },
  { value: 8, label: '8+ rooms' },
];

export const SURFACE_OPTIONS: MinMaxOption[] = [
  { value: 20, label: '20 m²' },
  { value: 40, label: '40 m²' },
  { value: 60, label: '60 m²' },
  { value: 80, label: '80 m²' },
  { value: 100, label: '100 m²' },
  { value: 120, label: '120 m²' },
  { value: 150, label: '150 m²' },
  { value: 180, label: '180 m²' },
  { value: 200, label: '200 m²' },
  { value: 250, label: '250 m²' },
  { value: 300, label: '300 m²' },
];

// Format helpers
export function formatSwissPrice(value: number): string {
  return `CHF ${value.toLocaleString('de-CH')}`;
}

export function formatRooms(value: number): string {
  return `${value} rooms`;
}

export function formatSurface(value: number): string {
  return `${value} m²`;
}
