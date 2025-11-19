import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Construction, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface ComingSoonPageProps {
  titleKey: string;
}

export function ComingSoonPage({ titleKey }: ComingSoonPageProps) {
  const { t, i18n } = useTranslation('common');
  const lang = i18n.language;

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center">
        <Construction className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-3xl font-bold mb-2">{t(titleKey)}</h1>
        <p className="text-muted-foreground mb-6">
          {t('comingSoon.description', 'This feature is coming soon. Stay tuned!')}
        </p>
        <Button asChild>
          <Link to={`/${lang}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('comingSoon.backHome', 'Back to Home')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
