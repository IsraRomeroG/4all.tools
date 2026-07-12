import { describe, expect, it } from 'vitest';

import {
  articleContentSchema,
  blogCategoryContentSchema,
} from '@/content/schemas/blog';
import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';

const validArticleEntry = {
  articleId: 'what-is-json',
  locale: 'en',
  primaryCategoryId: 'json-guides',
  secondaryCategoryIds: [],
  status: 'published',
  title: 'What Is JSON?',
  excerpt:
    'Learn what JSON is, how its syntax works, and why developers use it.',
  seo: {
    title: 'What Is JSON? Syntax, Examples, and Uses',
    description: 'Learn what JSON is and understand its basic syntax.',
  },
  publishedAt: '2026-07-10',
  relatedArticleIds: [],
  relatedToolIds: ['json-validator'],
};

const validBlogCategoryEntry = {
  categoryId: 'json-guides',
  locale: 'en',
  status: 'published',
  title: 'JSON Guides',
  description:
    'Tutorials and explanations about JSON syntax, validation, and usage.',
  seo: {
    title: 'JSON Guides and Tutorials',
    description: 'Learn JSON syntax, validation, and practical workflows.',
  },
};

describe('blog content schemas', () => {
  describe('article content schema', () => {
    it('accepts a valid localized article entry', () => {
      const parsed = articleContentSchema.parse(validArticleEntry);

      expect(parsed.articleId).toBe('what-is-json');
      expect(parsed.locale).toBe('en');
      expect(parsed.primaryCategoryId).toBe('json-guides');
      expect(parsed.publishedAt).toEqual(new Date('2026-07-10T00:00:00.000Z'));
      expect(parsed.relatedToolIds).toEqual(['json-validator']);
    });

    it('allows translations to share one stable article identity', () => {
      const english = articleContentSchema.parse(validArticleEntry);
      const spanish = articleContentSchema.parse({
        ...validArticleEntry,
        locale: 'es',
        title: 'Que es JSON?',
      });

      expect(english.articleId).toBe('what-is-json');
      expect(spanish.articleId).toBe('what-is-json');
    });

    it('defaults optional relation lists to empty arrays', () => {
      const parsed = articleContentSchema.parse({
        ...validArticleEntry,
        secondaryCategoryIds: undefined,
        relatedArticleIds: undefined,
        relatedToolIds: undefined,
      });

      expect(parsed.secondaryCategoryIds).toEqual([]);
      expect(parsed.relatedArticleIds).toEqual([]);
      expect(parsed.relatedToolIds).toEqual([]);
    });

    it.each([
      ['invalid article ID', { articleId: 'blog/what-is-json' }],
      ['invalid locale', { locale: 'en-US' }],
      ['missing primary category ID', { primaryCategoryId: undefined }],
      ['missing publishedAt', { publishedAt: undefined }],
      ['invalid date', { publishedAt: 'not-a-date' }],
      ['blank title', { title: '   ' }],
      ['blank excerpt', { excerpt: '   ' }],
      ['invalid related article ID', { relatedArticleIds: ['bad/id'] }],
      ['invalid related tool ID', { relatedToolIds: ['developer/json'] }],
      ['duplicate related article ID', { relatedArticleIds: ['json', 'json'] }],
    ])('rejects %s', (_name, override) => {
      expect(() =>
        articleContentSchema.parse({
          ...validArticleEntry,
          ...override,
        }),
      ).toThrow();
    });

    it('rejects updatedAt values before publishedAt', () => {
      expect(() =>
        articleContentSchema.parse({
          ...validArticleEntry,
          publishedAt: '2026-07-10',
          updatedAt: '2026-07-09',
        }),
      ).toThrow('Expected updatedAt to be on or after publishedAt');
    });

    it('rejects primary category duplicated in secondary categories', () => {
      expect(() =>
        articleContentSchema.parse({
          ...validArticleEntry,
          secondaryCategoryIds: ['json-guides'],
        }),
      ).toThrow('Expected secondaryCategoryIds to exclude primaryCategoryId');
    });

    it('rejects route-owned and deferred identity fields', () => {
      expect(() =>
        articleContentSchema.parse({
          ...validArticleEntry,
          slug: 'what-is-json',
        }),
      ).toThrow();

      expect(() =>
        articleContentSchema.parse({
          ...validArticleEntry,
          authorId: 'editorial-team',
        }),
      ).toThrow();
    });

    it('rejects canonical URL ownership inside SEO metadata', () => {
      expect(() =>
        articleContentSchema.parse({
          ...validArticleEntry,
          seo: {
            ...validArticleEntry.seo,
            canonicalUrl: 'https://4all.tools/blog/what-is-json/',
          },
        }),
      ).toThrow();
    });
  });

  describe('blog category content schema', () => {
    it('accepts a valid localized blog-category entry', () => {
      const parsed = blogCategoryContentSchema.parse(validBlogCategoryEntry);

      expect(parsed.categoryId).toBe('json-guides');
      expect(parsed.locale).toBe('en');
      expect(blogTaxonomy.hasNode(parsed.categoryId)).toBe(true);
    });

    it.each([
      ['invalid category ID syntax', { categoryId: 'development/json-guides' }],
      ['missing title', { title: undefined }],
      ['blank description', { description: '   ' }],
      ['invalid SEO metadata', { seo: { title: 'JSON Guides' } }],
    ])('rejects %s', (_name, override) => {
      expect(() =>
        blogCategoryContentSchema.parse({
          ...validBlogCategoryEntry,
          ...override,
        }),
      ).toThrow();
    });

    it('rejects category slug ownership', () => {
      expect(() =>
        blogCategoryContentSchema.parse({
          ...validBlogCategoryEntry,
          slug: 'guias-json',
        }),
      ).toThrow();
    });
  });

  describe('blog taxonomy independence', () => {
    it('classifies article content through blog taxonomy, not tool taxonomy', () => {
      const parsed = articleContentSchema.parse(validArticleEntry);

      expect(blogTaxonomy.hasNode(parsed.primaryCategoryId)).toBe(true);
      expect(blogTaxonomy.getLocalizedPath(parsed.primaryCategoryId, 'en')).toEqual([
        'development',
        'json-guides',
      ]);
      expect(toolTaxonomy.hasNode(parsed.primaryCategoryId)).toBe(false);
    });
  });
});
