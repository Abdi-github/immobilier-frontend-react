import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Building2, Home, Store, Warehouse, Trees, Castle } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useGetCategoriesQuery, type MultiLangName } from '@/features/locations/locations.api';

type SupportedLang = 'en' | 'fr' | 'de' | 'it';

// Helper to get localized name
const getLocalizedName = (name: MultiLangName | string, lang: string): string => {
  if (typeof name === 'string') return name;
  return name[lang as SupportedLang] || name.en || '';
};

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  apartment: Building2,
  house: Home,
  villa: Castle,
  studio: Building2,
  commercial: Store,
  office: Building2,
  warehouse: Warehouse,
  land: Trees,
  parking: Warehouse,
  default: Building2,
};

export function CategoryCards() {
  const { t, i18n } = useTranslation(['home', 'common']);

  const { data, isLoading } = useGetCategoriesQuery();

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-foreground">{t('home:categories.title')}</h2>
          <p className="mt-2 text-muted-foreground">{t('home:categories.subtitle')}</p>
        </div>

        {/* Categories grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data?.data?.slice(0, 8).map((category) => {
              const IconComponent = categoryIcons[category.slug] ?? Building2;

              return (
                <Link
                  key={category.id}
                  to={`/${i18n.language}/properties?category_id=${category.id}`}
                >
                  <Card className="group cursor-pointer transition-all hover:border-primary hover:shadow-md">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="mb-3 rounded-full bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground">
                        {getLocalizedName(category.name, i18n.language)}
                      </h3>
                      {category.count !== undefined && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {category.count} {t('common:property', { count: category.count })}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
