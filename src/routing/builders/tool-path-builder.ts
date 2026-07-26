import type { ToolCategoryId } from '@/domain/shared/ids';
import type { ToolDefinition } from '@/domain/tools';
import type { TaxonomyTree } from '@/domain/taxonomy/shared/types';
import type { Locale } from '@/i18n/types';
import { RoutingInvariantError } from '@/routing/errors';

import {
  freezeValidatedSegments,
  getLocalizedTaxonomySegments,
    getRequiredLocalizedLeaf,
  getRequiredPathFromRoot,
  type BuildPathContext,
} from './shared-path-builder';

export interface BuildToolPathInput {
  readonly definition: ToolDefinition;
  readonly locale: Locale;
  readonly taxonomy: TaxonomyTree<ToolCategoryId>;
  readonly sourceId?: string;
}

export function buildToolPathSegments(
  input: BuildToolPathInput,
): readonly string[] {
  const context = getToolContext(input);
  const leaf = getRequiredLocalizedLeaf(
    input.definition.route.localized,
    input.locale,
    context,
  );
  const taxonomyPath = getRequiredPathFromRoot(
    input.taxonomy,
    input.definition.taxonomy.primaryCategoryId,
    context,
  );
  const root = taxonomyPath[0];

  if (!root || root.id !== input.definition.rootCategoryId) {
    throw new RoutingInvariantError(
      'ROOT_CATEGORY_MISMATCH',
      `Tool ${input.definition.id} primary category ${input.definition.taxonomy.primaryCategoryId} does not descend from root category ${input.definition.rootCategoryId}.`,
      {
        ...context,
        actualRootCategoryId: root?.id,
      },
    );
  }

  const taxonomySegments =
    input.definition.route.strategy === 'flat'
      ? [root.localized[input.locale].slug]
      : getLocalizedTaxonomySegments(taxonomyPath, input.locale);

  return freezeValidatedSegments([...taxonomySegments, leaf.slug], context);
}

function getToolContext(input: BuildToolPathInput): BuildPathContext {
  return {
    locale: input.locale,
    routeKind: 'tool',
    toolId: input.definition.id,
    rootCategoryId: input.definition.rootCategoryId,
    primaryCategoryId: input.definition.taxonomy.primaryCategoryId,
    strategy: input.definition.route.strategy,
    ...(input.sourceId !== undefined ? { sourceId: input.sourceId } : {}),
  };
}
