import { describe, expect, it } from 'vitest';

import { getGlobalMessages } from '@/i18n/messages/registry';
import { SUPPORTED_LOCALES, type Locale } from '@/i18n/types';
import {
  buildSiteHeaderModel,
} from '@/navigation/site-header';
import { buildLocalizedPath } from '@/routing/builders';
import type { LocalizedRouteCluster } from '@/seo';

describe('site header model', () => {
  it.each([
    ['en', '/'],
    ['es', '/es/'],
    ['pt', '/pt/'],
    ['fr', '/fr/'],
  ] as const)('builds the localized Home URL for %s', (locale, url) => {
    const model = buildSiteHeaderModel({
      locale,
      pageContext: 'home',
      localizedRouteCluster: cluster(locale),
      messages: getGlobalMessages(locale),
    });

    expect(model.brand.url).toBe(url);
    expect(model.brand.url).not.toContain('/en/');
  });

  it.each([
    ['en', '/blog/'],
    ['es', '/es/blog/'],
    ['pt', '/pt/blog/'],
    ['fr', '/fr/blog/'],
  ] as const)('builds the localized Blog URL for %s', (locale, url) => {
    const model = buildSiteHeaderModel({
      locale,
      pageContext: 'other',
      localizedRouteCluster: cluster(locale),
      messages: getGlobalMessages(locale),
    });

    expect(model.primaryLinks).toHaveLength(1);
    expect(model.primaryLinks[0]?.id).toBe('blog');
    expect(model.primaryLinks[0]?.url).toBe(url);
  });

  it.each([
    ['home', true, 'page', false, undefined],
    ['blog-index', false, undefined, true, 'page'],
    ['blog-descendant', false, undefined, true, undefined],
    ['other', false, undefined, false, undefined],
  ] as const)(
    'keeps visual activity separate from current-page state for %s',
    (pageContext, brandActive, brandCurrent, blogActive, blogCurrent) => {
      const model = buildSiteHeaderModel({
        locale: 'en',
        pageContext,
        localizedRouteCluster: cluster('en'),
        messages: getGlobalMessages('en'),
      });

      expect(model.brand.active).toBe(brandActive);
      expect(model.brand.ariaCurrent).toBe(brandCurrent);
      expect(model.primaryLinks[0]?.active).toBe(blogActive);
      expect(model.primaryLinks[0]?.ariaCurrent).toBe(blogCurrent);
    },
  );

  it('uses localized labels and composes the existing language switcher model', () => {
    const model = buildSiteHeaderModel({
      locale: 'es',
      pageContext: 'blog-index',
      localizedRouteCluster: cluster('es', ['fr']),
      messages: getGlobalMessages('es'),
    });

    expect(model.primaryNavigationLabel).toBe(
      getGlobalMessages('es').navigation.primaryNavigationLabel,
    );
    expect(model.primaryLinks[0]?.label).toBe(getGlobalMessages('es').nav.blog);
    expect(model.languageSwitcher.items).toHaveLength(4);
    expect(
      model.languageSwitcher.items.find((item) => item.locale === 'fr'),
    ).toMatchObject({ state: 'unavailable' });
  });
});

function cluster(
  currentLocale: Locale,
  unavailable: readonly Locale[] = [],
): LocalizedRouteCluster {
  const variants = SUPPORTED_LOCALES.filter(
    (locale) => !unavailable.includes(locale),
  ).map((locale) => ({
    locale,
    hrefLang: locale,
    relativeUrl: buildLocalizedPath({
      locale,
      segments: ['example'],
    }),
    absoluteUrl: `https://4all.tools${buildLocalizedPath({
      locale,
      segments: ['example'],
    })}`,
    route: null,
    published: true as const,
    indexable: true,
  }));
  const current = variants.find((variant) => variant.locale === currentLocale);

  if (current === undefined) {
    throw new Error(`Missing test variant for ${currentLocale}.`);
  }

  return {
    subject: { kind: 'home' },
    currentLocale,
    current,
    variants,
  };
}
