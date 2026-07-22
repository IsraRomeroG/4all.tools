import {
  getAllToolDefinitions,
  getToolDefinition,
  findToolDefinition,
  TOOL_DEFINITIONS,
} from '@/features/tools/registry';
import {
  getAllToolModules,
  type ToolModule,
} from '@/features/tools/module-registry';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { getDeliveryRouteRegistry } from '@/templates/composers';
import {
  articleRouteProvider,
  blogCategoryRouteProvider,
  toolCategoryRouteProvider,
  toolRouteProvider,
} from '@/routing/providers';
import type { RouteDefinition } from '@/routing/definitions';
import type { ToolId } from '@/domain/shared/ids';

import {
  getContentSourceSnapshot,
} from '@/content/queries/indexed-content-source';
import { validateContentRelations } from './validators/relations';
import {
  validateContentIdentities,
  validateTaxonomyReferences,
  validateToolRegistryIntegrity,
} from './validators/identity';
import { validatePublicationAndSeo } from './validators/publication';
import { validateSourceBoundaries } from './validators/source-boundaries';
import { scanSourceGraph } from './source-graph/scan-source-files';
import type { SourceGraph } from './source-graph/types';
import { assertArchitectureValid, createArchitectureValidationReport } from './report';
import type {
  ArchitectureValidationContext,
} from './context';
import type { ArchitectureValidationReport } from './types';

export const TOOL_MODULE_SOURCE_DIRECTORIES: Readonly<Record<ToolId, string>> = Object.freeze({
  'json-validator': 'developer/json-validator',
});

export async function createProductionArchitectureContext(): Promise<ArchitectureValidationContext> {
  const content = await getContentSourceSnapshot();
  const routeDefinitions = await collectProductionRouteDefinitions();
  const modules = getAllToolModules();
  const toolModuleRegistrations = Object.freeze(
    modules.map((module) => ({
      toolId: module.definition.id,
      module,
    })),
  );

  return Object.freeze({
    content,
    toolDefinitions: {
      definitions: TOOL_DEFINITIONS,
      findToolDefinition,
      getToolDefinition,
      getAllToolDefinitions,
    },
    toolModules: createToolModulePort(modules),
    toolModuleRegistrations,
    toolModuleSourceDirectories: TOOL_MODULE_SOURCE_DIRECTORIES,
    toolTaxonomy,
    blogTaxonomy,
    routeDefinitions,
    routeRegistry: await getDeliveryRouteRegistry(),
  });
}

export async function validateArchitecture(input: {
  readonly context?: ArchitectureValidationContext;
  readonly sourceGraph?: SourceGraph;
} = {}): Promise<ArchitectureValidationReport> {
  const context = input.context ?? (await createProductionArchitectureContext());
  const sourceGraph = input.sourceGraph ?? (await scanSourceGraph());
  const contentEntries = Object.values(context.content.all).reduce(
    (total, entries) => total + entries.length,
    0,
  );
  const issues = [
    ...validateContentIdentities(context),
    ...validateTaxonomyReferences(context),
    ...validateToolRegistryIntegrity(context),
    ...validateContentRelations(context),
    ...(await validatePublicationAndSeo(context)),
    ...validateSourceBoundaries(sourceGraph),
  ];

  return createArchitectureValidationReport(issues, {
    contentEntries,
    toolDefinitions: context.toolDefinitions.getAllToolDefinitions().length,
    toolModules: context.toolModules.getAllToolModules().length,
    routeDefinitions: context.routeDefinitions.length,
    routeRecords: context.routeRegistry.getAll().length,
    pageModels: context.routeRegistry.getAll().length + 8,
    sourceFiles: sourceGraph.files.length,
  });
}

export async function validateProductionArchitecture(): Promise<ArchitectureValidationReport> {
  return validateArchitecture();
}

export async function assertProductionArchitectureValid(): Promise<ArchitectureValidationReport> {
  const report = await validateProductionArchitecture();

  assertArchitectureValid(report);

  return report;
}

async function collectProductionRouteDefinitions(): Promise<readonly RouteDefinition[]> {
  const providers = [
    toolRouteProvider,
    toolCategoryRouteProvider,
    articleRouteProvider,
    blogCategoryRouteProvider,
  ];
  const definitions = (await Promise.all(
    providers.map((provider) => provider.getRouteDefinitions()),
  )).flat();

  return Object.freeze(
    [...definitions].sort((first, second) =>
      `${first.kind}:${routeDefinitionId(first)}`.localeCompare(
        `${second.kind}:${routeDefinitionId(second)}`,
      ),
    ),
  );
}

function createToolModulePort(modules: readonly ToolModule[]) {
  const modulesById = new Map(modules.map((module) => [module.definition.id, module]));

  return Object.freeze({
    modules: Object.freeze(
      Object.fromEntries(modules.map((module) => [module.definition.id, module])),
    ),
    findToolModule: (toolId: ToolId) => modulesById.get(toolId) ?? null,
    getToolModule: (toolId: ToolId) => modulesById.get(toolId)!,
    getAllToolModules: () => modules,
  });
}

function routeDefinitionId(definition: RouteDefinition): string {
  switch (definition.kind) {
    case 'tool':
      return definition.definition.toolId;
    case 'tool-category':
    case 'blog-category':
      return definition.definition.categoryId;
    case 'article':
      return definition.definition.articleId;
  }
}
