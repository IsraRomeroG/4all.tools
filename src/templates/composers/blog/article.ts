import {
  requirePublishedArticleContent,
} from '@/content/queries';
import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import type { ArticleId } from '@/domain/shared/ids';
import { getGlobalMessages } from '@/i18n/messages/registry';
import type { Locale } from '@/i18n/types';
import { buildArticleBreadcrumbs } from '@/navigation/breadcrumbs';
import { buildLanguageSwitcherModel } from '@/navigation/language-switcher';
import type { RouteRegistry } from '@/routing/registry';
import { buildLocalizedPath } from '@/routing/builders';
import { composeSeoPageModel } from '@/seo';
import type { ArticlePageModel } from '@/templates/models/blog';

import {
  MissingCanonicalRouteError,
  MissingTaxonomyNodeError,
  UnknownBlogCategoryReferenceError,
  wrapCompositionCause,
} from '../errors';
import { renderContentEntry } from '../rendered-content';
import { formatArticleDate } from './dates';

export interface ArticlePageComposerDependencies {
  readonly routeRegistry: Pick<RouteRegistry, 'getCanonical' | 'getByTarget'>;
}

export async function composeArticlePageModel(
  locale: Locale,
  articleId: ArticleId,
  dependencies: ArticlePageComposerDependencies,
): Promise<ArticlePageModel> {
  const context = { locale, targetKind: 'article', entityId: articleId } as const;
  const route = dependencies.routeRegistry.getCanonical(locale, {
    kind: 'article',
    articleId,
  });

  if (route === null) {
    throw new MissingCanonicalRouteError(context);
  }

  const contentEntry = await loadArticleContent(
    articleId,
    locale,
    context,
  );
  const taxonomy = blogTaxonomy;
  const primaryCategory = taxonomy.findNode(contentEntry.data.primaryCategoryId);

  if (primaryCategory === undefined) {
    throw new MissingTaxonomyNodeError({
      locale,
      targetKind: 'blog-category',
      entityId: contentEntry.data.primaryCategoryId,
    });
  }

  for (const categoryId of contentEntry.data.secondaryCategoryIds) {
    if (taxonomy.findNode(categoryId) === undefined) {
      throw new UnknownBlogCategoryReferenceError({
        articleId,
        categoryId,
        locale,
      });
    }
  }

  const editorial = await loadArticleEditorial(contentEntry, context);
  const publishedAt = formatArticleDate(contentEntry.data.publishedAt, locale);
  const updatedAt =
    contentEntry.data.updatedAt === undefined
      ? undefined
      : formatArticleDate(contentEntry.data.updatedAt, locale);
  const categoryRoute = dependencies.routeRegistry.getCanonical(locale, {
    kind: 'blog-category',
    categoryId: primaryCategory.id,
  });
  const primaryCategoryReference =
    categoryRoute === null
      ? {
          categoryId: primaryCategory.id,
          label: primaryCategory.localized[locale].label,
          state: 'text' as const,
        }
      : {
          categoryId: primaryCategory.id,
          label: primaryCategory.localized[locale].label,
          state: 'link' as const,
          url: buildLocalizedPath({
            locale,
            segments: categoryRoute.segments,
          }),
        };
  const messages = getGlobalMessages(locale);
  const seoComposition = await composeSeoPageModel(
    {
      subject: { kind: 'route', target: route.target },
      locale,
      title: contentEntry.data.seo.title,
      description: contentEntry.data.seo.description,
      noindex: contentEntry.data.seo.noindex,
      openGraphType: 'article',
      openGraphArticle: {
        publishedTime: publishedAt.iso,
        ...(updatedAt === undefined ? {} : { modifiedTime: updatedAt.iso }),
        section: primaryCategory.localized[locale].label,
      },
    },
    { routeRegistry: dependencies.routeRegistry },
  );

  return {
    kind: 'article',
    locale,
    route,
    articleId,
    seo: seoComposition.seo,
    localizedRouteCluster: seoComposition.localizedRouteCluster,
    languageSwitcher: buildLanguageSwitcherModel({
      cluster: seoComposition.localizedRouteCluster,
      messages: messages.language,
    }),
    breadcrumbs: buildArticleBreadcrumbs({
      locale,
      articleTitle: contentEntry.data.title,
      primaryCategoryId: primaryCategory.id,
      taxonomy,
      routeRegistry: dependencies.routeRegistry,
      messages: messages.navigation,
      blogLabel: messages.blog.label,
    }),
    messages,
    content: {
      title: contentEntry.data.title,
      excerpt: contentEntry.data.excerpt,
      editorial,
    },
    metadata: {
      publishedAt,
      ...(updatedAt === undefined ? {} : { updatedAt }),
      primaryCategory: primaryCategoryReference,
    },
  };
}

async function loadArticleContent(
  articleId: ArticleId,
  locale: Locale,
  context: { readonly locale: Locale; readonly targetKind: 'article'; readonly entityId: ArticleId },
): ReturnType<typeof requirePublishedArticleContent> {
  try {
    return await requirePublishedArticleContent(articleId, locale);
  } catch (error) {
    throw wrapCompositionCause('Failed to load published article content.', context, error);
  }
}

async function loadArticleEditorial(
  entry: Awaited<ReturnType<typeof requirePublishedArticleContent>>,
  context: { readonly locale: Locale; readonly targetKind: 'article'; readonly entityId: ArticleId },
) {
  try {
    return await renderContentEntry(entry);
  } catch (error) {
    throw wrapCompositionCause('Failed to render article editorial content.', context, error);
  }
}
