import type { ToolId } from '@/domain/shared/ids';
import {
  findToolModule,
  getToolModule,
  MissingToolModuleError,
  type RegisteredToolModule,
} from '@/features/tools/module-registry';

export type ToolComponent = RegisteredToolModule['component'];

export class MissingToolComponentError extends Error {
  readonly toolId: ToolId;

  constructor(toolId: ToolId) {
    super(`Missing tool component for stable ID ${JSON.stringify(toolId)}.`);
    this.name = 'MissingToolComponentError';
    this.toolId = toolId;
  }
}

export function hasToolComponent(toolId: ToolId): boolean {
  return findToolModule(toolId)?.component !== undefined;
}

export function getToolComponent(toolId: ToolId): ToolComponent {
  try {
    return getToolModule(toolId).component;
  } catch (error) {
    if (!(error instanceof MissingToolModuleError)) {
      throw error;
    }

    throw new MissingToolComponentError(toolId);
  }
}
