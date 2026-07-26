import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import {
  getPublishedContentIndexes,
  type PublishedContentIndexes,
} from '@/content/queries';
import { toolRegistry } from '@/features/tools/registry';
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
    contentIndexes,
    toolRegistry,
    toolTaxonomy,
    blogTaxonomy,
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
