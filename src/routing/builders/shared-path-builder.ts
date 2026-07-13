import type { TaxonomyNode, TaxonomyTree } from '@/domain/taxonomy/shared/types';
import type { Locale } from '@/i18n/types';
import { RoutingInvariantError } from '@/routing/errors';
import type { LocalizedRouteLeaf } from '@/routing/definitions/types';

import { assertValidRouteSegments } from './segment-validation';

export interface BuildPathContext {
  readonly locale: Locale;
  readonly sourceId?: string;
  readonly [key: string]: unknown;
}

export function freezeValidatedSegments(
  segments: readonly string[],
  context: BuildPathContext,
): readonly string[] {
  assertValidRouteSegments(segments, context);

  return Object.freeze([...segments]);
}

export function getRequiredLocalizedLeaf(
  localized: Partial<Record<Locale, LocalizedRouteLeaf>>,
  locale: Locale,
  context: BuildPathContext,
): LocalizedRouteLeaf {
  const leaf = localized[locale];

  if (leaf) {
    return leaf;
  }

  throw new RoutingInvariantError(
    'MISSING_LOCALIZED_ROUTE',
    `Missing localized route metadata for locale ${locale}.`,
    context,
  );
}

export function getRequiredTaxonomyNode<TId extends string>(
  taxonomy: TaxonomyTree<TId>,
  id: TId,
  context: BuildPathContext,
): TaxonomyNode<TId> {
  const node = taxonomy.findNode(id);

  if (node) {
    return node;
  }

  throw new RoutingInvariantError(
    'UNKNOWN_TAXONOMY_NODE',
    `Unknown taxonomy node ${id}.`,
    {
      ...context,
      taxonomyNodeId: id,
    },
  );
}

export function getRequiredPathFromRoot<TId extends string>(
  taxonomy: TaxonomyTree<TId>,
  id: TId,
  context: BuildPathContext,
): readonly TaxonomyNode<TId>[] {
  getRequiredTaxonomyNode(taxonomy, id, context);

  return taxonomy.getPathFromRoot(id);
}

export function assertPublishedTaxonomyPath<TId extends string>(
  path: readonly TaxonomyNode<TId>[],
  context: BuildPathContext,
): void {
  const unpublishedNode = path.find((node) => node.status !== 'published');

  if (!unpublishedNode) {
    return;
  }

  throw new RoutingInvariantError(
    'UNPUBLISHABLE_ROUTE',
    `Taxonomy node ${unpublishedNode.id} is ${unpublishedNode.status} and cannot be used for a canonical route.`,
    {
      ...context,
      taxonomyNodeId: unpublishedNode.id,
      status: unpublishedNode.status,
    },
  );
}

export function getLocalizedTaxonomySegments<TId extends string>(
  path: readonly TaxonomyNode<TId>[],
  locale: Locale,
): readonly string[] {
  return path.map((node) => node.localized[locale].slug);
}
