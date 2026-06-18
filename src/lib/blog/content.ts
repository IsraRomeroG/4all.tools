import { getCollection, type CollectionEntry } from "astro:content";
import {
  BLOG_CATEGORIES,
  BLOG_UI,
  DEFAULT_LOCALE,
  POSTS_PER_PAGE,
  SUPPORTED_LOCALES,
  type BlogCategoryDefinition,
  type BlogCategoryId,
  type Locale,
} from "./config.ts";
import {
  buildAlternateLinks,
  buildBlogPagePath,
  buildCategoryPagePath,
  buildPostPath,
  type AlternateLink,
  type AlternatePath,
} from "./routes.ts";
import { assertValidBlogRecords, getGroupFromEntryId } from "./validation.ts";

export type BlogEntry = CollectionEntry<"blog">;

export interface BlogPost {
  entry: BlogEntry;
  group: string;
  locale: Locale;
  slug: string;
  categoryId: BlogCategoryId;
  category: BlogCategoryDefinition;
  categorySlug: string;
  path: string;
  title: string;
  description: string;
  publishedAt: Date;
  updatedAt: Date;
  tags: string[];
  relatedTools: Array<{ label: string; href: string }>;
  relatedPosts: string[];
  readingMinutes: number;
}

export interface PaginatedBlogPosts {
  items: BlogPost[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

let cachedPublishedPosts: BlogPost[] | undefined;

function estimateReadingMinutes(body: string | undefined): number {
  const words = (body ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function sortPosts(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => {
    const dateDifference = b.publishedAt.getTime() - a.publishedAt.getTime();
    return dateDifference === 0 ? a.title.localeCompare(b.title) : dateDifference;
  });
}

function normalizeEntry(entry: BlogEntry): BlogPost {
  const group = getGroupFromEntryId(entry.id);
  const locale = entry.data.locale;
  const categoryId = entry.data.categoryId;
  const category = BLOG_CATEGORIES[categoryId];

  return {
    entry,
    group,
    locale,
    slug: entry.data.slug,
    categoryId,
    category,
    categorySlug: category.slugs[locale],
    path: buildPostPath(locale, categoryId, entry.data.slug),
    title: entry.data.title,
    description: entry.data.description,
    publishedAt: entry.data.publishedAt,
    updatedAt: entry.data.updatedAt ?? entry.data.publishedAt,
    tags: entry.data.tags,
    relatedTools: entry.data.relatedTools,
    relatedPosts: entry.data.relatedPosts,
    readingMinutes: estimateReadingMinutes(entry.body),
  };
}

async function loadPublishedPosts(): Promise<BlogPost[]> {
  const entries = await getCollection("blog");
  const records = entries.map((entry) => ({
    id: entry.id,
    group: getGroupFromEntryId(entry.id),
    locale: entry.data.locale,
    categoryId: entry.data.categoryId,
    slug: entry.data.slug,
    status: entry.data.status,
  }));

  assertValidBlogRecords(records);

  return sortPosts(
    entries.filter((entry) => entry.data.status === "published").map((entry) => normalizeEntry(entry)),
  );
}

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  cachedPublishedPosts ??= await loadPublishedPosts();
  return cachedPublishedPosts;
}

export function getPostsByLocale(posts: BlogPost[], locale: Locale): BlogPost[] {
  return posts.filter((post) => post.locale === locale);
}

export function getPostsByCategory(posts: BlogPost[], locale: Locale, categoryId: BlogCategoryId): BlogPost[] {
  return posts.filter((post) => post.locale === locale && post.categoryId === categoryId);
}

export function paginateBlogPosts(
  posts: BlogPost[],
  page: number,
  pageSize = POSTS_PER_PAGE,
): PaginatedBlogPosts {
  const totalItems = posts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: posts.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
  };
}

export async function getPostTranslations(group: string): Promise<BlogPost[]> {
  const posts = await getPublishedBlogPosts();
  return SUPPORTED_LOCALES.flatMap((locale) =>
    posts.filter((post) => post.group === group && post.locale === locale),
  );
}

export async function getRelatedPosts(post: BlogPost, limit = 3): Promise<BlogPost[]> {
  const posts = await getPublishedBlogPosts();
  const explicitRelated = post.relatedPosts
    .map((group) => posts.find((candidate) => candidate.group === group && candidate.locale === post.locale))
    .filter((candidate): candidate is BlogPost => Boolean(candidate));

  const categoryRelated = posts.filter(
    (candidate) =>
      candidate.locale === post.locale &&
      candidate.group !== post.group &&
      candidate.categoryId === post.categoryId &&
      !explicitRelated.some((related) => related.group === candidate.group),
  );

  return [...explicitRelated, ...categoryRelated].slice(0, limit);
}

export function getAvailableCategories(posts: BlogPost[], locale: Locale): BlogCategoryDefinition[] {
  return Object.values(BLOG_CATEGORIES).filter((category) =>
    posts.some((post) => post.locale === locale && post.categoryId === category.id),
  );
}

export function getCategoryPostCount(posts: BlogPost[], locale: Locale, categoryId: BlogCategoryId): number {
  return getPostsByCategory(posts, locale, categoryId).length;
}

function alternatesWithDefault(alternates: AlternatePath[]): AlternateLink[] {
  const english = alternates.find((alternate) => alternate.locale === DEFAULT_LOCALE);
  const withDefault = english ? [...alternates, { locale: "x-default" as const, path: english.path }] : alternates;
  return buildAlternateLinks(withDefault);
}

export async function getBlogIndexAlternates(page = 1): Promise<AlternateLink[]> {
  const posts = await getPublishedBlogPosts();
  const alternates = SUPPORTED_LOCALES.flatMap((locale) => {
    const localePosts = getPostsByLocale(posts, locale);
    const totalPages = paginateBlogPosts(localePosts, page).totalPages;
    return localePosts.length > 0 && page <= totalPages ? [{ locale, path: buildBlogPagePath(locale, page) }] : [];
  });

  return alternatesWithDefault(alternates);
}

export async function getCategoryAlternates(categoryId: BlogCategoryId, page = 1): Promise<AlternateLink[]> {
  const posts = await getPublishedBlogPosts();
  const alternates = SUPPORTED_LOCALES.flatMap((locale) => {
    const totalPages = paginateBlogPosts(getPostsByCategory(posts, locale, categoryId), page).totalPages;
    const hasPosts = getPostsByCategory(posts, locale, categoryId).length > 0;
    return hasPosts && page <= totalPages
      ? [{ locale, path: buildCategoryPagePath(locale, categoryId, page) }]
      : [];
  });

  return alternatesWithDefault(alternates);
}

export function getPostAlternates(translations: BlogPost[]): AlternateLink[] {
  const alternates = translations.map((post) => ({
    locale: post.locale,
    path: post.path,
  }));

  return alternatesWithDefault(alternates);
}

export function getReadingTimeLabel(post: BlogPost): string {
  return `${post.readingMinutes} ${BLOG_UI[post.locale].minuteRead}`;
}

export function formatBlogDate(locale: Locale, date: Date): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
