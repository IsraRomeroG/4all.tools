import { beforeEach, describe, expect, it, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';

const mocks = vi.hoisted(() => ({
  getCollection: vi.fn(),
}));

vi.mock('@/content/queries/astro-content', () => ({
  getCollection: mocks.getCollection,
}));

import {
  createPublishedContentIndexes,
  resetPublishedContentIndexesForTesting,
} from '@/content/queries';
import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import { toolRegistry } from '@/features/tools/registry';
import type { Locale } from '@/i18n/types';
import {
  createRouteRegistry,
  createRouteRegistryFromRecords,
} from '@/routing/registry';
import { getRootCategoryStaticPathEntries } from '@/routing/static-paths';
import type { RouteRecord, RouteTarget } from '@/routing/types';
import {
  composeRootAdapterPage,
  composeStaticPageModel,
  MissingCanonicalRouteError,
  PageModelCompositionError,
} from '@/templates/composers';
import type { ContentCollectionSource } from '@/content/queries';
import type { StaticPageContentEntry } from '@/content/queries';
import StaticPageTemplate from '@/templates/StaticPageTemplate.astro';

describe('static-page composer and root adapter delivery', () => {
  beforeEach(() => {
    resetPublishedContentIndexesForTesting();
    activeStaticPages = baseStaticPageFixtures;
    mocks.getCollection.mockImplementation(async (collection: string) => {
      if (collection === 'staticPages') {
        return activeStaticPages;
      }

      if (collection === 'toolCategories') {
        return [toolCategoryFixture];
      }

      return [];
    });
  });

  it('composes localized EN and ES pages from one stable page identity', async () => {
    const registry = await fixtureRegistry();
    const english = await composeStaticPageModel('en', 'contact', {
      routeRegistry: registry,
    });
    const spanish = await composeStaticPageModel('es', 'contact', {
      routeRegistry: registry,
    });

    expect(english).toMatchObject({
      kind: 'static-page',
      pageId: 'contact',
      title: 'Contact',
      route: { locale: 'en', segments: ['contact'] },
      seo: { canonicalUrl: 'https://4all.tools/contact/' },
    });
    expect(spanish).toMatchObject({
      kind: 'static-page',
      pageId: 'contact',
      title: 'Contacto',
      route: { locale: 'es', segments: ['contacto'] },
      seo: { canonicalUrl: 'https://4all.tools/es/contacto/' },
    });
    expect(Object.hasOwn(english, 'localizedRouteCluster')).toBe(false);
    expect(Object.hasOwn(spanish, 'localizedRouteCluster')).toBe(false);
    expect(english.languageSwitcher.items).toEqual([
      expect.objectContaining({ locale: 'en', state: 'current' }),
      expect.objectContaining({ locale: 'es', state: 'available', url: '/es/contacto/' }),
      expect.objectContaining({ locale: 'pt', state: 'unavailable' }),
      expect.objectContaining({ locale: 'fr', state: 'unavailable' }),
    ]);
    expect(spanish.languageSwitcher.items).toEqual([
      expect.objectContaining({ locale: 'en', state: 'available', url: '/contact/' }),
      expect.objectContaining({ locale: 'es', state: 'current' }),
      expect.objectContaining({ locale: 'pt', state: 'unavailable' }),
      expect.objectContaining({ locale: 'fr', state: 'unavailable' }),
    ]);
    expect(await renderContent(english)).toContain('English contact body');
    expect(await renderContent(spanish)).toContain('Spanish contact body');
    expect(await renderContent(english)).not.toContain('Spanish contact body');
  });

  it('dispatches root category and static-page targets through one adapter', async () => {
    const registry = await fixtureRegistry();
    const category = await composeRootAdapterPage(
      'en',
      { kind: 'tool-category', categoryId: 'developer' },
      { routeRegistry: registry },
    );
    const staticPage = await composeRootAdapterPage(
      'en',
      { kind: 'static-page', pageId: 'contact' },
      { routeRegistry: registry },
    );

    expect(category.kind).toBe('tool-category');
    expect(staticPage.kind).toBe('static-page');
    expect(staticPage).toMatchObject({ pageId: 'contact' });
  });

  it.each([
    ['en', 'contact'],
    ['es', 'contacto'],
    ['pt', 'contato'],
    ['fr', 'contact'],
  ] as const)('supports the shared root adapter family for %s', async (locale, slug) => {
    activeStaticPages = allStaticPageFixtures;
    const registry = await fixtureRegistry();
    const page = await composeRootAdapterPage(
      locale,
      { kind: 'static-page', pageId: 'contact' },
      { routeRegistry: registry },
    );

    expect(page).toMatchObject({
      kind: 'static-page',
      locale,
      route: { locale, segments: [slug] },
    });
    expect(getRootCategoryStaticPathEntries(registry, locale)).toContainEqual({
      params: { category: slug },
      props: { routeTarget: { kind: 'static-page', pageId: 'contact' } },
    });
  });

  it('rejects unsupported root adapter targets explicitly', async () => {
    const registry = await fixtureRegistry();

    await expect(
      composeRootAdapterPage(
        'en',
        { kind: 'tool', toolId: 'json-validator' },
        { routeRegistry: registry },
      ),
    ).rejects.toMatchObject({
      code: 'UNSUPPORTED_PAGE_TARGET',
      context: { locale: 'en', targetKind: 'tool' },
    });
  });

  it('fails when the requested canonical route is missing', async () => {
    const registry = createRouteRegistryFromRecords([
      route('en', ['contact'], { kind: 'static-page', pageId: 'contact' }),
    ]);

    await expect(
      composeStaticPageModel('es', 'contact', { routeRegistry: registry }),
    ).rejects.toBeInstanceOf(MissingCanonicalRouteError);
  });

  it('fails when content is missing even if a route target exists', async () => {
    const registry = createRouteRegistryFromRecords([
      route('pt', ['contato'], { kind: 'static-page', pageId: 'missing' }),
    ]);

    await expect(
      composeStaticPageModel('pt', 'missing', { routeRegistry: registry }),
    ).rejects.toMatchObject({
      code: 'PAGE_MODEL_COMPOSITION_FAILED',
      context: { locale: 'pt', targetKind: 'static-page', entityId: 'missing' },
    });
  });

  it('rejects a canonical route from another route family', async () => {
    const mismatchedRegistry = {
      getCanonical: () =>
        route('en', ['contact'], { kind: 'tool', toolId: 'json-validator' }),
      getByTarget: () => [],
    };

    await expect(
      composeStaticPageModel('en', 'contact', {
        routeRegistry: mismatchedRegistry,
      }),
    ).rejects.toBeInstanceOf(PageModelCompositionError);
  });
});

const baseStaticPageFixtures = [
  staticPage('en', 'contact', 'contact', 'Contact', 'English contact body'),
  staticPage('es', 'contact', 'contacto', 'Contacto', 'Spanish contact body'),
] as unknown as readonly StaticPageContentEntry[];

const allStaticPageFixtures = [
  ...baseStaticPageFixtures,
  staticPage('pt', 'contact', 'contato', 'Contato', 'Portuguese contact body'),
  staticPage('fr', 'contact', 'contact', 'Contact', 'French contact body'),
] as unknown as readonly StaticPageContentEntry[];

let activeStaticPages: readonly StaticPageContentEntry[] = baseStaticPageFixtures;

const toolCategoryFixture = {
  id: 'tool-categories/en/developer',
  collection: 'toolCategories',
  data: {
    categoryId: 'developer',
    locale: 'en',
    status: 'published',
    title: 'Developer Tools',
    description: 'Tools for developers.',
    seo: {
      title: 'Developer Tools',
      description: 'Tools for developers.',
      noindex: false,
    },
  },
};

async function fixtureRegistry() {
  const indexes = await createPublishedContentIndexes(fixtureSource);

  return createRouteRegistry({
    contentIndexes: indexes,
    toolRegistry,
    toolTaxonomy,
    blogTaxonomy,
  });
}

const fixtureSource: ContentCollectionSource = {
  getCollection: (async (collection) => {
    if (collection === 'staticPages') {
      return activeStaticPages as never;
    }

    if (collection === 'toolCategories') {
      return [toolCategoryFixture] as never;
    }

    return [] as never;
  }) as ContentCollectionSource['getCollection'],
};

function staticPage(
  locale: Locale,
  pageId: string,
  routeSlug: string,
  title: string,
  body: string,
) {
  return {
    id: `static-pages/${locale}/${pageId}`,
    collection: 'staticPages',
    data: {
      pageId,
      locale,
      routeSlug,
      status: 'published',
      title,
      seo: {
        title,
        description: `${title} description.`,
        noindex: false,
      },
    },
    rendered: {
      html: `<h2>${body}</h2>`,
      metadata: {
        headings: [{ depth: 2, slug: body.toLowerCase().replaceAll(' ', '-'), text: body }],
        frontmatter: {},
        imagePaths: [],
      },
    },
  };
}

function route(locale: Locale, segments: readonly string[], target: RouteTarget): RouteRecord {
  return {
    area:
      target.kind === 'static-page'
        ? 'static'
        : target.kind === 'article' || target.kind === 'blog-category'
          ? 'blog'
          : 'tools',
    locale,
    segments,
    target,
    sourceId: 'fixture:static-page-delivery',
  };
}

async function renderContent(page: object): Promise<string> {
  const container = await AstroContainer.create();

  return container.renderToString(StaticPageTemplate, {
    partial: false,
    props: { page },
  });
}
