import { getLocaleNavigationSubjectKey } from './localized-route-cluster';
import type { LocalizedRouteCluster } from './localized-route-cluster';
import type { SeoPageModel } from './types';

export interface ReciprocalSeoPageModel {
  readonly seo: SeoPageModel;
  readonly localizedRouteCluster: LocalizedRouteCluster;
}

export function assertReciprocalSeoAlternates(
  pages: readonly ReciprocalSeoPageModel[],
): void {
  const indexablePages = pages.filter((page) => page.seo.robots.index);

  if (indexablePages.length === 0) {
    return;
  }

  const subjectKey = getLocaleNavigationSubjectKey(
    indexablePages[0]!.localizedRouteCluster.subject,
  );
  const expected = indexablePages[0]!.localizedRouteCluster.variants
    .filter((variant) => variant.indexable)
    .map((variant) => variant.absoluteUrl);

  for (const page of indexablePages) {
    const actual = page.seo.alternates.map((alternate) => alternate.url);
    const pageSubjectKey = getLocaleNavigationSubjectKey(
      page.localizedRouteCluster.subject,
    );

    if (pageSubjectKey !== subjectKey) {
      throw new Error(
        `Reciprocal SEO alternate validation received different subjects: ${subjectKey} and ${pageSubjectKey}.`,
      );
    }

    if (!sameValues(actual, expected)) {
      throw new Error(
        `SEO alternate set mismatch for ${subjectKey}:${page.localizedRouteCluster.currentLocale}. Expected ${expected.join(', ')}; received ${actual.join(', ')}.`,
      );
    }

    if (!expected.includes(page.seo.canonicalUrl)) {
      throw new Error(
        `SEO canonical is absent from the reciprocal alternate set for ${subjectKey}:${page.localizedRouteCluster.currentLocale}.`,
      );
    }
  }
}

function sameValues(first: readonly string[], second: readonly string[]): boolean {
  return (
    first.length === second.length &&
    first.every((value, index) => value === second[index])
  );
}
