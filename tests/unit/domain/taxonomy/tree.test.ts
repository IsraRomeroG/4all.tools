import { describe, expect, it } from 'vitest';

import { TaxonomyInvariantError } from '@/domain/taxonomy/shared/errors';
import { createTaxonomyTree } from '@/domain/taxonomy/shared/tree';
import type { TaxonomyNode } from '@/domain/taxonomy/shared/types';

describe('taxonomy tree engine', () => {
  it('supports empty forests', () => {
    const tree = createTaxonomyTree([]);

    expect(tree.getRoots()).toEqual([]);
    expect(tree.hasNode('missing')).toBe(false);
    expect(tree.findNode('missing')).toBeUndefined();
    expectTaxonomyError(() => tree.getNode('missing'), 'UNKNOWN_NODE');
  });

  it('queries one-root and multiple-root forests', () => {
    const tree = createTaxonomyTree([
      node({ id: 'seo', sortOrder: 300 }),
      node({ id: 'developer', sortOrder: 100 }),
      node({ id: 'text', sortOrder: 200 }),
    ]);

    expect(ids(tree.getRoots())).toEqual(['developer', 'text', 'seo']);
    expect(tree.hasNode('developer')).toBe(true);
    expect(tree.hasNode('missing')).toBe(false);
    expect(tree.findNode('text')?.id).toBe('text');
    expect(tree.findNode('missing')).toBeUndefined();
    expect(tree.getParent('developer')).toBeNull();
    expect(tree.getChildren('developer')).toEqual([]);
  });

  it('looks up parents, children, ancestors, roots, paths, and descendants', () => {
    const tree = createTaxonomyTree([
      node({ id: 'd', parentId: 'c', sortOrder: 100 }),
      node({ id: 'c', parentId: 'b', sortOrder: 100 }),
      node({ id: 'b', parentId: 'a', sortOrder: 100 }),
      node({ id: 'a', sortOrder: 100 }),
    ]);

    expect(tree.getParent('a')).toBeNull();
    expect(tree.getParent('d')?.id).toBe('c');
    expect(ids(tree.getChildren('a'))).toEqual(['b']);
    expect(ids(tree.getChildren('d'))).toEqual([]);
    expect(ids(tree.getAncestors('d'))).toEqual(['a', 'b', 'c']);
    expect(ids(tree.getAncestors('a'))).toEqual([]);
    expect(tree.getRoot('d').id).toBe('a');
    expect(tree.getRoot('a').id).toBe('a');
    expect(ids(tree.getPathFromRoot('d'))).toEqual(['a', 'b', 'c', 'd']);
    expect(ids(tree.getDescendants('a'))).toEqual(['b', 'c', 'd']);
    expect(ids(tree.getDescendants('d'))).toEqual([]);
  });

  it('uses deterministic ordering for roots, children, and descendants', () => {
    const tree = createTaxonomyTree([
      node({ id: 'c', parentId: 'a', sortOrder: 200 }),
      node({ id: 'e', parentId: 'b', sortOrder: 200 }),
      node({ id: 'd', parentId: 'b', sortOrder: 100 }),
      node({ id: 'b', parentId: 'a', sortOrder: 100 }),
      node({ id: 'z-root', sortOrder: 100 }),
      node({ id: 'a-root', sortOrder: 100 }),
      node({ id: 'a', sortOrder: 50 }),
    ]);

    expect(ids(tree.getRoots())).toEqual(['a', 'a-root', 'z-root']);
    expect(ids(tree.getChildren('a'))).toEqual(['b', 'c']);
    expect(ids(tree.getChildren('b'))).toEqual(['d', 'e']);
    expect(ids(tree.getDescendants('a'))).toEqual(['b', 'd', 'e', 'c']);
  });

  it('maps localized taxonomy paths without route prefixes', () => {
    const tree = createTaxonomyTree([
      node({
        id: 'developer',
        localized: localized('developer', 'desarrollo', 'desenvolvimento', 'developpement'),
      }),
      node({
        id: 'data-formats',
        parentId: 'developer',
        localized: localized(
          'data-formats',
          'formatos-de-datos',
          'formatos-de-dados',
          'formats-de-donnees',
        ),
      }),
      node({ id: 'json', parentId: 'data-formats' }),
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

  it('snapshots input nodes and returns frozen query objects', () => {
    const source = [
      node({
        id: 'developer',
        localized: localized('developer', 'desarrollo', 'desenvolvimento', 'developpement'),
      }),
      node({ id: 'json', parentId: 'developer' }),
    ];

    const tree = createTaxonomyTree(source);
    source[0]!.localized.en.slug = 'changed-after-construction';
    source.push(node({ id: 'late-node' }));

    expect(tree.getLocalizedPath('json', 'en')).toEqual(['developer', 'json']);
    expect(tree.hasNode('late-node')).toBe(false);
    expect(Object.isFrozen(tree)).toBe(true);
    expect(Object.isFrozen(tree.getRoots())).toBe(true);
    expect(Object.isFrozen(tree.getNode('developer'))).toBe(true);
    expect(Object.isFrozen(tree.getNode('developer').localized)).toBe(true);
  });

  it('throws UNKNOWN_NODE for strict queries against missing IDs', () => {
    const tree = createTaxonomyTree([node({ id: 'developer' })]);

    expectTaxonomyError(() => tree.getNode('missing'), 'UNKNOWN_NODE');
    expectTaxonomyError(() => tree.getParent('missing'), 'UNKNOWN_NODE');
    expectTaxonomyError(() => tree.getChildren('missing'), 'UNKNOWN_NODE');
    expectTaxonomyError(() => tree.getAncestors('missing'), 'UNKNOWN_NODE');
    expectTaxonomyError(() => tree.getDescendants('missing'), 'UNKNOWN_NODE');
    expectTaxonomyError(() => tree.getRoot('missing'), 'UNKNOWN_NODE');
    expectTaxonomyError(() => tree.getPathFromRoot('missing'), 'UNKNOWN_NODE');
    expectTaxonomyError(
      () => tree.getLocalizedPath('missing', 'en'),
      'UNKNOWN_NODE',
    );
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
    localized: params.localized ?? localized(params.id, params.id, params.id, params.id),
    status: 'published',
    sortOrder: params.sortOrder ?? 100,
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

function ids(nodes: readonly TaxonomyNode[]): string[] {
  return nodes.map((item) => item.id);
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
