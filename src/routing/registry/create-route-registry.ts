import type { PublishedContentIndexes } from '@/content/queries';
import type {
  BlogCategoryId,
  ToolCategoryId,
} from '@/domain/shared/ids';
import type { TaxonomyTree } from '@/domain/taxonomy/shared/types';
import { toolRegistry as productionToolRegistry, type ToolRegistry } from '@/features/tools/registry';
import { SUPPORTED_LOCALES } from '@/i18n/types';
import {
  buildArticlePathSegments,
  buildBlogCategoryPathSegments,
  buildToolCategoryPathSegments,
  buildToolPathSegments,
} from '@/routing/builders';
import { getRouteTargetKey, type RouteRecord } from '@/routing/types';

import { createRouteRegistryFromRecords, type RouteRegistry } from './route-index';

export interface CreateRouteRegistryInput {
  readonly contentIndexes: PublishedContentIndexes;
  readonly toolRegistry?: ToolRegistry;
  readonly toolTaxonomy: TaxonomyTree<ToolCategoryId>;
  readonly blogTaxonomy: TaxonomyTree<BlogCategoryId>;
}

export async function createRouteRegistry(
  input: CreateRouteRegistryInput,
): Promise<RouteRegistry> {
  const registry = input.toolRegistry ?? productionToolRegistry;
  const records = [
    ...buildToolRecords(input.contentIndexes, registry, input.toolTaxonomy),
    ...buildToolCategoryRecords(input.contentIndexes, input.toolTaxonomy),
    ...buildArticleRecords(input.contentIndexes, input.blogTaxonomy),
    ...buildBlogCategoryRecords(input.contentIndexes, input.blogTaxonomy),
  ];

  return createRouteRegistryFromRecords(sortRouteRecords(records));
}

function buildToolRecords(
  indexes: PublishedContentIndexes,
  registry: ToolRegistry,
  taxonomy: TaxonomyTree<ToolCategoryId>,
): readonly RouteRecord[] {
  const records: RouteRecord[] = [];

  for (const module of registry.getAll()) {
    const definition = module.definition;

    if (definition.status !== 'published') {
      continue;
    }

    for (const locale of SUPPORTED_LOCALES) {
      const content = indexes.tools.find({ toolId: definition.id, locale });

      if (content === null) {
        continue;
      }

      const sourceId = sourceIdFor('tool-content', content.id);
      records.push({
        area: 'tools',
        locale,
        segments: buildToolPathSegments({
          definition,
          locale,
          taxonomy,
          sourceId,
        }),
        target: { kind: 'tool', toolId: definition.id },
        sourceId,
      });
    }
  }

  return records;
}

function buildToolCategoryRecords(
  indexes: PublishedContentIndexes,
  taxonomy: TaxonomyTree<ToolCategoryId>,
): readonly RouteRecord[] {
  const records: RouteRecord[] = [];

  for (const locale of SUPPORTED_LOCALES) {
    for (const content of indexes.toolCategories.list(locale)) {
      const sourceId = sourceIdFor('tool-category-content', content.id);
      records.push({
        area: 'tools',
        locale,
        segments: buildToolCategoryPathSegments({
          categoryId: content.data.categoryId,
          locale,
          taxonomy,
          sourceId,
        }),
        target: { kind: 'tool-category', categoryId: content.data.categoryId },
        sourceId,
      });
    }
  }

  return records;
}

function buildArticleRecords(
  indexes: PublishedContentIndexes,
  taxonomy: TaxonomyTree<BlogCategoryId>,
): readonly RouteRecord[] {
  const records: RouteRecord[] = [];

  for (const locale of SUPPORTED_LOCALES) {
    for (const content of indexes.blog.list(locale)) {
      const sourceId = sourceIdFor('article-content', content.id);
      records.push({
        area: 'blog',
        locale,
        segments: buildArticlePathSegments({
          articleId: content.data.articleId,
          primaryCategoryId: content.data.primaryCategoryId,
          routeSlug: content.data.routeSlug,
          locale,
          taxonomy,
          sourceId,
        }),
        target: { kind: 'article', articleId: content.data.articleId },
        sourceId,
      });
    }
  }

  return records;
}

function buildBlogCategoryRecords(
  indexes: PublishedContentIndexes,
  taxonomy: TaxonomyTree<BlogCategoryId>,
): readonly RouteRecord[] {
  const records: RouteRecord[] = [];

  for (const locale of SUPPORTED_LOCALES) {
    for (const content of indexes.blogCategories.list(locale)) {
      const sourceId = sourceIdFor('blog-category-content', content.id);
      records.push({
        area: 'blog',
        locale,
        segments: buildBlogCategoryPathSegments({
          categoryId: content.data.categoryId,
          locale,
          taxonomy,
          sourceId,
        }),
        target: { kind: 'blog-category', categoryId: content.data.categoryId },
        sourceId,
      });
    }
  }

  return records;
}

function sortRouteRecords(records: readonly RouteRecord[]): readonly RouteRecord[] {
  return Object.freeze(
    [...records].sort((first, second) =>
      `${first.area}:${first.locale}:${first.segments.join('/')}:${getRouteTargetKey(first.target)}`.localeCompare(
        `${second.area}:${second.locale}:${second.segments.join('/')}:${getRouteTargetKey(second.target)}`,
      ),
    ),
  );
}

function sourceIdFor(kind: string, entryId: string): string {
  return `${kind}:${entryId}`;
}
