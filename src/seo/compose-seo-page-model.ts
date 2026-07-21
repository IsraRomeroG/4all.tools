import { DEFAULT_LOCALE } from '@/i18n/config';
import type { Locale } from '@/i18n/types';
import type { RouteRegistry } from '@/routing/registry';

import { createSeoPageModel } from './create-seo-page-model';
import { SeoIndexabilityMismatchError } from './errors';
import {
  createDefaultSeoIndexabilityResolver,
  type SeoIndexabilityResolver,
} from './indexability';
import {
  buildLocalizedRouteCluster,
  getLocaleNavigationSubjectKey,
  type LocaleNavigationSubject,
  type LocalizedRouteCluster,
  type SeoHomeIndexabilityResolver,
} from './localized-route-cluster';
import type {
  SeoOpenGraphImage,
  SeoOpenGraphModel,
  SeoPageModel,
} from './types';

export interface ComposeSeoPageModelInput {
  readonly subject: LocaleNavigationSubject;
  readonly locale: Locale;
  readonly title: string;
  readonly description: string;
  readonly noindex: boolean;
  readonly openGraphType: SeoOpenGraphModel['type'];
  readonly openGraphImage?: SeoOpenGraphImage;
}

export interface SeoCompositionDependencies {
  readonly routeRegistry?: Pick<RouteRegistry, 'getCanonical' | 'getByTarget'>;
  readonly indexabilityResolver?: SeoIndexabilityResolver;
  readonly homeIndexabilityResolver?: SeoHomeIndexabilityResolver;
}

export interface SeoPageComposition {
  readonly seo: SeoPageModel;
  readonly localizedRouteCluster: LocalizedRouteCluster;
}

export async function composeSeoPageModel(
  input: ComposeSeoPageModelInput,
  dependencies: SeoCompositionDependencies = {},
): Promise<SeoPageComposition> {
  const indexabilityResolver =
    dependencies.indexabilityResolver ??
    (await createDefaultSeoIndexabilityResolver());
  const localizedRouteCluster = await buildLocalizedRouteCluster(
    {
      subject: input.subject,
      currentLocale: input.locale,
    },
    {
      indexabilityResolver,
      ...(dependencies.routeRegistry === undefined
        ? {}
        : { routeRegistry: dependencies.routeRegistry }),
      ...(dependencies.homeIndexabilityResolver === undefined
        ? {}
        : { homeIndexabilityResolver: dependencies.homeIndexabilityResolver }),
    },
  );
  const contentIndexable = !input.noindex;

  if (localizedRouteCluster.current.indexable !== contentIndexable) {
    throw new SeoIndexabilityMismatchError({
      subjectKey: getLocaleNavigationSubjectKey(input.subject),
      locale: input.locale,
      contentNoindex: input.noindex,
      resolvedIndexable: localizedRouteCluster.current.indexable,
    });
  }

  const seoVariants = localizedRouteCluster.current.indexable
    ? localizedRouteCluster.variants.filter((variant) => variant.indexable)
    : [];
  const defaultVariant = seoVariants.find(
    (variant) => variant.locale === DEFAULT_LOCALE,
  );
  const seo = createSeoPageModel({
    title: input.title,
    description: input.description,
    canonicalUrl: localizedRouteCluster.current.absoluteUrl,
    noindex: input.noindex,
    alternates: seoVariants.map((variant) => ({
      locale: variant.locale,
      hrefLang: variant.hrefLang,
      url: variant.absoluteUrl,
    })),
    ...(defaultVariant === undefined
      ? {}
      : { xDefaultUrl: defaultVariant.absoluteUrl }),
    openGraphType: input.openGraphType,
    ...(input.openGraphImage === undefined
      ? {}
      : { openGraphImage: input.openGraphImage }),
  });

  return Object.freeze({
    seo,
    localizedRouteCluster,
  });
}
