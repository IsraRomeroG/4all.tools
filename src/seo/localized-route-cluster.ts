import { LOCALES } from '@/i18n/config';
import { SUPPORTED_LOCALES, type Locale } from '@/i18n/types';
import { buildAbsoluteUrl, buildLocalizedPath } from '@/routing/builders';
import type { RouteRegistry } from '@/routing/registry';
import {
  getRouteTargetKey,
  type RouteRecord,
  type RouteTarget,
} from '@/routing/types';

import {
  CanonicalTargetMismatchError,
  DuplicateLocaleVariantError,
  MissingCanonicalRouteError,
  MissingCurrentVariantError,
} from './errors';
import type { SeoIndexabilityResolver } from './indexability';

export type LocaleNavigationSubject =
  | {
      readonly kind: 'route';
      readonly target: RouteTarget;
    }
  | {
      readonly kind: 'home';
    };

export interface LocalizedRouteVariant {
  readonly locale: Locale;
  readonly hrefLang: string;
  readonly relativeUrl: string;
  readonly absoluteUrl: string;
  readonly route: RouteRecord | null;
  readonly published: true;
  readonly indexable: boolean;
}

export interface LocalizedRouteCluster {
  readonly subject: LocaleNavigationSubject;
  readonly currentLocale: Locale;
  readonly current: LocalizedRouteVariant;
  readonly variants: readonly LocalizedRouteVariant[];
}

export interface SeoHomeIndexabilityResolver {
  isHomeIndexable(locale: Locale): boolean | Promise<boolean>;
}

export interface LocalizedRouteClusterDependencies {
  readonly routeRegistry?: Pick<RouteRegistry, 'getCanonical' | 'getByTarget'>;
  readonly indexabilityResolver: SeoIndexabilityResolver;
  readonly homeIndexabilityResolver?: SeoHomeIndexabilityResolver;
}

export async function buildLocalizedRouteCluster(
  input: {
    readonly subject: LocaleNavigationSubject;
    readonly currentLocale: Locale;
  },
  dependencies: LocalizedRouteClusterDependencies,
): Promise<LocalizedRouteCluster> {
  const variants =
    input.subject.kind === 'home'
      ? await buildHomeVariants(dependencies.homeIndexabilityResolver)
      : await buildRouteVariants(
          {
            subject: input.subject,
            currentLocale: input.currentLocale,
          },
          dependencies,
        );
  const current =
    variants.find((variant) => variant.locale === input.currentLocale) ?? null;

  if (current === null) {
    throw new MissingCurrentVariantError(
      getLocaleNavigationSubjectKey(input.subject),
      input.currentLocale,
    );
  }

  return Object.freeze({
    subject: Object.freeze(
      input.subject.kind === 'home'
        ? { kind: 'home' as const }
        : {
            kind: 'route' as const,
            target: Object.freeze({ ...input.subject.target }) as RouteTarget,
          },
    ),
    currentLocale: input.currentLocale,
    current,
    variants: Object.freeze(variants),
  });
}

export function getLocaleNavigationSubjectKey(
  subject: LocaleNavigationSubject,
): string {
  return subject.kind === 'home' ? 'home' : getRouteTargetKey(subject.target);
}

async function buildRouteVariants(
  input: {
    readonly subject: Extract<LocaleNavigationSubject, { readonly kind: 'route' }>;
    readonly currentLocale: Locale;
  },
  dependencies: LocalizedRouteClusterDependencies,
): Promise<readonly LocalizedRouteVariant[]> {
  const routeRegistry = requireRouteRegistry(dependencies);
  const subjectKey = getRouteTargetKey(input.subject.target);
  const currentRoute = routeRegistry.getCanonical(
    input.currentLocale,
    input.subject.target,
  );

  if (currentRoute === null) {
    throw new MissingCanonicalRouteError(subjectKey, input.currentLocale);
  }

  assertRouteTarget(currentRoute, subjectKey);

  const records = routeRegistry.getByTarget(input.subject.target);
  assertUniqueRouteLocales(subjectKey, records);

  return Promise.all(
    [...records].sort(compareByLocaleOrder).map(async (record) => {
      assertRouteTarget(record, subjectKey);

      return createVariant({
        locale: record.locale,
        route: record,
        segments: record.segments,
        indexable: await dependencies.indexabilityResolver.isIndexable(
          record.target,
          record.locale,
        ),
      });
    }),
  );
}

async function buildHomeVariants(
  homeIndexabilityResolver: SeoHomeIndexabilityResolver | undefined,
): Promise<readonly LocalizedRouteVariant[]> {
  return Promise.all(
    SUPPORTED_LOCALES.map(async (locale) =>
      createVariant({
        locale,
        route: null,
        segments: [],
        indexable:
          homeIndexabilityResolver === undefined
            ? true
            : await homeIndexabilityResolver.isHomeIndexable(locale),
      }),
    ),
  );
}

function createVariant(input: {
  readonly locale: Locale;
  readonly route: RouteRecord | null;
  readonly segments: readonly string[];
  readonly indexable: boolean;
}): LocalizedRouteVariant {
  return Object.freeze({
    locale: input.locale,
    hrefLang: LOCALES[input.locale].htmlLang,
    relativeUrl: buildLocalizedPath({
      locale: input.locale,
      segments: input.segments,
    }),
    absoluteUrl: buildAbsoluteUrl({
      locale: input.locale,
      segments: input.segments,
    }),
    route: input.route,
    published: true,
    indexable: input.indexable,
  });
}

function requireRouteRegistry(
  dependencies: LocalizedRouteClusterDependencies,
): Pick<RouteRegistry, 'getCanonical' | 'getByTarget'> {
  if (dependencies.routeRegistry === undefined) {
    throw new Error('Route subject cluster composition requires a route registry.');
  }

  return dependencies.routeRegistry;
}

function assertRouteTarget(record: RouteRecord, expectedSubjectKey: string): void {
  const actualSubjectKey = getRouteTargetKey(record.target);

  if (actualSubjectKey !== expectedSubjectKey) {
    throw new CanonicalTargetMismatchError(
      expectedSubjectKey,
      actualSubjectKey,
      record.locale,
      record.sourceId,
    );
  }
}

function assertUniqueRouteLocales(
  subjectKey: string,
  records: readonly RouteRecord[],
): void {
  const sourceIdsByLocale = new Map<Locale, string[]>();

  for (const record of records) {
    const sourceIds = sourceIdsByLocale.get(record.locale) ?? [];

    sourceIds.push(record.sourceId);
    sourceIdsByLocale.set(record.locale, sourceIds);
  }

  for (const [locale, sourceIds] of sourceIdsByLocale) {
    if (sourceIds.length > 1) {
      throw new DuplicateLocaleVariantError(subjectKey, locale, sourceIds);
    }
  }
}

function compareByLocaleOrder(
  first: RouteRecord,
  second: RouteRecord,
): number {
  return (
    SUPPORTED_LOCALES.indexOf(first.locale) -
    SUPPORTED_LOCALES.indexOf(second.locale)
  );
}
