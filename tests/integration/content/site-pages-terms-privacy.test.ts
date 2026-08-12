import { describe, expect, it } from 'vitest';

import {
  getPublishedContentIndexes,
  getPublishedSitePageContent,
} from '@/content/queries';
import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import { toolRegistry } from '@/features/tools/registry';
import type { Locale } from '@/i18n/types';
import { buildLocalizedPath } from '@/routing/builders';
import { createRouteRegistry } from '@/routing/registry';
import { createPublishedContentSeoIndexabilityResolver } from '@/seo';

const EXPECTED_SITE_PAGES = [
  { pageId: 'privacy', locale: 'en', routeSlug: 'privacy', url: '/privacy/' },
  { pageId: 'terms', locale: 'en', routeSlug: 'terms', url: '/terms/' },
  { pageId: 'privacy', locale: 'es', routeSlug: 'privacidad', url: '/es/privacidad/' },
  { pageId: 'terms', locale: 'es', routeSlug: 'terminos', url: '/es/terminos/' },
  { pageId: 'privacy', locale: 'pt', routeSlug: 'privacidade', url: '/pt/privacidade/' },
  { pageId: 'terms', locale: 'pt', routeSlug: 'termos', url: '/pt/termos/' },
  {
    pageId: 'privacy',
    locale: 'fr',
    routeSlug: 'confidentialite',
    url: '/fr/confidentialite/',
  },
  {
    pageId: 'terms',
    locale: 'fr',
    routeSlug: 'conditions-utilisation',
    url: '/fr/conditions-utilisation/',
  },
] as const satisfies readonly {
  pageId: 'privacy' | 'terms';
  locale: Locale;
  routeSlug: string;
  url: string;
}[];

describe('production Terms and Privacy publication', () => {
  it.each(EXPECTED_SITE_PAGES)(
    'publishes the exact $locale $pageId entry as noindex',
    async ({ pageId, locale, routeSlug }) => {
      const entry = await getPublishedSitePageContent(pageId, locale);

      expect(entry).toMatchObject({
        data: {
          pageId,
          locale,
          routeSlug,
          status: 'published',
          seo: { noindex: true },
        },
      });
    },
  );

  it.each(['privacy', 'terms'] as const)(
    'exposes four public routes and no indexable variants for %s',
    async (pageId) => {
      const indexes = await getPublishedContentIndexes();
      const registry = await createRouteRegistry({
        contentIndexes: indexes,
        toolRegistry,
        toolTaxonomy,
        blogTaxonomy,
      });
      const indexability = createPublishedContentSeoIndexabilityResolver(indexes);
      const expectedRoutes = EXPECTED_SITE_PAGES.filter(
        (entry) => entry.pageId === pageId,
      );

      expect(registry.getByTarget({ kind: 'site-page', pageId })).toHaveLength(4);

      for (const expected of expectedRoutes) {
        const route = registry.getCanonical(expected.locale, {
          kind: 'site-page',
          pageId,
        });

        expect(route).toMatchObject({
          area: 'site',
          locale: expected.locale,
          segments: [expected.routeSlug],
          target: { kind: 'site-page', pageId },
        });
        expect(
          buildLocalizedPath({
            locale: expected.locale,
            segments: route?.segments ?? [],
          }),
        ).toBe(expected.url);
        expect(indexability.isIndexable({ kind: 'site-page', pageId }, expected.locale)).toBe(
          false,
        );
      }
    },
  );
});
