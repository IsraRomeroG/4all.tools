import { SITE_URL, TRAILING_SLASH_POLICY } from '@/config/site';
import { LOCALES, SUPPORTED_LOCALES } from '@/i18n/config';
import type { Locale } from '@/i18n/types';
import { RoutingInvariantError } from '@/routing/errors';

import { assertValidRouteSegment } from './segment-validation';

export interface BuildLocalizedPathInput {
  readonly locale: Locale;
  readonly segments: readonly string[];
}

export interface LocalizedUrlBuilderOptions {
  readonly site: URL;
}

export interface LocalizedUrlBuilder {
  buildRelative(input: BuildLocalizedPathInput): string;
  buildAbsolute(input: BuildLocalizedPathInput): string;
}

export function createLocalizedUrlBuilder(
  options: LocalizedUrlBuilderOptions,
): LocalizedUrlBuilder {
  return Object.freeze({
    buildRelative: (input: BuildLocalizedPathInput) => buildLocalizedPath(input),
    buildAbsolute: (input: BuildLocalizedPathInput) =>
      new URL(buildLocalizedPath(input), options.site).toString(),
  });
}

export function buildLocalizedPath(input: BuildLocalizedPathInput): string {
  assertValidLocalizedPathInput(input);

  const prefix = LOCALES[input.locale].pathPrefix;
  const pathSegments = prefix.length > 0 ? [prefix, ...input.segments] : input.segments;
  const path = `/${pathSegments.join('/')}`;

  return applyTrailingSlash(path);
}

export function buildAbsoluteUrl(input: BuildLocalizedPathInput): string {
  return DEFAULT_LOCALIZED_URL_BUILDER.buildAbsolute(input);
}

export const DEFAULT_LOCALIZED_URL_BUILDER = createLocalizedUrlBuilder({
  site: SITE_URL,
});

function assertValidLocalizedPathInput(
  input: BuildLocalizedPathInput,
): void {
  for (const segment of input.segments) {
    assertValidRouteSegment(segment, {
      locale: input.locale,
      segments: input.segments,
      source: 'localized-url-builder',
    });
  }

  const rootSegment = input.segments[0];

  if (rootSegment !== undefined && getLocaleNamespaceSegments().has(rootSegment)) {
    throw new RoutingInvariantError(
      'INVALID_SEGMENT',
      `Route segments for locale ${input.locale} must not include locale namespace ${rootSegment}.`,
      {
        locale: input.locale,
        localeNamespace: rootSegment,
        segments: input.segments,
      },
    );
  }
}

function applyTrailingSlash(path: string): string {
  if (TRAILING_SLASH_POLICY !== 'always') {
    return path;
  }

  return path.endsWith('/') ? path : `${path}/`;
}

function getLocaleNamespaceSegments(): ReadonlySet<string> {
  const segments = new Set<string>();

  for (const locale of SUPPORTED_LOCALES) {
    segments.add(locale);

    const pathPrefix = LOCALES[locale].pathPrefix;

    if (pathPrefix.length > 0) {
      segments.add(pathPrefix);
    }
  }

  return segments;
}
