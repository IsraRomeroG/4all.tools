import {
  listPublishedToolContent,
  type ToolContentEntry,
} from '@/content/queries';
import type { ToolDefinition } from '@/domain/tools';
import { toolRegistry, type ToolRegistry } from '@/features/tools/registry';
import type { Locale } from '@/i18n/types';
import type {
  RouteDefinition,
  ToolRouteDefinition,
} from '@/routing/definitions';
import type { RouteDefinitionProvider } from '@/routing/definitions/providers';
import type { RouteStrategy } from '@/routing/types';
import { assertNever } from '@/routing/types';

export function createToolRouteProvider(
  listTools: (locale: Locale) => Promise<readonly ToolContentEntry[]> =
    listPublishedToolContent,
  registry: ToolRegistry = toolRegistry,
): RouteDefinitionProvider {
  return {
    sourceId: 'tool-content',
    description: 'Published localized tool content adapted from ToolRegistry.',
    getRouteDefinitions: async () =>
      Object.freeze(
        (
          await Promise.all(
            (['en', 'es', 'pt', 'fr'] as const).map((locale) =>
              listTools(locale),
            ),
          )
        )
          .flat()
          .flatMap((entry) => {
            const module = registry.find(entry.data.toolId);

            if (module === null || module.definition.status !== 'published') {
              return [];
            }

            return [
              Object.freeze({
                kind: 'tool',
                definition: Object.freeze({
                  ...toToolRouteDefinition(module.definition),
                  locale: entry.data.locale,
                  sourceId: entry.id,
                }),
              }) satisfies Extract<RouteDefinition, { readonly kind: 'tool' }>,
            ];
          }),
      ),
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

function toRouteStrategy(strategy: ToolDefinition['route']['strategy']): RouteStrategy {
  switch (strategy) {
    case 'flat':
      return 'flat';

    case 'hierarchical':
      return 'hierarchical';

    default:
      return assertNever(strategy);
  }
}
