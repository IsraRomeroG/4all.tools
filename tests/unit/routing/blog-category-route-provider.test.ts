import { describe, expect, it } from 'vitest';

import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { createTaxonomyTree } from '@/domain/taxonomy/shared/tree';
import type { TaxonomyNode } from '@/domain/taxonomy/shared/types';
import { createBlogCategoryRouteProvider, blogCategoryRouteProvider } from '@/routing/providers/blog-category-route-provider';
import type { RoutePublicationAvailability } from '@/routing/registry';
import { createRouteRegistry } from '@/routing/registry';
import type { RouteTarget } from '@/routing/types';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';

describe('blog category route provider', () => {
  it('contains only the explicit production categories', async () => {
    const definitions = await blogCategoryRouteProvider.getRouteDefinitions();

    expect(definitions.map((route) =>
      route.kind === 'blog-category' ? route.definition.categoryId : null,
    )).toEqual([
      'development',
      'json-guides',
    ]);
  });

  it('does not change when a classification-only taxonomy node is added', async () => {
    const provider = createBlogCategoryRouteProvider();
    const withExtraNode = createTaxonomyTree([
      ...blogTaxonomy.getRoots(),
      ...blogTaxonomy.getDescendants('development'),
      blogNode('release-notes', 'development'),
    ]);

    const before = await createRouteRegistry({
      providers: [provider],
      toolTaxonomy,
      blogTaxonomy,
      publicationAvailability: publishEverything,
    });
    const after = await createRouteRegistry({
      providers: [provider],
      toolTaxonomy,
      blogTaxonomy: withExtraNode,
      publicationAvailability: publishEverything,
    });

    expect(after.getAll()).toEqual(before.getAll());
    expect(
      after.getByTarget({ kind: 'blog-category', categoryId: 'release-notes' }),
    ).toEqual([]);
  });

  it('builds both localized hierarchical category paths', async () => {
    const registry = await createRouteRegistry({
      providers: [blogCategoryRouteProvider],
      toolTaxonomy,
      blogTaxonomy,
      publicationAvailability: publishEverything,
    });

    expect(
      registry.getAll().map((record) => `${record.locale}:${record.segments.join('/')}`),
    ).toEqual([
      'en:blog/development',
      'en:blog/development/json-guides',
      'es:blog/desarrollo',
      'es:blog/desarrollo/guias-json',
      'pt:blog/desenvolvimento',
      'pt:blog/desenvolvimento/guias-json',
      'fr:blog/developpement',
      'fr:blog/developpement/guides-json',
    ]);
  });

  it('rejects an unknown explicit category definition', async () => {
    const provider = createBlogCategoryRouteProvider(() => [
      {
        categoryId: 'missing-category',
        strategy: 'hierarchical',
        status: 'published',
      },
    ]);

    await expect(
      createRouteRegistry({
        providers: [provider],
        toolTaxonomy,
        blogTaxonomy,
        publicationAvailability: publishEverything,
      }),
    ).rejects.toMatchObject({ code: 'UNKNOWN_TAXONOMY_NODE' });
  });
});

const publishEverything: RoutePublicationAvailability = {
  isPublishable: (_target: RouteTarget) => true,
};

function blogNode(
  id: string,
  parentId: string | null,
): TaxonomyNode<string> {
  return {
    id,
    parentId,
    localized: {
      en: { slug: id, label: id },
      es: { slug: id, label: id },
      pt: { slug: id, label: id },
      fr: { slug: id, label: id },
    },
    status: 'published',
    sortOrder: 200,
  };
}
