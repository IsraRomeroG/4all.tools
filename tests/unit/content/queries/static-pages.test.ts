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
  getPublishedStaticPageContent,
  listPublishedStaticPageContent,
  requirePublishedStaticPageContent,
  resetPublishedContentIndexesForTesting,
} from '@/content/queries';

interface TestEntry {
  readonly id: string;
  readonly data: Record<string, unknown>;
}

let staticPages: TestEntry[];

describe('static-page content query services', () => {
  beforeEach(() => {
    resetPublishedContentIndexesForTesting();
    staticPages = [
      entry('static-pages/en/contact', {
        pageId: 'contact',
        locale: 'en',
        routeSlug: 'contact',
        status: 'published',
        title: 'Contact',
      }),
      entry('static-pages/es/contact', {
        pageId: 'contact',
        locale: 'es',
        routeSlug: 'contacto',
        status: 'published',
        title: 'Contacto',
      }),
      entry('static-pages/en/privacy-draft', {
        pageId: 'privacy',
        locale: 'en',
        routeSlug: 'privacy',
        status: 'draft',
        title: 'Privacy draft',
      }),
      entry('static-pages/fr/terms-archived', {
        pageId: 'terms',
        locale: 'fr',
        routeSlug: 'terms',
        status: 'archived',
        title: 'Archived terms',
      }),
    ];

    mocks.getCollection.mockImplementation(async (collection: string) => {
      if (collection === 'staticPages') {
        return staticPages;
      }

      return [];
    });
  });

  it('gets one exact published entry by pageId and locale', async () => {
    await expect(getPublishedStaticPageContent('contact', 'en')).resolves.toMatchObject({
      id: 'static-pages/en/contact',
      data: { pageId: 'contact', locale: 'en', routeSlug: 'contact' },
    });
  });

  it('does not fall back to English for a missing locale', async () => {
    await expect(getPublishedStaticPageContent('contact', 'pt')).resolves.toBeNull();
    await expect(listPublishedStaticPageContent('pt')).resolves.toEqual([]);
  });

  it('requires the exact published entry', async () => {
    await expect(requirePublishedStaticPageContent('contact', 'es')).resolves.toMatchObject({
      id: 'static-pages/es/contact',
      data: { title: 'Contacto' },
    });
  });

  it('reports the exact missing-content context', async () => {
    try {
      await requirePublishedStaticPageContent('contact', 'pt');
      throw new Error('Expected missing static-page content to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(ContentNotFoundError);
      expect((error as ContentNotFoundError).context).toEqual({
        collection: 'staticPages',
        entityField: 'pageId',
        entityId: 'contact',
        locale: 'pt',
        status: 'published',
      });
    }
  });

  it('lists only published entries for the requested locale', async () => {
    await expect(listPublishedStaticPageContent('en')).resolves.toEqual([
      expect.objectContaining({ id: 'static-pages/en/contact' }),
    ]);
    await expect(listPublishedStaticPageContent('fr')).resolves.toEqual([]);
  });

  it('excludes draft and archived entries from published queries', async () => {
    await expect(getPublishedStaticPageContent('privacy', 'en')).resolves.toBeNull();
    await expect(getPublishedStaticPageContent('terms', 'fr')).resolves.toBeNull();
    await expect(listPublishedStaticPageContent('en')).resolves.not.toContainEqual(
      expect.objectContaining({ id: 'static-pages/en/privacy-draft' }),
    );
  });

  it('preserves ambiguity for duplicate published identities', async () => {
    staticPages.push(
      entry('static-pages/en/contact-duplicate', {
        pageId: 'contact',
        locale: 'en',
        routeSlug: 'contact-copy',
        status: 'published',
        title: 'Contact duplicate',
      }),
    );

    await expect(getPublishedStaticPageContent('contact', 'en')).rejects.toBeInstanceOf(
      AmbiguousContentError,
    );
    await expect(requirePublishedStaticPageContent('contact', 'en')).rejects.toBeInstanceOf(
      AmbiguousContentError,
    );
    await expect(listPublishedStaticPageContent('en')).rejects.toBeInstanceOf(
      AmbiguousContentError,
    );
  });
});

function entry(id: string, data: Record<string, unknown>): TestEntry {
  return { id, data };
}
