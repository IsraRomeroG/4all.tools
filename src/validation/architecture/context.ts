import type { ContentSourceSnapshot } from '@/content/queries/indexed-content-source';
import type { BlogCategoryId, ToolCategoryId } from '@/domain/shared/ids';
import type { TaxonomyTree } from '@/domain/taxonomy/shared/types';
import type { ToolDefinitionRegistry } from '@/features/tools/definition-registry';
import type {
  ToolModule,
  ToolModuleRegistry,
} from '@/features/tools/module-registry';
import type { RouteDefinition } from '@/routing/definitions/types';
import type { RouteRegistry } from '@/routing/registry/route-index';

export interface ArchitectureValidationContext {
  readonly content: ContentSourceSnapshot;
  readonly toolDefinitions: ToolDefinitionRegistry;
  readonly toolModules: ToolModuleRegistry;
  readonly toolTaxonomy: TaxonomyTree<ToolCategoryId>;
  readonly blogTaxonomy: TaxonomyTree<BlogCategoryId>;
  readonly routeDefinitions: readonly RouteDefinition[];
  readonly routeRegistry: RouteRegistry;
}

export function createArchitectureValidationContext(
  input: ArchitectureValidationContext,
): ArchitectureValidationContext {
  return Object.freeze({
    ...input,
    routeDefinitions: Object.freeze([...input.routeDefinitions]),
  });
}

export type ArchitectureToolModule = ToolModule;
