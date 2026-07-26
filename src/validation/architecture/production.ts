import {
  toolRegistry,
} from '@/features/tools/registry';
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

import {
  getContentSourceSnapshot,
} from '@/content/queries/indexed-content-source';
import { validateContentRelations } from './validators/relations';
import {
  validateContentIdentities,
  validateTaxonomyReferences,
  validateToolRegistryIntegrity,
} from './validators/identity';
import { validateRouteIntegrity } from './validators/publication';
import { validateSourceBoundaries } from './validators/source-boundaries';
import { assertArchitectureValid, createArchitectureValidationReport } from './report';
import type {
  ArchitectureValidationContext,
} from './context';
import type { ArchitectureValidationReport } from './types';

export async function createProductionArchitectureContext(): Promise<ArchitectureValidationContext> {
  const content = await getContentSourceSnapshot();
  const routeDefinitions = await collectProductionRouteDefinitions();

  return Object.freeze({
    content,
    toolRegistry,
    toolTaxonomy,
    blogTaxonomy,
    routeDefinitions,
    routeRegistry: await getDeliveryRouteRegistry(),
  });
}

export async function validateArchitecture(input: {
  readonly context?: ArchitectureValidationContext;
} = {}): Promise<ArchitectureValidationReport> {
  const context = input.context ?? (await createProductionArchitectureContext());
  const contentEntries = Object.values(context.content.all).reduce(
    (total, entries) => total + entries.length,
    0,
  );
  const issues = [
    ...validateContentIdentities(context),
    ...validateTaxonomyReferences(context),
    ...validateToolRegistryIntegrity(context),
    ...validateContentRelations(context),
    ...validateRouteIntegrity(context),
    ...validateSourceBoundaries(),
  ];

  return createArchitectureValidationReport(issues, {
    contentEntries,
    toolDefinitions: context.toolRegistry.getAll().length,
    toolModules: context.toolRegistry.getAll().length,
    routeDefinitions: context.routeDefinitions.length,
    routeRecords: context.routeRegistry.getAll().length,
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
