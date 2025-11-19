import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export function NotFoundPage() {
  const { t, i18n } = useTranslation('common');

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      {/* 404 Illustration */}
      <div className="relative">
        <span className="text-[10rem] font-bold text-muted/30 md:text-[14rem]">
          404
        </span>
        <Home className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 text-primary md:h-28 md:w-28" />
      </div>

      {/* Content */}
      <h1 className="mt-4 text-2xl font-bold md:text-3xl">
        {t('errors.pageNotFound')}
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        {t('errors.pageNotFoundDescription')}
      </p>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Button asChild>
          <Link to={`/${i18n.language}`}>
            <Home className="mr-2 h-4 w-4" />
            {t('nav.home')}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to={`/${i18n.language}/properties`}>
            <Search className="mr-2 h-4 w-4" />
            {t('nav.properties')}
          </Link>
        </Button>
        <Button variant="ghost" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('actions.goBack')}
        </Button>
      </div>
    </div>
  );
}
