import { BLOG_INDEX_CONTENT } from '@/content/site/blog-index';
import {
  listPublishedArticleContent,
} from '@/content/queries';
import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { getGlobalMessages } from '@/i18n/messages/registry';
import type { Locale } from '@/i18n/types';
import { buildBlogIndexBreadcrumbs } from '@/navigation/breadcrumbs';
import { buildLanguageSwitcherModel } from '@/navigation/language-switcher';
import type { RouteRegistry } from '@/routing/registry';
import { composeSeoPageModel } from '@/seo';
import type { BlogIndexPageModel } from '@/templates/models/blog';

import {
  createArticleSummary,
  createBlogCategorySummary,
  sortBlogCategories,
} from './catalog';

export interface BlogIndexPageComposerDependencies {
  readonly routeRegistry: Pick<RouteRegistry, 'getCanonical' | 'getByTarget'>;
}

export async function composeBlogIndexPageModel(
  locale: Locale,
  dependencies: BlogIndexPageComposerDependencies,
): Promise<BlogIndexPageModel> {
  const content = BLOG_INDEX_CONTENT[locale];
  const messages = getGlobalMessages(locale);
  const taxonomy = blogTaxonomy;
  const articles = await listPublishedArticleContent(locale);
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
  );

  return {
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
    articles: articleSummaries,
    categories,
  };
}
