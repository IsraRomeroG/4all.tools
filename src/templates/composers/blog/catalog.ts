import type { CollectionEntry } from 'astro:content';

import type { BlogCategoryId } from '@/domain/shared/ids';
import type { TaxonomyNode, TaxonomyTree } from '@/domain/taxonomy/shared/types';
import type { Locale } from '@/i18n/types';
import { buildLocalizedPath } from '@/routing/builders';
import type { RouteRegistry } from '@/routing/registry';
import { getRouteTargetKey } from '@/routing/types';
import type {
  ArticleSummaryModel,
  BlogCategorySummaryModel,
} from '@/templates/models/blog';
import { UnknownBlogCategoryReferenceError } from '../errors';
import { formatArticleDate } from './dates';

export type BlogArticleEntry = CollectionEntry<'blog'>;

export function createArticleSummary(
  entry: BlogArticleEntry,
  locale: Locale,
  dependencies: {
    readonly routeRegistry: Pick<RouteRegistry, 'getCanonical'>;
    readonly blogTaxonomy: Pick<TaxonomyTree<BlogCategoryId>, 'findNode'>;
  },
): ArticleSummaryModel | null {
  const route = dependencies.routeRegistry.getCanonical(locale, {
    kind: 'article',
    articleId: entry.data.articleId,
  });

  if (route === null) {
    return null;
  }

  if (
    route.target.kind !== 'article' ||
    route.target.articleId !== entry.data.articleId
  ) {
    throw new Error(
      `Canonical route ${getRouteTargetKey(route.target)} does not match article ${entry.data.articleId}.`,
    );
  }

  for (const categoryId of entry.data.secondaryCategoryIds) {
    if (dependencies.blogTaxonomy.findNode(categoryId) === undefined) {
      throw new UnknownBlogCategoryReferenceError({
        categoryId,
        locale,
        articleId: entry.data.articleId,
      });
    }
  }

  const category = dependencies.blogTaxonomy.findNode(
    entry.data.primaryCategoryId,
  );

  if (category === undefined) {
    throw new UnknownBlogCategoryReferenceError({
      categoryId: entry.data.primaryCategoryId,
      locale,
      articleId: entry.data.articleId,
    });
  }

  return Object.freeze({
    articleId: entry.data.articleId,
    title: entry.data.title,
    excerpt: entry.data.excerpt,
    url: buildLocalizedPath({ locale, segments: route.segments }),
    publishedAt: formatArticleDate(entry.data.publishedAt, locale),
    primaryCategory: {
      categoryId: category.id,
      label: category.localized[locale].label,
    },
  });
}

export function createBlogCategorySummary(
  node: TaxonomyNode<BlogCategoryId>,
  locale: Locale,
  routeRegistry: Pick<RouteRegistry, 'getCanonical'>,
): BlogCategorySummaryModel | null {
  const route = routeRegistry.getCanonical(locale, {
    kind: 'blog-category',
    categoryId: node.id,
  });

  if (route === null) {
    return null;
  }

  return Object.freeze({
    categoryId: node.id,
    label: node.localized[locale].label,
    url: buildLocalizedPath({ locale, segments: route.segments }),
  });
}

export function filterArticlesForBlogCategory(input: {
  readonly categoryId: BlogCategoryId;
  readonly articles: readonly BlogArticleEntry[];
  readonly blogTaxonomy: Pick<
    TaxonomyTree<BlogCategoryId>,
    'findNode' | 'getDescendants'
  >;
  readonly locale?: Locale;
}): readonly BlogArticleEntry[] {
  const category = input.blogTaxonomy.findNode(input.categoryId);

  if (category === undefined) {
    throw new UnknownBlogCategoryReferenceError(
      input.locale === undefined
        ? { categoryId: input.categoryId }
        : { categoryId: input.categoryId, locale: input.locale },
    );
  }

  const subtree = new Set<BlogCategoryId>([
    category.id,
    ...input.blogTaxonomy
      .getDescendants(input.categoryId)
      .map((node) => node.id),
  ]);
  const seen = new Set<string>();
  const matches: BlogArticleEntry[] = [];

  for (const article of input.articles) {
    validateArticleCategories(article, input);

    const isMatch =
      subtree.has(article.data.primaryCategoryId) ||
      article.data.secondaryCategoryIds.some((id) => subtree.has(id));

    if (isMatch && !seen.has(article.data.articleId)) {
      seen.add(article.data.articleId);
      matches.push(article);
    }
  }

  return Object.freeze(matches);
}

function validateArticleCategories(
  article: BlogArticleEntry,
  input: {
    readonly blogTaxonomy: Pick<TaxonomyTree<BlogCategoryId>, 'findNode'>;
    readonly locale?: Locale;
  },
): void {
  const categoryIds = [
    article.data.primaryCategoryId,
    ...article.data.secondaryCategoryIds,
  ];

  for (const categoryId of categoryIds) {
    if (input.blogTaxonomy.findNode(categoryId) === undefined) {
      throw new UnknownBlogCategoryReferenceError(
        input.locale === undefined
          ? { categoryId, articleId: article.data.articleId }
          : {
              categoryId,
              locale: input.locale,
              articleId: article.data.articleId,
            },
      );
    }
  }
}

export function sortBlogCategories(
  categories: readonly TaxonomyNode<BlogCategoryId>[],
): readonly TaxonomyNode<BlogCategoryId>[] {
  return Object.freeze(
    [...categories].sort(
      (first, second) =>
        first.sortOrder - second.sortOrder || compareStableIds(first.id, second.id),
    ),
  );
}

function compareStableIds(first: string, second: string): number {
  return first < second ? -1 : first > second ? 1 : 0;
}
