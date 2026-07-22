import type { ArticleRouteDefinition } from '@/routing/definitions';
import {
  ARTICLE_ROUTE_DEFINITIONS,
  createArticleRouteDefinitionIndex,
  freezeArticleRouteDefinition,
  getArticleRouteDefinition,
  toArticleRouteDefinitionRoute,
  type ArticleRouteDefinitionIndex,
} from '@/routing/definitions/blog';
import type { RouteDefinitionProvider } from '@/routing/definitions/providers';

export function createArticleRouteProvider(
  getDefinitions: () => readonly ArticleRouteDefinition[] = () =>
    ARTICLE_ROUTE_DEFINITIONS,
): RouteDefinitionProvider {
  return {
    sourceId: 'article-route-definitions',
    description: 'Explicit production article route definitions.',
    getRouteDefinitions: () => {
      const definitions = getDefinitions().map(freezeArticleRouteDefinition);

      // Constructing the index is intentionally part of provider evaluation so
      // duplicate IDs fail before the generic route registry can index records.
      createArticleRouteDefinitionIndex(definitions);

      return Object.freeze(definitions.map(toArticleRouteDefinitionRoute));
    },
  };
}

export const articleRouteProvider = createArticleRouteProvider();

export { getArticleRouteDefinition };

export function createArticleRouteDefinitionLookup(
  definitions: readonly ArticleRouteDefinition[] = ARTICLE_ROUTE_DEFINITIONS,
): ArticleRouteDefinitionIndex {
  return createArticleRouteDefinitionIndex(
    definitions.map(freezeArticleRouteDefinition),
  );
}
