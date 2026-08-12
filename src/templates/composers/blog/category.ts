import {
  requirePublishedBlogCategoryContent,
  listPublishedArticleContent,
} from '@/content/queries';
import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import type { BlogCategoryId } from '@/domain/shared/ids';
import { getGlobalMessages } from '@/i18n/messages/registry';
import type { Locale } from '@/i18n/types';
import { buildBlogCategoryBreadcrumbs } from '@/navigation/breadcrumbs';
import { buildLanguageSwitcherModel } from '@/navigation/language-switcher';
import { buildSiteFooterModelIfAvailable } from '@/navigation/site-footer';
import type { RouteRegistry } from '@/routing/registry';
import type { BlogCategoryPageModel } from '@/templates/models/blog';

import {
  MissingCanonicalRouteError,
  MissingTaxonomyNodeError,
  wrapCompositionCause,
} from '../errors';
import { renderContentEntry } from '../rendered-content';
import { composeRouteSeoPageModel } from '../seo';
import {
  createArticleSummary,
  createBlogCategorySummary,
  filterArticlesForBlogCategory,
  sortBlogCategories,
} from './catalog';

export interface BlogCategoryPageComposerDependencies {
  readonly routeRegistry: Pick<RouteRegistry, 'getCanonical' | 'getByTarget'>;
}

export async function composeBlogCategoryPageModel(
  locale: Locale,
  categoryId: BlogCategoryId,
  dependencies: BlogCategoryPageComposerDependencies,
): Promise<BlogCategoryPageModel> {
  const context = { locale, targetKind: 'blog-category', entityId: categoryId } as const;
  const taxonomy = blogTaxonomy;
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

  const contentEntry = await wrapBlogCategoryCause(
    context,
    () => requirePublishedBlogCategoryContent(categoryId, locale),
    'Failed to load published blog category content.',
  );
  const editorial = await wrapBlogCategoryCause(
    context,
    () => renderContentEntry(contentEntry),
    'Failed to render blog category editorial content.',
  );
  const articles = await listPublishedArticleContent(locale);
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
    dependencies.routeRegistry,
  );
  const messages = getGlobalMessages(locale);

  return {
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
    articles: articleSummaries,
    childCategories,
    siteFooter: buildSiteFooterModelIfAvailable({
      locale,
      routeRegistry: dependencies.routeRegistry,
      messages: messages.footer,
    }),
  };
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
