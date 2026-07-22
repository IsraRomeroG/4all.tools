import type { ContentSourceSnapshot } from '@/content/queries/indexed-content-source';
import type { BlogCategoryId, ToolCategoryId, ToolId } from '@/domain/shared/ids';
import type { TaxonomyTree } from '@/domain/taxonomy/shared/types';
import type { ToolDefinitionRegistry } from '@/features/tools/definition-registry';
import type {
  ToolModule,
  ToolModuleRegistry,
} from '@/features/tools/module-registry';
import type { RouteDefinition } from '@/routing/definitions/types';
import type { RouteRegistry } from '@/routing/registry/route-index';
import type { RouteRecord, RouteTarget } from '@/routing/types';
import type { Locale } from '@/i18n/types';
import type { LocalizedRouteCluster, SeoPageModel } from '@/seo';

export interface ArchitectureValidationContext {
  readonly content: ContentSourceSnapshot;
  readonly toolDefinitions: ToolDefinitionRegistry;
  readonly toolModules: ToolModuleRegistry;
  readonly toolModuleRegistrations?: readonly ArchitectureToolModuleRegistration[];
  readonly toolModuleSourceDirectories?: Readonly<Record<ToolId, string>>;
  readonly toolTaxonomy: TaxonomyTree<ToolCategoryId>;
  readonly blogTaxonomy: TaxonomyTree<BlogCategoryId>;
  readonly routeDefinitions: readonly RouteDefinition[];
  readonly routeRegistry: RouteRegistry;
  readonly composition?: ArchitectureCompositionPorts;
}

export interface ArchitectureToolModuleRegistration {
  readonly toolId: ToolId;
  readonly module: ToolModule;
}

export interface ArchitectureComposedPageModel {
  readonly kind: 'home' | 'blog-index' | RouteTarget['kind'];
  readonly locale: Locale;
  readonly route: RouteRecord | null;
  readonly seo: SeoPageModel;
  readonly localizedRouteCluster: LocalizedRouteCluster;
}

export interface ArchitectureCompositionPorts {
  readonly composeRoute: (
    record: RouteRecord,
  ) => Promise<ArchitectureComposedPageModel>;
  readonly composeHome: (locale: Locale) => Promise<ArchitectureComposedPageModel>;
  readonly composeBlogIndex: (locale: Locale) => Promise<ArchitectureComposedPageModel>;
}

export function createArchitectureValidationContext(
  input: ArchitectureValidationContext,
): ArchitectureValidationContext {
  return Object.freeze({
    ...input,
    routeDefinitions: Object.freeze([...input.routeDefinitions]),
  });
}
