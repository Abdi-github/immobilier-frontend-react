import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, MapPin, Phone, Globe, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { Agency } from '../agencies.api';

interface AgencyCardProps {
  agency: Agency;
  lang: string;
}

export function AgencyCard({ agency, lang }: AgencyCardProps) {
  const { t } = useTranslation('agencies');

  const {
    id,
    name,
    address,
    city,
    postal_code,
    phone,
    website,
    logo,
    is_verified,
    verified,
    total_properties,
  } = agency;

  // Get city name in current language with fallback
  const getCityName = (): string => {
    if (!city) return '';
    if (typeof city === 'string') return city;
    if (city.name) {
      return city.name[lang] || city.name['en'] || Object.values(city.name)[0] || '';
    }
    return '';
  };

  const cityName = getCityName();
  const isVerified = is_verified || verified;

  // Format website URL
  const websiteUrl = website?.startsWith('http') ? website : `https://${website}`;

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row">
      {/* Logo */}
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border bg-gray-50">
        {logo ? (
          <img src={logo} alt={name} className="h-full w-full rounded-md object-contain p-1" />
        ) : (
          <Building2 className="h-10 w-10 text-gray-400" />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2">
        {/* Agency Name */}
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">{name}</h3>
          {isVerified && (
            <span title={t('verified', 'Verified')}>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </span>
          )}
        </div>

        {/* Address */}
        <div className="flex items-start gap-1 text-sm text-gray-600">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {address}
            <br />
            {postal_code} {cityName}
          </span>
        </div>

        {/* Contact Info */}
        {phone && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Phone className="h-4 w-4 shrink-0" />
            <a href={`tel:${phone}`} className="hover:text-primary">
              {phone}
            </a>
          </div>
        )}

        {/* Properties Count */}
        {total_properties > 0 && (
          <p className="text-sm text-gray-500">
            {t('propertiesCount', '{{count}} residential objects', { count: total_properties })}{' '}
            <Link
              to={`/${lang}/properties?agency_id=${id}`}
              className="text-primary hover:underline"
            >
              {t('toBuy', 'To buy')}
            </Link>
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
        <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
          <Link to={`/${lang}/agencies/${id}`}>{t('details', 'Details')}</Link>
        </Button>

        {website && (
          <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
            <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
              <Globe className="mr-1 h-4 w-4" />
              {t('map', 'Map')}
            </a>
          </Button>
        )}

        <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
          {t('contact', 'Contact')}
        </Button>
      </div>
    </div>
  );
}
