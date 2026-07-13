import type { BlogCategoryId, ToolCategoryId } from '@/domain/shared/ids';
import type { TaxonomyTree } from '@/domain/taxonomy/shared/types';
import { SUPPORTED_LOCALES, type Locale } from '@/i18n/types';
import {
  buildArticlePathSegments,
  buildBlogCategoryPathSegments,
  buildToolCategoryPathSegments,
  buildToolPathSegments,
} from '@/routing/builders';
import type {
  ArticleRouteDefinition,
  BlogCategoryRouteDefinition,
  RouteDefinition,
  ToolCategoryRouteDefinition,
  ToolRouteDefinition,
} from '@/routing/definitions/types';
import type { RouteDefinitionProvider } from '@/routing/definitions/providers';
import { assertNever } from '@/routing/types';
import type { RouteRecord, RouteTarget } from '@/routing/types';
import { assertNoReservedNamespaceConflict } from '@/routing/validation';

import { createRouteRegistryFromRecords, type RouteRegistry } from './route-index';

export interface RoutePublicationDecision {
  readonly publishable: boolean;
  readonly reason?: string;
}

export type RoutePublicationDecisionResult =
  | boolean
  | RoutePublicationDecision;

export interface RoutePublicationAvailability {
  isPublishable(
    target: RouteTarget,
    locale: Locale,
  ): RoutePublicationDecisionResult | Promise<RoutePublicationDecisionResult>;
}

export interface CreateRouteRegistryInput {
  readonly providers: readonly RouteDefinitionProvider[];
  readonly toolTaxonomy: TaxonomyTree<ToolCategoryId>;
  readonly blogTaxonomy: TaxonomyTree<BlogCategoryId>;
  readonly publicationAvailability: RoutePublicationAvailability;
}

interface CollectedRouteDefinition {
  readonly sourceId: string;
  readonly routeDefinition: RouteDefinition;
}

export async function createRouteRegistry(
  input: CreateRouteRegistryInput,
): Promise<RouteRegistry> {
  const definitions = await collectRouteDefinitions(input.providers);
  const records: RouteRecord[] = [];

  for (const collected of definitions) {
    if (!isPublishedDefinition(collected.routeDefinition)) {
      continue;
    }

    for (const locale of SUPPORTED_LOCALES) {
      if (!hasLocalizedRouteMetadata(collected.routeDefinition, locale)) {
        continue;
      }

      const target = getDefinitionTarget(collected.routeDefinition);
      const decision = await resolvePublicationDecision(
        input.publicationAvailability,
        target,
        locale,
      );

      if (!decision.publishable) {
        continue;
      }

      const record = buildRouteRecord({
        collected,
        locale,
        target,
        toolTaxonomy: input.toolTaxonomy,
        blogTaxonomy: input.blogTaxonomy,
      });

      assertNoReservedNamespaceConflict({
        locale: record.locale,
        area: record.area,
        segments: record.segments,
        target: record.target,
        sourceId: record.sourceId,
      });

      records.push(record);
    }
  }

  return createRouteRegistryFromRecords(records);
}

async function collectRouteDefinitions(
  providers: readonly RouteDefinitionProvider[],
): Promise<readonly CollectedRouteDefinition[]> {
  const providerResults = await Promise.all(
    providers.map(async (provider) => {
      const routeDefinitions = await provider.getRouteDefinitions();

      return routeDefinitions.map((routeDefinition) => ({
        sourceId: provider.sourceId,
        routeDefinition,
      }));
    }),
  );

  return providerResults.flat();
}

function isPublishedDefinition(routeDefinition: RouteDefinition): boolean {
  return routeDefinition.definition.status === 'published';
}

function hasLocalizedRouteMetadata(
  routeDefinition: RouteDefinition,
  locale: Locale,
): boolean {
  switch (routeDefinition.kind) {
    case 'tool':
    case 'article':
      return routeDefinition.definition.localized[locale] !== undefined;

    case 'tool-category':
    case 'blog-category':
      return true;

    default:
      return assertNever(routeDefinition);
  }
}

async function resolvePublicationDecision(
  availability: RoutePublicationAvailability,
  target: RouteTarget,
  locale: Locale,
): Promise<RoutePublicationDecision> {
  const decision = await availability.isPublishable(target, locale);

  if (typeof decision === 'boolean') {
    return { publishable: decision };
  }

  return decision;
}

function buildRouteRecord(input: {
  readonly collected: CollectedRouteDefinition;
  readonly locale: Locale;
  readonly target: RouteTarget;
  readonly toolTaxonomy: TaxonomyTree<ToolCategoryId>;
  readonly blogTaxonomy: TaxonomyTree<BlogCategoryId>;
}): RouteRecord {
  const { routeDefinition } = input.collected;

  switch (routeDefinition.kind) {
    case 'tool':
      return createToolRecord({
        definition: routeDefinition.definition,
        locale: input.locale,
        target: input.target,
        sourceId: input.collected.sourceId,
        taxonomy: input.toolTaxonomy,
      });

    case 'tool-category':
      return createToolCategoryRecord({
        definition: routeDefinition.definition,
        locale: input.locale,
        target: input.target,
        sourceId: input.collected.sourceId,
        taxonomy: input.toolTaxonomy,
      });

    case 'article':
      return createArticleRecord({
        definition: routeDefinition.definition,
        locale: input.locale,
        target: input.target,
        sourceId: input.collected.sourceId,
        taxonomy: input.blogTaxonomy,
      });

    case 'blog-category':
      return createBlogCategoryRecord({
        definition: routeDefinition.definition,
        locale: input.locale,
        target: input.target,
        sourceId: input.collected.sourceId,
        taxonomy: input.blogTaxonomy,
      });

    default:
      return assertNever(routeDefinition);
  }
}

function getDefinitionTarget(routeDefinition: RouteDefinition): RouteTarget {
  switch (routeDefinition.kind) {
    case 'tool':
      return {
        kind: 'tool',
        toolId: routeDefinition.definition.toolId,
      };

    case 'tool-category':
      return {
        kind: 'tool-category',
        categoryId: routeDefinition.definition.categoryId,
      };

    case 'article':
      return {
        kind: 'article',
        articleId: routeDefinition.definition.articleId,
      };

    case 'blog-category':
      return {
        kind: 'blog-category',
        categoryId: routeDefinition.definition.categoryId,
      };

    default:
      return assertNever(routeDefinition);
  }
}

function createToolRecord(input: {
  readonly definition: ToolRouteDefinition;
  readonly locale: Locale;
  readonly target: RouteTarget;
  readonly sourceId: string;
  readonly taxonomy: TaxonomyTree<ToolCategoryId>;
}): RouteRecord {
  return {
    area: 'tools',
    locale: input.locale,
    segments: buildToolPathSegments({
      definition: input.definition,
      locale: input.locale,
      taxonomy: input.taxonomy,
      sourceId: input.sourceId,
    }),
    target: input.target,
    sourceId: input.sourceId,
  };
}

function createToolCategoryRecord(input: {
  readonly definition: ToolCategoryRouteDefinition;
  readonly locale: Locale;
  readonly target: RouteTarget;
  readonly sourceId: string;
  readonly taxonomy: TaxonomyTree<ToolCategoryId>;
}): RouteRecord {
  return {
    area: 'tools',
    locale: input.locale,
    segments: buildToolCategoryPathSegments({
      definition: input.definition,
      locale: input.locale,
      taxonomy: input.taxonomy,
      sourceId: input.sourceId,
    }),
    target: input.target,
    sourceId: input.sourceId,
  };
}

function createArticleRecord(input: {
  readonly definition: ArticleRouteDefinition;
  readonly locale: Locale;
  readonly target: RouteTarget;
  readonly sourceId: string;
  readonly taxonomy: TaxonomyTree<BlogCategoryId>;
}): RouteRecord {
  return {
    area: 'blog',
    locale: input.locale,
    segments: buildArticlePathSegments({
      definition: input.definition,
      locale: input.locale,
      taxonomy: input.taxonomy,
      sourceId: input.sourceId,
    }),
    target: input.target,
    sourceId: input.sourceId,
  };
}

function createBlogCategoryRecord(input: {
  readonly definition: BlogCategoryRouteDefinition;
  readonly locale: Locale;
  readonly target: RouteTarget;
  readonly sourceId: string;
  readonly taxonomy: TaxonomyTree<BlogCategoryId>;
}): RouteRecord {
  return {
    area: 'blog',
    locale: input.locale,
    segments: buildBlogCategoryPathSegments({
      definition: input.definition,
      locale: input.locale,
      taxonomy: input.taxonomy,
      sourceId: input.sourceId,
    }),
    target: input.target,
    sourceId: input.sourceId,
  };
}
