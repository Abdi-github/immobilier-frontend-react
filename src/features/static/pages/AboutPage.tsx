import { useTranslation } from 'react-i18next';
import { Building2, Users, Globe, Shield } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';

export function AboutPage() {
  const { t } = useTranslation('common');

  const values = [
    {
      icon: Building2,
      title: t('about.values.quality.title', 'Quality Listings'),
      description: t(
        'about.values.quality.description',
        'Every property listing is verified and moderated to ensure accuracy and quality for our users.'
      ),
    },
    {
      icon: Users,
      title: t('about.values.trust.title', 'Trusted Partners'),
      description: t(
        'about.values.trust.description',
        'We work with verified agencies and property owners across all Swiss cantons.'
      ),
    },
    {
      icon: Globe,
      title: t('about.values.multilingual.title', 'Multilingual'),
      description: t(
        'about.values.multilingual.description',
        'Our platform is available in English, French, German, and Italian to serve all of Switzerland.'
      ),
    },
    {
      icon: Shield,
      title: t('about.values.security.title', 'Data Security'),
      description: t(
        'about.values.security.description',
        'Your personal data is protected with industry-standard security measures and Swiss privacy laws.'
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t('about.title', 'About Immobilier.ch')}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t(
            'about.subtitle',
            "Switzerland's leading real estate platform, connecting property seekers with their dream homes since 2024."
          )}
        </p>
      </div>

      {/* Mission */}
      <div className="prose prose-gray max-w-none mb-12">
        <h2 className="text-2xl font-semibold">{t('about.mission.title', 'Our Mission')}</h2>
        <p className="text-muted-foreground leading-relaxed">
          {t(
            'about.mission.text',
            "Immobilier.ch is dedicated to simplifying the Swiss real estate market. Whether you're looking to rent an apartment in Zurich, buy a house in Geneva, or find commercial space in Bern, our platform provides comprehensive property listings with advanced search capabilities, multi-language support, and direct connections to trusted agencies and property owners."
          )}
        </p>
      </div>

      {/* Values */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">
          {t('about.values.title', 'What Sets Us Apart')}
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {values.map((value) => (
            <Card key={value.title}>
              <CardContent className="p-6 flex gap-4">
                <div className="shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <value.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{value.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{value.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="rounded-xl bg-muted p-8 text-center">
        <h2 className="text-2xl font-semibold mb-6">
          {t('about.stats.title', 'Immobilier.ch in Numbers')}
        </h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <div>
            <p className="text-3xl font-bold text-primary">26</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('about.stats.cantons', 'Cantons Covered')}
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">10K+</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('about.stats.properties', 'Property Listings')}
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">500+</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('about.stats.agencies', 'Trusted Agencies')}
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">4</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('about.stats.languages', 'Languages')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
