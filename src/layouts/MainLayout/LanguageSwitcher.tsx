import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setLanguage, type SupportedLanguage } from '@/shared/state/language.slice';
import { LANGUAGE_LABELS, LANGUAGE_FLAGS } from '@/shared/utils/constants';
import { cn } from '@/shared/lib/utils';

export function LanguageSwitcher() {
  const { i18n } = useTranslation('common');
  const dispatch = useAppDispatch();
  const { current: currentLanguage, supported } = useAppSelector((state) => state.language);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    dispatch(setLanguage(lang));
    i18n.changeLanguage(lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {LANGUAGE_FLAGS[currentLanguage]} {currentLanguage.toUpperCase()}
          </span>
          <span className="sm:hidden">{LANGUAGE_FLAGS[currentLanguage]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {supported.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={cn(
              'cursor-pointer justify-between',
              currentLanguage === lang && 'bg-accent'
            )}
          >
            <span>
              {LANGUAGE_FLAGS[lang]} {LANGUAGE_LABELS[lang]}
            </span>
            {currentLanguage === lang && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
