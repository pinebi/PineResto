import { useTheme } from '@/contexts/ThemeContext';
import { translations, LanguageKey } from '@/utils/translations';

export function useTranslations() {
  const { language } = useTheme();

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language as LanguageKey];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return { t, language };
}


