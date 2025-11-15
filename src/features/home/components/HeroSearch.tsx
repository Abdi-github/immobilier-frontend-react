import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { cn } from '@/shared/lib/utils';
import { useGetCantonsQuery, type MultiLangName } from '@/features/locations/locations.api';

type TransactionType = 'rent' | 'buy';
type PropertySection = 'residential' | 'commercial';
type SupportedLang = 'en' | 'fr' | 'de' | 'it';

// Helper to get localized name
const getLocalizedName = (name: MultiLangName | string, lang: string): string => {
  if (typeof name === 'string') return name;
  return name[lang as SupportedLang] || name.en || '';
};

export function HeroSearch() {
  const { t, i18n } = useTranslation(['home', 'common']);
  const navigate = useNavigate();
  
  const [section, setSection] = useState<PropertySection>('residential');
  const [transactionType, setTransactionType] = useState<TransactionType>('rent');
  const [cantonId, setCantonId] = useState<string>('all');
  
  const { data: cantonsData } = useGetCantonsQuery();

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set('transaction_type', transactionType);
    if (cantonId && cantonId !== 'all') params.set('canton_id', cantonId);
    
    navigate(`/${i18n.language}/properties?${params.toString()}`);
  };

  return (
    <section className="relative bg-gradient-to-b from-[#f8f9fa] to-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          {/* Hero title - matching immobilier.ch */}
          <h1 className="mb-8 text-center text-3xl font-bold text-[#1a1a2e] md:text-4xl lg:text-5xl">
            {t('home:hero.title', 'Your project starts here')}
          </h1>

          {/* Search box - matching immobilier.ch style */}
          <div className="rounded-lg bg-white p-4 shadow-lg md:p-6">
            {/* Section tabs: Residential | Commercial | Estimate */}
            <div className="mb-4 flex justify-center border-b border-gray-200">
              <button
                type="button"
                onClick={() => setSection('residential')}
                className={cn(
                  'relative px-6 py-3 text-sm font-medium transition-colors',
                  section === 'residential'
                    ? 'text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {t('home:hero.residential', 'Residential')}
              </button>
              <button
                type="button"
                onClick={() => setSection('commercial')}
                className={cn(
                  'relative px-6 py-3 text-sm font-medium transition-colors',
                  section === 'commercial'
                    ? 'text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {t('home:hero.commercial', 'Commercial')}
              </button>
              <button
                type="button"
                className="relative px-6 py-3 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                {t('home:hero.estimate', 'Estimate')}
              </button>
            </div>

            {/* Rent/Buy radio buttons - matching immobilier.ch */}
            <div className="mb-4 flex items-center justify-center gap-6">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="transactionType"
                  checked={transactionType === 'buy'}
                  onChange={() => setTransactionType('buy')}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-700">
                  {t('common:transaction.buy', 'Buy')}
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="transactionType"
                  checked={transactionType === 'rent'}
                  onChange={() => setTransactionType('rent')}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-700">
                  {t('common:transaction.rent', 'Rent')}
                </span>
              </label>
            </div>

            {/* Location search - matching immobilier.ch style */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Select value={cantonId} onValueChange={setCantonId}>
                  <SelectTrigger className="h-12 pl-10 text-left border-gray-300">
                    <SelectValue placeholder={t('home:hero.wherePlaceholder', 'Where? (cities, ZIP, districts, cantons)')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common:filters.allLocations', 'All locations')}</SelectItem>
                    {cantonsData?.data?.map((canton) => (
                      <SelectItem key={canton.id} value={canton.id}>
                        {getLocalizedName(canton.name, i18n.language)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleSearch}
                size="lg" 
                className="h-12 px-6 bg-primary hover:bg-primary/90"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Services section - matching immobilier.ch "Our services to support you" */}
        <div className="mt-12">
          <h2 className="mb-6 text-center text-lg font-semibold text-gray-600">
            {t('home:services.title', 'Our services to support you')}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Estimate card */}
            <div className="group cursor-pointer rounded-lg bg-gradient-to-br from-primary/90 to-primary p-6 text-white shadow-md transition-transform hover:scale-[1.02]">
              <div className="mb-2 text-xl font-bold">
                {t('home:services.estimate.title', 'Estimate')}
              </div>
              <div className="text-sm opacity-90">
                {t('home:services.estimate.subtitle', 'your property')}
              </div>
              <div className="mt-1 text-xs font-semibold uppercase">
                {t('home:services.estimate.tag', 'for free')}
              </div>
              <ChevronRight className="mt-4 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </div>

            {/* e-Tenant card */}
            <div className="group cursor-pointer rounded-lg bg-gradient-to-br from-[#4a90d9] to-[#3a7bc8] p-6 text-white shadow-md transition-transform hover:scale-[1.02]">
              <div className="mb-2 text-xl font-bold">
                {t('home:services.eTenant.title', 'Apply')}
              </div>
              <div className="text-sm opacity-90">
                {t('home:services.eTenant.subtitle', 'for a rental')}
              </div>
              <div className="mt-1 text-xs font-semibold uppercase">
                {t('home:services.eTenant.tag', 'with e-Tenant')}
              </div>
              <ChevronRight className="mt-4 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </div>

            {/* Find agency card */}
            <div className="group cursor-pointer rounded-lg bg-gradient-to-br from-[#2d3748] to-[#1a202c] p-6 text-white shadow-md transition-transform hover:scale-[1.02]">
              <div className="mb-2 text-xl font-bold">
                {t('home:services.findAgency.title', 'Find')}
              </div>
              <div className="text-sm opacity-90">
                {t('home:services.findAgency.subtitle', 'an agency')}
              </div>
              <ChevronRight className="mt-4 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
