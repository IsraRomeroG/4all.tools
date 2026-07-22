import type { ArticleId } from '@/domain/shared/ids';
import type {
  ArticleRouteDefinition,
  LocalizedRouteLeaf,
  RouteDefinition,
} from '@/routing/definitions';
import { RoutingInvariantError } from '@/routing/errors';

export const ARTICLE_ROUTE_DEFINITIONS = Object.freeze([
  Object.freeze({
    articleId: 'what-is-json',
    primaryCategoryId: 'json-guides',
    strategy: 'hierarchical',
    localized: Object.freeze({
      en: Object.freeze({ slug: 'what-is-json' }),
      es: Object.freeze({ slug: 'que-es-json' }),
      pt: Object.freeze({ slug: 'o-que-e-json' }),
      fr: Object.freeze({ slug: 'qu-est-ce-que-json' }),
    }),
    status: 'published',
  }),
] as const satisfies readonly ArticleRouteDefinition[]);

export interface ArticleRouteDefinitionIndex {
  get(articleId: ArticleId): ArticleRouteDefinition | null;
}

export function createArticleRouteDefinitionIndex(
  definitions: readonly ArticleRouteDefinition[],
): ArticleRouteDefinitionIndex {
  const definitionsById = new Map<ArticleId, ArticleRouteDefinition>();

  for (const definition of definitions) {
    if (definitionsById.has(definition.articleId)) {
      throw new RoutingInvariantError(
        'DUPLICATE_ROUTE_DEFINITION',
        `Duplicate article route definition for ${definition.articleId}.`,
        {
          articleId: definition.articleId,
        },
      );
    }

    definitionsById.set(definition.articleId, definition);
  }

  return Object.freeze({
    get: (articleId: ArticleId) => definitionsById.get(articleId) ?? null,
  });
}

const articleRouteDefinitionIndex = createArticleRouteDefinitionIndex(
  ARTICLE_ROUTE_DEFINITIONS,
);

export function getArticleRouteDefinition(
  articleId: ArticleId,
): ArticleRouteDefinition | null {
  return articleRouteDefinitionIndex.get(articleId);
}

export function freezeArticleRouteDefinition(
  definition: ArticleRouteDefinition,
): ArticleRouteDefinition {
  return Object.freeze({
    ...definition,
    localized: Object.freeze(
      Object.fromEntries(
        Object.entries(definition.localized).map(([locale, leaf]) => [
          locale,
          Object.freeze({ ...(leaf as LocalizedRouteLeaf) }),
        ]),
      ) as ArticleRouteDefinition['localized'],
    ),
  });
}

export function toArticleRouteDefinitionRoute(
  definition: ArticleRouteDefinition,
): Extract<RouteDefinition, { readonly kind: 'article' }> {
  return Object.freeze({
    kind: 'article',
    definition: freezeArticleRouteDefinition(definition),
  });
}
