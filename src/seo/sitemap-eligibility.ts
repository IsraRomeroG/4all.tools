import type { Locale } from '../i18n/types';
import { buildAbsoluteUrl } from '../routing/builders/localized-url-builder';
import type { RouteRegistry } from '../routing/registry';

import type { SeoIndexabilityResolver } from './indexability';

const SITEMAP_INDEXABILITY_STATE = Symbol.for(
  '4all.tools.sitemap-indexability',
);

interface SitemapIndexabilityState {
  readonly noindexUrls: Set<string>;
}

export interface SitemapEligibilityDependencies {
  readonly getRouteRegistry: () => Promise<Pick<RouteRegistry, 'getAll'>>;
  readonly getIndexabilityResolver: () => Promise<SeoIndexabilityResolver>;
  readonly locales: readonly Locale[];
  readonly buildAbsoluteUrl: typeof buildAbsoluteUrl;
}

export function registerSitemapUrlIndexability(
  url: string,
  indexable: boolean,
): void {
  const state = getSitemapIndexabilityState();

  if (indexable) {
    state.noindexUrls.delete(url);
  } else {
    state.noindexUrls.add(url);
  }
}

export function isSitemapUrlEligible(url: string): boolean {
  return !getSitemapIndexabilityState().noindexUrls.has(url);
}

function getSitemapIndexabilityState(): SitemapIndexabilityState {
  const globalState = globalThis as typeof globalThis & {
    [SITEMAP_INDEXABILITY_STATE]?: SitemapIndexabilityState;
  };

  globalState[SITEMAP_INDEXABILITY_STATE] ??= {
    noindexUrls: new Set<string>(),
  };

  return globalState[SITEMAP_INDEXABILITY_STATE];
}

export function createSitemapEligibleUrlSetLoader(
  dependencies: SitemapEligibilityDependencies,
): () => Promise<ReadonlySet<string>> {
  let eligibleUrlsPromise: Promise<ReadonlySet<string>> | undefined;

  return () => {
    eligibleUrlsPromise ??= createSitemapEligibleUrlSet(dependencies);

    return eligibleUrlsPromise;
  };
}

async function createSitemapEligibleUrlSet(
  dependencies: SitemapEligibilityDependencies,
): Promise<ReadonlySet<string>> {
  const [routeRegistry, indexabilityResolver] = await Promise.all([
    dependencies.getRouteRegistry(),
    dependencies.getIndexabilityResolver(),
  ]);
  const eligibleUrls = new Set<string>();

  for (const record of routeRegistry.getAll()) {
    if (!(await indexabilityResolver.isIndexable(record.target, record.locale))) {
      continue;
    }

    eligibleUrls.add(
      dependencies.buildAbsoluteUrl({
        locale: record.locale,
        segments: record.segments,
      }),
    );
  }

  for (const locale of dependencies.locales) {
    eligibleUrls.add(
      dependencies.buildAbsoluteUrl({
        locale,
        segments: [],
      }),
    );
    eligibleUrls.add(
      dependencies.buildAbsoluteUrl({
        locale,
        segments: ['blog'],
      }),
    );
  }

  return eligibleUrls;
}
