import { describe, expect, it } from 'vitest';

import { jsonValidatorDefinition } from '@/features/tools/developer/json-validator/tool.config';
import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import { createTaxonomyTree } from '@/domain/taxonomy/shared/tree';
import type { TaxonomyNode } from '@/domain/taxonomy/shared/types';
import { RoutingInvariantError } from '@/routing';
import {
  assertValidRouteSegment,
  assertValidRouteSegments,
  buildArticlePathSegments,
  buildBlogCategoryPathSegments,
  buildToolCategoryPathSegments,
  buildToolPathSegments,
  isValidRouteSegment,
} from '@/routing/builders';

describe('localized route path builders', () => {
  it('validates route segments', () => {
    expect(isValidRouteSegment('json-validator')).toBe(true);
    expect(() => assertValidRouteSegment('json-validator')).not.toThrow();
    expect(isValidRouteSegment('Developer')).toBe(false);
    expectRouteError(() => assertValidRouteSegment('Developer'), 'INVALID_SEGMENT');
    expectRouteError(() => assertValidRouteSegments([]), 'EMPTY_SEGMENTS');
  });

  it('builds flat localized tool paths from the canonical tool definition', () => {
    expect(buildToolPathSegments({ definition: jsonValidatorDefinition, locale: 'en', taxonomy: toolTaxonomy })).toEqual([
      'developer',
      'json-validator',
    ]);
    expect(buildToolPathSegments({ definition: jsonValidatorDefinition, locale: 'es', taxonomy: toolTaxonomy })).toEqual([
      'desarrollo',
      'validador-json',
    ]);
  });

  it('builds hierarchical tool paths through classification taxonomy', () => {
    const definition = {
      ...jsonValidatorDefinition,
      route: { ...jsonValidatorDefinition.route, strategy: 'hierarchical' },
    } as const;

    expect(buildToolPathSegments({ definition, locale: 'en', taxonomy: toolTaxonomy })).toEqual([
      'developer',
      'data-formats',
      'json',
      'json-validator',
    ]);
  });

  it('fails when a tool lacks localized route metadata', () => {
    const definition = {
      ...jsonValidatorDefinition,
      route: {
        ...jsonValidatorDefinition.route,
        localized: { en: { slug: 'json-validator' } },
      },
    } as const;

    expectRouteError(
      () => buildToolPathSegments({ definition, locale: 'es', taxonomy: toolTaxonomy }),
      'MISSING_LOCALIZED_ROUTE',
    );
  });

  it('allows classification-only taxonomy nodes in entity paths', () => {
    const taxonomy = createTaxonomyTree([
      node('developer', null),
      node('data-formats', 'developer'),
      node('json', 'data-formats'),
    ]);

    expect(buildToolPathSegments({ definition: jsonValidatorDefinition, locale: 'en', taxonomy })).toEqual([
      'developer',
      'json-validator',
    ]);
  });

  it('builds content-owned article paths hierarchically', () => {
    expect(buildArticlePathSegments({
      articleId: 'what-is-json',
      primaryCategoryId: 'json-guides',
      routeSlug: 'que-es-json',
      locale: 'es',
      taxonomy: blogTaxonomy,
    })).toEqual(['blog', 'desarrollo', 'guias-json', 'que-es-json']);
  });

  it('builds content-owned hierarchical category paths', () => {
    expect(buildToolCategoryPathSegments({ categoryId: 'developer', locale: 'en', taxonomy: toolTaxonomy })).toEqual(['developer']);
    expect(buildToolCategoryPathSegments({ categoryId: 'data-formats', locale: 'es', taxonomy: toolTaxonomy })).toEqual([
      'desarrollo',
      'formatos-de-datos',
    ]);
    expect(buildBlogCategoryPathSegments({ categoryId: 'json-guides', locale: 'fr', taxonomy: blogTaxonomy })).toEqual([
      'blog',
      'developpement',
      'guides-json',
    ]);
  });
});

function node(id: string, parentId: string | null): TaxonomyNode {
  return {
    id,
    parentId,
    localized: {
      en: { slug: id, label: id },
      es: { slug: id, label: id },
      pt: { slug: id, label: id },
      fr: { slug: id, label: id },
    },
    sortOrder: 100,
  };
}

function expectRouteError(action: () => unknown, code: RoutingInvariantError['code']): void {
  expect(action).toThrow(RoutingInvariantError);
  try {
    action();
  } catch (error) {
    expect(error).toBeInstanceOf(RoutingInvariantError);
    expect((error as RoutingInvariantError).code).toBe(code);
  }
}
