import { useTranslation } from 'react-i18next';
import { HeroSearch } from '../components/HeroSearch';
import { FeaturedProperties } from '../components/FeaturedProperties';
import { CityListings } from '../components/CityListings';
import { BuyOrRentSection } from '../components/BuyOrRentSection';
import { SEO } from '@/shared/components/SEO';

export function HomePage() {
  const { t } = useTranslation('home');

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={t('seo.title', 'Real Estate in Switzerland – Buy & Rent')}
        description={t(
          'seo.description',
          'Find apartments, houses & commercial properties for rent or sale across Switzerland. Search by canton, city, price, and more on Immobilier.ch.'
        )}
      />
      {/* Hero section with search */}
      <HeroSearch />

      {/* Container with horizontal padding on md+ screens */}
      <div className="mx-auto max-w-7xl md:px-6 lg:px-8">
        {/* City listings - matching immobilier.ch "Broaden your search to other towns" */}
        <CityListings />

        {/* Buy or Rent section */}
        <BuyOrRentSection />

        {/* Featured properties */}
        <FeaturedProperties />

        {/* Info section - matching immobilier.ch bottom text */}
        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <h2 className="mb-6 text-xl font-bold text-[#1a1a2e]">
              {t(
                'info.title',
                'We provide you with the keys to a successful real estate experience in Switzerland'
              )}
            </h2>
            <div className="prose prose-sm max-w-none text-gray-600">
              <p>
                {t(
                  'info.paragraph1',
                  'Buying a house, renting an apartment or investing in real estate can often be complicated. Whatever your real estate project in Switzerland – buying, renting, selling or investing – you can be sure to find all the answers to your needs on immobilier.ch.'
                )}
              </p>
              <p className="mt-4">
                {t(
                  'info.paragraph2',
                  'Your dream home is waiting for you! It will only take a few clicks to find it on immobilier.ch. Enter your criteria, launch the search and straightaway obtain the most relevant results.'
                )}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
