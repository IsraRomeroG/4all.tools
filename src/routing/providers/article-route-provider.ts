import {
  listPublishedArticleContent,
  type ArticleContentEntry,
} from '@/content/queries';
import { SUPPORTED_LOCALES, type Locale } from '@/i18n/types';
import { getArticleRouteDefinition } from '@/routing/definitions/blog';
import type { ArticleRouteDefinition, RouteDefinition } from '@/routing/definitions';
import type { RouteDefinitionProvider } from '@/routing/definitions/providers';

export function createArticleRouteProvider(
  listArticles: (locale: Locale) =>
    Promise<readonly ArticleContentEntry[]> = listPublishedArticleContent,
): RouteDefinitionProvider {
  return {
    sourceId: 'article-content',
    description: 'Published localized article content route adapter.',
    getRouteDefinitions: async () =>
      Object.freeze(
        (
          await Promise.all(SUPPORTED_LOCALES.map((locale) => listArticles(locale)))
        )
          .flat()
          .map(toArticleRouteDefinitionRoute),
      ),
  };
}

export const articleRouteProvider = createArticleRouteProvider();

// Temporary composer compatibility until T03 removes the explicit definition lookup.
export { getArticleRouteDefinition };

function toArticleRouteDefinitionRoute(
  entry: ArticleContentEntry,
): Extract<RouteDefinition, { readonly kind: 'article' }> {
  const localized: ArticleRouteDefinition['localized'] = {
    [entry.data.locale]: { slug: entry.data.routeSlug },
  };

  return Object.freeze({
    kind: 'article',
    definition: Object.freeze({
      articleId: entry.data.articleId,
      primaryCategoryId: entry.data.primaryCategoryId,
      strategy: 'hierarchical',
      localized: Object.freeze(localized),
      status: entry.data.status,
      sourceId: entry.id,
    }),
  });
}
