import { describe, expect, it } from 'vitest';

import {
  assertStableEntityId,
  isStableEntityId,
  type ArticleId,
  type BlogCategoryId,
  type LandingId,
  type ToolCategoryId,
  type ToolId,
} from '@/domain/shared/ids';

describe('stable entity IDs', () => {
  it('exports semantic aliases as simple string contracts', () => {
    const toolId: ToolId = 'json-validator';
    const toolCategoryId: ToolCategoryId = 'developer';
    const blogCategoryId: BlogCategoryId = 'data-formats';
    const articleId: ArticleId = 'what-is-json';
    const landingId: LandingId = 'json-tools';

    expect([
      toolId,
      toolCategoryId,
      blogCategoryId,
      articleId,
      landingId,
    ]).toEqual([
      'json-validator',
      'developer',
      'data-formats',
      'what-is-json',
      'json-tools',
    ]);
  });

  it.each([
    'json',
    'json-validator',
    'sha256-generator',
    'base64-decoder',
    'ipv6-validator',
    'blog',
  ])('accepts valid stable ID %s', (value) => {
    expect(isStableEntityId(value)).toBe(true);
  });

  it.each([
    'JSON-Validator',
    'json_validator',
    'json validator',
    'developer/json-validator',
    '-json-validator',
    'json-validator-',
    'json--validator',
    '',
    'válidador-json',
  ])('rejects invalid stable ID %s', (value) => {
    expect(isStableEntityId(value)).toBe(false);
  });

  it('throws a descriptive error for invalid stable IDs', () => {
    expect(() => assertStableEntityId('json-validator')).not.toThrow();
    expect(() => assertStableEntityId('/developer/json-validator/')).toThrow(
      'Invalid stable entity ID "/developer/json-validator/".',
    );
  });
});
