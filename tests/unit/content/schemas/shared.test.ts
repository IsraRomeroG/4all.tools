import { describe, expect, it } from 'vitest';

import {
  contentDateSchema,
  entityIdSchema,
  localeSchema,
  optionalDateMetaSchema,
  publicationStatusSchema,
  seoSchema,
  uniqueEntityIdListSchema,
} from '@/content/schemas/shared';
import { PUBLICATION_STATUSES } from '@/domain/shared/publication';
import { SUPPORTED_LOCALES } from '@/i18n/types';

describe('shared content schemas', () => {
  describe('locale schema', () => {
    it.each(SUPPORTED_LOCALES)('accepts supported locale %s', (locale) => {
      expect(localeSchema.parse(locale)).toBe(locale);
    });

    it.each(['EN', 'Es', 'es-MX', 'pt-BR', 'de', ''])(
      'rejects unsupported locale %s',
      (locale) => {
        expect(() => localeSchema.parse(locale)).toThrow();
      },
    );
  });

  describe('publication status schema', () => {
    it.each(PUBLICATION_STATUSES)('accepts publication status %s', (status) => {
      expect(publicationStatusSchema.parse(status)).toBe(status);
    });

    it.each(['active', 'private', 'deleted', 'Published'])(
      'rejects unsupported publication status %s',
      (status) => {
        expect(() => publicationStatusSchema.parse(status)).toThrow();
      },
    );
  });

  describe('entity ID schema', () => {
    it.each([
      'json-validator',
      'robots-txt-validator',
      'sha256-generator',
      'base64-decoder',
      'what-is-json',
      'developer',
      'json',
    ])('accepts stable entity ID %s', (id) => {
      expect(entityIdSchema.parse(id)).toBe(id);
    });

    it.each([
      'JSONValidator',
      'json_validator',
      'json validator',
      'developer/json-validator',
      '-json-validator',
      'json-validator-',
      'json--validator',
      '',
    ])('rejects invalid stable entity ID %s', (id) => {
      expect(() => entityIdSchema.parse(id)).toThrow(
        'Expected a lowercase kebab-case stable entity ID',
      );
    });
  });

  describe('SEO schema', () => {
    it('accepts editorial SEO metadata and defaults noindex to false', () => {
      expect(
        seoSchema.parse({
          title: 'JSON Validator',
          description: 'Validate and format JSON online.',
        }),
      ).toEqual({
        title: 'JSON Validator',
        description: 'Validate and format JSON online.',
        noindex: false,
      });
    });

    it('accepts an explicit noindex override', () => {
      expect(
        seoSchema.parse({
          title: 'Draft JSON Validator',
          description: 'Preview content.',
          noindex: true,
        }).noindex,
      ).toBe(true);
    });

    it('trims human-readable fields', () => {
      expect(
        seoSchema.parse({
          title: '  JSON Validator  ',
          description: '  Validate JSON.  ',
        }),
      ).toMatchObject({
        title: 'JSON Validator',
        description: 'Validate JSON.',
      });
    });

    it.each([
      {},
      { description: 'Validate JSON.' },
      { title: 'JSON Validator' },
      { title: '   ', description: 'Validate JSON.' },
      { title: 'JSON Validator', description: '   ' },
    ])('rejects missing or blank required SEO fields %#', (value) => {
      expect(() => seoSchema.parse(value)).toThrow();
    });

    it('rejects route-owned metadata', () => {
      expect(() =>
        seoSchema.parse({
          title: 'JSON Validator',
          description: 'Validate JSON.',
          canonicalUrl: 'https://example.com/json-validator',
        }),
      ).toThrow();
    });
  });

  describe('date metadata schema', () => {
    it('coerces ISO-style frontmatter values through the reusable date schema', () => {
      expect(contentDateSchema.parse('2026-07-10')).toEqual(
        new Date('2026-07-10T00:00:00.000Z'),
      );
    });

    it('coerces ISO-style frontmatter date strings to dates', () => {
      const result = optionalDateMetaSchema.parse({
        publishedAt: '2026-07-10',
      });

      expect(result.publishedAt).toBeInstanceOf(Date);
      expect(result.publishedAt?.toISOString()).toBe(
        '2026-07-10T00:00:00.000Z',
      );
    });

    it('keeps Date objects valid', () => {
      const updatedAt = new Date('2026-07-11T12:30:00.000Z');

      expect(optionalDateMetaSchema.parse({ updatedAt }).updatedAt).toEqual(
        updatedAt,
      );
    });

    it('rejects invalid dates', () => {
      expect(() =>
        optionalDateMetaSchema.parse({ publishedAt: 'not-a-date' }),
      ).toThrow();
    });

    it('does not rely on ambiguous locale-formatted dates', () => {
      expect(
        optionalDateMetaSchema.parse({ publishedAt: '2026-07-10' }).publishedAt,
      ).toEqual(new Date('2026-07-10T00:00:00.000Z'));
      expect('10/07/2026').not.toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('unique entity ID list schema', () => {
    it('defaults missing relation lists to an empty array', () => {
      expect(uniqueEntityIdListSchema.parse(undefined)).toEqual([]);
    });

    it('accepts unique stable entity IDs', () => {
      expect(
        uniqueEntityIdListSchema.parse(['json-validator', 'base64-decoder']),
      ).toEqual(['json-validator', 'base64-decoder']);
    });

    it('rejects duplicate stable entity IDs', () => {
      expect(() =>
        uniqueEntityIdListSchema.parse(['json-validator', 'json-validator']),
      ).toThrow('Expected unique entity IDs');
    });

    it('rejects invalid IDs inside relation lists', () => {
      expect(() =>
        uniqueEntityIdListSchema.parse(['developer/json-validator']),
      ).toThrow('Expected a lowercase kebab-case stable entity ID');
    });
  });
});
