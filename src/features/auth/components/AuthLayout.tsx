import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, Heart, FolderOpen, LineChart, Clock } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

/**
 * Auth layout with features panel on the right
 * Similar to immobilier.ch auth pages
 */
export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { t, i18n } = useTranslation('auth');
  const lang = i18n.language;

  const features = [
    {
      icon: Bell,
      title: t('features.alerts.title', 'Alerts'),
      description: t(
        'features.alerts.description',
        'Create alerts to be informed about new properties that match your criteria.'
      ),
    },
    {
      icon: LineChart,
      title: t('features.preEstimates.title', 'Pre-estimates'),
      description: t(
        'features.preEstimates.description',
        'Your property pre-estimates are saved in your account and updated regularly.'
      ),
    },
    {
      icon: FolderOpen,
      title: t('features.files.title', 'Files'),
      description: t(
        'features.files.description',
        'Save your property documents to show owners your seriousness as a tenant.'
      ),
    },
    {
      icon: Heart,
      title: t('features.favorites.title', 'Favorites'),
      description: t(
        'features.favorites.description',
        'Save properties you like in your favorites and compare them easily.'
      ),
    },
    {
      icon: Clock,
      title: t('features.consultations.title', 'Latest consultations'),
      description: t(
        'features.consultations.description',
        'Find your recently viewed properties with a single click.'
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to={`/${lang}`} className="flex items-center">
            <span className="text-2xl font-bold text-primary">immobilier</span>
            <span className="text-2xl font-bold text-secondary">.ch</span>
          </Link>
        </div>
      </header>

      {/* Dashboard access banner for professionals */}
      <div className="bg-[#1a1a2e] text-white py-2 text-center text-sm">
        <span>
          {t('professional.banner', 'Are you a professional?')}{' '}
          <Link to={`/${lang}/professional/register`} className="underline hover:text-gray-200">
            {t('professional.dashboardAccess', 'Dashboard access')}
          </Link>
        </span>
      </div>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start max-w-6xl mx-auto">
          {/* Left column - Form */}
          <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8">
            {/* Title */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
              <p className="text-gray-600">{subtitle}</p>
            </div>

            {/* Form content */}
            {children}
          </div>

          {/* Right column - Features */}
          <div className="hidden lg:block">
            <div className="space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex gap-4 p-4 bg-white rounded-lg shadow-sm">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;
