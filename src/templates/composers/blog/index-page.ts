import { BLOG_INDEX_CONTENT } from '@/content/site/blog-index';
import {
  listPublishedArticleContent,
  type ArticleContentEntry,
} from '@/content/queries';
import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import type { BlogCategoryId } from '@/domain/shared/ids';
import type { TaxonomyTree } from '@/domain/taxonomy/shared/types';
import { getGlobalMessages } from '@/i18n/messages/registry';
import type { GlobalMessages } from '@/i18n/messages/types';
import type { Locale } from '@/i18n/types';
import { buildBlogIndexBreadcrumbs } from '@/navigation/breadcrumbs';
import { buildLanguageSwitcherModel } from '@/navigation/language-switcher';
import type { RouteRegistry } from '@/routing/registry';
import type { SeoIndexabilityResolver } from '@/seo';
import { composeSeoPageModel } from '@/seo';
import type { BlogIndexPageModel } from '@/templates/models/blog';

import {
  createArticleSummary,
  createBlogCategorySummary,
  sortBlogCategories,
} from './catalog';

export interface BlogIndexPageComposerDependencies {
  readonly routeRegistry: Pick<RouteRegistry, 'getCanonical' | 'getByTarget'>;
  readonly blogTaxonomy?: Pick<
    TaxonomyTree<BlogCategoryId>,
    'getRoots' | 'findNode'
  >;
  readonly listPublishedArticleContent?: (
    locale: Locale,
  ) => Promise<readonly ArticleContentEntry[]>;
  readonly getGlobalMessages?: (locale: Locale) => GlobalMessages;
  readonly seoIndexabilityResolver?: SeoIndexabilityResolver;
}

export async function composeBlogIndexPageModel(
  locale: Locale,
  dependencies: BlogIndexPageComposerDependencies,
): Promise<BlogIndexPageModel> {
  const content = BLOG_INDEX_CONTENT[locale];
  const messages = (dependencies.getGlobalMessages ?? getGlobalMessages)(locale);
  const taxonomy = dependencies.blogTaxonomy ?? blogTaxonomy;
  const articles = await (
    dependencies.listPublishedArticleContent ?? listPublishedArticleContent
  )(locale);
  const articleSummaries = articles
    .map((entry) =>
      createArticleSummary(entry, locale, {
        routeRegistry: dependencies.routeRegistry,
        blogTaxonomy: taxonomy,
      }),
    )
    .filter((summary): summary is NonNullable<typeof summary> => summary !== null);
  const categories = sortBlogCategories(taxonomy.getRoots())
    .map((node) =>
      createBlogCategorySummary(node, locale, dependencies.routeRegistry),
    )
    .filter((summary): summary is NonNullable<typeof summary> => summary !== null);
  const seoComposition = await composeSeoPageModel(
    {
      subject: { kind: 'blog-index' },
      locale,
      title: content.title,
      description: content.description,
      noindex: false,
      openGraphType: 'website',
    },
    dependencies.seoIndexabilityResolver === undefined
      ? {}
      : { indexabilityResolver: dependencies.seoIndexabilityResolver },
  );

  return Object.freeze({
    kind: 'blog-index',
    locale,
    route: null,
    seo: seoComposition.seo,
    localizedRouteCluster: seoComposition.localizedRouteCluster,
    languageSwitcher: buildLanguageSwitcherModel({
      cluster: seoComposition.localizedRouteCluster,
      messages: messages.language,
    }),
    breadcrumbs: buildBlogIndexBreadcrumbs({
      locale,
      messages: messages.navigation,
      blogLabel: messages.blog.label,
    }),
    messages,
    title: content.title,
    description: content.description,
    articles: Object.freeze(articleSummaries),
    categories: Object.freeze(categories),
  });
}
