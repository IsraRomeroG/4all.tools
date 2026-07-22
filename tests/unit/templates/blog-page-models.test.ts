import { describe, expect, it } from 'vitest';

import type { ArticleContentEntry } from '@/content/queries';
import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { createRouteRegistryFromRecords } from '@/routing/registry';
import type { RouteRecord } from '@/routing/types';
import {
  ArticleRouteContentMismatchError,
  composeArticlePageModel,
  composeBlogCategoryPageModel,
  composeBlogIndexPageModel,
  filterArticlesForBlogCategory,
} from '@/templates/composers';
import FixtureContent from '../../fixtures/templates/FixtureContent.astro';

describe('blog page-model composers', () => {
  it('composes a localized blog index with root-only categories and SEO navigation', async () => {
    const page = await composeBlogIndexPageModel('en', {
      routeRegistry: routeRegistry(),
      listPublishedArticleContent: async () => [articleEntry()],
      seoIndexabilityResolver: { isIndexable: () => true },
    });

    expect(page.route).toBeNull();
    expect(page.articles.map((item) => item.articleId)).toEqual(['what-is-json']);
    expect(page.categories.map((item) => item.categoryId)).toEqual(['development']);
    expect(page.localizedRouteCluster.subject).toEqual({ kind: 'blog-index' });
    expect(page.seo.canonicalUrl).toBe('https://4all.tools/blog/');
    expect(page.seo.openGraph.type).toBe('website');
    expect(page.breadcrumbs.items.map((item) => item.label)).toEqual([
      'Home',
      'Blog',
    ]);
  });

  it('composes category subtree articles and explicit child category links', async () => {
    const page = await composeBlogCategoryPageModel('en', 'development', {
      routeRegistry: routeRegistry(),
      listPublishedArticleContent: async () => [articleEntry()],
      requirePublishedBlogCategoryContent: async () => categoryEntry(),
      renderContent,
      seoIndexabilityResolver: { isIndexable: () => true },
    });

    expect(page.articles.map((item) => item.articleId)).toEqual(['what-is-json']);
    expect(page.childCategories.map((item) => item.categoryId)).toEqual([
      'json-guides',
    ]);
    expect(page.breadcrumbs.items.map((item) => item.label)).toEqual([
      'Home',
      'Blog',
      'Development',
    ]);
  });

  it('composes article metadata, localized breadcrumbs and article Open Graph fields', async () => {
    const page = await composeArticlePageModel('en', 'what-is-json', {
      routeRegistry: routeRegistry(),
      requirePublishedArticleContent: async () => articleEntry(),
      renderContent,
      seoIndexabilityResolver: { isIndexable: () => true },
    });

    expect(page.route.segments).toEqual([
      'blog',
      'development',
      'json-guides',
      'what-is-json',
    ]);
    expect(page.content.title).toBe('What Is JSON');
    expect(page.metadata.publishedAt.iso).toBe('2026-07-21T00:00:00.000Z');
    expect(page.seo.openGraph).toMatchObject({
      type: 'article',
      article: {
        publishedTime: '2026-07-21T00:00:00.000Z',
        section: 'JSON Guides',
      },
    });
    expect(page.breadcrumbs.items.map((item) => item.label)).toEqual([
      'Home',
      'Blog',
      'Development',
      'JSON Guides',
      'What Is JSON',
    ]);
  });

  it('preserves article Open Graph metadata for a public noindex article', async () => {
    const page = await composeArticlePageModel('en', 'what-is-json', {
      routeRegistry: routeRegistry(),
      requirePublishedArticleContent: async () =>
        articleEntry('json-guides', {
          noindex: true,
          updatedAt: '2026-07-22T00:00:00.000Z',
        }),
      renderContent,
      seoIndexabilityResolver: { isIndexable: () => false },
    });

    expect(page.kind).toBe('article');
    expect(page.seo.canonicalUrl).toBe(
      'https://4all.tools/blog/development/json-guides/what-is-json/',
    );
    expect(page.seo.robots).toEqual({ index: false, follow: true });
    expect(page.seo.alternates).toEqual([]);
    expect(Object.prototype.hasOwnProperty.call(page.seo, 'xDefaultUrl')).toBe(
      false,
    );
    expect(page.seo.openGraph).toMatchObject({
      type: 'article',
      article: {
        publishedTime: page.metadata.publishedAt.iso,
        modifiedTime: page.metadata.updatedAt?.iso,
        section: 'JSON Guides',
      },
    });
    expect(page.languageSwitcher.items).toEqual([
      expect.objectContaining({ locale: 'en', state: 'current' }),
      expect.objectContaining({ locale: 'es', state: 'available' }),
      expect.objectContaining({ locale: 'pt', state: 'available' }),
      expect.objectContaining({ locale: 'fr', state: 'available' }),
    ]);
  });

  it('does not require a public category landing for article composition', async () => {
    const registry = createRouteRegistryFromRecords([
      route({
        locale: 'en',
        segments: ['blog', 'development', 'json-guides', 'what-is-json'],
        target: { kind: 'article', articleId: 'what-is-json' },
      }),
    ]);
    const page = await composeArticlePageModel('en', 'what-is-json', {
      routeRegistry: registry,
      requirePublishedArticleContent: async () => articleEntry(),
      renderContent,
      seoIndexabilityResolver: { isIndexable: () => true },
    });

    expect(page.metadata.primaryCategory).toEqual({
      categoryId: 'json-guides',
      label: 'JSON Guides',
      state: 'text',
    });
  });

  it('rejects route/content primary-category mismatches', async () => {
    await expect(
      composeArticlePageModel('en', 'what-is-json', {
        routeRegistry: routeRegistry(),
        requirePublishedArticleContent: async () =>
          articleEntry('development'),
        renderContent,
        seoIndexabilityResolver: { isIndexable: () => true },
      }),
    ).rejects.toBeInstanceOf(ArticleRouteContentMismatchError);
  });

  it('rejects unknown secondary categories during article composition', async () => {
    await expect(
      composeArticlePageModel('en', 'what-is-json', {
        routeRegistry: routeRegistry(),
        requirePublishedArticleContent: async () =>
          articleEntry('json-guides', {
            secondaryCategoryIds: ['missing-secondary-category'],
          }),
        renderContent,
        seoIndexabilityResolver: { isIndexable: () => true },
      }),
    ).rejects.toMatchObject({
      code: 'UNKNOWN_BLOG_CATEGORY_REFERENCE',
      context: {
        locale: 'en',
        targetKind: 'blog-category',
        entityId: 'missing-secondary-category',
      },
    });
  });

  it('rejects unknown secondary categories during catalog projection', () => {
    expect(() =>
      filterArticlesForBlogCategory({
        categoryId: 'development',
        articles: [
          articleEntry('json-guides', {
            secondaryCategoryIds: ['missing-secondary-category'],
          }),
        ],
        blogTaxonomy,
        locale: 'en',
      }),
    ).toThrow(
      expect.objectContaining({
        code: 'UNKNOWN_BLOG_CATEGORY_REFERENCE',
        context: {
          locale: 'en',
          targetKind: 'blog-category',
          entityId: 'missing-secondary-category',
        },
      }),
    );
  });
});

const renderContent = async () => ({
  Content: FixtureContent,
  headings: [],
});

function routeRegistry() {
  return createRouteRegistryFromRecords([
    ...(['en', 'es', 'pt', 'fr'] as const).flatMap((locale) => [
      route({
        locale,
        segments:
          ['blog', 'development'],
        target: { kind: 'blog-category', categoryId: 'development' },
      }),
      route({
        locale,
        segments:
          ['blog', 'development', 'json-guides'],
        target: { kind: 'blog-category', categoryId: 'json-guides' },
      }),
      route({
        locale,
        segments:
          ['blog', 'development', 'json-guides', 'what-is-json'],
        target: { kind: 'article', articleId: 'what-is-json' },
      }),
    ]),
  ]);
}

function route(input: {
  readonly locale: RouteRecord['locale'];
  readonly segments: readonly string[];
  readonly target: RouteRecord['target'];
}): RouteRecord {
  return {
    area: 'blog',
    locale: input.locale,
    segments: input.segments,
    target: input.target,
    sourceId: 'fixture:blog-page-models',
  };
}

function articleEntry(
  primaryCategoryId = 'json-guides',
  options: {
    readonly secondaryCategoryIds?: readonly string[];
    readonly noindex?: boolean;
    readonly updatedAt?: string;
  } = {},
) {
  return {
    id: 'blog/en/development/json-guides/what-is-json',
    collection: 'blog',
    data: {
      articleId: 'what-is-json',
      locale: 'en',
      primaryCategoryId,
      secondaryCategoryIds: options.secondaryCategoryIds ?? [],
      status: 'published',
      title: 'What Is JSON',
      excerpt: 'A practical introduction to JSON.',
      seo: {
        title: 'What Is JSON',
        description: 'A practical introduction to JSON.',
        noindex: options.noindex ?? false,
      },
      publishedAt: new Date('2026-07-21T00:00:00.000Z'),
      ...(options.updatedAt === undefined
        ? {}
        : { updatedAt: new Date(options.updatedAt) }),
      relatedArticleIds: [],
      relatedToolIds: [],
    },
  } as unknown as ArticleContentEntry;
}

function categoryEntry() {
  return {
    id: 'blog-categories/en/development',
    collection: 'blogCategories',
    data: {
      categoryId: 'development',
      locale: 'en',
      status: 'published',
      title: 'Development',
      description: 'Development guides.',
      seo: {
        title: 'Development',
        description: 'Development guides.',
        noindex: false,
      },
    },
  } as never;
}
