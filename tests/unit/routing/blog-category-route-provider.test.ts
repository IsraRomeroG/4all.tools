import { describe, expect, it } from 'vitest';

import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import type { BlogCategoryContentEntry } from '@/content/queries';
import type { Locale } from '@/i18n/types';
import { blogCategoryRouteProvider, createBlogCategoryRouteProvider } from '@/routing/providers/blog-category-route-provider';
import type { RoutePublicationAvailability } from '@/routing/registry';
import { createRouteRegistry } from '@/routing/registry';
import type { RouteTarget } from '@/routing/types';

describe('blog category route provider', () => {
  it('derives all current hierarchical landings from localized content', async () => {
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
    expect(registry.getAll().every((record) => record.sourceId !== 'blog-category-content')).toBe(true);
  });

  it('does not create a landing for missing localized category content', async () => {
    const provider = createBlogCategoryRouteProvider(async (locale) =>
      locale === 'es' ? [] : [categoryEntry(locale)],
    );
    const registry = await createRouteRegistry({
      providers: [provider],
      toolTaxonomy,
      blogTaxonomy,
      publicationAvailability: publishEverything,
    });

    expect(registry.getCanonical('es', { kind: 'blog-category', categoryId: 'development' })).toBeNull();
    expect(registry.getCanonical('en', { kind: 'blog-category', categoryId: 'development' })).not.toBeNull();
  });

  it('rejects content that references an unknown taxonomy category', async () => {
    const provider = createBlogCategoryRouteProvider(async () => [
      categoryEntry('en', 'missing-category'),
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

function categoryEntry(
  locale: Locale,
  categoryId = 'development',
): BlogCategoryContentEntry {
  return {
    id: `blog-categories/${locale}/${categoryId}`,
    collection: 'blogCategories',
    data: {
      categoryId,
      locale,
      status: 'published',
      title: categoryId,
      description: categoryId,
      seo: { title: categoryId, description: categoryId, noindex: false },
    },
  } as unknown as BlogCategoryContentEntry;
}
