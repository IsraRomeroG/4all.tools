import {
  requirePublishedBlogCategoryContent,
  listPublishedArticleContent,
  type ArticleContentEntry,
  type BlogCategoryContentEntry,
} from '@/content/queries';
import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import type { BlogCategoryId } from '@/domain/shared/ids';
import type { TaxonomyTree } from '@/domain/taxonomy/shared/types';
import { getGlobalMessages } from '@/i18n/messages/registry';
import type { GlobalMessages } from '@/i18n/messages/types';
import type { Locale } from '@/i18n/types';
import { buildBlogCategoryBreadcrumbs } from '@/navigation/breadcrumbs';
import { buildLanguageSwitcherModel } from '@/navigation/language-switcher';
import type { RouteRegistry } from '@/routing/registry';
import type { SeoIndexabilityResolver } from '@/seo';
import type { BlogCategoryPageModel } from '@/templates/models/blog';

import {
  MissingCanonicalRouteError,
  MissingTaxonomyNodeError,
  wrapCompositionCause,
} from '../errors';
import { renderContentEntry, type RenderContent } from '../rendered-content';
import { composeRouteSeoPageModel } from '../seo';
import {
  createArticleSummary,
  createBlogCategorySummary,
  filterArticlesForBlogCategory,
  sortBlogCategories,
} from './catalog';

export interface BlogCategoryPageComposerDependencies {
  readonly routeRegistry: Pick<RouteRegistry, 'getCanonical' | 'getByTarget'>;
  readonly blogTaxonomy?: Pick<
    TaxonomyTree<BlogCategoryId>,
    'findNode' | 'getPathFromRoot' | 'getChildren' | 'getDescendants'
  >;
  readonly requirePublishedBlogCategoryContent?: (
    categoryId: BlogCategoryId,
    locale: Locale,
  ) => Promise<BlogCategoryContentEntry>;
  readonly listPublishedArticleContent?: (
    locale: Locale,
  ) => Promise<readonly ArticleContentEntry[]>;
  readonly renderContent?: RenderContent;
  readonly getGlobalMessages?: (locale: Locale) => GlobalMessages;
  readonly seoIndexabilityResolver?: SeoIndexabilityResolver;
}

export async function composeBlogCategoryPageModel(
  locale: Locale,
  categoryId: BlogCategoryId,
  dependencies: BlogCategoryPageComposerDependencies,
): Promise<BlogCategoryPageModel> {
  const context = { locale, targetKind: 'blog-category', entityId: categoryId } as const;
  const taxonomy = dependencies.blogTaxonomy ?? blogTaxonomy;
  const categoryNode = taxonomy.findNode(categoryId);

  if (categoryNode === undefined) {
    throw new MissingTaxonomyNodeError(context);
  }

  const route = dependencies.routeRegistry.getCanonical(locale, {
    kind: 'blog-category',
    categoryId,
  });

  if (route === null) {
    throw new MissingCanonicalRouteError(context);
  }

  const contentQuery =
    dependencies.requirePublishedBlogCategoryContent ??
    requirePublishedBlogCategoryContent;
  const contentEntry = await wrapBlogCategoryCause(
    context,
    () => contentQuery(categoryId, locale),
    'Failed to load published blog category content.',
  );
  const renderContent = dependencies.renderContent ?? renderContentEntry;
  const editorial = await wrapBlogCategoryCause(
    context,
    () => renderContent(contentEntry),
    'Failed to render blog category editorial content.',
  );
  const articles = await (
    dependencies.listPublishedArticleContent ?? listPublishedArticleContent
  )(locale);
  const categoryArticles = filterArticlesForBlogCategory({
    categoryId,
    articles,
    blogTaxonomy: taxonomy,
    locale,
  });
  const articleSummaries = categoryArticles
    .map((entry) =>
      createArticleSummary(entry, locale, {
        routeRegistry: dependencies.routeRegistry,
        blogTaxonomy: taxonomy,
      }),
    )
    .filter((summary): summary is NonNullable<typeof summary> => summary !== null);
  const childCategories = sortBlogCategories(taxonomy.getChildren(categoryId))
    .map((node) =>
      createBlogCategorySummary(node, locale, dependencies.routeRegistry),
    )
    .filter((summary): summary is NonNullable<typeof summary> => summary !== null);
  const seoComposition = await composeRouteSeoPageModel(
    { route, seo: contentEntry.data.seo },
    {
      routeRegistry: dependencies.routeRegistry,
      ...(dependencies.seoIndexabilityResolver === undefined
        ? {}
        : { indexabilityResolver: dependencies.seoIndexabilityResolver }),
    },
  );
  const messages = (dependencies.getGlobalMessages ?? getGlobalMessages)(locale);

  return Object.freeze({
    kind: 'blog-category',
    locale,
    route,
    categoryId,
    seo: seoComposition.seo,
    localizedRouteCluster: seoComposition.localizedRouteCluster,
    languageSwitcher: buildLanguageSwitcherModel({
      cluster: seoComposition.localizedRouteCluster,
      messages: messages.language,
    }),
    breadcrumbs: buildBlogCategoryBreadcrumbs({
      locale,
      categoryId,
      currentTitle: contentEntry.data.title,
      taxonomy,
      routeRegistry: dependencies.routeRegistry,
      messages: messages.navigation,
      blogLabel: messages.blog.label,
    }),
    messages,
    content: {
      title: contentEntry.data.title,
      description: contentEntry.data.description,
      editorial,
    },
    articles: Object.freeze(articleSummaries),
    childCategories: Object.freeze(childCategories),
  });
}

async function wrapBlogCategoryCause<T>(
  context: { readonly locale: Locale; readonly targetKind: 'blog-category'; readonly entityId: BlogCategoryId },
  action: () => Promise<T>,
  message: string,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw wrapCompositionCause(message, context, error);
  }
}
