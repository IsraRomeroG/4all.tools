import { describe, expect, it } from 'vitest';

import type { ToolCategoryId } from '@/domain/shared/ids';
import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { createTaxonomyTree } from '@/domain/taxonomy/shared/tree';
import type { TaxonomyNode } from '@/domain/taxonomy/shared/types';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import { RoutingInvariantError } from '@/routing';
import type {
  ArticleRouteDefinition,
  BlogCategoryRouteDefinition,
  ToolCategoryRouteDefinition,
  ToolRouteDefinition,
} from '@/routing/definitions';
import {
  assertValidRouteSegment,
  assertValidRouteSegments,
  buildArticlePathSegments,
  buildBlogCategoryPathSegments,
  buildToolCategoryPathSegments,
  buildToolPathSegments,
  isValidRouteSegment,
} from '@/routing/builders';

import {
  DEVELOPER_CATEGORY_ROUTE_FIXTURE,
  JSON_GUIDES_BLOG_CATEGORY_ROUTE_FIXTURE,
  JSON_VALIDATOR_ROUTE_FIXTURE,
  WHAT_IS_JSON_ARTICLE_ROUTE_FIXTURE,
} from '../../fixtures/routing/route-definitions';

describe('localized route path builders', () => {
  describe('segment validation', () => {
    it.each([
      'developer',
      'data-formats',
      'json',
      'json-validator',
      'validador-json',
      'formats-de-donnees',
      'sha256',
    ])('accepts valid route segment %s', (segment) => {
      expect(isValidRouteSegment(segment)).toBe(true);
      expect(() => assertValidRouteSegment(segment)).not.toThrow();
    });

    it.each([
      '',
      'Developer',
      'data_formats',
      'data formats',
      '/data-formats',
      'data-formats/',
      'developer/json-validator',
      'data--formats',
      '-data-formats',
      'data-formats-',
      'json.validator',
      'valid@dor-json',
    ])('rejects invalid route segment %s', (segment) => {
      expect(isValidRouteSegment(segment)).toBe(false);
      expectRouteError(
        () => assertValidRouteSegment(segment, { source: 'unit-test' }),
        'INVALID_SEGMENT',
      );
    });

    it('rejects an empty entity segment list', () => {
      expectRouteError(() => assertValidRouteSegments([]), 'EMPTY_SEGMENTS');
    });
  });

  describe('tool paths', () => {
    it('builds flat localized tool paths for all initial locales', () => {
      expect(
        buildToolPathSegments({
          definition: JSON_VALIDATOR_ROUTE_FIXTURE,
          locale: 'en',
          taxonomy: toolTaxonomy,
        }),
      ).toEqual(['developer', 'json-validator']);
      expect(
        buildToolPathSegments({
          definition: JSON_VALIDATOR_ROUTE_FIXTURE,
          locale: 'es',
          taxonomy: toolTaxonomy,
        }),
      ).toEqual(['desarrollo', 'validador-json']);
      expect(
        buildToolPathSegments({
          definition: JSON_VALIDATOR_ROUTE_FIXTURE,
          locale: 'pt',
          taxonomy: toolTaxonomy,
        }),
      ).toEqual(['desenvolvedor', 'validador-json']);
      expect(
        buildToolPathSegments({
          definition: JSON_VALIDATOR_ROUTE_FIXTURE,
          locale: 'fr',
          taxonomy: toolTaxonomy,
        }),
      ).toEqual(['developpement', 'validateur-json']);
    });

    it('builds hierarchical tool paths from root-to-primary taxonomy order', () => {
      expect(
        buildToolPathSegments({
          definition: hierarchicalTool(JSON_VALIDATOR_ROUTE_FIXTURE),
          locale: 'en',
          taxonomy: toolTaxonomy,
        }),
      ).toEqual([
        'developer',
        'data-formats',
        'json',
        'json-validator',
      ]);
      expect(
        buildToolPathSegments({
          definition: hierarchicalTool(JSON_VALIDATOR_ROUTE_FIXTURE),
          locale: 'es',
          taxonomy: toolTaxonomy,
        }),
      ).toEqual([
        'desarrollo',
        'formatos-de-datos',
        'json',
        'validador-json',
      ]);
    });

    it('rejects a root category mismatch', () => {
      expectRouteError(
        () =>
          buildToolPathSegments({
            definition: {
              ...JSON_VALIDATOR_ROUTE_FIXTURE,
              rootCategoryId: 'seo',
            } satisfies ToolRouteDefinition,
            locale: 'en',
            taxonomy: toolTaxonomy,
          }),
        'ROOT_CATEGORY_MISMATCH',
      );
    });

    it('rejects missing localized route metadata without fallback', () => {
      expectRouteError(
        () =>
          buildToolPathSegments({
            definition: {
              ...JSON_VALIDATOR_ROUTE_FIXTURE,
              localized: {
                en: { slug: 'json-validator' },
              },
            } satisfies ToolRouteDefinition,
            locale: 'es',
            taxonomy: toolTaxonomy,
          }),
        'MISSING_LOCALIZED_ROUTE',
      );
    });

    it('rejects invalid localized leaf slugs', () => {
      expectRouteError(
        () =>
          buildToolPathSegments({
            definition: {
              ...JSON_VALIDATOR_ROUTE_FIXTURE,
              localized: {
                ...JSON_VALIDATOR_ROUTE_FIXTURE.localized,
                en: { slug: 'JSON Validator' },
              },
            } satisfies ToolRouteDefinition,
            locale: 'en',
            taxonomy: toolTaxonomy,
          }),
        'INVALID_SEGMENT',
      );
    });

    it('rejects unpublished taxonomy chains used for classification', () => {
      expectRouteError(
        () =>
          buildToolPathSegments({
            definition: JSON_VALIDATOR_ROUTE_FIXTURE,
            locale: 'en',
            taxonomy: createTaxonomyTree<ToolCategoryId>([
              toolNode('developer', null, 'published'),
              toolNode('data-formats', 'developer', 'draft'),
              toolNode('json', 'data-formats', 'published'),
            ]),
          }),
        'UNPUBLISHABLE_ROUTE',
      );
    });
  });

  describe('tool category paths', () => {
    it('builds explicit root category landing paths', () => {
      expect(
        buildToolCategoryPathSegments({
          definition: DEVELOPER_CATEGORY_ROUTE_FIXTURE,
          locale: 'en',
          taxonomy: toolTaxonomy,
        }),
      ).toEqual(['developer']);
      expect(
        buildToolCategoryPathSegments({
          definition: DEVELOPER_CATEGORY_ROUTE_FIXTURE,
          locale: 'es',
          taxonomy: toolTaxonomy,
        }),
      ).toEqual(['desarrollo']);
    });

    it('builds explicit nested category hierarchical paths', () => {
      expect(
        buildToolCategoryPathSegments({
          definition: {
            categoryId: 'data-formats',
            strategy: 'hierarchical',
            status: 'published',
          } satisfies ToolCategoryRouteDefinition,
          locale: 'en',
          taxonomy: toolTaxonomy,
        }),
      ).toEqual(['developer', 'data-formats']);
      expect(
        buildToolCategoryPathSegments({
          definition: {
            categoryId: 'data-formats',
            strategy: 'hierarchical',
            status: 'published',
          } satisfies ToolCategoryRouteDefinition,
          locale: 'es',
          taxonomy: toolTaxonomy,
        }),
      ).toEqual(['desarrollo', 'formatos-de-datos']);
    });

    it('rejects root category strategy for nested taxonomy nodes', () => {
      expectRouteError(
        () =>
          buildToolCategoryPathSegments({
            definition: {
              categoryId: 'data-formats',
              strategy: 'root',
              status: 'published',
            } satisfies ToolCategoryRouteDefinition,
            locale: 'en',
            taxonomy: toolTaxonomy,
          }),
        'ROOT_CATEGORY_MISMATCH',
      );
    });
  });

  describe('blog paths', () => {
    it('builds flat article paths under the blog namespace', () => {
      expect(
        buildArticlePathSegments({
          definition: WHAT_IS_JSON_ARTICLE_ROUTE_FIXTURE,
          locale: 'en',
          taxonomy: blogTaxonomy,
        }),
      ).toEqual(['blog', 'what-is-json']);
      expect(
        buildArticlePathSegments({
          definition: WHAT_IS_JSON_ARTICLE_ROUTE_FIXTURE,
          locale: 'es',
          taxonomy: blogTaxonomy,
        }),
      ).toEqual(['blog', 'que-es-json']);
    });

    it('builds hierarchical article paths under the blog namespace', () => {
      expect(
        buildArticlePathSegments({
          definition: hierarchicalArticle(WHAT_IS_JSON_ARTICLE_ROUTE_FIXTURE),
          locale: 'en',
          taxonomy: blogTaxonomy,
        }),
      ).toEqual([
        'blog',
        'development',
        'json-guides',
        'what-is-json',
      ]);
      expect(
        buildArticlePathSegments({
          definition: hierarchicalArticle(WHAT_IS_JSON_ARTICLE_ROUTE_FIXTURE),
          locale: 'es',
          taxonomy: blogTaxonomy,
        }),
      ).toEqual(['blog', 'desarrollo', 'guias-json', 'que-es-json']);
    });

    it('builds explicit nested blog category paths', () => {
      expect(
        buildBlogCategoryPathSegments({
          definition: JSON_GUIDES_BLOG_CATEGORY_ROUTE_FIXTURE,
          locale: 'en',
          taxonomy: blogTaxonomy,
        }),
      ).toEqual(['blog', 'development', 'json-guides']);
      expect(
        buildBlogCategoryPathSegments({
          definition: JSON_GUIDES_BLOG_CATEGORY_ROUTE_FIXTURE,
          locale: 'es',
          taxonomy: blogTaxonomy,
        }),
      ).toEqual(['blog', 'desarrollo', 'guias-json']);
    });

    it('builds flat blog category paths with the category leaf only', () => {
      expect(
        buildBlogCategoryPathSegments({
          definition: {
            categoryId: 'json-guides',
            strategy: 'flat',
            status: 'published',
          } satisfies BlogCategoryRouteDefinition,
          locale: 'en',
          taxonomy: blogTaxonomy,
        }),
      ).toEqual(['blog', 'json-guides']);
    });

    it('rejects missing localized article leaf metadata without fallback', () => {
      expectRouteError(
        () =>
          buildArticlePathSegments({
            definition: {
              ...WHAT_IS_JSON_ARTICLE_ROUTE_FIXTURE,
              localized: {
                en: { slug: 'what-is-json' },
              },
            } satisfies ArticleRouteDefinition,
            locale: 'es',
            taxonomy: blogTaxonomy,
          }),
        'MISSING_LOCALIZED_ROUTE',
      );
    });
  });
});

function hierarchicalTool(
  definition: ToolRouteDefinition,
): ToolRouteDefinition {
  return {
    ...definition,
    strategy: 'hierarchical',
  };
}

function hierarchicalArticle(
  definition: ArticleRouteDefinition,
): ArticleRouteDefinition {
  return {
    ...definition,
    strategy: 'hierarchical',
  };
}

function toolNode(
  id: ToolCategoryId,
  parentId: ToolCategoryId | null,
  status: TaxonomyNode<ToolCategoryId>['status'],
): TaxonomyNode<ToolCategoryId> {
  return {
    id,
    parentId,
    localized: {
      en: { slug: id, label: id },
      es: { slug: id, label: id },
      pt: { slug: id, label: id },
      fr: { slug: id, label: id },
    },
    status,
    sortOrder: 100,
  };
}

function expectRouteError(
  action: () => unknown,
  code: RoutingInvariantError['code'],
): void {
  expect(action).toThrow(RoutingInvariantError);

  try {
    action();
  } catch (error) {
    expect(error).toBeInstanceOf(RoutingInvariantError);
    expect((error as RoutingInvariantError).code).toBe(code);
  }
}
