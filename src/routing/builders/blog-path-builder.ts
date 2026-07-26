import type { ArticleId, BlogCategoryId } from '@/domain/shared/ids';
import type { TaxonomyTree } from '@/domain/taxonomy/shared/types';
import type { Locale } from '@/i18n/types';
import { RoutingInvariantError } from '@/routing/errors';
import type { BlogCategoryRouteDefinition } from '@/routing/definitions/types';

import {
  assertPublishedTaxonomyPath,
  freezeValidatedSegments,
  getLocalizedTaxonomySegments,
  getRequiredPathFromRoot,
  type BuildPathContext,
} from './shared-path-builder';

export const BLOG_ROUTE_ROOT_SEGMENT = 'blog';

export interface BuildArticlePathInput {
  readonly articleId: ArticleId;
  readonly primaryCategoryId: BlogCategoryId;
  readonly routeSlug: string;
  readonly locale: Locale;
  readonly taxonomy: TaxonomyTree<BlogCategoryId>;
  readonly sourceId?: string;
}

export interface BuildBlogCategoryPathInput {
  readonly definition: BlogCategoryRouteDefinition;
  readonly locale: Locale;
  readonly taxonomy: TaxonomyTree<BlogCategoryId>;
  readonly sourceId?: string;
}

export function buildArticlePathSegments(
  input: BuildArticlePathInput,
): readonly string[] {
  const context = getArticleContext(input);
  const taxonomyPath = getRequiredPathFromRoot(
    input.taxonomy,
    input.primaryCategoryId,
    context,
  );
  const taxonomySegments = getLocalizedTaxonomySegments(
    taxonomyPath,
    input.locale,
  );

  assertPublishedTaxonomyPath(taxonomyPath, context);

  return freezeValidatedSegments(
    [BLOG_ROUTE_ROOT_SEGMENT, ...taxonomySegments, input.routeSlug],
    context,
  );
}

export function buildBlogCategoryPathSegments(
  input: BuildBlogCategoryPathInput,
): readonly string[] {
  const context = getBlogCategoryContext(input);
  const taxonomyPath = getRequiredPathFromRoot(
    input.taxonomy,
    input.definition.categoryId,
    context,
  );
  const categoryNode = taxonomyPath[taxonomyPath.length - 1];

  if (!categoryNode) {
    throw new RoutingInvariantError(
      'UNKNOWN_TAXONOMY_NODE',
      `Unknown taxonomy node ${input.definition.categoryId}.`,
      context,
    );
  }

  const taxonomySegments =
    input.definition.strategy === 'flat'
      ? [categoryNode.localized[input.locale].slug]
      : getLocalizedTaxonomySegments(taxonomyPath, input.locale);

  assertPublishedTaxonomyPath(taxonomyPath, context);

  return freezeValidatedSegments(
    [BLOG_ROUTE_ROOT_SEGMENT, ...taxonomySegments],
    context,
  );
}

function getArticleContext(input: BuildArticlePathInput): BuildPathContext {
  return {
    locale: input.locale,
    routeKind: 'article',
    articleId: input.articleId,
    primaryCategoryId: input.primaryCategoryId,
    strategy: 'hierarchical',
    ...(input.sourceId !== undefined ? { sourceId: input.sourceId } : {}),
  };
}

function getBlogCategoryContext(
  input: BuildBlogCategoryPathInput,
): BuildPathContext {
  return {
    locale: input.locale,
    routeKind: 'blog-category',
    categoryId: input.definition.categoryId,
    strategy: input.definition.strategy,
    ...(input.sourceId !== undefined ? { sourceId: input.sourceId } : {}),
  };
}
