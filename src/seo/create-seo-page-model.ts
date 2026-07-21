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
  NoindexSeoAlternateConflictError,
  type SeoUrlPurpose,
} from './errors';
import type {
  IndexableSeoPageModel,
  IndexableSeoRobotsModel,
  NoindexSeoPageModel,
  NoindexSeoRobotsModel,
  SeoLocaleAlternate,
  SeoOpenGraphImage,
  SeoOpenGraphModel,
  SeoRobotsModel,
} from './types';

interface SeoBaseInput {
  readonly title: string;
  readonly description: string;
  readonly canonicalUrl: string;
  readonly openGraphType?: SeoOpenGraphModel['type'];
  readonly openGraphImage?: SeoOpenGraphImage;
  readonly siteUrl?: URL;
}

export interface CreateIndexableSeoPageModelInput extends SeoBaseInput {
  readonly noindex?: false;
  readonly alternates?: readonly SeoLocaleAlternate[];
  readonly xDefaultUrl?: string;
}

export interface CreateNoindexSeoPageModelInput extends SeoBaseInput {
  readonly noindex: true;
  readonly alternates?: readonly [];
  readonly xDefaultUrl?: never;
}

export type CreateSeoPageModelInput =
  | CreateIndexableSeoPageModelInput
  | CreateNoindexSeoPageModelInput;

export function createSeoPageModel(
  input: CreateIndexableSeoPageModelInput,
): IndexableSeoPageModel;
export function createSeoPageModel(
  input: CreateNoindexSeoPageModelInput,
): NoindexSeoPageModel;
export function createSeoPageModel(
  input: CreateSeoPageModelInput,
): IndexableSeoPageModel | NoindexSeoPageModel;
export function createSeoPageModel(
  input: CreateSeoPageModelInput,
): IndexableSeoPageModel | NoindexSeoPageModel {
  const siteUrl = input.siteUrl ?? SITE_URL;
  const title = normalizeTitle(input.title);
  const description = normalizeDescription(input.description);
  const canonicalUrl = assertCanonicalUrl(input.canonicalUrl, siteUrl);
  const image =
    input.openGraphImage === undefined
      ? undefined
      : normalizeOpenGraphImage(input.openGraphImage);

  const openGraph = Object.freeze({
    type: input.openGraphType ?? 'website',
    title,
    description,
    url: canonicalUrl,
    siteName: '4all.tools',
    ...(image === undefined ? {} : { image }),
  });

  if (input.noindex === true) {
    assertNoindexSeoConflicts(input, canonicalUrl);

    return Object.freeze({
      title,
      description,
      canonicalUrl,
      robots: normalizeRobots(false),
      alternates: Object.freeze([] as const),
      openGraph,
    });
  }

  const alternates = normalizeAlternates(input.alternates ?? [], siteUrl);

  return Object.freeze({
    title,
    description,
    canonicalUrl,
    robots: normalizeRobots(true),
    alternates,
    ...(input.xDefaultUrl === undefined
      ? {}
      : { xDefaultUrl: assertCanonicalUrl(input.xDefaultUrl, siteUrl, 'x-default') }),
    openGraph,
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

function normalizeRobots(indexable: true): IndexableSeoRobotsModel;
function normalizeRobots(indexable: false): NoindexSeoRobotsModel;
function normalizeRobots(indexable: boolean): SeoRobotsModel {
  return Object.freeze({
    index: indexable,
    follow: true,
  });
}

function assertNoindexSeoConflicts(
  input: CreateNoindexSeoPageModelInput,
  canonicalUrl: string,
): void {
  if (input.alternates !== undefined && input.alternates.length > 0) {
    throw new NoindexSeoAlternateConflictError('alternates', canonicalUrl);
  }

  if (Object.prototype.hasOwnProperty.call(input, 'xDefaultUrl')) {
    throw new NoindexSeoAlternateConflictError('x-default', canonicalUrl);
  }
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
