import type { ToolCategoryId } from '@/domain/shared/ids';
import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import { getPublishedToolCategoryContent } from '@/content/queries/tool-categories';
import type { Locale } from '@/i18n/types';
import type { RouteDefinition, RouteDefinitionProvider } from '@/routing/definitions';
import {
  createRouteRegistry,
  type RoutePublicationAvailability,
  type RouteRegistry,
} from '@/routing/registry';
import type { RouteTarget } from '@/routing/types';

let deliveryRouteRegistryPromise: Promise<RouteRegistry> | undefined;

export function getDeliveryRouteRegistry(): Promise<RouteRegistry> {
  deliveryRouteRegistryPromise ??= createRouteRegistry({
    providers: [toolCategoryRouteDefinitions],
    toolTaxonomy,
    blogTaxonomy,
    publicationAvailability: publishedDeliveryContentAvailability,
  });

  return deliveryRouteRegistryPromise;
}

const toolCategoryRouteDefinitions: RouteDefinitionProvider = {
  sourceId: 'delivery:tool-categories',
  getRouteDefinitions: () =>
    getPublishedToolCategoryRouteDefinitions().map((definition) => ({
      kind: 'tool-category',
      definition,
    })),
};

function getPublishedToolCategoryRouteDefinitions(): readonly Extract<
  RouteDefinition,
  { readonly kind: 'tool-category' }
>['definition'][] {
  const roots = toolTaxonomy.getRoots();
  const descendants = roots.flatMap((node) => toolTaxonomy.getDescendants(node.id));
  const categories = [...roots, ...descendants].filter(
    (node) => node.status === 'published',
  );

  return categories.map((node) => ({
    categoryId: node.id,
    strategy: node.parentId === null ? 'root' : 'hierarchical',
    status: node.status,
  }));
}

const publishedDeliveryContentAvailability: RoutePublicationAvailability = {
  isPublishable: async (target: RouteTarget, locale: Locale) => {
    switch (target.kind) {
      case 'tool-category':
        return hasPublishedToolCategoryContent(target.categoryId, locale);

      case 'tool':
      case 'article':
      case 'blog-category':
        return false;
    }
  },
};

async function hasPublishedToolCategoryContent(
  categoryId: ToolCategoryId,
  locale: Locale,
): Promise<boolean> {
  return (await getPublishedToolCategoryContent(categoryId, locale)) !== null;
}
