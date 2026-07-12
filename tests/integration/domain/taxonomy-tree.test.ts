import { describe, expect, it } from 'vitest';

import { createTaxonomyTree } from '@/domain/taxonomy/shared/tree';
import type { TaxonomyNode } from '@/domain/taxonomy/shared/types';

describe('taxonomy tree integration fixture', () => {
  it('models a realistic multi-root taxonomy forest deterministically', () => {
    const tree = createTaxonomyTree([
      node({
        id: 'xml',
        parentId: 'data-formats',
        sortOrder: 200,
        localized: localized('xml', 'xml', 'xml', 'xml'),
      }),
      node({
        id: 'seo',
        sortOrder: 200,
        localized: localized('seo', 'seo', 'seo', 'seo'),
      }),
      node({
        id: 'base64',
        parentId: 'encoders',
        sortOrder: 100,
        localized: localized('base64', 'base64', 'base64', 'base64'),
      }),
      node({
        id: 'developer',
        sortOrder: 100,
        localized: localized(
          'developer',
          'desarrollo',
          'desenvolvimento',
          'developpement',
        ),
      }),
      node({
        id: 'crawling',
        parentId: 'seo',
        sortOrder: 100,
        localized: localized('crawling', 'rastreo', 'rastreamento', 'exploration'),
      }),
      node({
        id: 'encoders',
        parentId: 'developer',
        sortOrder: 200,
        localized: localized(
          'encoders',
          'codificadores',
          'codificadores',
          'encodeurs',
        ),
      }),
      node({
        id: 'json',
        parentId: 'data-formats',
        sortOrder: 100,
        localized: localized('json', 'json', 'json', 'json'),
      }),
      node({
        id: 'data-formats',
        parentId: 'developer',
        sortOrder: 100,
        localized: localized(
          'data-formats',
          'formatos-de-datos',
          'formatos-de-dados',
          'formats-de-donnees',
        ),
      }),
    ]);

    expect(tree.getRoots().map((item) => item.id)).toEqual([
      'developer',
      'seo',
    ]);
    expect(tree.getRoot('json').id).toBe('developer');
    expect(tree.getRoot('crawling').id).toBe('seo');
    expect(tree.getDescendants('developer').map((item) => item.id)).toEqual([
      'data-formats',
      'json',
      'xml',
      'encoders',
      'base64',
    ]);
    expect(tree.getLocalizedPath('json', 'en')).toEqual([
      'developer',
      'data-formats',
      'json',
    ]);
    expect(tree.getLocalizedPath('json', 'es')).toEqual([
      'desarrollo',
      'formatos-de-datos',
      'json',
    ]);
  });
});

function node(params: {
  id: string;
  parentId?: string | null;
  sortOrder: number;
  localized: TaxonomyNode['localized'];
}): TaxonomyNode {
  return {
    id: params.id,
    parentId: params.parentId ?? null,
    localized: params.localized,
    status: 'published',
    sortOrder: params.sortOrder,
  };
}

function localized(
  enSlug: string,
  esSlug: string,
  ptSlug: string,
  frSlug: string,
): TaxonomyNode['localized'] {
  return {
    en: { slug: enSlug, label: enSlug },
    es: { slug: esSlug, label: esSlug },
    pt: { slug: ptSlug, label: ptSlug },
    fr: { slug: frSlug, label: frSlug },
  };
}
