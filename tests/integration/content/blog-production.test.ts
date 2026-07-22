import { describe, expect, it } from 'vitest';

import {
  getPublishedArticleContent,
  getPublishedBlogCategoryContent,
  listPublishedArticleContent,
} from '@/content/queries';
import { getDeliveryRouteRegistry } from '@/templates/composers';

const LOCALES = ['en', 'es', 'pt', 'fr'] as const;

describe('P08 production blog vertical slice', () => {
  it('publishes the same localized article identity with the frozen date and relation', async () => {
    for (const locale of LOCALES) {
      const article = await getPublishedArticleContent('what-is-json', locale);

      expect(article?.data.articleId).toBe('what-is-json');
      expect(article?.data.primaryCategoryId).toBe('json-guides');
      expect(article?.data.status).toBe('published');
      expect(article?.data.seo.noindex).toBe(false);
      expect(article?.data.secondaryCategoryIds).toEqual([]);
      expect(article?.data.relatedArticleIds).toEqual([]);
      expect(article?.data.relatedToolIds).toEqual(['json-validator']);
      expect(article?.data.publishedAt.toISOString()).toBe(
        '2026-07-21T00:00:00.000Z',
      );
      expect(article?.data.title).not.toContain('Ã');
      expect(article?.data.title).not.toContain('ƒ');
      expect(article?.data.excerpt.length).toBeGreaterThan(20);
      expect((await listPublishedArticleContent(locale)).map((entry) => entry.data.articleId)).toContain(
        'what-is-json',
      );
    }
  });

  it('publishes both seed categories in every locale', async () => {
    for (const locale of LOCALES) {
      await expect(
        getPublishedBlogCategoryContent('development', locale),
      ).resolves.toMatchObject({ data: { categoryId: 'development', locale } });
      await expect(
        getPublishedBlogCategoryContent('json-guides', locale),
      ).resolves.toMatchObject({ data: { categoryId: 'json-guides', locale } });
    }
  });

  it('creates the frozen production route matrix with stable targets', async () => {
    const registry = await getDeliveryRouteRegistry();
    const blogRecords = registry
      .getAll()
      .filter((record) => record.area === 'blog');

    expect(blogRecords).toHaveLength(12);
    expect(
      blogRecords.filter((record) => record.target.kind === 'article'),
    ).toHaveLength(4);
    expect(
      blogRecords.filter((record) => record.target.kind === 'blog-category'),
    ).toHaveLength(8);
    expect(
      blogRecords
        .filter((record) => record.target.kind === 'article')
        .every(
          (record) =>
            record.target.kind === 'article' &&
            record.target.articleId === 'what-is-json',
        ),
    ).toBe(true);
  });
});
