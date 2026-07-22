import type { CollectionEntry } from 'astro:content';

import type {
  ArticleId,
  BlogCategoryId,
  ToolCategoryId,
  ToolId,
} from '@/domain/shared/ids';
import type { Locale } from '@/i18n/types';

import { getCollection } from './astro-content';
import { ContentNotFoundError, type ContentQueryContext } from './errors';
import type { ArticleContentEntry } from './blog';
import type { BlogCategoryContentEntry } from './blog-categories';
import { resolveExactMatch } from './shared';
import type { ToolCategoryContentEntry } from './tool-categories';
import type { ToolContentEntry } from './tools';

type IndexedCollectionName =
  | 'tools'
  | 'toolCategories'
  | 'blog'
  | 'blogCategories';

export interface ContentCollectionSource {
  getCollection<TCollection extends IndexedCollectionName>(
    collection: TCollection,
  ): Promise<readonly CollectionEntry<TCollection>[]>;
}

export const astroContentSource: ContentCollectionSource = {
  getCollection: (collection) => getCollection(collection),
};

export interface ToolContentKey {
  readonly toolId: ToolId;
  readonly locale: Locale;
}

export interface ToolCategoryContentKey {
  readonly categoryId: ToolCategoryId;
  readonly locale: Locale;
}

export interface ArticleContentKey {
  readonly articleId: ArticleId;
  readonly locale: Locale;
}

export interface BlogCategoryContentKey {
  readonly categoryId: BlogCategoryId;
  readonly locale: Locale;
}

export interface ContentIndex<TKey, TEntry> {
  find(key: TKey): TEntry | null;
  require(key: TKey): TEntry;
}

export interface LocaleListContentIndex<TKey, TEntry>
  extends ContentIndex<TKey, TEntry> {
  list(locale: Locale): readonly TEntry[];
}

export interface PublishedContentIndexes {
  readonly tools: ContentIndex<ToolContentKey, ToolContentEntry>;
  readonly toolCategories: ContentIndex<
    ToolCategoryContentKey,
    ToolCategoryContentEntry
  >;
  readonly blog: LocaleListContentIndex<
    ArticleContentKey,
    ArticleContentEntry
  >;
  readonly blogCategories: ContentIndex<
    BlogCategoryContentKey,
    BlogCategoryContentEntry
  >;
}

export interface ContentSourceSnapshot {
  readonly all: {
    readonly tools: readonly ToolContentEntry[];
    readonly toolCategories: readonly ToolCategoryContentEntry[];
    readonly blog: readonly ArticleContentEntry[];
    readonly blogCategories: readonly BlogCategoryContentEntry[];
  };
  readonly published: PublishedContentIndexes;
}

type PublishedEntry =
  | ToolContentEntry
  | ToolCategoryContentEntry
  | ArticleContentEntry
  | BlogCategoryContentEntry;

interface CreatePublishedIndexInput<TKey, TEntry extends PublishedEntry> {
  readonly entries: readonly TEntry[];
  readonly context: (key: TKey) => ContentQueryContext;
  readonly getEntityId: (entry: TEntry) => string;
  readonly getKey: (entry: TEntry) => TKey;
  readonly getKeyEntityId: (key: TKey) => string;
  readonly getKeyLocale: (key: TKey) => Locale;
  readonly includeLocaleList?: boolean;
  readonly compareEntries?: (first: TEntry, second: TEntry) => number;
}

export async function createPublishedContentIndexes(
  source: ContentCollectionSource = astroContentSource,
): Promise<PublishedContentIndexes> {
  return (await createContentSourceSnapshot(source)).published;
}

export async function createContentSourceSnapshot(
  source: ContentCollectionSource = astroContentSource,
): Promise<ContentSourceSnapshot> {
  const [tools, toolCategories, blog, blogCategories] = await Promise.all([
    source.getCollection('tools'),
    source.getCollection('toolCategories'),
    source.getCollection('blog'),
    source.getCollection('blogCategories'),
  ]);

  const all = Object.freeze({
    tools: freezeEntries(tools),
    toolCategories: freezeEntries(toolCategories),
    blog: freezeEntries(blog),
    blogCategories: freezeEntries(blogCategories),
  });

  return Object.freeze({
    all,
    published: createPublishedContentIndexesFromEntries(all),
  });
}

function createPublishedContentIndexesFromEntries(entries: {
  readonly tools: readonly ToolContentEntry[];
  readonly toolCategories: readonly ToolCategoryContentEntry[];
  readonly blog: readonly ArticleContentEntry[];
  readonly blogCategories: readonly BlogCategoryContentEntry[];
}): PublishedContentIndexes {
  return Object.freeze({
    tools: createPublishedIndex<ToolContentKey, ToolContentEntry>({
      entries: entries.tools,
      context: ({ toolId, locale }) => ({
        collection: 'tools',
        entityField: 'toolId',
        entityId: toolId,
        locale,
        status: 'published',
      }),
      getEntityId: (entry) => entry.data.toolId,
      getKey: (entry) => ({
        toolId: entry.data.toolId,
        locale: entry.data.locale,
      }),
      getKeyEntityId: (key) => key.toolId,
      getKeyLocale: (key) => key.locale,
    }),
    toolCategories: createPublishedIndex<
      ToolCategoryContentKey,
      ToolCategoryContentEntry
    >({
      entries: entries.toolCategories,
      context: ({ categoryId, locale }) => ({
        collection: 'toolCategories',
        entityField: 'categoryId',
        entityId: categoryId,
        locale,
        status: 'published',
      }),
      getEntityId: (entry) => entry.data.categoryId,
      getKey: (entry) => ({
        categoryId: entry.data.categoryId,
        locale: entry.data.locale,
      }),
      getKeyEntityId: (key) => key.categoryId,
      getKeyLocale: (key) => key.locale,
    }),
    blog: createPublishedIndex<ArticleContentKey, ArticleContentEntry>({
      entries: entries.blog,
      context: ({ articleId, locale }) => ({
        collection: 'blog',
        entityField: 'articleId',
        entityId: articleId,
        locale,
        status: 'published',
      }),
      getEntityId: (entry) => entry.data.articleId,
      getKey: (entry) => ({
        articleId: entry.data.articleId,
        locale: entry.data.locale,
      }),
      getKeyEntityId: (key) => key.articleId,
      getKeyLocale: (key) => key.locale,
      includeLocaleList: true,
      compareEntries: comparePublishedArticles,
    }),
    blogCategories: createPublishedIndex<
      BlogCategoryContentKey,
      BlogCategoryContentEntry
    >({
      entries: entries.blogCategories,
      context: ({ categoryId, locale }) => ({
        collection: 'blogCategories',
        entityField: 'categoryId',
        entityId: categoryId,
        locale,
        status: 'published',
      }),
      getEntityId: (entry) => entry.data.categoryId,
      getKey: (entry) => ({
        categoryId: entry.data.categoryId,
        locale: entry.data.locale,
      }),
      getKeyEntityId: (key) => key.categoryId,
      getKeyLocale: (key) => key.locale,
    }),
  });
}

function freezeEntries<TEntry>(entries: readonly TEntry[]): readonly TEntry[] {
  return Object.freeze([...entries]);
}

function createPublishedIndex<TKey, TEntry extends PublishedEntry>(
  input: CreatePublishedIndexInput<TKey, TEntry> & {
    readonly includeLocaleList: true;
  },
): LocaleListContentIndex<TKey, TEntry>;
function createPublishedIndex<TKey, TEntry extends PublishedEntry>(
  input: CreatePublishedIndexInput<TKey, TEntry>,
): ContentIndex<TKey, TEntry>;
function createPublishedIndex<TKey, TEntry extends PublishedEntry>(
  input: CreatePublishedIndexInput<TKey, TEntry>,
): ContentIndex<TKey, TEntry> | LocaleListContentIndex<TKey, TEntry> {
  const entriesByLocale = new Map<Locale, Map<string, TEntry[]>>();
  const entriesByLocaleList = new Map<Locale, TEntry[]>();

  for (const entry of input.entries) {
    if (entry.data.status !== 'published') {
      continue;
    }

    const localeEntries =
      entriesByLocale.get(entry.data.locale) ?? new Map<string, TEntry[]>();
    const entityId = input.getEntityId(entry);
    const matches = localeEntries.get(entityId) ?? [];

    matches.push(entry);
    localeEntries.set(entityId, matches);
    entriesByLocale.set(entry.data.locale, localeEntries);

    const localeEntriesList =
      entriesByLocaleList.get(entry.data.locale) ?? [];
    localeEntriesList.push(entry);
    entriesByLocaleList.set(entry.data.locale, localeEntriesList);
  }

  const find = (key: TKey): TEntry | null => {
    const matches =
      entriesByLocale
        .get(input.getKeyLocale(key))
        ?.get(input.getKeyEntityId(key)) ?? [];

    return resolveExactMatch(matches, input.context(key));
  };

  const index = {
    find,
    require: (key: TKey) => {
      const entry = find(key);

      if (entry === null) {
        throw new ContentNotFoundError(input.context(key));
      }

      return entry;
    },
  } satisfies ContentIndex<TKey, TEntry>;

  if (!input.includeLocaleList) {
    return Object.freeze(index);
  }

  return Object.freeze({
    ...index,
    list: (locale: Locale) => {
      const entries = entriesByLocaleList.get(locale) ?? [];

      for (const entry of entries) {
        const matches =
          entriesByLocale.get(locale)?.get(input.getEntityId(entry)) ?? [];

        resolveExactMatch(matches, input.context(input.getKey(entry)));
      }

      return Object.freeze(
        [...entries].sort(input.compareEntries ?? (() => 0)),
      );
    },
  });
}

function comparePublishedArticles(
  first: ArticleContentEntry,
  second: ArticleContentEntry,
): number {
  const byDate =
    second.data.publishedAt.getTime() - first.data.publishedAt.getTime();

  if (byDate !== 0) {
    return byDate;
  }

  return compareStableIds(first.data.articleId, second.data.articleId);
}

function compareStableIds(first: string, second: string): number {
  return first < second ? -1 : first > second ? 1 : 0;
}

let publishedContentIndexesPromise:
  | Promise<PublishedContentIndexes>
  | undefined;
let contentSourceSnapshotPromise: Promise<ContentSourceSnapshot> | undefined;

export function getContentSourceSnapshot(): Promise<ContentSourceSnapshot> {
  // Astro dev keeps the content store mutable across page reloads; rebuild there
  // so authoring changes are visible instead of favoring a stale singleton.
  if (import.meta.env.DEV) {
    return createContentSourceSnapshot();
  }

  contentSourceSnapshotPromise ??= createContentSourceSnapshot();

  return contentSourceSnapshotPromise;
}

export function getPublishedContentIndexes(): Promise<PublishedContentIndexes> {
  if (import.meta.env.DEV) {
    return getContentSourceSnapshot().then((snapshot) => snapshot.published);
  }

  publishedContentIndexesPromise ??= getContentSourceSnapshot().then(
    (snapshot) => snapshot.published,
  );

  return publishedContentIndexesPromise;
}

export function resetPublishedContentIndexesForTesting(): void {
  resetContentSourceSnapshotForTesting();
}

export function resetContentSourceSnapshotForTesting(): void {
  publishedContentIndexesPromise = undefined;
  contentSourceSnapshotPromise = undefined;
}
