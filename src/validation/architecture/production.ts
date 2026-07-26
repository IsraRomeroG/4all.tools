import { toolRegistry } from '@/features/tools/registry';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { getDeliveryRouteRegistry } from '@/templates/composers';
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

  return Object.freeze({
    content,
    toolRegistry,
    toolTaxonomy,
    blogTaxonomy,
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
