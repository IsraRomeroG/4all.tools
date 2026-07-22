import type { BlogCategoryId } from '@/domain/shared/ids';
import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import type { TaxonomyTree } from '@/domain/taxonomy/shared/types';
import { buildLocalizedPath } from '@/routing/builders';
import type { RouteRegistry } from '@/routing/registry';
import type { Locale } from '@/i18n/types';

import {
  createBreadcrumbModel,
  createCurrentBreadcrumb,
  createHomeBreadcrumb,
} from './shared';
import type { BreadcrumbMessages, BreadcrumbModel } from './types';
import { UnknownBreadcrumbTaxonomyNodeError } from './errors';

interface BlogBreadcrumbInput {
  readonly locale: Locale;
  readonly taxonomy?: Pick<
    TaxonomyTree<BlogCategoryId>,
    'findNode' | 'getPathFromRoot'
  >;
  readonly routeRegistry: Pick<RouteRegistry, 'getCanonical'>;
  readonly messages: BreadcrumbMessages;
  readonly blogLabel: string;
}

export function buildBlogIndexBreadcrumbs(input: {
  readonly locale: Locale;
  readonly messages: BreadcrumbMessages;
  readonly blogLabel: string;
}): BreadcrumbModel {
  const localeInput = { locale: input.locale, messages: input.messages };

  return createBreadcrumbModel(input.messages.breadcrumbsLabel, [
    createHomeBreadcrumb(localeInput),
    createCurrentBreadcrumb('taxonomy', input.blogLabel),
  ]);
}

export function buildBlogCategoryBreadcrumbs(
  input: BlogBreadcrumbInput & {
    readonly categoryId: BlogCategoryId;
    readonly currentTitle: string;
  },
): BreadcrumbModel {
  const taxonomy = input.taxonomy ?? blogTaxonomy;
  const path = getBlogTaxonomyPath(taxonomy, input.categoryId);
  const localeInput = { locale: input.locale, messages: input.messages };
  const items = [
    createHomeBreadcrumb(localeInput),
    createBlogBreadcrumb(input.locale, input.blogLabel),
    ...path.slice(0, -1).map((node) =>
      createBlogTaxonomyBreadcrumb(node, input),
    ),
    createCurrentBreadcrumb('taxonomy', input.currentTitle),
  ];

  return createBreadcrumbModel(input.messages.breadcrumbsLabel, items);
}

function createBlogBreadcrumb(locale: Locale, label: string) {
  return {
    kind: 'taxonomy' as const,
    state: 'link' as const,
    label,
    url: buildLocalizedPath({ locale, segments: ['blog'] }),
  };
}

export function buildArticleBreadcrumbs(
  input: BlogBreadcrumbInput & {
    readonly articleTitle: string;
    readonly primaryCategoryId: BlogCategoryId;
  },
): BreadcrumbModel {
  const taxonomy = input.taxonomy ?? blogTaxonomy;
  const path = getBlogTaxonomyPath(taxonomy, input.primaryCategoryId);
  const localeInput = { locale: input.locale, messages: input.messages };
  const items = [
    createHomeBreadcrumb(localeInput),
    createBlogBreadcrumb(input.locale, input.blogLabel),
    ...path.map((node) => createBlogTaxonomyBreadcrumb(node, input)),
    createCurrentBreadcrumb('entity', input.articleTitle),
  ];

  return createBreadcrumbModel(input.messages.breadcrumbsLabel, items);
}

function getBlogTaxonomyPath(
  taxonomy: Pick<TaxonomyTree<BlogCategoryId>, 'findNode' | 'getPathFromRoot'>,
  categoryId: BlogCategoryId,
) {
  if (taxonomy.findNode(categoryId) === undefined) {
    throw new UnknownBreadcrumbTaxonomyNodeError(categoryId);
  }

  return taxonomy.getPathFromRoot(categoryId);
}

function createBlogTaxonomyBreadcrumb(
  node: ReturnType<
    Pick<TaxonomyTree<BlogCategoryId>, 'getPathFromRoot'>['getPathFromRoot']
  >[number],
  input: BlogBreadcrumbInput,
) {
  const label = node.localized[input.locale].label;
  const route = input.routeRegistry.getCanonical(input.locale, {
    kind: 'blog-category',
    categoryId: node.id,
  });

  if (route === null) {
    return {
      kind: 'taxonomy' as const,
      state: 'text' as const,
      label,
    };
  }

  return {
    kind: 'taxonomy' as const,
    state: 'link' as const,
    label,
    url: buildLocalizedPath({
      locale: input.locale,
      segments: route.segments,
    }),
  };
}
