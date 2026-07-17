import { describe, expect, it } from 'vitest';

import type { ToolCategoryId } from '@/domain/shared/ids';
import { AmbiguousContentError } from '@/content/queries/errors';
import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { createTaxonomyTree } from '@/domain/taxonomy/shared/tree';
import type { TaxonomyNode, TaxonomyTree } from '@/domain/taxonomy/shared/types';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import { RoutingInvariantError } from '@/routing';
import type { RouteDefinition, RouteDefinitionProvider } from '@/routing/definitions';
import {
  createToolCategoryRouteProvider,
  toolCategoryRouteProvider,
} from '@/routing/providers/tool-category-route-provider';
import type {
  RoutePublicationAvailability,
  RouteRegistry,
} from '@/routing/registry';
import { createRouteRegistry } from '@/routing/registry';
import { getRouteTargetKey, type RouteTarget } from '@/routing/types';
import { getDeliveryRouteRegistry } from '@/templates/composers';

import {
  JSON_VALIDATOR_ROUTE_FIXTURE,
  ROUTE_DEFINITION_FIXTURES,
  WHAT_IS_JSON_ARTICLE_ROUTE_FIXTURE,
} from '../../fixtures/routing/route-definitions';

describe('route registry integration', () => {
  it('builds a registry from providers and groups localized alternates by stable target', async () => {
    const registry = await fixtureRegistry({
      providers: [
        provider('fixture:tools', [ROUTE_DEFINITION_FIXTURES[0]!]),
      ],
    });

    expect(paths(registry)).toEqual([
      'en:developer/json-validator',
      'es:desarrollo/validador-json',
      'pt:desenvolvedor/validador-json',
      'fr:developpement/validateur-json',
    ]);
    expect(
      registry
        .getByTarget({
          kind: 'tool',
          toolId: 'json-validator',
        })
        .map((record) => record.locale),
    ).toEqual(['en', 'es', 'pt', 'fr']);
  });

  it('looks up route records by path and canonical target', async () => {
    const registry = await fixtureRegistry({
      providers: [
        provider('fixture:tools', [ROUTE_DEFINITION_FIXTURES[0]!]),
      ],
    });

    expect(
      registry.findByPath('en', ['developer', 'json-validator'])?.target,
    ).toEqual({
      kind: 'tool',
      toolId: 'json-validator',
    });
    expect(
      registry.getCanonical('es', {
        kind: 'tool',
        toolId: 'json-validator',
      })?.segments,
    ).toEqual(['desarrollo', 'validador-json']);
    expect(registry.findByPath('en', ['developer', 'not-a-tool'])).toBeNull();
  });

  it('filters missing localized publication availability without fallback', async () => {
    const registry = await fixtureRegistry({
      providers: [
        provider('fixture:tools', [ROUTE_DEFINITION_FIXTURES[0]!]),
      ],
      availability: missingLocales({
        'tool:json-validator': ['es'],
      }),
    });

    expect(
      registry.getCanonical('en', {
        kind: 'tool',
        toolId: 'json-validator',
      })?.segments,
    ).toEqual(['developer', 'json-validator']);
    expect(
      registry.getCanonical('es', {
        kind: 'tool',
        toolId: 'json-validator',
      }),
    ).toBeNull();
    expect(
      registry.findByPath('es', ['desarrollo', 'validador-json']),
    ).toBeNull();
  });

  it('skips missing localized route metadata without English fallback', async () => {
    const registry = await fixtureRegistry({
      providers: [
        provider('fixture:articles', [ROUTE_DEFINITION_FIXTURES[2]!]),
      ],
    });

    expect(paths(registry)).toEqual([
      'en:blog/what-is-json',
      'es:blog/que-es-json',
    ]);
    expect(
      registry.getCanonical('pt', {
        kind: 'article',
        articleId: 'what-is-json',
      }),
    ).toBeNull();
  });

  it('rejects reserved namespace ownership before indexing records', async () => {
    await expectRouteRegistryError(
      () =>
        fixtureRegistry({
          providers: [
            provider('fixture:reserved-tool-root', [
              {
                kind: 'tool',
                definition: {
                  ...JSON_VALIDATOR_ROUTE_FIXTURE,
                  toolId: 'blog-tool',
                  rootCategoryId: 'developer',
                  primaryCategoryId: 'developer',
                  localized: {
                    en: { slug: 'example-tool' },
                  },
                },
              },
            ]),
          ],
          toolTaxonomy: createTaxonomyTree<ToolCategoryId>([
            toolNode({
              id: 'developer',
              localizedSlug: 'blog',
            }),
          ]),
        }),
      'RESERVED_ROOT_SEGMENT',
    );
  });

  it('rejects duplicate path ownership across different targets', async () => {
    await expectRouteRegistryError(
      () =>
        fixtureRegistry({
          providers: [
            provider('fixture:duplicate-tools', [
              {
                kind: 'tool',
                definition: {
                  ...JSON_VALIDATOR_ROUTE_FIXTURE,
                  toolId: 'json-validator',
                  localized: {
                    en: { slug: 'shared' },
                  },
                },
              },
              {
                kind: 'tool',
                definition: {
                  ...JSON_VALIDATOR_ROUTE_FIXTURE,
                  toolId: 'json-checker',
                  localized: {
                    en: { slug: 'shared' },
                  },
                },
              },
            ]),
          ],
        }),
      'DUPLICATE_PUBLIC_PATH',
    );
  });

  it('rejects duplicate canonical target records in one locale', async () => {
    await expectRouteRegistryError(
      () =>
        fixtureRegistry({
          providers: [
            provider('fixture:duplicate-target', [
              {
                kind: 'tool',
                definition: {
                  ...JSON_VALIDATOR_ROUTE_FIXTURE,
                  localized: {
                    en: { slug: 'json-validator' },
                  },
                },
              },
              {
                kind: 'tool',
                definition: {
                  ...JSON_VALIDATOR_ROUTE_FIXTURE,
                  localized: {
                    en: { slug: 'json-check' },
                  },
                },
              },
            ]),
          ],
        }),
      'DUPLICATE_CANONICAL_TARGET',
    );
  });

  it('keeps output deterministic when provider order changes', async () => {
    const toolProvider = provider('fixture:tools', [
      ROUTE_DEFINITION_FIXTURES[0]!,
    ]);
    const articleProvider = provider('fixture:articles', [
      ROUTE_DEFINITION_FIXTURES[2]!,
    ]);
    const first = await fixtureRegistry({
      providers: [toolProvider, articleProvider],
    });
    const second = await fixtureRegistry({
      providers: [articleProvider, toolProvider],
    });

    expect(paths(first)).toEqual(paths(second));
  });

  it('uses blog taxonomy for article routes instead of tool taxonomy', async () => {
    const registry = await fixtureRegistry({
      providers: [
        provider('fixture:articles', [
          {
            kind: 'article',
            definition: {
              ...WHAT_IS_JSON_ARTICLE_ROUTE_FIXTURE,
              strategy: 'hierarchical',
              localized: {
                en: { slug: 'what-is-json' },
              },
            },
          },
        ]),
      ],
    });

    expect(paths(registry)).toEqual([
      'en:blog/development/json-guides/what-is-json',
    ]);
  });

  it('does not generate route records for draft definitions', async () => {
    const registry = await fixtureRegistry({
      providers: [
        provider('fixture:drafts', [
          {
            kind: 'tool',
            definition: {
              ...JSON_VALIDATOR_ROUTE_FIXTURE,
              status: 'draft',
            },
          },
        ]),
      ],
    });

    expect(registry.getAll()).toEqual([]);
  });

  it('generates explicit tool category routes only when localized content is publishable', async () => {
    const registry = await fixtureRegistry({
      providers: [toolCategoryRouteProvider],
      availability: missingLocales({
        'tool-category:developer': ['es', 'pt', 'fr'],
      }),
    });

    expect(paths(registry)).toEqual(['en:developer']);
  });

  it('does not route published classification-only tool category nodes', async () => {
    const registry = await fixtureRegistry({
      providers: [toolCategoryRouteProvider],
    });

    expect(toolTaxonomy.getNode('data-formats').status).toBe('published');
    expect(toolTaxonomy.getNode('json').status).toBe('published');
    expect(toolCategoryTargets(registry)).toEqual(['developer']);
    expect(
      registry.getByTarget({
        kind: 'tool-category',
        categoryId: 'data-formats',
      }),
    ).toEqual([]);
    expect(
      registry.getByTarget({
        kind: 'tool-category',
        categoryId: 'json',
      }),
    ).toEqual([]);
  });

  it('rejects explicit tool category routes for unknown category IDs', async () => {
    await expectRouteRegistryError(
      () =>
        fixtureRegistry({
          providers: [
            createToolCategoryRouteProvider(() => [
              categoryRouteDefinition('missing-category', 'root'),
            ]),
          ],
        }),
      'UNKNOWN_TAXONOMY_NODE',
    );
  });

  it('rejects root strategy for non-root explicit tool category routes', async () => {
    await expectRouteRegistryError(
      () =>
        fixtureRegistry({
          providers: [
            createToolCategoryRouteProvider(() => [
              categoryRouteDefinition('data-formats', 'root'),
            ]),
          ],
        }),
      'ROOT_CATEGORY_MISMATCH',
    );
  });

  it('keeps production JSON Validator routes unchanged', async () => {
    const registry = await getDeliveryRouteRegistry();

    expect(
      registry
        .getByTarget({
          kind: 'tool',
          toolId: 'json-validator',
        })
        .map((record) => `${record.locale}:${record.segments.join('/')}`),
    ).toEqual([
      'en:developer/json-validator',
      'es:desarrollo/validador-json',
      'pt:desenvolvedor/validador-json',
      'fr:developpement/validateur-json',
    ]);
  });

  it('propagates publication availability errors without swallowing them', async () => {
    const error = new AmbiguousContentError({
      collection: 'tools',
      entityField: 'toolId',
      entityId: 'json-validator',
      locale: 'en',
      status: 'published',
      matchedEntryIds: ['a', 'b'],
    });

    await expect(
      fixtureRegistry({
        providers: [
          provider('fixture:tools', [ROUTE_DEFINITION_FIXTURES[0]!]),
        ],
        availability: {
          isPublishable: () => {
            throw error;
          },
        },
      }),
    ).rejects.toBe(error);
  });
});

function provider(
  sourceId: string,
  definitions: readonly RouteDefinition[],
): RouteDefinitionProvider {
  return {
    sourceId,
    getRouteDefinitions: () => definitions,
  };
}

async function fixtureRegistry(input: {
  readonly providers: readonly RouteDefinitionProvider[];
  readonly availability?: RoutePublicationAvailability;
  readonly toolTaxonomy?: TaxonomyTree<ToolCategoryId>;
}): Promise<RouteRegistry> {
  return createRouteRegistry({
    providers: input.providers,
    toolTaxonomy: input.toolTaxonomy ?? toolTaxonomy,
    blogTaxonomy,
    publicationAvailability: input.availability ?? allPublishable,
  });
}

const allPublishable: RoutePublicationAvailability = {
  isPublishable: () => true,
};

function missingLocales(
  missingByTarget: Readonly<Record<string, readonly string[]>>,
): RoutePublicationAvailability {
  return {
    isPublishable: (target: RouteTarget, locale) => {
      const missingLocalesForTarget =
        missingByTarget[getRouteTargetKey(target)] ?? [];

      return !missingLocalesForTarget.includes(locale);
    },
  };
}

function paths(registry: RouteRegistry): string[] {
  return registry
    .getAll()
    .map((record) => `${record.locale}:${record.segments.join('/')}`);
}

function toolCategoryTargets(registry: RouteRegistry): string[] {
  return [
    ...new Set(
      registry.getAll().flatMap((record) =>
        record.target.kind === 'tool-category'
          ? [record.target.categoryId]
          : [],
      ),
    ),
  ].sort();
}

function categoryRouteDefinition(
  categoryId: ToolCategoryId,
  strategy: 'root' | 'hierarchical',
): Extract<RouteDefinition, { readonly kind: 'tool-category' }>['definition'] {
  return {
    categoryId,
    strategy,
    status: 'published',
  };
}

function toolNode(params: {
  readonly id: ToolCategoryId;
  readonly localizedSlug: string;
}): TaxonomyNode<ToolCategoryId> {
  return {
    id: params.id,
    parentId: null,
    localized: {
      en: { slug: params.localizedSlug, label: params.localizedSlug },
      es: { slug: params.localizedSlug, label: params.localizedSlug },
      pt: { slug: params.localizedSlug, label: params.localizedSlug },
      fr: { slug: params.localizedSlug, label: params.localizedSlug },
    },
    status: 'published',
    sortOrder: 100,
  };
}

async function expectRouteRegistryError(
  action: () => Promise<unknown>,
  code: RoutingInvariantError['code'],
): Promise<void> {
  let caughtError: unknown;

  try {
    await action();
  } catch (error) {
    caughtError = error;
  }

  expect(caughtError).toBeInstanceOf(RoutingInvariantError);
  expect((caughtError as RoutingInvariantError).code).toBe(code);
}
