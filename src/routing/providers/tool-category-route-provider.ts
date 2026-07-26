import {
  listPublishedToolCategoryContent,
  type ToolCategoryContentEntry,
} from '@/content/queries';
import { SUPPORTED_LOCALES, type Locale } from '@/i18n/types';
import type {
  RouteDefinition,
  ToolCategoryRouteDefinition,
} from '@/routing/definitions';
import type { RouteDefinitionProvider } from '@/routing/definitions/providers';

export function createToolCategoryRouteProvider(
  listCategories: (locale: Locale) =>
    Promise<readonly ToolCategoryContentEntry[]> =
    listPublishedToolCategoryContent,
): RouteDefinitionProvider {
  return {
    sourceId: 'tool-category-content',
    description: 'Published localized tool-category content route adapter.',
    getRouteDefinitions: async () =>
      Object.freeze(
        (
          await Promise.all(
            SUPPORTED_LOCALES.map((locale) => listCategories(locale)),
          )
        )
          .flat()
          .map(toToolCategoryRouteDefinition),
      ),
  };
}

export const toolCategoryRouteProvider = createToolCategoryRouteProvider();

function toToolCategoryRouteDefinition(
  entry: ToolCategoryContentEntry,
): Extract<RouteDefinition, { readonly kind: 'tool-category' }> {
  const definition: ToolCategoryRouteDefinition = {
    categoryId: entry.data.categoryId,
    strategy: 'hierarchical',
    status: entry.data.status,
    locale: entry.data.locale,
    sourceId: entry.id,
  };

  return Object.freeze({
    kind: 'tool-category',
    definition: Object.freeze(definition),
  });
}
