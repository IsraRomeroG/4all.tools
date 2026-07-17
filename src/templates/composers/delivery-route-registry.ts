import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import {
  createIndexedPublicationAvailability,
  getPublishedContentIndexes,
  type PublishedContentIndexes,
} from '@/content/queries';
import { toolCategoryRouteProvider } from '@/routing/providers/tool-category-route-provider';
import { toolRouteProvider } from '@/routing/providers/tool-route-provider';
import {
  createRouteRegistry,
  type RouteRegistry,
} from '@/routing/registry';

export interface DeliveryRouteRegistryDependencies {
  readonly getPublishedContentIndexes: () => Promise<PublishedContentIndexes>;
}

const productionDependencies: DeliveryRouteRegistryDependencies = {
  getPublishedContentIndexes,
};

let deliveryRouteRegistryPromise: Promise<RouteRegistry> | undefined;

export function getDeliveryRouteRegistry(): Promise<RouteRegistry> {
  deliveryRouteRegistryPromise ??= createDeliveryRouteRegistry();

  return deliveryRouteRegistryPromise;
}

async function createDeliveryRouteRegistry(
  dependencies: DeliveryRouteRegistryDependencies = productionDependencies,
): Promise<RouteRegistry> {
  const contentIndexes = await dependencies.getPublishedContentIndexes();

  return createRouteRegistry({
    providers: [toolRouteProvider, toolCategoryRouteProvider],
    toolTaxonomy,
    blogTaxonomy,
    publicationAvailability: createIndexedPublicationAvailability(contentIndexes),
  });
}

export function createDeliveryRouteRegistryForTesting(
  dependencies: DeliveryRouteRegistryDependencies,
): Promise<RouteRegistry> {
  return createDeliveryRouteRegistry(dependencies);
}

export function resetDeliveryRouteRegistryForTesting(): void {
  deliveryRouteRegistryPromise = undefined;
}
