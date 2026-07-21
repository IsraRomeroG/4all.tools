import { SITE_URL, TRAILING_SLASH_POLICY } from '@/config/site';
import { LOCALES } from '@/i18n/config';
import { isLocale } from '@/i18n/guards';
import type { Locale } from '@/i18n/types';

import {
  DuplicateSeoAlternateError,
  InvalidSeoAlternateError,
  InvalidSeoDescriptionError,
  InvalidSeoTitleError,
  InvalidSeoUrlError,
  type SeoUrlPurpose,
} from './errors';
import type {
  SeoLocaleAlternate,
  SeoOpenGraphImage,
  SeoOpenGraphModel,
  SeoPageModel,
  SeoRobotsModel,
} from './types';

export interface CreateSeoPageModelInput {
  readonly title: string;
  readonly description: string;
  readonly canonicalUrl: string;
  readonly noindex?: boolean;
  readonly alternates?: readonly SeoLocaleAlternate[];
  readonly xDefaultUrl?: string;
  readonly openGraphType?: SeoOpenGraphModel['type'];
  readonly openGraphImage?: SeoOpenGraphImage;
  readonly siteUrl?: URL;
}

export function createSeoPageModel(
  input: CreateSeoPageModelInput,
): SeoPageModel {
  const siteUrl = input.siteUrl ?? SITE_URL;
  const title = normalizeTitle(input.title);
  const description = normalizeDescription(input.description);
  const canonicalUrl = assertCanonicalUrl(input.canonicalUrl, siteUrl);
  const alternates = normalizeAlternates(input.alternates ?? [], siteUrl);
  const image =
    input.openGraphImage === undefined
      ? undefined
      : normalizeOpenGraphImage(input.openGraphImage);

  return Object.freeze({
    title,
    description,
    canonicalUrl,
    robots: normalizeRobots(input.noindex ?? false),
    alternates,
    ...(input.xDefaultUrl === undefined
      ? {}
      : { xDefaultUrl: assertCanonicalUrl(input.xDefaultUrl, siteUrl, 'x-default') }),
    openGraph: Object.freeze({
      type: input.openGraphType ?? 'website',
      title,
      description,
      url: canonicalUrl,
      siteName: '4all.tools',
      ...(image === undefined ? {} : { image }),
    }),
  });
}

export function serializeRobots(robots: SeoRobotsModel): string {
  return `${robots.index ? 'index' : 'noindex'},follow`;
}

export function assertCanonicalUrl(
  url: string,
  siteUrl: URL = SITE_URL,
  purpose: SeoUrlPurpose = 'canonical',
): string {
  const parsed = parseAbsoluteUrl(url, purpose);

  if (parsed.protocol !== 'https:') {
    throw new InvalidSeoUrlError(url, 'expected HTTPS', purpose);
  }

  if (parsed.origin !== siteUrl.origin) {
    throw new InvalidSeoUrlError(
      url,
      `expected same origin as ${siteUrl.origin}`,
      purpose,
    );
  }

  if (parsed.search !== '') {
    throw new InvalidSeoUrlError(url, 'query parameters are not allowed', purpose);
  }

  if (parsed.hash !== '') {
    throw new InvalidSeoUrlError(url, 'fragments are not allowed', purpose);
  }

  if (TRAILING_SLASH_POLICY === 'always' && !parsed.pathname.endsWith('/')) {
    throw new InvalidSeoUrlError(
      url,
      'expected a trailing slash',
      purpose,
    );
  }

  return parsed.toString();
}

function normalizeTitle(title: string): string {
  const normalized = title.trim();

  if (normalized.length === 0) {
    throw new InvalidSeoTitleError();
  }

  return normalized;
}

function normalizeDescription(description: string): string {
  const normalized = description.trim();

  if (normalized.length === 0) {
    throw new InvalidSeoDescriptionError();
  }

  return normalized;
}

function normalizeRobots(noindex: boolean): SeoRobotsModel {
  return Object.freeze({
    index: !noindex,
    follow: true,
  });
}

function normalizeAlternates(
  alternates: readonly SeoLocaleAlternate[],
  siteUrl: URL,
): readonly SeoLocaleAlternate[] {
  const locales = new Set<Locale>();
  const hrefLangs = new Set<string>();
  const urls = new Set<string>();

  return Object.freeze(
    alternates.map((alternate) => {
      if (!isLocale(alternate.locale)) {
        throw new InvalidSeoAlternateError(
          `unsupported locale "${String(alternate.locale)}"`,
        );
      }

      const hrefLang = alternate.hrefLang.trim();
      const expectedHrefLang = LOCALES[alternate.locale].htmlLang;

      if (hrefLang.length === 0) {
        throw new InvalidSeoAlternateError('hrefLang must be non-empty');
      }

      if (hrefLang !== expectedHrefLang) {
        throw new InvalidSeoAlternateError(
          `hrefLang "${hrefLang}" does not match locale "${alternate.locale}"`,
        );
      }

      const url = assertCanonicalUrl(alternate.url, siteUrl, 'alternate');

      assertUnique(locales, alternate.locale, 'locale');
      assertUnique(hrefLangs, hrefLang, 'hrefLang');
      assertUnique(urls, url, 'url');

      return Object.freeze({
        locale: alternate.locale,
        hrefLang,
        url,
      });
    }),
  );
}

function normalizeOpenGraphImage(
  image: SeoOpenGraphImage,
): SeoOpenGraphImage {
  const url = parseAbsoluteUrl(image.url, 'open-graph-image').toString();
  const alt = image.alt.trim();

  if (alt.length === 0) {
    throw new InvalidSeoAlternateError('Open Graph image alt must be non-empty');
  }

  return Object.freeze({
    url,
    alt,
    ...(image.width === undefined ? {} : { width: image.width }),
    ...(image.height === undefined ? {} : { height: image.height }),
  });
}

function parseAbsoluteUrl(url: string, purpose: SeoUrlPurpose): URL {
  if (url.trim() !== url || url.length === 0) {
    throw new InvalidSeoUrlError(url, 'expected an absolute URL', purpose);
  }

  try {
    return new URL(url);
  } catch {
    throw new InvalidSeoUrlError(url, 'expected an absolute URL', purpose);
  }
}

function assertUnique<T extends string>(
  values: Set<T>,
  value: T,
  field: 'locale' | 'hrefLang' | 'url',
): void {
  if (values.has(value)) {
    throw new DuplicateSeoAlternateError(field, value);
  }

  values.add(value);
}
