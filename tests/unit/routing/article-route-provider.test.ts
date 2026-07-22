import { describe, expect, it } from 'vitest';

import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import {
  articleRouteProvider,
  createArticleRouteProvider,
  getArticleRouteDefinition,
} from '@/routing/providers/article-route-provider';
import type { RoutePublicationAvailability } from '@/routing/registry';
import { createRouteRegistry } from '@/routing/registry';
import type { RouteTarget } from '@/routing/types';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';

describe('article route provider', () => {
  it('publishes the explicit four-locale what-is-json definition', async () => {
    const definitions = await articleRouteProvider.getRouteDefinitions();

    expect(definitions).toHaveLength(1);
    expect(definitions[0]).toEqual({
      kind: 'article',
      definition: {
        articleId: 'what-is-json',
        primaryCategoryId: 'json-guides',
        strategy: 'hierarchical',
        localized: {
          en: { slug: 'what-is-json' },
          es: { slug: 'que-es-json' },
          pt: { slug: 'o-que-e-json' },
          fr: { slug: 'qu-est-ce-que-json' },
        },
        status: 'published',
      },
    });
    expect(Object.isFrozen(definitions)).toBe(true);
    expect(Object.isFrozen(definitions[0]!.definition)).toBe(true);
  });

  it('exposes an indexed stable-id lookup', () => {
    expect(getArticleRouteDefinition('what-is-json')).toMatchObject({
      articleId: 'what-is-json',
      primaryCategoryId: 'json-guides',
    });
    expect(getArticleRouteDefinition('missing-article')).toBeNull();
  });

  it('rejects duplicate article IDs while evaluating the provider', async () => {
    const definition = getArticleRouteDefinition('what-is-json')!;
    const provider = createArticleRouteProvider(() => [definition, definition]);

    expect(() => provider.getRouteDefinitions()).toThrow(
      expect.objectContaining({ code: 'DUPLICATE_ROUTE_DEFINITION' }),
    );
  });

  it('builds the exact hierarchical route matrix through the generic registry', async () => {
    const registry = await createRouteRegistry({
      providers: [articleRouteProvider],
      toolTaxonomy,
      blogTaxonomy,
      publicationAvailability: publishEverything,
    });

    expect(
      registry.getAll().map((record) => `${record.locale}:${record.segments.join('/')}`),
    ).toEqual([
      'en:blog/development/json-guides/what-is-json',
      'es:blog/desarrollo/guias-json/que-es-json',
      'pt:blog/desenvolvimento/guias-json/o-que-e-json',
      'fr:blog/developpement/guides-json/qu-est-ce-que-json',
    ]);
  });

  it('rejects invalid localized article leaves', async () => {
    const provider = createArticleRouteProvider(() => [
      {
        ...getArticleRouteDefinition('what-is-json')!,
        localized: {
          en: { slug: 'What-Is-JSON' },
        },
      },
    ]);

    await expect(
      createRouteRegistry({
        providers: [provider],
        toolTaxonomy,
        blogTaxonomy,
        publicationAvailability: publishEverything,
      }),
    ).rejects.toMatchObject({ code: 'INVALID_SEGMENT' });
  });
});

const publishEverything: RoutePublicationAvailability = {
  isPublishable: (_target: RouteTarget) => true,
};
