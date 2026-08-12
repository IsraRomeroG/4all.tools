import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getCollection: vi.fn(),
}));

vi.mock('@/content/queries/astro-content', () => ({
  getCollection: mocks.getCollection,
}));

import {
  AmbiguousContentError,
  ContentNotFoundError,
  getPublishedSitePageContent,
  listPublishedSitePageContent,
  requirePublishedSitePageContent,
  resetPublishedContentIndexesForTesting,
} from '@/content/queries';

interface TestEntry {
  readonly id: string;
  readonly data: Record<string, unknown>;
}

let sitePages: TestEntry[];

describe('site-page content query services', () => {
  beforeEach(() => {
    resetPublishedContentIndexesForTesting();
    sitePages = [
      entry('site-pages/en/contact', {
        pageId: 'contact',
        locale: 'en',
        routeSlug: 'contact',
        status: 'published',
        title: 'Contact',
      }),
      entry('site-pages/es/contact', {
        pageId: 'contact',
        locale: 'es',
        routeSlug: 'contacto',
        status: 'published',
        title: 'Contacto',
      }),
      entry('site-pages/en/privacy-draft', {
        pageId: 'privacy',
        locale: 'en',
        routeSlug: 'privacy',
        status: 'draft',
        title: 'Privacy draft',
      }),
      entry('site-pages/fr/terms-archived', {
        pageId: 'terms',
        locale: 'fr',
        routeSlug: 'terms',
        status: 'archived',
        title: 'Archived terms',
      }),
    ];

    mocks.getCollection.mockImplementation(async (collection: string) => {
      if (collection === 'sitePages') {
        return sitePages;
      }

      return [];
    });
  });

  it('gets one exact published entry by pageId and locale', async () => {
    await expect(getPublishedSitePageContent('contact', 'en')).resolves.toMatchObject({
      id: 'site-pages/en/contact',
      data: { pageId: 'contact', locale: 'en', routeSlug: 'contact' },
    });
  });

  it('does not fall back to English for a missing locale', async () => {
    await expect(getPublishedSitePageContent('contact', 'pt')).resolves.toBeNull();
    await expect(listPublishedSitePageContent('pt')).resolves.toEqual([]);
  });

  it('requires the exact published entry', async () => {
    await expect(requirePublishedSitePageContent('contact', 'es')).resolves.toMatchObject({
      id: 'site-pages/es/contact',
      data: { title: 'Contacto' },
    });
  });

  it('reports the exact missing-content context', async () => {
    try {
      await requirePublishedSitePageContent('contact', 'pt');
      throw new Error('Expected missing site-page content to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(ContentNotFoundError);
      expect((error as ContentNotFoundError).context).toEqual({
        collection: 'sitePages',
        entityField: 'pageId',
        entityId: 'contact',
        locale: 'pt',
        status: 'published',
      });
    }
  });

  it('lists only published entries for the requested locale', async () => {
    await expect(listPublishedSitePageContent('en')).resolves.toEqual([
      expect.objectContaining({ id: 'site-pages/en/contact' }),
    ]);
    await expect(listPublishedSitePageContent('fr')).resolves.toEqual([]);
  });

  it('excludes draft and archived entries from published queries', async () => {
    await expect(getPublishedSitePageContent('privacy', 'en')).resolves.toBeNull();
    await expect(getPublishedSitePageContent('terms', 'fr')).resolves.toBeNull();
    await expect(listPublishedSitePageContent('en')).resolves.not.toContainEqual(
      expect.objectContaining({ id: 'site-pages/en/privacy-draft' }),
    );
  });

  it('preserves ambiguity for duplicate published identities', async () => {
    sitePages.push(
      entry('site-pages/en/contact-duplicate', {
        pageId: 'contact',
        locale: 'en',
        routeSlug: 'contact-copy',
        status: 'published',
        title: 'Contact duplicate',
      }),
    );

    await expect(getPublishedSitePageContent('contact', 'en')).rejects.toBeInstanceOf(
      AmbiguousContentError,
    );
    await expect(requirePublishedSitePageContent('contact', 'en')).rejects.toBeInstanceOf(
      AmbiguousContentError,
    );
    await expect(listPublishedSitePageContent('en')).rejects.toBeInstanceOf(
      AmbiguousContentError,
    );
  });
});

function entry(id: string, data: Record<string, unknown>): TestEntry {
  return { id, data };
}
