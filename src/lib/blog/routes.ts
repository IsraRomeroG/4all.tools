import {
  BLOG_BASE_SEGMENT,
  BLOG_CATEGORIES,
  DEFAULT_LOCALE,
  SITE_URL,
  type BlogCategoryId,
  type Locale,
} from "./config.ts";

export interface AlternatePath {
  locale: Locale | "x-default";
  path: string;
}

export interface AlternateLink {
  locale: Locale | "x-default";
  href: string;
}

export function stripSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, "");
}

export function normalizePath(path: string): string {
  const cleanPath = path.trim();

  if (!cleanPath || cleanPath === "/") {
    return "/";
  }

  const [pathname, suffix = ""] = cleanPath.split(/([?#].*)/, 2);
  const normalizedPathname = `/${stripSlashes(pathname).replace(/\/{2,}/g, "/")}`;

  return normalizedPathname === "/" ? "/" : `${normalizedPathname.replace(/\/+$/g, "")}${suffix}`;
}

export function localePrefix(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? "" : `/${locale}`;
}

export function buildLocalizedPath(locale: Locale, segments: Array<string | number | undefined>): string {
  const cleanSegments = segments
    .filter((segment): segment is string | number => segment !== undefined && segment !== "")
    .map((segment) => stripSlashes(String(segment)))
    .filter(Boolean);

  return normalizePath(`${localePrefix(locale)}/${cleanSegments.join("/")}`);
}

export function buildBlogIndexPath(locale: Locale): string {
  return buildLocalizedPath(locale, [BLOG_BASE_SEGMENT]);
}

export function buildBlogPagePath(locale: Locale, page: number): string {
  return page <= 1
    ? buildBlogIndexPath(locale)
    : buildLocalizedPath(locale, [BLOG_BASE_SEGMENT, "page", page]);
}

export function getCategorySlug(locale: Locale, categoryId: BlogCategoryId): string {
  return BLOG_CATEGORIES[categoryId].slugs[locale];
}

export function getCategoryIdBySlug(locale: Locale, slug: string): BlogCategoryId | undefined {
  const cleanSlug = stripSlashes(slug);

  return Object.values(BLOG_CATEGORIES).find((category) => category.slugs[locale] === cleanSlug)?.id;
}

export function buildCategoryPath(locale: Locale, categoryId: BlogCategoryId): string {
  return buildLocalizedPath(locale, [BLOG_BASE_SEGMENT, getCategorySlug(locale, categoryId)]);
}

export function buildCategoryPagePath(locale: Locale, categoryId: BlogCategoryId, page: number): string {
  return page <= 1
    ? buildCategoryPath(locale, categoryId)
    : buildLocalizedPath(locale, [BLOG_BASE_SEGMENT, getCategorySlug(locale, categoryId), "page", page]);
}

export function buildPostPath(locale: Locale, categoryId: BlogCategoryId, slug: string): string {
  return buildLocalizedPath(locale, [BLOG_BASE_SEGMENT, getCategorySlug(locale, categoryId), slug]);
}

export function toAbsoluteUrl(path: string, site = SITE_URL): string {
  return new URL(normalizePath(path), site).toString();
}

export function buildAlternateLinks(alternates: AlternatePath[], site = SITE_URL): AlternateLink[] {
  return alternates.map((alternate) => ({
    locale: alternate.locale,
    href: toAbsoluteUrl(alternate.path, site),
  }));
}
