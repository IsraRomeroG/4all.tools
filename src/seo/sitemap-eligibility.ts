const SITEMAP_INDEXABILITY_STATE = Symbol.for(
  '4all.tools.sitemap-indexability',
);

interface SitemapIndexabilityState {
  readonly noindexUrls: Set<string>;
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
