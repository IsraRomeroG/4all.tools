import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import {
  createIndexedPublicationAvailability,
  createPublishedContentIndexes,
} from '@/content/queries';
import { toolCategoryRouteProvider } from '@/routing/providers/tool-category-route-provider';
import { toolRouteProvider } from '@/routing/providers/tool-route-provider';
import {
  createRouteRegistry,
  type RouteRegistry,
} from '@/routing/registry';

let deliveryRouteRegistryPromise: Promise<RouteRegistry> | undefined;

export function getDeliveryRouteRegistry(): Promise<RouteRegistry> {
  deliveryRouteRegistryPromise ??= createDeliveryRouteRegistry();

  return deliveryRouteRegistryPromise;
}

async function createDeliveryRouteRegistry(): Promise<RouteRegistry> {
  const contentIndexes = await createPublishedContentIndexes();

  return createRouteRegistry({
    providers: [toolRouteProvider, toolCategoryRouteProvider],
    toolTaxonomy,
    blogTaxonomy,
    publicationAvailability: createIndexedPublicationAvailability(contentIndexes),
  });
}
