import { describe, expect, it } from 'vitest';

import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import { getGlobalMessages } from '@/i18n/messages/registry';
import {
  BreadcrumbRouteTargetMismatchError,
  UnknownBreadcrumbTaxonomyNodeError,
  buildToolBreadcrumbs,
  buildToolCategoryBreadcrumbs,
} from '@/navigation/breadcrumbs';
import { createRouteRegistryFromRecords } from '@/routing/registry';
import type { RouteRecord, RouteTarget } from '@/routing/types';

describe('breadcrumb builders', () => {
  it('builds the full conceptual JSON Validator path with route-aware links', () => {
    const model = buildToolBreadcrumbs({
      locale: 'en',
      toolId: 'json-validator',
      primaryCategoryId: 'json',
      currentTitle: 'JSON Validator',
      taxonomy: toolTaxonomy,
      routeRegistry: registry(),
      messages: getGlobalMessages('en').navigation,
    });

    expect(model.items).toEqual([
      { kind: 'home', state: 'link', label: 'Home', url: '/' },
      {
        kind: 'taxonomy',
        state: 'link',
        label: 'Developer Tools',
        url: '/developer/',
      },
      { kind: 'taxonomy', state: 'text', label: 'Data Formats' },
      { kind: 'taxonomy', state: 'text', label: 'JSON' },
      { kind: 'entity', state: 'current', label: 'JSON Validator' },
    ]);
    expect(model.items.filter((item) => item.state === 'current')).toHaveLength(1);
    expect(model.items.at(-1)?.state).toBe('current');
  });

  it('localizes labels and home URL without parsing the public URL', () => {
    const model = buildToolBreadcrumbs({
      locale: 'es',
      toolId: 'json-validator',
      primaryCategoryId: 'json',
      currentTitle: 'Validador JSON',
      taxonomy: toolTaxonomy,
      routeRegistry: registry(),
      messages: getGlobalMessages('es').navigation,
    });

    expect(model.items).toMatchObject([
      { label: 'Inicio', url: '/es/' },
      { label: 'Herramientas para desarrolladores', url: '/es/desarrollo/' },
      { label: 'Formatos de datos', state: 'text' },
      { label: 'JSON', state: 'text' },
      { label: 'Validador JSON', state: 'current' },
    ]);
  });

  it('turns a future explicit category route into a link automatically', () => {
    const model = buildToolBreadcrumbs({
      locale: 'en',
      toolId: 'json-validator',
      primaryCategoryId: 'json',
      currentTitle: 'JSON Validator',
      taxonomy: toolTaxonomy,
      routeRegistry: registry({ includeJsonCategory: true }),
      messages: getGlobalMessages('en').navigation,
    });

    expect(model.items[3]).toEqual({
      kind: 'taxonomy',
      state: 'link',
      label: 'JSON',
      url: '/developer/json/',
    });
  });

  it('builds category breadcrumbs with the editorial title as current', () => {
    const model = buildToolCategoryBreadcrumbs({
      locale: 'es',
      categoryId: 'data-formats',
      currentTitle: 'Formatos de datos',
      taxonomy: toolTaxonomy,
      routeRegistry: registry(),
      messages: getGlobalMessages('es').navigation,
    });

    expect(model.items).toEqual([
      { kind: 'home', state: 'link', label: 'Inicio', url: '/es/' },
      {
        kind: 'taxonomy',
        state: 'link',
        label: 'Herramientas para desarrolladores',
        url: '/es/desarrollo/',
      },
      { kind: 'taxonomy', state: 'current', label: 'Formatos de datos' },
    ]);
  });

  it('rejects unknown taxonomy nodes and mismatched route targets', () => {
    expect(() =>
      buildToolBreadcrumbs({
        locale: 'en',
        toolId: 'json-validator',
        primaryCategoryId: 'missing-category',
        currentTitle: 'JSON Validator',
        taxonomy: toolTaxonomy,
        routeRegistry: registry(),
        messages: getGlobalMessages('en').navigation,
      }),
    ).toThrow(UnknownBreadcrumbTaxonomyNodeError);

    expect(() =>
      buildToolBreadcrumbs({
        locale: 'en',
        toolId: 'json-validator',
        primaryCategoryId: 'json',
        currentTitle: 'JSON Validator',
        taxonomy: toolTaxonomy,
        routeRegistry: {
          getCanonical: () =>
            route('en', ['developer'], {
              kind: 'tool',
              toolId: 'json-validator',
            }),
        },
        messages: getGlobalMessages('en').navigation,
      }),
    ).toThrow(BreadcrumbRouteTargetMismatchError);
  });
});

function registry(options: { readonly includeJsonCategory?: boolean } = {}) {
  return createRouteRegistryFromRecords([
    route('en', ['developer'], {
      kind: 'tool-category',
      categoryId: 'developer',
    }),
    route('es', ['desarrollo'], {
      kind: 'tool-category',
      categoryId: 'developer',
    }),
    ...(options.includeJsonCategory
      ? [
          route('en', ['developer', 'json'], {
            kind: 'tool-category',
            categoryId: 'json',
          }),
        ]
      : []),
  ]);
}

function route(
  locale: RouteRecord['locale'],
  segments: readonly string[],
  target: RouteTarget,
): RouteRecord {
  return {
    area: 'tools',
    locale,
    segments,
    target,
    sourceId: 'fixture:breadcrumbs',
  };
}
