import type { ToolCategoryId } from '@/domain/shared/ids';
import type { TaxonomyTree } from '@/domain/taxonomy/shared/types';
import type { Locale } from '@/i18n/types';
import { RoutingInvariantError } from '@/routing/errors';
import type { ToolCategoryRouteDefinition } from '@/routing/definitions/types';

import {
  assertPublishedTaxonomyPath,
  freezeValidatedSegments,
  getLocalizedTaxonomySegments,
  getRequiredPathFromRoot,
  type BuildPathContext,
} from './shared-path-builder';

export interface BuildToolCategoryPathInput {
  readonly definition: ToolCategoryRouteDefinition;
  readonly locale: Locale;
  readonly taxonomy: TaxonomyTree<ToolCategoryId>;
  readonly sourceId?: string;
}

export function buildToolCategoryPathSegments(
  input: BuildToolCategoryPathInput,
): readonly string[] {
  const context = getToolCategoryContext(input);
  const taxonomyPath = getRequiredPathFromRoot(
    input.taxonomy,
    input.definition.categoryId,
    context,
  );
  const root = taxonomyPath[0];

  if (!root) {
    throw new RoutingInvariantError(
      'UNKNOWN_TAXONOMY_NODE',
      `Unknown taxonomy node ${input.definition.categoryId}.`,
      context,
    );
  }

  if (
    input.definition.strategy === 'root' &&
    root.id !== input.definition.categoryId
  ) {
    throw new RoutingInvariantError(
      'ROOT_CATEGORY_MISMATCH',
      `Tool category ${input.definition.categoryId} is not a taxonomy root and cannot use root route strategy.`,
      {
        ...context,
        rootCategoryId: root.id,
      },
    );
  }

  const path = input.definition.strategy === 'root' ? [root] : taxonomyPath;

  assertPublishedTaxonomyPath(path, context);

  return freezeValidatedSegments(
    getLocalizedTaxonomySegments(path, input.locale),
    context,
  );
}

function getToolCategoryContext(
  input: BuildToolCategoryPathInput,
): BuildPathContext {
  return {
    locale: input.locale,
    routeKind: 'tool-category',
    categoryId: input.definition.categoryId,
    strategy: input.definition.strategy,
    ...(input.sourceId !== undefined ? { sourceId: input.sourceId } : {}),
  };
}
