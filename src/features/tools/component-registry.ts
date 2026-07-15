import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

import type { ToolId } from '@/domain/shared/ids';
import JsonValidatorTool from '@/features/tools/developer/json-validator/Tool.astro';
import { JSON_VALIDATOR_TOOL_ID } from '@/features/tools/developer/json-validator/types';

export type ToolComponent = AstroComponentFactory;

export class MissingToolComponentError extends Error {
  readonly toolId: ToolId;

  constructor(toolId: ToolId) {
    super(`Missing tool component for stable ID ${JSON.stringify(toolId)}.`);
    this.name = 'MissingToolComponentError';
    this.toolId = toolId;
  }
}

export const TOOL_COMPONENTS = {
  [JSON_VALIDATOR_TOOL_ID]: JsonValidatorTool,
} as const satisfies Readonly<Record<ToolId, ToolComponent>>;

const TOOL_COMPONENT_LOOKUP: Readonly<Record<ToolId, ToolComponent>> =
  TOOL_COMPONENTS;

export function hasToolComponent(toolId: ToolId): boolean {
  return Object.hasOwn(TOOL_COMPONENT_LOOKUP, toolId);
}

export function getToolComponent(toolId: ToolId): ToolComponent {
  const component = TOOL_COMPONENT_LOOKUP[toolId];

  if (!component) {
    throw new MissingToolComponentError(toolId);
  }

  return component;
}
