import type {
  RouteDefinition,
  RouteDefinitionProvider,
  ToolCategoryRouteDefinition,
} from '@/routing/definitions';

export const TOOL_CATEGORY_ROUTE_DEFINITIONS = Object.freeze([
  Object.freeze({
    categoryId: 'developer',
    strategy: 'root',
    status: 'published',
  }),
] satisfies readonly ToolCategoryRouteDefinition[]);

export function createToolCategoryRouteProvider(
  getDefinitions: () => readonly ToolCategoryRouteDefinition[] = () =>
    TOOL_CATEGORY_ROUTE_DEFINITIONS,
): RouteDefinitionProvider {
  return {
    sourceId: 'tool-category-route-registry',
    description: 'Explicit production tool-category routes.',
    getRouteDefinitions: () =>
      Object.freeze(
        getDefinitions().map((definition) =>
          Object.freeze({
            kind: 'tool-category',
            definition,
          } satisfies Extract<RouteDefinition, { readonly kind: 'tool-category' }>),
        ),
      ),
  };
}

export const toolCategoryRouteProvider = createToolCategoryRouteProvider();
