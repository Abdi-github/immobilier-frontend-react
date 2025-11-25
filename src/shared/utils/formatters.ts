/**
 * Format price in CHF with Swiss formatting
 */
export function formatPrice(
  price: number | null | undefined,
  currency: string = 'CHF'
): string {
  if (price === null || price === undefined) {
    return 'Prix sur demande';
  }
  
  if (price === 0) {
    return 'Prix sur demande';
  }

  // Swiss number formatting: 1'000'000
  const formatted = price.toLocaleString('de-CH');
  return `${currency} ${formatted}`;
}

/**
 * Format price with /month suffix for rentals
 */
export function formatRentalPrice(
  price: number | null | undefined,
  currency: string = 'CHF',
  monthLabel: string = '/mo'
): string {
  const basePrice = formatPrice(price, currency);
  if (price === null || price === undefined || price === 0) {
    return basePrice;
  }
  return `${basePrice}${monthLabel}`;
}

/**
 * Format area in square meters
 */
export function formatArea(area: number | null | undefined): string {
  if (area === null || area === undefined) {
    return '-';
  }
  return `${area.toLocaleString('de-CH')} m²`;
}

/**
 * Format rooms count
 */
export function formatRooms(
  rooms: number | null | undefined,
  singular: string = 'room',
  plural: string = 'rooms'
): string {
  if (rooms === null || rooms === undefined) {
    return '-';
  }
  return `${rooms} ${rooms === 1 ? singular : plural}`;
}

/**
 * Format date for display
 */
export function formatDate(
  date: string | Date | null | undefined,
  locale: string = 'en-CH'
): string {
  if (!date) {
    return '-';
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(
  date: string | Date | null | undefined,
  locale: string = 'en'
): string {
  if (!date) {
    return '-';
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return rtf.format(-diffMins, 'minute');
    }
    return rtf.format(-diffHours, 'hour');
  }
  
  if (diffDays < 30) {
    return rtf.format(-diffDays, 'day');
  }
  
  if (diffDays < 365) {
    const diffMonths = Math.floor(diffDays / 30);
    return rtf.format(-diffMonths, 'month');
  }
  
  const diffYears = Math.floor(diffDays / 365);
  return rtf.format(-diffYears, 'year');
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength).trim()}...`;
}

/**
 * Generate slug from text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Multi-language name type
 */
export type MultiLangName = {
  en?: string;
  fr?: string;
  de?: string;
  it?: string;
} | string;

type SupportedLang = 'en' | 'fr' | 'de' | 'it';

/**
 * Get localized name from multi-language object
 */
export function getLocalizedName(name: MultiLangName | undefined | null, lang: string): string {
  if (!name) return '';
  if (typeof name === 'string') return name;
  return name[lang as SupportedLang] || name.en || '';
}
