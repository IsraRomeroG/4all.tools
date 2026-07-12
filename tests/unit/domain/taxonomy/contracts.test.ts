import { describe, expect, it } from 'vitest';

import type { BlogCategoryId, ToolCategoryId } from '@/domain/shared/ids';
import { TaxonomyInvariantError } from '@/domain/taxonomy/shared/errors';
import {
  isTaxonomySlug,
  type TaxonomyNode,
  type TaxonomyTree,
} from '@/domain/taxonomy/shared/types';

describe('taxonomy contracts', () => {
  it.each([
    'developer',
    'data-formats',
    'formatos-de-datos',
    'formats-de-donnees',
    'json',
    'sha256',
  ])('accepts valid taxonomy slug %s', (value) => {
    expect(isTaxonomySlug(value)).toBe(true);
  });

  it.each([
    'Developer',
    'DATA-FORMATS',
    'data_formats',
    'data formats',
    '/data-formats',
    'data-formats/',
    'data--formats',
    '-data-formats',
    'data-formats-',
    '',
    null,
    undefined,
    42,
  ])('rejects invalid taxonomy slug %s', (value) => {
    expect(isTaxonomySlug(value)).toBe(false);
  });

  it('represents tool and blog taxonomy nodes through the shared generic contract', () => {
    const toolNode: TaxonomyNode<ToolCategoryId> = {
      id: 'developer',
      parentId: null,
      localized: {
        en: { slug: 'developer', label: 'Developer Tools' },
        es: { slug: 'desarrollo', label: 'Herramientas para desarrolladores' },
        pt: { slug: 'desenvolvimento', label: 'Ferramentas para desenvolvedores' },
        fr: { slug: 'developpement', label: 'Outils pour developpeurs' },
      },
      status: 'published',
      sortOrder: 100,
    };

    const blogNode: TaxonomyNode<BlogCategoryId> = {
      id: 'json-guides',
      parentId: 'development',
      localized: {
        en: { slug: 'json-guides', label: 'JSON Guides' },
        es: { slug: 'guias-json', label: 'Guias de JSON' },
        pt: { slug: 'guias-json', label: 'Guias de JSON' },
        fr: { slug: 'guides-json', label: 'Guides JSON' },
      },
      status: 'draft',
      sortOrder: 200,
    };

    expect(toolNode.parentId).toBeNull();
    expect(blogNode.parentId).toBe('development');
  });

  it('allows multiple roots and conceptual localized paths at interface level', () => {
    const roots: readonly TaxonomyNode[] = [
      rootNode('developer', 100),
      rootNode('seo', 200),
    ];

    const taxonomy: TaxonomyTree = {
      hasNode: (id) => roots.some((node) => node.id === id),
      findNode: (id) => roots.find((node) => node.id === id),
      getNode: (id) => {
        const node = roots.find((candidate) => candidate.id === id);

        if (!node) {
          throw new TaxonomyInvariantError({
            code: 'UNKNOWN_NODE',
            message: `Unknown taxonomy node ${id}.`,
            context: { id },
          });
        }

        return node;
      },
      getRoots: () => roots,
      getParent: () => null,
      getChildren: () => [],
      getAncestors: () => [],
      getDescendants: () => [],
      getRoot: (id) => taxonomy.getNode(id),
      getPathFromRoot: (id) => [taxonomy.getNode(id)],
      getLocalizedPath: (id, locale) => [taxonomy.getNode(id).localized[locale].slug],
    };

    expect(taxonomy.getRoots().map((node) => node.id)).toEqual([
      'developer',
      'seo',
    ]);
    expect(taxonomy.getLocalizedPath('developer', 'en')).toEqual(['developer']);
  });

  it('keeps invariant errors machine-readable', () => {
    const error = new TaxonomyInvariantError({
      code: 'DUPLICATE_SIBLING_SLUG',
      message: 'Duplicate taxonomy slug json under parent developer.',
      context: {
        locale: 'es',
        parentId: 'developer',
        slug: 'json',
        nodeIds: ['json-a', 'json-b'],
      },
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('TaxonomyInvariantError');
    expect(error.message).toBe(
      'Duplicate taxonomy slug json under parent developer.',
    );
    expect(error.code).toBe('DUPLICATE_SIBLING_SLUG');
    expect(error.context).toEqual({
      locale: 'es',
      parentId: 'developer',
      slug: 'json',
      nodeIds: ['json-a', 'json-b'],
    });
  });
});

function rootNode(id: string, sortOrder: number): TaxonomyNode {
  return {
    id,
    parentId: null,
    localized: {
      en: { slug: id, label: id },
      es: { slug: id, label: id },
      pt: { slug: id, label: id },
      fr: { slug: id, label: id },
    },
    status: 'published',
    sortOrder,
  };
}
