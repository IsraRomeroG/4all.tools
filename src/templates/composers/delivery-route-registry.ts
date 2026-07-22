import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import {
  createIndexedPublicationAvailability,
  getPublishedContentIndexes,
  type PublishedContentIndexes,
} from '@/content/queries';
import { toolCategoryRouteProvider } from '@/routing/providers/tool-category-route-provider';
import { toolRouteProvider } from '@/routing/providers/tool-route-provider';
import { articleRouteProvider } from '@/routing/providers/article-route-provider';
import { blogCategoryRouteProvider } from '@/routing/providers/blog-category-route-provider';
import {
  createRouteRegistry,
  type RouteRegistry,
} from '@/routing/registry';

export interface DeliveryRouteRegistryDependencies {
  readonly getPublishedContentIndexes: () => Promise<PublishedContentIndexes>;
}

export interface DeliveryRouteRegistryLifecycleOptions {
  readonly development: boolean;
  readonly createRegistry: () => Promise<RouteRegistry>;
}

const productionDependencies: DeliveryRouteRegistryDependencies = {
  getPublishedContentIndexes,
};

let deliveryRouteRegistryAccessor: (() => Promise<RouteRegistry>) | undefined;

export function getDeliveryRouteRegistry(): Promise<RouteRegistry> {
  deliveryRouteRegistryAccessor ??= createDeliveryRouteRegistryAccessor({
    development: import.meta.env.DEV,
    createRegistry: () => createDeliveryRouteRegistry(),
  });

  return deliveryRouteRegistryAccessor();
}

export function createDeliveryRouteRegistryAccessor(
  options: DeliveryRouteRegistryLifecycleOptions,
): () => Promise<RouteRegistry> {
  let registryPromise: Promise<RouteRegistry> | undefined;

  return () => {
    if (options.development) {
      return options.createRegistry();
    }

    registryPromise ??= options.createRegistry();

    return registryPromise;
  };
}

async function createDeliveryRouteRegistry(
  dependencies: DeliveryRouteRegistryDependencies = productionDependencies,
): Promise<RouteRegistry> {
  const contentIndexes = await dependencies.getPublishedContentIndexes();

  return createRouteRegistry({
    providers: [
      toolRouteProvider,
      toolCategoryRouteProvider,
      articleRouteProvider,
      blogCategoryRouteProvider,
    ],
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
  deliveryRouteRegistryAccessor = undefined;
}
