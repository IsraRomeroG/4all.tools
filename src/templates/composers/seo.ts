import type { SeoContentData } from '@/content/schemas/shared';
import type { Locale } from '@/i18n/types';
import { buildAbsoluteUrl } from '@/routing/builders';
import type { RouteRecord } from '@/routing/types';
import { createSeoPageModel, type SeoPageModel } from '@/seo';

export function composeRouteSeoPageModel(input: {
  readonly route: RouteRecord;
  readonly seo: SeoContentData;
}): SeoPageModel {
  const canonicalUrl = buildAbsoluteUrl({
    locale: input.route.locale,
    segments: input.route.segments,
  });

  return createSeoPageModel({
    title: input.seo.title,
    description: input.seo.description,
    canonicalUrl,
    noindex: input.seo.noindex,
  });
}

export function composeHomeSeoPageModel(input: {
  readonly locale: Locale;
  readonly title: string;
  readonly description: string;
}): SeoPageModel {
  return createSeoPageModel({
    title: input.title,
    description: input.description,
    canonicalUrl: buildAbsoluteUrl({
      locale: input.locale,
      segments: [],
    }),
  });
}
