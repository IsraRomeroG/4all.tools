import type { ToolId } from '@/domain/shared/ids';
import type { ToolDefinition } from '@/domain/tools';

export {
  DuplicateToolDefinitionError,
  ToolTaxonomyMismatchError,
  UnknownToolDefinitionError,
  createToolRegistry,
  type CreateToolRegistryOptions,
  type ToolDefinitionRegistry,
} from './definition-registry';
import { UnknownToolDefinitionError } from './definition-registry';
import {
  TOOL_MODULES,
  findToolModule,
  getAllToolModules,
  type RegisteredToolId,
} from './module-registry';

export type { RegisteredToolId };

export const TOOL_DEFINITIONS = Object.freeze(
  Object.fromEntries(
    Object.entries(TOOL_MODULES).map(([toolId, module]) => [
      toolId,
      module.definition,
    ]),
  ) as Record<ToolId, ToolDefinition>,
);
const ALL_TOOL_DEFINITIONS = Object.freeze(
  getAllToolModules().map((module) => module.definition),
);

export function findToolDefinition(toolId: ToolId): ToolDefinition | null {
  return findToolModule(toolId)?.definition ?? null;
}

export function getToolDefinition(toolId: ToolId): ToolDefinition {
  const module = findToolModule(toolId);

  if (!module) {
    throw new UnknownToolDefinitionError(toolId);
  }

  return module.definition;
}

export function getAllToolDefinitions(): readonly ToolDefinition[] {
  return ALL_TOOL_DEFINITIONS;
}
