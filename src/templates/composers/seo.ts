import type { SeoContentData } from '@/content/schemas/shared';
import type { Locale } from '@/i18n/types';
import type { RouteRegistry } from '@/routing/registry';
import type { RouteRecord } from '@/routing/types';
import {
  composeSeoPageModel,
  type SeoPageComposition,
} from '@/seo';

export function composeRouteSeoPageModel(
  input: {
    readonly route: RouteRecord;
    readonly seo: SeoContentData;
  },
  routeRegistry: Pick<RouteRegistry, 'getCanonical' | 'getByTarget'>,
): Promise<SeoPageComposition> {
  return composeSeoPageModel({
    subject: {
      kind: 'route',
      target: input.route.target,
    },
    locale: input.route.locale,
    title: input.seo.title,
    description: input.seo.description,
    noindex: input.seo.noindex,
    openGraphType: 'website',
  }, { routeRegistry });
}

export function composeHomeSeoPageModel(
  input: {
    readonly locale: Locale;
    readonly title: string;
    readonly description: string;
    readonly noindex?: boolean;
  },
): Promise<SeoPageComposition> {
  return composeSeoPageModel({
    subject: {
      kind: 'home',
    },
    locale: input.locale,
    title: input.title,
    description: input.description,
    noindex: input.noindex ?? false,
    openGraphType: 'website',
  });
}
