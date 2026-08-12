import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import { getPublishedContentIndexes } from '@/content/queries';
import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import { toolRegistry } from '@/features/tools/registry';
import { SUPPORTED_LOCALES, type Locale } from '@/i18n/types';
import { buildLocalizedPath } from '@/routing/builders';
import { createRouteRegistry } from '@/routing/registry';

const SITE_PAGE_IDS = ['about', 'contact', 'privacy', 'terms'] as const;

const EXPECTED_SITE_ROUTES = [
  ['/about/', 'en', 'about'],
  ['/contact/', 'en', 'contact'],
  ['/privacy/', 'en', 'privacy'],
  ['/terms/', 'en', 'terms'],
  ['/es/acerca-de/', 'es', 'about'],
  ['/es/contacto/', 'es', 'contact'],
  ['/es/privacidad/', 'es', 'privacy'],
  ['/es/terminos/', 'es', 'terms'],
  ['/pt/sobre/', 'pt', 'about'],
  ['/pt/contato/', 'pt', 'contact'],
  ['/pt/privacidade/', 'pt', 'privacy'],
  ['/pt/termos/', 'pt', 'terms'],
  ['/fr/a-propos/', 'fr', 'about'],
  ['/fr/contact/', 'fr', 'contact'],
  ['/fr/confidentialite/', 'fr', 'privacy'],
  ['/fr/conditions-utilisation/', 'fr', 'terms'],
] as const satisfies readonly [string, Locale, (typeof SITE_PAGE_IDS)[number]][];

const PLACEHOLDER_PATTERN = /\bTODO\b|\bTBD\b|example\.com|your-email|placeholder|lorem ipsum/i;

describe('P18 site-page closure contract', () => {
  it('publishes exactly four stable identities across all four locales', async () => {
    const indexes = await getPublishedContentIndexes();
    const entries = SUPPORTED_LOCALES.flatMap((locale) => indexes.sitePages.list(locale));

    expect(entries).toHaveLength(16);
    expect([...new Set(entries.map((entry) => entry.data.pageId))].sort()).toEqual([
      ...SITE_PAGE_IDS,
    ]);

    for (const pageId of SITE_PAGE_IDS) {
      expect(entries.filter((entry) => entry.data.pageId === pageId)).toHaveLength(4);
    }
    for (const locale of SUPPORTED_LOCALES) {
      expect(indexes.sitePages.list(locale).map((entry) => entry.data.pageId).sort()).toEqual([
        ...SITE_PAGE_IDS,
      ]);
    }
  });

  it('keeps the public URL matrix and indexability policy explicit', async () => {
    const indexes = await getPublishedContentIndexes();
    const registry = await createRouteRegistry({
      contentIndexes: indexes,
      toolRegistry,
      toolTaxonomy,
      blogTaxonomy,
    });
    const routes = registry
      .getAll()
      .filter((route) => route.area === 'site' && route.target.kind === 'site-page')
      .map((route) => {
        if (route.target.kind !== 'site-page') {
          throw new Error('Expected a site route to target a site page.');
        }

        return [
          buildLocalizedPath({ locale: route.locale, segments: route.segments }),
          route.locale,
          route.target.pageId,
        ] as const;
      });

    expect(routes.toSorted(([first], [second]) => first.localeCompare(second))).toEqual(
      [...EXPECTED_SITE_ROUTES].toSorted(([first], [second]) => first.localeCompare(second)),
    );
    expect(routes.some(([url]) => url.startsWith('/en/'))).toBe(false);

    for (const entry of SUPPORTED_LOCALES.flatMap((locale) => indexes.sitePages.list(locale))) {
      expect(entry.data.title).not.toBe('');
      expect(entry.data.seo.title).not.toBe('');
      expect(entry.data.seo.description).not.toBe('');
      expect(entry.data.seo.noindex).toBe(
        entry.data.pageId === 'privacy' || entry.data.pageId === 'terms',
      );
    }
  });

  it('keeps production Markdown free of placeholders and uses the declared contact destination', async () => {
    const sources = await Promise.all(
      SUPPORTED_LOCALES.flatMap((locale) =>
        SITE_PAGE_IDS.map(async (pageId) => ({
          locale,
          pageId,
          source: await readFile(
            new URL(`../../../src/content/site-pages/${locale}/${pageId}.md`, import.meta.url),
            'utf8',
          ),
        })),
      ),
    );

    for (const { source } of sources) {
      expect(source).not.toMatch(PLACEHOLDER_PATTERN);
    }

    for (const contact of sources.filter(({ pageId }) => pageId === 'contact')) {
      expect(contact.source).toContain('[hello@4all.tools](mailto:hello@4all.tools)');
      expect(contact.source.toLowerCase()).toContain('contact');
      expect(contact.source).not.toMatch(/<form\b/i);
    }
  });
});
