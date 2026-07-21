import type { Locale } from '@/i18n/types';
import type { RouteRegistry } from '@/routing/registry';
import type { RouteRecord, RouteTarget } from '@/routing/types';

import type { SeoIndexabilityResolver } from './indexability';

export type LocalizedPageAvailability =
  | {
      readonly state: 'published-indexable';
      readonly route: RouteRecord;
    }
  | {
      readonly state: 'published-noindex';
      readonly route: RouteRecord;
    }
  | {
      readonly state: 'unavailable';
      readonly reason: 'missing-public-route';
    };

export interface LocalizedPageAvailabilityResolver {
  getAvailability(
    target: RouteTarget,
    locale: Locale,
  ): LocalizedPageAvailability | Promise<LocalizedPageAvailability>;
}

export interface ResolveLocalizedPageAvailabilityDependencies {
  readonly routeRegistry: Pick<RouteRegistry, 'getCanonical'>;
  readonly indexabilityResolver: SeoIndexabilityResolver;
}

export function createLocalizedPageAvailabilityResolver(
  dependencies: ResolveLocalizedPageAvailabilityDependencies,
): LocalizedPageAvailabilityResolver {
  return Object.freeze({
    getAvailability: (target: RouteTarget, locale: Locale) =>
      resolveLocalizedPageAvailability(target, locale, dependencies),
  });
}

export async function resolveLocalizedPageAvailability(
  target: RouteTarget,
  locale: Locale,
  dependencies: ResolveLocalizedPageAvailabilityDependencies,
): Promise<LocalizedPageAvailability> {
  const route = dependencies.routeRegistry.getCanonical(locale, target);

  if (route === null) {
    return {
      state: 'unavailable',
      reason: 'missing-public-route',
    };
  }

  const indexable = await dependencies.indexabilityResolver.isIndexable(
    target,
    locale,
  );

  return indexable
    ? { state: 'published-indexable', route }
    : { state: 'published-noindex', route };
}
