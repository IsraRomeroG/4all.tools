import type { ToolDefinition, ToolRouteMode } from '@/domain/tools';
import {
  getAllToolDefinitions,
} from '@/features/tools/registry';
import type {
  RouteDefinitionProvider,
  ToolRouteDefinition,
} from '@/routing/definitions';
import type { RouteStrategy } from '@/routing/types';
import { assertNever } from '@/routing/types';

export function createToolRouteProvider(
  getDefinitions: () => readonly ToolDefinition[] = getAllToolDefinitions,
): RouteDefinitionProvider {
  return {
    sourceId: 'tool-registry',
    description: 'Production tool route definitions from the tool registry.',
    getRouteDefinitions: () =>
      getDefinitions()
        .filter((definition) => definition.status === 'published')
        .map((definition) => ({
          kind: 'tool',
          definition: toToolRouteDefinition(definition),
        })),
  };
}

export const toolRouteProvider = createToolRouteProvider();

export function toToolRouteDefinition(
  definition: ToolDefinition,
): ToolRouteDefinition {
  return {
    toolId: definition.id,
    rootCategoryId: definition.rootCategoryId,
    primaryCategoryId: definition.taxonomy.primaryCategoryId,
    strategy: toRouteStrategy(definition.route.strategy),
    localized: definition.route.localized,
    status: definition.status,
  };
}

function toRouteStrategy(strategy: ToolRouteMode): RouteStrategy {
  switch (strategy) {
    case 'flat':
      return 'flat';

    case 'hierarchical':
      return 'hierarchical';

    default:
      return assertNever(strategy);
  }
}
