import type { ToolCategoryId, ToolId } from '@/domain/shared/ids';
import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import { getPublishedToolCategoryContent } from '@/content/queries/tool-categories';
import { getPublishedToolContent } from '@/content/queries/tools';
import type { Locale } from '@/i18n/types';
import { toolCategoryRouteProvider } from '@/routing/providers/tool-category-route-provider';
import { toolRouteProvider } from '@/routing/providers/tool-route-provider';
import {
  createRouteRegistry,
  type RoutePublicationAvailability,
  type RouteRegistry,
} from '@/routing/registry';
import type { RouteTarget } from '@/routing/types';

let deliveryRouteRegistryPromise: Promise<RouteRegistry> | undefined;

export function getDeliveryRouteRegistry(): Promise<RouteRegistry> {
  deliveryRouteRegistryPromise ??= createRouteRegistry({
    providers: [toolRouteProvider, toolCategoryRouteProvider],
    toolTaxonomy,
    blogTaxonomy,
    publicationAvailability: publishedDeliveryContentAvailability,
  });

  return deliveryRouteRegistryPromise;
}

const publishedDeliveryContentAvailability: RoutePublicationAvailability = {
  isPublishable: async (target: RouteTarget, locale: Locale) => {
    switch (target.kind) {
      case 'tool-category':
        return hasPublishedToolCategoryContent(target.categoryId, locale);

      case 'tool':
        return hasPublishedToolContent(target.toolId, locale);

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

async function hasPublishedToolContent(
  toolId: ToolId,
  locale: Locale,
): Promise<boolean> {
  return (await getPublishedToolContent(toolId, locale)) !== null;
}
