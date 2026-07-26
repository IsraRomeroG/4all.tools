import { describe, expect, it } from 'vitest';

import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import { toolCategoryRouteProvider } from '@/routing/providers/tool-category-route-provider';
import type { RoutePublicationAvailability } from '@/routing/registry';
import { createRouteRegistry } from '@/routing/registry';
import type { RouteTarget } from '@/routing/types';

describe('tool category route provider', () => {
  it('derives category landings from published localized content', async () => {
    const definitions = await toolCategoryRouteProvider.getRouteDefinitions();

    expect(definitions).toHaveLength(1);
    expect(definitions[0]).toMatchObject({
      kind: 'tool-category',
      definition: {
        categoryId: 'developer',
        strategy: 'hierarchical',
        status: 'published',
        sourceId: 'en/developer',
      },
    });
    expect(Object.isFrozen(definitions)).toBe(true);
    expect(Object.isFrozen(definitions[0]!.definition)).toBe(true);
  });

  it('does not create a landing without localized category content', async () => {
    const provider = {
      ...toolCategoryRouteProvider,
      getRouteDefinitions: async () => [],
    };
    const registry = await createRouteRegistry({
      providers: [provider],
      toolTaxonomy,
      blogTaxonomy,
      publicationAvailability: publishEverything,
    });

    expect(registry.getByTarget({ kind: 'tool-category', categoryId: 'developer' })).toEqual([]);
  });

  it('keeps classification-only taxonomy nodes out of category landings', async () => {
    const registry = await createRouteRegistry({
      providers: [toolCategoryRouteProvider],
      toolTaxonomy,
      blogTaxonomy,
      publicationAvailability: publishEverything,
    });

    expect(registry.getByTarget({ kind: 'tool-category', categoryId: 'data-formats' })).toEqual([]);
    expect(registry.getByTarget({ kind: 'tool-category', categoryId: 'json' })).toEqual([]);
  });
});

const publishEverything: RoutePublicationAvailability = {
  isPublishable: (_target: RouteTarget) => true,
};
