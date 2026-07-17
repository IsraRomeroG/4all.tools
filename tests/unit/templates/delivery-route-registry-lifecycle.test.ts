import { describe, expect, it, vi } from 'vitest';

import {
  createRouteRegistryFromRecords,
  type RouteRegistry,
} from '@/routing/registry';
import { createDeliveryRouteRegistryAccessor } from '@/templates/composers/delivery-route-registry';

describe('delivery route registry lifecycle accessor', () => {
  it('memoizes production registry creation', async () => {
    const registry = createRouteRegistryFromRecords([]);
    const createRegistry = vi.fn(async () => registry);
    const getRegistry = createDeliveryRouteRegistryAccessor({
      development: false,
      createRegistry,
    });

    const firstPromise = getRegistry();
    const secondPromise = getRegistry();
    const [firstRegistry, secondRegistry] = await Promise.all([
      firstPromise,
      secondPromise,
    ]);

    expect(secondPromise).toBe(firstPromise);
    expect(createRegistry).toHaveBeenCalledTimes(1);
    expect(secondRegistry).toBe(firstRegistry);
    expect(firstRegistry).toBe(registry);
  });

  it('reconstructs the registry for each development access', async () => {
    const firstRegistry = createRouteRegistryFromRecords([]);
    const secondRegistry = createRouteRegistryFromRecords([]);
    const registries = [firstRegistry, secondRegistry];
    const createRegistry = vi.fn(async () => {
      const registry = registries.shift();

      if (registry === undefined) {
        throw new Error('Missing test registry.');
      }

      return registry;
    });
    const getRegistry = createDeliveryRouteRegistryAccessor({
      development: true,
      createRegistry,
    });

    const firstPromise = getRegistry();
    const secondPromise = getRegistry();

    await expect(firstPromise).resolves.toBe(firstRegistry);
    await expect(secondPromise).resolves.toBe(secondRegistry);
    expect(secondPromise).not.toBe(firstPromise);
    expect(createRegistry).toHaveBeenCalledTimes(2);
  });

  it('can recover from failed development registry creation', async () => {
    const failure = new Error('Failed test registry creation.');
    const registry = createRouteRegistryFromRecords([]);
    let attempt = 0;
    const createRegistry = vi.fn(async () => {
      attempt += 1;

      if (attempt === 1) {
        throw failure;
      }

      return registry;
    });
    const getRegistry = createDeliveryRouteRegistryAccessor({
      development: true,
      createRegistry,
    });

    await expect(getRegistry()).rejects.toBe(failure);
    await expect(getRegistry()).resolves.toBe(registry);
    expect(createRegistry).toHaveBeenCalledTimes(2);
  });

  it('shares concurrent production registry requests', async () => {
    const registry = createRouteRegistryFromRecords([]);
    const pending = deferred<RouteRegistry>();
    const createRegistry = vi.fn(() => pending.promise);
    const getRegistry = createDeliveryRouteRegistryAccessor({
      development: false,
      createRegistry,
    });

    const firstPromise = getRegistry();
    const secondPromise = getRegistry();
    const thirdPromise = getRegistry();

    expect(secondPromise).toBe(firstPromise);
    expect(thirdPromise).toBe(firstPromise);
    expect(createRegistry).toHaveBeenCalledTimes(1);

    pending.resolve(registry);

    await expect(firstPromise).resolves.toBe(registry);
    await expect(secondPromise).resolves.toBe(registry);
    await expect(thirdPromise).resolves.toBe(registry);
  });
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return {
    promise,
    resolve,
  };
}
