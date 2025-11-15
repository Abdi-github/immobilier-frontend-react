import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Key, Building2 } from 'lucide-react';

export function BuyOrRentSection() {
  const { t, i18n } = useTranslation('home');
  const lang = i18n.language;

  return (
    <section className="bg-[#1a1a2e] py-16">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            {t('buyOrRent.title', 'Buy or rent ?')}
          </h2>
          <p className="mt-2 text-white/70">
            {t('buyOrRent.subtitle', 'Whatever your requirements, you will certainly find what you are looking for on immobilier.ch.')}
          </p>
        </div>

        {/* Options grid */}
        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
          {/* Buy option */}
          <Link
            to={`/${lang}/properties?transaction_type=buy`}
            className="group flex items-center gap-4 rounded-lg bg-white/10 p-6 transition-all hover:bg-white/20"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <Home className="h-6 w-6" />
            </div>
            <span className="text-lg font-semibold text-white">
              {t('buyOrRent.wantToBuy', 'I want to buy')}
            </span>
          </Link>

          {/* Rent option */}
          <Link
            to={`/${lang}/properties?transaction_type=rent`}
            className="group flex items-center gap-4 rounded-lg bg-white/10 p-6 transition-all hover:bg-white/20"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <Key className="h-6 w-6" />
            </div>
            <span className="text-lg font-semibold text-white">
              {t('buyOrRent.wantToRent', 'I want to rent')}
            </span>
          </Link>

          {/* Agency option */}
          <Link
            to={`/${lang}/agencies`}
            className="group flex items-center gap-4 rounded-lg bg-white/10 p-6 transition-all hover:bg-white/20"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <Building2 className="h-6 w-6" />
            </div>
            <span className="text-lg font-semibold text-white">
              {t('buyOrRent.lookingForAgency', 'I am looking for a real estate agency')}
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
