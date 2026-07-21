import type { Locale } from '@/i18n/types';

export interface LanguageNavigationMessages {
  readonly switcherLabel: string;
  readonly currentLanguage: string;
  readonly unavailable: string;
}

export type LanguageSwitcherItem =
  | {
      readonly state: 'current';
      readonly locale: Locale;
      readonly label: string;
      readonly htmlLang: string;
    }
  | {
      readonly state: 'available';
      readonly locale: Locale;
      readonly label: string;
      readonly htmlLang: string;
      readonly url: string;
    }
  | {
      readonly state: 'unavailable';
      readonly locale: Locale;
      readonly label: string;
      readonly htmlLang: string;
    };

export interface LanguageSwitcherModel {
  readonly ariaLabel: string;
  readonly currentLanguage: string;
  readonly unavailableLabel: string;
  readonly items: readonly LanguageSwitcherItem[];
}
