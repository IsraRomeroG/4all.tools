import { describe, expect, it } from 'vitest';

import { TaxonomyInvariantError } from '@/domain/taxonomy/shared/errors';
import { createTaxonomyTree } from '@/domain/taxonomy/shared/tree';
import type { TaxonomyNode } from '@/domain/taxonomy/shared/types';

describe('taxonomy tree invalid graph validation', () => {
  it('rejects duplicate IDs', () => {
    expectTaxonomyError(
      () =>
        createTaxonomyTree([
          node({ id: 'json', localized: localized('json-a') }),
          node({ id: 'json', localized: localized('json-b') }),
        ]),
      'DUPLICATE_ID',
    );
  });

  it('rejects missing parents', () => {
    expectTaxonomyError(
      () => createTaxonomyTree([node({ id: 'json', parentId: 'missing' })]),
      'MISSING_PARENT',
    );
  });

  it('rejects self-parenting nodes', () => {
    expectTaxonomyError(
      () => createTaxonomyTree([node({ id: 'json', parentId: 'json' })]),
      'SELF_PARENT',
    );
  });

  it('rejects two-node cycles', () => {
    expectTaxonomyError(
      () =>
        createTaxonomyTree([
          node({ id: 'a', parentId: 'b' }),
          node({ id: 'b', parentId: 'a' }),
        ]),
      'CYCLE',
    );
  });

  it('rejects three-node cycles', () => {
    expectTaxonomyError(
      () =>
        createTaxonomyTree([
          node({ id: 'a', parentId: 'b' }),
          node({ id: 'b', parentId: 'c' }),
          node({ id: 'c', parentId: 'a' }),
        ]),
      'CYCLE',
    );
  });

  it('rejects invalid root and child slugs', () => {
    expectTaxonomyError(
      () =>
        createTaxonomyTree([
          node({ id: 'developer', localized: localized('Developer') }),
        ]),
      'INVALID_SLUG',
    );

    expectTaxonomyError(
      () =>
        createTaxonomyTree([
          node({ id: 'developer' }),
          node({
            id: 'json',
            parentId: 'developer',
            localized: localized('data_formats'),
          }),
        ]),
      'INVALID_SLUG',
    );
  });

  it('rejects empty labels and short labels', () => {
    expectTaxonomyError(
      () =>
        createTaxonomyTree([
          node({
            id: 'developer',
            localized: {
              en: { slug: 'developer', label: ' ' },
              es: { slug: 'developer', label: 'developer' },
              pt: { slug: 'developer', label: 'developer' },
              fr: { slug: 'developer', label: 'developer' },
            },
          }),
        ]),
      'EMPTY_LABEL',
    );

    expectTaxonomyError(
      () =>
        createTaxonomyTree([
          node({
            id: 'developer',
            localized: {
              en: { slug: 'developer', label: 'developer', shortLabel: '' },
              es: { slug: 'developer', label: 'developer' },
              pt: { slug: 'developer', label: 'developer' },
              fr: { slug: 'developer', label: 'developer' },
            },
          }),
        ]),
      'EMPTY_LABEL',
    );
  });

  it('rejects invalid sort orders', () => {
    expectTaxonomyError(
      () => createTaxonomyTree([node({ id: 'developer', sortOrder: 1.5 })]),
      'INVALID_SORT_ORDER',
    );

    expectTaxonomyError(
      () =>
        createTaxonomyTree([
          node({ id: 'developer', sortOrder: Number.POSITIVE_INFINITY }),
        ]),
      'INVALID_SORT_ORDER',
    );
  });

  it('rejects duplicate root slugs per locale', () => {
    expectTaxonomyError(
      () =>
        createTaxonomyTree([
          node({ id: 'developer', localized: localized('tools') }),
          node({ id: 'seo', localized: localized('tools') }),
        ]),
      'DUPLICATE_SIBLING_SLUG',
    );
  });

  it('rejects duplicate child slugs under the same parent per locale', () => {
    expectTaxonomyError(
      () =>
        createTaxonomyTree([
          node({ id: 'developer' }),
          node({
            id: 'json-a',
            parentId: 'developer',
            localized: localized('json-a', 'json'),
          }),
          node({
            id: 'json-b',
            parentId: 'developer',
            localized: localized('json-b', 'json'),
          }),
        ]),
      'DUPLICATE_SIBLING_SLUG',
    );
  });

  it('allows the same localized slug under different parents', () => {
    const tree = createTaxonomyTree([
      node({ id: 'developer' }),
      node({ id: 'seo' }),
      node({
        id: 'developer-json',
        parentId: 'developer',
        localized: localized('json'),
      }),
      node({
        id: 'seo-json',
        parentId: 'seo',
        localized: localized('json'),
      }),
    ]);

    expect(tree.getLocalizedPath('developer-json', 'en')).toEqual([
      'developer',
      'json',
    ]);
    expect(tree.getLocalizedPath('seo-json', 'en')).toEqual(['seo', 'json']);
  });
});

function node(params: {
  id: string;
  parentId?: string | null;
  sortOrder?: number;
  localized?: TaxonomyNode['localized'];
}): TaxonomyNode {
  return {
    id: params.id,
    parentId: params.parentId ?? null,
    localized: params.localized ?? localized(params.id),
    status: 'published',
    sortOrder: params.sortOrder ?? 100,
  };
}

function localized(enSlug: string, esSlug = enSlug): TaxonomyNode['localized'] {
  return {
    en: { slug: enSlug, label: enSlug },
    es: { slug: esSlug, label: esSlug },
    pt: { slug: enSlug, label: enSlug },
    fr: { slug: enSlug, label: enSlug },
  };
}

function expectTaxonomyError(
  action: () => unknown,
  code: TaxonomyInvariantError['code'],
): void {
  expect(action).toThrow(TaxonomyInvariantError);

  try {
    action();
  } catch (error) {
    expect(error).toBeInstanceOf(TaxonomyInvariantError);
    expect((error as TaxonomyInvariantError).code).toBe(code);
  }
}
