import type { ToolCategoryId } from '@/domain/shared/ids';
import type { TaxonomyTree } from '@/domain/taxonomy/shared/types';
import type { Locale } from '@/i18n/types';

import {
  freezeValidatedSegments,
  getLocalizedTaxonomySegments,
  getRequiredPathFromRoot,
  type BuildPathContext,
} from './shared-path-builder';

export interface BuildToolCategoryPathInput {
  readonly categoryId: ToolCategoryId;
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
    input.categoryId,
    context,
  );

  return freezeValidatedSegments(
    getLocalizedTaxonomySegments(taxonomyPath, input.locale),
    context,
  );
}

function getToolCategoryContext(
  input: BuildToolCategoryPathInput,
): BuildPathContext {
  return {
    locale: input.locale,
    routeKind: 'tool-category',
    categoryId: input.categoryId,
    strategy: 'hierarchical',
    ...(input.sourceId !== undefined ? { sourceId: input.sourceId } : {}),
  };
}
