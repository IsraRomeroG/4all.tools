import { SUPPORTED_LOCALES, type Locale } from '@/i18n/types';

import { TaxonomyInvariantError } from './errors';
import {
  isTaxonomySlug,
  type TaxonomyLocaleData,
  type TaxonomyNode,
  type TaxonomyTree,
} from './types';

type FrozenTaxonomyLocaleData = Readonly<TaxonomyLocaleData>;

type FrozenLocalizedTaxonomyData<TId extends string> = {
  readonly [TLocale in keyof TaxonomyNode<TId>['localized']]: FrozenTaxonomyLocaleData;
};

type FrozenTaxonomyNode<TId extends string> = Readonly<
  Omit<TaxonomyNode<TId>, 'localized'>
> & {
  readonly localized: FrozenLocalizedTaxonomyData<TId>;
};

type VisitState = 'visiting' | 'visited';

const VIRTUAL_ROOT_PARENT = '<root>';

export function createTaxonomyTree<TId extends string>(
  inputNodes: readonly TaxonomyNode<TId>[],
): TaxonomyTree<TId> {
  const nodes = inputNodes.map(snapshotNode);
  const nodesById = new Map<TId, FrozenTaxonomyNode<TId>>();

  for (const node of nodes) {
    validateNodeFields(node);

    if (nodesById.has(node.id)) {
      throw new TaxonomyInvariantError({
        code: 'DUPLICATE_ID',
        message: `Duplicate taxonomy node ID ${node.id}.`,
        context: { id: node.id },
      });
    }

    nodesById.set(node.id, node);
  }

  for (const node of nodes) {
    if (node.parentId === node.id) {
      throw new TaxonomyInvariantError({
        code: 'SELF_PARENT',
        message: `Taxonomy node ${node.id} cannot be its own parent.`,
        context: { id: node.id },
      });
    }

    if (node.parentId !== null && !nodesById.has(node.parentId)) {
      throw new TaxonomyInvariantError({
        code: 'MISSING_PARENT',
        message: `Taxonomy node ${node.id} references missing parent ${node.parentId}.`,
        context: { id: node.id, parentId: node.parentId },
      });
    }
  }

  validateAcyclic(nodes, nodesById);

  const childrenByParent = buildChildrenIndex(nodes);
  validateDuplicateSiblingSlugs(childrenByParent);

  const roots = childrenByParent.get(null) ?? Object.freeze([]);

  function findNode(id: TId): FrozenTaxonomyNode<TId> | undefined {
    return nodesById.get(id);
  }

  function getNode(id: TId): FrozenTaxonomyNode<TId> {
    const node = findNode(id);

    if (!node) {
      throw new TaxonomyInvariantError({
        code: 'UNKNOWN_NODE',
        message: `Unknown taxonomy node ${id}.`,
        context: { id },
      });
    }

    return node;
  }

  function getChildren(id: TId): readonly FrozenTaxonomyNode<TId>[] {
    getNode(id);

    return childrenByParent.get(id) ?? Object.freeze([]);
  }

  function getAncestors(id: TId): readonly FrozenTaxonomyNode<TId>[] {
    const ancestors: FrozenTaxonomyNode<TId>[] = [];
    let current = getNode(id);

    while (current.parentId !== null) {
      const parent = getNode(current.parentId);
      ancestors.push(parent);
      current = parent;
    }

    return Object.freeze(ancestors.reverse());
  }

  function getRoot(id: TId): FrozenTaxonomyNode<TId> {
    let current = getNode(id);

    while (current.parentId !== null) {
      current = getNode(current.parentId);
    }

    return current;
  }

  function getPathFromRoot(id: TId): readonly FrozenTaxonomyNode<TId>[] {
    return Object.freeze([...getAncestors(id), getNode(id)]);
  }

  function getDescendants(id: TId): readonly FrozenTaxonomyNode<TId>[] {
    getNode(id);

    const descendants: FrozenTaxonomyNode<TId>[] = [];
    const visitChildren = (parentId: TId) => {
      for (const child of getChildren(parentId)) {
        descendants.push(child);
        visitChildren(child.id);
      }
    };

    visitChildren(id);

    return Object.freeze(descendants);
  }

  const tree: TaxonomyTree<TId> = {
    hasNode: (id: TId) => nodesById.has(id),
    findNode,
    getNode,
    getRoots: () => roots,
    getParent: (id: TId) => {
      const node = getNode(id);

      return node.parentId === null ? null : getNode(node.parentId);
    },
    getChildren,
    getAncestors,
    getDescendants,
    getRoot,
    getPathFromRoot,
    getLocalizedPath: (id: TId, locale: Locale) =>
      Object.freeze(
        getPathFromRoot(id).map((node) => node.localized[locale].slug),
      ),
  };

  return Object.freeze(tree);
}

function snapshotNode<TId extends string>(
  node: TaxonomyNode<TId>,
): FrozenTaxonomyNode<TId> {
  return Object.freeze({
    id: node.id,
    parentId: node.parentId,
    localized: snapshotLocalized(node.localized),
    status: node.status,
    sortOrder: node.sortOrder,
  }) as FrozenTaxonomyNode<TId>;
}

function snapshotLocalized<TId extends string>(
  localized: TaxonomyNode<TId>['localized'],
): FrozenLocalizedTaxonomyData<TId> {
  const snapshot = {} as {
    [TLocale in keyof TaxonomyNode<TId>['localized']]: FrozenTaxonomyLocaleData;
  };

  for (const locale of SUPPORTED_LOCALES) {
    snapshot[locale] = Object.freeze({ ...localized[locale] });
  }

  return Object.freeze(snapshot);
}

function validateNodeFields<TId extends string>(
  node: FrozenTaxonomyNode<TId>,
): void {
  if (!Number.isFinite(node.sortOrder) || !Number.isInteger(node.sortOrder)) {
    throw new TaxonomyInvariantError({
      code: 'INVALID_SORT_ORDER',
      message: `Taxonomy node ${node.id} has invalid sortOrder ${node.sortOrder}.`,
      context: { id: node.id, sortOrder: node.sortOrder },
    });
  }

  for (const locale of SUPPORTED_LOCALES) {
    const localeData = node.localized[locale];

    if (!isTaxonomySlug(localeData.slug)) {
      throw new TaxonomyInvariantError({
        code: 'INVALID_SLUG',
        message: `Taxonomy node ${node.id} has invalid ${locale} slug ${JSON.stringify(
          localeData.slug,
        )}.`,
        context: { id: node.id, locale, slug: localeData.slug },
      });
    }

    if (localeData.label.trim().length === 0) {
      throw new TaxonomyInvariantError({
        code: 'EMPTY_LABEL',
        message: `Taxonomy node ${node.id} has empty ${locale} label.`,
        context: { id: node.id, locale, field: 'label' },
      });
    }

    if (
      localeData.shortLabel !== undefined &&
      localeData.shortLabel.trim().length === 0
    ) {
      throw new TaxonomyInvariantError({
        code: 'EMPTY_LABEL',
        message: `Taxonomy node ${node.id} has empty ${locale} shortLabel.`,
        context: { id: node.id, locale, field: 'shortLabel' },
      });
    }
  }
}

function validateAcyclic<TId extends string>(
  nodes: readonly FrozenTaxonomyNode<TId>[],
  nodesById: ReadonlyMap<TId, FrozenTaxonomyNode<TId>>,
): void {
  const states = new Map<TId, VisitState>();

  const visit = (node: FrozenTaxonomyNode<TId>, path: readonly TId[]) => {
    const state = states.get(node.id);

    if (state === 'visited') {
      return;
    }

    if (state === 'visiting') {
      const firstCycleIndex = path.indexOf(node.id);
      const cycle =
        firstCycleIndex >= 0
          ? [...path.slice(firstCycleIndex), node.id]
          : [...path, node.id];

      throw new TaxonomyInvariantError({
        code: 'CYCLE',
        message: `Taxonomy cycle detected: ${cycle.join(' -> ')}.`,
        context: { cycle },
      });
    }

    states.set(node.id, 'visiting');

    if (node.parentId !== null) {
      const parent = nodesById.get(node.parentId);

      if (parent) {
        visit(parent, [...path, node.id]);
      }
    }

    states.set(node.id, 'visited');
  };

  for (const node of nodes) {
    visit(node, []);
  }
}

function buildChildrenIndex<TId extends string>(
  nodes: readonly FrozenTaxonomyNode<TId>[],
): ReadonlyMap<TId | null, readonly FrozenTaxonomyNode<TId>[]> {
  const mutableBuckets = new Map<TId | null, FrozenTaxonomyNode<TId>[]>();

  for (const node of nodes) {
    const bucket = mutableBuckets.get(node.parentId) ?? [];
    bucket.push(node);
    mutableBuckets.set(node.parentId, bucket);
  }

  const frozenBuckets = new Map<TId | null, readonly FrozenTaxonomyNode<TId>[]>();

  for (const [parentId, bucket] of mutableBuckets) {
    frozenBuckets.set(parentId, Object.freeze([...bucket].sort(compareNodes)));
  }

  return frozenBuckets;
}

function validateDuplicateSiblingSlugs<TId extends string>(
  childrenByParent: ReadonlyMap<TId | null, readonly FrozenTaxonomyNode<TId>[]>,
): void {
  for (const [parentId, siblings] of childrenByParent) {
    for (const locale of SUPPORTED_LOCALES) {
      const firstNodeBySlug = new Map<string, FrozenTaxonomyNode<TId>>();

      for (const node of siblings) {
        const slug = node.localized[locale].slug;
        const firstNode = firstNodeBySlug.get(slug);

        if (firstNode) {
          throw new TaxonomyInvariantError({
            code: 'DUPLICATE_SIBLING_SLUG',
            message: `Duplicate ${locale} taxonomy slug ${slug} under parent ${
              parentId ?? VIRTUAL_ROOT_PARENT
            }.`,
            context: {
              locale,
              parentId,
              slug,
              nodeIds: [firstNode.id, node.id],
            },
          });
        }

        firstNodeBySlug.set(slug, node);
      }
    }
  }
}

function compareNodes<TId extends string>(
  a: FrozenTaxonomyNode<TId>,
  b: FrozenTaxonomyNode<TId>,
): number {
  if (a.sortOrder !== b.sortOrder) {
    return a.sortOrder - b.sortOrder;
  }

  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}
