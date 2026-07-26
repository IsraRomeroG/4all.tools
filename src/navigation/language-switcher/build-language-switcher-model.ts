import { LOCALES, SUPPORTED_LOCALES } from '@/i18n/config';
import type { LocalizedRouteCluster } from '@/seo';

import type {
  LanguageNavigationMessages,
  LanguageSwitcherItem,
  LanguageSwitcherModel,
} from './types';

export interface BuildLanguageSwitcherModelInput {
  readonly cluster: LocalizedRouteCluster;
  readonly messages: LanguageNavigationMessages;
}

export function buildLanguageSwitcherModel(
  input: BuildLanguageSwitcherModelInput,
): LanguageSwitcherModel {
  const variantsByLocale = new Map(
    input.cluster.variants.map((variant) => [variant.locale, variant]),
  );

  if (!variantsByLocale.has(input.cluster.currentLocale)) {
    throw new Error(
      `Language switcher cluster is missing its current locale: ${input.cluster.currentLocale}.`,
    );
  }

  const items = SUPPORTED_LOCALES.map((locale): LanguageSwitcherItem => {
    const localeDefinition = LOCALES[locale];

    if (locale === input.cluster.currentLocale) {
      return {
        state: 'current' as const,
        locale,
        label: localeDefinition.label,
        htmlLang: localeDefinition.htmlLang,
      };
    }

    const variant = variantsByLocale.get(locale);

    if (variant === undefined) {
      return {
        state: 'unavailable' as const,
        locale,
        label: localeDefinition.label,
        htmlLang: localeDefinition.htmlLang,
      };
    }

    assertInternalRelativeUrl(variant.relativeUrl, locale);

    return {
      state: 'available' as const,
      locale,
      label: localeDefinition.label,
      htmlLang: localeDefinition.htmlLang,
      url: variant.relativeUrl,
    };
  });

  return {
    ariaLabel: input.messages.switcherLabel,
    currentLanguage: input.messages.currentLanguage,
    unavailableLabel: input.messages.unavailable,
    items,
  };
}

function assertInternalRelativeUrl(url: string, locale: string): void {
  if (!url.startsWith('/') || url.startsWith('//')) {
    throw new Error(
      `Language switcher URL for locale ${locale} must be an internal relative URL.`,
    );
  }
}
