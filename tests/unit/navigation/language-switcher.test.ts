import { describe, expect, it } from 'vitest';

import { getGlobalMessages } from '@/i18n/messages/registry';
import { buildLanguageSwitcherModel } from '@/navigation/language-switcher';
import type { LocalizedRouteCluster } from '@/seo';

describe('language switcher model', () => {
  it('includes every locale in stable order with one current item', () => {
    const model = buildLanguageSwitcherModel({
      cluster: cluster('es'),
      messages: getGlobalMessages('es').language,
    });

    expect(model.items.map((item) => item.locale)).toEqual([
      'en',
      'es',
      'pt',
      'fr',
    ]);
    expect(model.items.filter((item) => item.state === 'current')).toHaveLength(
      1,
    );
    expect(model.items).toEqual([
      {
        state: 'available',
        locale: 'en',
        label: 'English',
        htmlLang: 'en',
        url: '/developer/json-validator/',
      },
      {
        state: 'current',
        locale: 'es',
        label: 'Español',
        htmlLang: 'es',
      },
      {
        state: 'available',
        locale: 'pt',
        label: 'Português',
        htmlLang: 'pt',
        url: '/pt/desenvolvedor/validador-json/',
      },
      {
        state: 'available',
        locale: 'fr',
        label: 'Français',
        htmlLang: 'fr',
        url: '/fr/developpement/validateur-json/',
      },
    ]);
  });

  it('keeps a published noindex variant available to users', () => {
    const model = buildLanguageSwitcherModel({
      cluster: cluster('en', { es: false }),
      messages: getGlobalMessages('en').language,
    });

    expect(model.items.find((item) => item.locale === 'es')).toEqual({
      state: 'available',
      locale: 'es',
      label: 'Español',
      htmlLang: 'es',
      url: '/es/desarrollo/validador-json/',
    });
  });

  it('marks a missing localized route unavailable without a fallback URL', () => {
    const model = buildLanguageSwitcherModel({
      cluster: cluster('en', { es: undefined }),
      messages: getGlobalMessages('en').language,
    });
    const spanish = model.items.find((item) => item.locale === 'es');

    expect(spanish).toEqual({
      state: 'unavailable',
      locale: 'es',
      label: 'Español',
      htmlLang: 'es',
    });
    expect(spanish).not.toHaveProperty('url');
  });

  it('rejects a cluster missing its current locale', () => {
    expect(() =>
      buildLanguageSwitcherModel({
        cluster: cluster('en', { en: undefined }),
        messages: getGlobalMessages('en').language,
      }),
    ).toThrow('missing its current locale');
  });
});

function cluster(
  currentLocale: 'en' | 'es',
  indexable: Partial<
    Record<'en' | 'es' | 'pt' | 'fr', boolean | undefined>
  > = {},
): LocalizedRouteCluster {
  const routes = {
    en: ['developer', 'json-validator'],
    es: ['desarrollo', 'validador-json'],
    pt: ['desenvolvedor', 'validador-json'],
    fr: ['developpement', 'validateur-json'],
  } as const;
  const omittedLocales = new Set(
    (Object.keys(indexable) as Array<keyof typeof routes>).filter(
      (locale) => indexable[locale] === undefined,
    ),
  );
  const locales = (Object.keys(routes) as Array<keyof typeof routes>).filter(
    (locale) => !omittedLocales.has(locale),
  );
  const variants = locales
    .map((locale) => {
      const segments = routes[locale];
      const relativeUrl = `/${locale === 'en' ? '' : `${locale}/`}${segments.join('/')}/`;

      return {
        locale,
        hrefLang: locale,
        relativeUrl,
        absoluteUrl: `https://4all.tools${relativeUrl}`,
        route: null,
        published: true as const,
        indexable: indexable[locale] ?? true,
      };
    });
  const current = variants.find((variant) => variant.locale === currentLocale);

  return {
    subject: {
      kind: 'route',
      target: {
        kind: 'tool',
        toolId: 'json-validator',
      },
    },
    currentLocale,
    current: current ?? (variants[0] as LocalizedRouteCluster['current']),
    variants,
  };
}
