import { describe, expect, it } from 'vitest';

import {
  toolCategoryContentSchema,
  toolContentSchema,
} from '@/content/schemas/tools';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';

const validToolEntry = {
  toolId: 'json-validator',
  locale: 'en',
  status: 'published',
  title: 'JSON Validator',
  description: 'Validate, format, and debug JSON directly in your browser.',
  seo: {
    title: 'JSON Validator - Validate JSON Online',
    description: 'Validate JSON syntax and identify errors.',
  },
  publishedAt: '2026-07-10',
  relatedToolIds: [],
};

const validToolCategoryEntry = {
  categoryId: 'developer',
  locale: 'en',
  status: 'published',
  title: 'Developer Tools',
  description: 'Utilities for developers working with data formats.',
  seo: {
    title: 'Developer Tools Online',
    description: 'Browse online developer utilities.',
  },
};

describe('tool content schemas', () => {
  describe('tool content schema', () => {
    it('accepts a valid localized tool entry', () => {
      const parsed = toolContentSchema.parse(validToolEntry);

      expect(parsed.toolId).toBe('json-validator');
      expect(parsed.locale).toBe('en');
      expect(parsed.relatedToolIds).toEqual([]);
      expect(parsed.publishedAt).toEqual(new Date('2026-07-10T00:00:00.000Z'));
    });

    it('defaults missing related tool lists to an empty array', () => {
      const parsed = toolContentSchema.parse({
        ...validToolEntry,
        relatedToolIds: undefined,
      });

      expect(parsed.relatedToolIds).toEqual([]);
    });

    it('accepts optional intro text when it contains content', () => {
      const parsed = toolContentSchema.parse({
        ...validToolEntry,
        intro: 'Paste JSON to validate it in your browser.',
      });

      expect(parsed.intro).toBe('Paste JSON to validate it in your browser.');
    });

    it.each([
      ['invalid tool ID syntax', { toolId: 'developer/json-validator' }],
      ['invalid locale', { locale: 'es-MX' }],
      ['invalid publication status', { status: 'active' }],
      ['missing title', { title: undefined }],
      ['whitespace-only description', { description: '   ' }],
      ['invalid related ID', { relatedToolIds: ['developer/json-validator'] }],
      ['duplicate related ID', { relatedToolIds: ['json', 'json'] }],
      ['blank intro', { intro: '   ' }],
    ])('rejects %s', (_name, override) => {
      expect(() =>
        toolContentSchema.parse({
          ...validToolEntry,
          ...override,
        }),
      ).toThrow();
    });

    it('rejects route-owned fields', () => {
      expect(() =>
        toolContentSchema.parse({
          ...validToolEntry,
          slug: 'validador-json',
        }),
      ).toThrow();
    });

    it('rejects canonical URL ownership inside SEO metadata', () => {
      expect(() =>
        toolContentSchema.parse({
          ...validToolEntry,
          seo: {
            ...validToolEntry.seo,
            canonicalUrl: 'https://4all.tools/json-validator/',
          },
        }),
      ).toThrow();
    });

    it('rejects updatedAt values before publishedAt', () => {
      expect(() =>
        toolContentSchema.parse({
          ...validToolEntry,
          publishedAt: '2026-07-10',
          updatedAt: '2026-07-09',
        }),
      ).toThrow('Expected updatedAt to be on or after publishedAt');
    });
  });

  describe('tool category content schema', () => {
    it('accepts a valid localized tool-category entry', () => {
      const parsed = toolCategoryContentSchema.parse(validToolCategoryEntry);

      expect(parsed.categoryId).toBe('developer');
      expect(parsed.locale).toBe('en');
      expect(toolTaxonomy.hasNode(parsed.categoryId)).toBe(true);
    });

    it.each([
      ['invalid category ID syntax', { categoryId: 'developer/json' }],
      ['invalid locale', { locale: 'pt-BR' }],
      ['invalid publication status', { status: 'private' }],
      ['missing title', { title: undefined }],
      ['whitespace-only description', { description: '   ' }],
    ])('rejects %s', (_name, override) => {
      expect(() =>
        toolCategoryContentSchema.parse({
          ...validToolCategoryEntry,
          ...override,
        }),
      ).toThrow();
    });

    it('rejects category slug ownership', () => {
      expect(() =>
        toolCategoryContentSchema.parse({
          ...validToolCategoryEntry,
          slug: 'desarrollo',
        }),
      ).toThrow();
    });

    it('rejects route-owned SEO metadata', () => {
      expect(() =>
        toolCategoryContentSchema.parse({
          ...validToolCategoryEntry,
          seo: {
            ...validToolCategoryEntry.seo,
            canonicalUrl: 'https://4all.tools/developer/',
          },
        }),
      ).toThrow();
    });
  });
});
