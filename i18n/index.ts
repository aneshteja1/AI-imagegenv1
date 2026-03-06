import { en } from './en';
import { ge } from './ge';
import { de } from './de';

export type Language = 'en' | 'ge' | 'de';
export type { Translations } from './en';

export const translations = { en, ge, de };

export function getTranslations(lang: Language) {
  return translations[lang] ?? translations.en;
}

export const SUPPORTED_LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ge', label: 'ქართული', flag: '🇬🇪' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];