import type { ToolCategoryId } from '@/domain/shared/ids';
import type { TaxonomyTree } from '@/domain/taxonomy/shared/types';
import type { Locale } from '@/i18n/types';
import { RoutingInvariantError } from '@/routing/errors';
import type { ToolRouteDefinition } from '@/routing/definitions/types';

import {
  assertPublishedTaxonomyPath,
  freezeValidatedSegments,
  getLocalizedTaxonomySegments,
  getRequiredLocalizedLeaf,
  getRequiredPathFromRoot,
  type BuildPathContext,
} from './shared-path-builder';

export interface BuildToolPathInput {
  readonly definition: ToolRouteDefinition;
  readonly locale: Locale;
  readonly taxonomy: TaxonomyTree<ToolCategoryId>;
  readonly sourceId?: string;
}

export function buildToolPathSegments(
  input: BuildToolPathInput,
): readonly string[] {
  const context = getToolContext(input);
  const leaf = getRequiredLocalizedLeaf(
    input.definition.localized,
    input.locale,
    context,
  );
  const taxonomyPath = getRequiredPathFromRoot(
    input.taxonomy,
    input.definition.primaryCategoryId,
    context,
  );
  const root = taxonomyPath[0];

  if (!root || root.id !== input.definition.rootCategoryId) {
    throw new RoutingInvariantError(
      'ROOT_CATEGORY_MISMATCH',
      `Tool ${input.definition.toolId} primary category ${input.definition.primaryCategoryId} does not descend from root category ${input.definition.rootCategoryId}.`,
      {
        ...context,
        actualRootCategoryId: root?.id,
      },
    );
  }

  assertPublishedTaxonomyPath(taxonomyPath, context);

  const taxonomySegments =
    input.definition.strategy === 'flat'
      ? [root.localized[input.locale].slug]
      : getLocalizedTaxonomySegments(taxonomyPath, input.locale);

  return freezeValidatedSegments([...taxonomySegments, leaf.slug], context);
}

function getToolContext(input: BuildToolPathInput): BuildPathContext {
  return {
    locale: input.locale,
    routeKind: 'tool',
    toolId: input.definition.toolId,
    rootCategoryId: input.definition.rootCategoryId,
    primaryCategoryId: input.definition.primaryCategoryId,
    strategy: input.definition.strategy,
    ...(input.sourceId !== undefined ? { sourceId: input.sourceId } : {}),
  };
}
