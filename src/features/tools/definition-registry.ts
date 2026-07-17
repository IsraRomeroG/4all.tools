import { assertStableEntityId } from '@/domain/shared/ids';
import type { ToolCategoryId, ToolId } from '@/domain/shared/ids';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import type { TaxonomyTree } from '@/domain/taxonomy/shared/types';
import type { ToolDefinition } from '@/domain/tools';

export class UnknownToolDefinitionError extends Error {
  readonly toolId: ToolId;

  constructor(toolId: ToolId) {
    super(`Unknown tool definition ${JSON.stringify(toolId)}.`);
    this.name = 'UnknownToolDefinitionError';
    this.toolId = toolId;
  }
}

export class DuplicateToolDefinitionError extends Error {
  readonly toolId: ToolId;

  constructor(toolId: ToolId) {
    super(`Duplicate tool definition for stable ID ${JSON.stringify(toolId)}.`);
    this.name = 'DuplicateToolDefinitionError';
    this.toolId = toolId;
  }
}

export class ToolTaxonomyMismatchError extends Error {
  readonly toolId: ToolId;
  readonly rootCategoryId: ToolCategoryId;
  readonly primaryCategoryId: ToolCategoryId;
  readonly actualRootCategoryId: ToolCategoryId;

  constructor(params: {
    readonly toolId: ToolId;
    readonly rootCategoryId: ToolCategoryId;
    readonly primaryCategoryId: ToolCategoryId;
    readonly actualRootCategoryId: ToolCategoryId;
  }) {
    super(
      `Tool ${JSON.stringify(params.toolId)} declares root category ` +
        `${JSON.stringify(params.rootCategoryId)}, but primary category ` +
        `${JSON.stringify(params.primaryCategoryId)} belongs to root ` +
        `${JSON.stringify(params.actualRootCategoryId)}.`,
    );
    this.name = 'ToolTaxonomyMismatchError';
    this.toolId = params.toolId;
    this.rootCategoryId = params.rootCategoryId;
    this.primaryCategoryId = params.primaryCategoryId;
    this.actualRootCategoryId = params.actualRootCategoryId;
  }
}

export interface ToolDefinitionRegistry {
  readonly definitions: Readonly<Record<ToolId, ToolDefinition>>;
  findToolDefinition(toolId: ToolId): ToolDefinition | null;
  getToolDefinition(toolId: ToolId): ToolDefinition;
  getAllToolDefinitions(): readonly ToolDefinition[];
}

export interface CreateToolRegistryOptions {
  readonly taxonomy?: TaxonomyTree<ToolCategoryId>;
}

export function createToolRegistry(
  definitions: readonly ToolDefinition[],
  options: CreateToolRegistryOptions = {},
): ToolDefinitionRegistry {
  const taxonomy = options.taxonomy ?? toolTaxonomy;
  const definitionsById = new Map<ToolId, ToolDefinition>();

  for (const definition of definitions) {
    validateToolDefinition(definition, taxonomy);

    if (definitionsById.has(definition.id)) {
      throw new DuplicateToolDefinitionError(definition.id);
    }

    definitionsById.set(definition.id, definition);
  }

  const orderedDefinitions = Object.freeze(
    [...definitionsById.values()].sort(compareToolDefinitions),
  );
  const definitionRecord = Object.freeze(
    Object.fromEntries(
      orderedDefinitions.map((definition) => [definition.id, definition]),
    ) as Record<ToolId, ToolDefinition>,
  );

  return Object.freeze({
    definitions: definitionRecord,
    findToolDefinition: (toolId: ToolId) =>
      definitionsById.get(toolId) ?? null,
    getToolDefinition: (toolId: ToolId) => {
      const definition = definitionsById.get(toolId);

      if (!definition) {
        throw new UnknownToolDefinitionError(toolId);
      }

      return definition;
    },
    getAllToolDefinitions: () => orderedDefinitions,
  });
}

function validateToolDefinition(
  definition: ToolDefinition,
  taxonomy: TaxonomyTree<ToolCategoryId>,
): void {
  assertStableEntityId(definition.id);
  assertStableEntityId(definition.rootCategoryId);
  assertStableEntityId(definition.taxonomy.primaryCategoryId);

  const actualRootCategoryId = taxonomy.getRoot(
    definition.taxonomy.primaryCategoryId,
  ).id;

  if (actualRootCategoryId !== definition.rootCategoryId) {
    throw new ToolTaxonomyMismatchError({
      toolId: definition.id,
      rootCategoryId: definition.rootCategoryId,
      primaryCategoryId: definition.taxonomy.primaryCategoryId,
      actualRootCategoryId,
    });
  }
}

function compareToolDefinitions(
  first: ToolDefinition,
  second: ToolDefinition,
): number {
  return first.id < second.id ? -1 : first.id > second.id ? 1 : 0;
}
