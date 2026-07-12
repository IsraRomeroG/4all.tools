import { describe, expect, it } from 'vitest';

import {
  AmbiguousContentError,
  ContentNotFoundError,
} from '@/content/queries/errors';
import { requireExactMatch, resolveExactMatch } from '@/content/queries/shared';

const context = {
  collection: 'tools',
  entityField: 'toolId',
  entityId: 'json-validator',
  locale: 'en',
  status: 'published',
} as const;

describe('content query exact-match helpers', () => {
  it('returns null for zero nullable matches', () => {
    expect(resolveExactMatch([], context)).toBeNull();
  });

  it('returns the only nullable match', () => {
    const entry = { id: 'tools/en/developer/json-validator' };

    expect(resolveExactMatch([entry], context)).toBe(entry);
  });

  it('throws an ambiguous content error for multiple nullable matches', () => {
    expect(() =>
      resolveExactMatch(
        [
          { id: 'tools/es/developer/json-validator' },
          { id: 'tools/es/duplicate/json-validator' },
        ],
        { ...context, locale: 'es' },
      ),
    ).toThrow(AmbiguousContentError);
  });

  it('throws not found for zero required matches', () => {
    expect(() => requireExactMatch([], context)).toThrow(ContentNotFoundError);
  });

  it('returns the only required match', () => {
    const entry = { id: 'tools/en/developer/json-validator' };

    expect(requireExactMatch([entry], context)).toBe(entry);
  });

  it('preserves matched entry IDs in ambiguity context', () => {
    try {
      requireExactMatch(
        [
          { id: 'tools/es/developer/json-validator' },
          { id: 'tools/es/duplicate/json-validator' },
        ],
        { ...context, locale: 'es' },
      );
      throw new Error('Expected ambiguity to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(AmbiguousContentError);
      expect((error as AmbiguousContentError).context).toMatchObject({
        collection: 'tools',
        entityId: 'json-validator',
        locale: 'es',
        matchedEntryIds: [
          'tools/es/developer/json-validator',
          'tools/es/duplicate/json-validator',
        ],
      });
    }
  });
});
