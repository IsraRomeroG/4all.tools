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

const EXPECTED_SITE_PAGES = [
  { pageId: 'about', locale: 'en', routeSlug: 'about', url: '/about/' },
  { pageId: 'contact', locale: 'en', routeSlug: 'contact', url: '/contact/' },
  { pageId: 'about', locale: 'es', routeSlug: 'acerca-de', url: '/es/acerca-de/' },
  { pageId: 'contact', locale: 'es', routeSlug: 'contacto', url: '/es/contacto/' },
  { pageId: 'about', locale: 'pt', routeSlug: 'sobre', url: '/pt/sobre/' },
  { pageId: 'contact', locale: 'pt', routeSlug: 'contato', url: '/pt/contato/' },
  { pageId: 'about', locale: 'fr', routeSlug: 'a-propos', url: '/fr/a-propos/' },
  { pageId: 'contact', locale: 'fr', routeSlug: 'contact', url: '/fr/contact/' },
] as const satisfies readonly {
  pageId: 'about' | 'contact';
  locale: Locale;
  routeSlug: string;
  url: string;
}[];

describe('production About and Contact publication', () => {
  it.each(EXPECTED_SITE_PAGES)(
    'publishes the exact $locale $pageId entry without locale fallback',
    async ({ pageId, locale, routeSlug }) => {
      const entry = await getPublishedSitePageContent(pageId, locale);

      expect(entry).toMatchObject({
        data: {
          pageId,
          locale,
          routeSlug,
          status: 'published',
          seo: { noindex: false },
        },
      });
    },
  );

  it.each(['about', 'contact'] as const)(
    'exposes four canonical localized routes for %s',
    async (pageId) => {
      const indexes = await getPublishedContentIndexes();
      const registry = await createRouteRegistry({
        contentIndexes: indexes,
        toolRegistry,
        toolTaxonomy,
        blogTaxonomy,
      });
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
      }
    },
  );
});
