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
  SeoOpenGraphArticleMetadata,
  SeoOpenGraphImage,
  SeoPageModel,
} from './types';

interface ComposeSeoPageModelBaseInput {
  readonly subject: LocaleNavigationSubject;
  readonly locale: Locale;
  readonly title: string;
  readonly description: string;
  readonly noindex: boolean;
  readonly openGraphImage?: SeoOpenGraphImage;
}

export type ComposeSeoPageModelInput = ComposeSeoPageModelBaseInput &
  (
    | {
        readonly openGraphType: 'website';
        readonly openGraphArticle?: never;
      }
    | {
        readonly openGraphType: 'article';
        readonly openGraphArticle: SeoOpenGraphArticleMetadata;
      }
  );

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

  const seoBaseInput = {
    title: input.title,
    description: input.description,
    canonicalUrl: localizedRouteCluster.current.absoluteUrl,
    ...(input.openGraphImage === undefined
      ? {}
      : { openGraphImage: input.openGraphImage }),
  };

  const seo = input.noindex
    ? input.openGraphType === 'article'
      ? createSeoPageModel({
          ...seoBaseInput,
          noindex: true,
          openGraphType: 'article',
          openGraphArticle: input.openGraphArticle,
        })
      : createSeoPageModel({
          ...seoBaseInput,
          noindex: true,
          openGraphType: 'website',
        })
    : input.openGraphType === 'article'
      ? createIndexableSeoPageModel(localizedRouteCluster, {
          ...seoBaseInput,
          openGraphType: 'article',
          openGraphArticle: input.openGraphArticle,
        })
      : createIndexableSeoPageModel(localizedRouteCluster, {
          ...seoBaseInput,
          openGraphType: 'website',
        });

  return Object.freeze({
    seo,
    localizedRouteCluster,
  });
}

function createIndexableSeoPageModel(
  localizedRouteCluster: LocalizedRouteCluster,
  input: {
    readonly title: string;
    readonly description: string;
    readonly canonicalUrl: string;
    readonly openGraphType?: 'website';
    readonly openGraphArticle?: never;
  } | {
    readonly title: string;
    readonly description: string;
    readonly canonicalUrl: string;
    readonly openGraphType: 'article';
    readonly openGraphArticle: SeoOpenGraphArticleMetadata;
    readonly openGraphImage?: SeoOpenGraphImage;
  },
) {
  const seoVariants = localizedRouteCluster.variants.filter(
    (variant) => variant.indexable,
  );
  const defaultVariant = seoVariants.find(
    (variant) => variant.locale === DEFAULT_LOCALE,
  );

  const alternates = seoVariants.map((variant) => ({
    locale: variant.locale,
    hrefLang: variant.hrefLang,
    url: variant.absoluteUrl,
  }));

  if (input.openGraphType === 'article') {
    return createSeoPageModel({
      ...input,
      noindex: false,
      alternates,
      ...(defaultVariant === undefined
        ? {}
        : { xDefaultUrl: defaultVariant.absoluteUrl }),
    });
  }

  return createSeoPageModel({
    ...input,
    noindex: false,
    openGraphType: 'website',
    alternates,
    ...(defaultVariant === undefined
      ? {}
      : { xDefaultUrl: defaultVariant.absoluteUrl }),
  });
}
