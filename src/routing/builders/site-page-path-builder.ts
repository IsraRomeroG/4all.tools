import type { Locale } from '@/i18n/types';

import { freezeValidatedSegments } from './shared-path-builder';

export function buildSitePagePathSegments(input: {
  readonly locale: Locale;
  readonly routeSlug: string;
  readonly sourceId?: string;
}): readonly string[] {
  return freezeValidatedSegments(
    [input.routeSlug],
    input.sourceId === undefined
      ? { locale: input.locale, routeSlug: input.routeSlug }
      : {
          locale: input.locale,
          sourceId: input.sourceId,
          routeSlug: input.routeSlug,
        },
  );
}
