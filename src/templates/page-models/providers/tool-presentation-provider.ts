import type { ToolId } from '@/domain/shared/ids';
import { findToolDefinition } from '@/features/tools/registry';
import type { ToolPresentationDefinition } from '@/templates/models/tool';

export const toolPresentationProvider = {
  getToolPresentation,
};

export function getToolPresentation(
  toolId: ToolId,
): ToolPresentationDefinition | null {
  const definition = findToolDefinition(toolId);

  if (!definition) {
    return null;
  }

  return {
    toolId: definition.id,
    primaryCategoryId: definition.taxonomy.primaryCategoryId,
    executionType: definition.execution.type,
  };
}
