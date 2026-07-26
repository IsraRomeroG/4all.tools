import type { ContentSourceSnapshot } from '@/content/queries/indexed-content-source';
import type { BlogCategoryId, ToolCategoryId } from '@/domain/shared/ids';
import type { TaxonomyTree } from '@/domain/taxonomy/shared/types';
import type { ToolRegistry } from '@/features/tools/registry';
import type { RouteRegistry } from '@/routing/registry/route-index';

export interface ArchitectureValidationContext {
  readonly content: ContentSourceSnapshot;
  readonly toolRegistry: ToolRegistry;
  readonly toolTaxonomy: TaxonomyTree<ToolCategoryId>;
  readonly blogTaxonomy: TaxonomyTree<BlogCategoryId>;
  readonly routeRegistry: RouteRegistry;
}

export function createArchitectureValidationContext(
  input: ArchitectureValidationContext,
): ArchitectureValidationContext {
  return Object.freeze({
    ...input,
  });
}
