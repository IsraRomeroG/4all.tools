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

export interface PublishedContentIndexes {
  readonly tools: ContentIndex<ToolContentKey, ToolContentEntry>;
  readonly toolCategories: ContentIndex<
    ToolCategoryContentKey,
    ToolCategoryContentEntry
  >;
  readonly blog: ContentIndex<ArticleContentKey, ArticleContentEntry>;
  readonly blogCategories: ContentIndex<
    BlogCategoryContentKey,
    BlogCategoryContentEntry
  >;
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
  readonly getKeyEntityId: (key: TKey) => string;
  readonly getKeyLocale: (key: TKey) => Locale;
}

export async function createPublishedContentIndexes(
  source: ContentCollectionSource = astroContentSource,
): Promise<PublishedContentIndexes> {
  const [tools, toolCategories, blog, blogCategories] = await Promise.all([
    source.getCollection('tools'),
    source.getCollection('toolCategories'),
    source.getCollection('blog'),
    source.getCollection('blogCategories'),
  ]);

  return Object.freeze({
    tools: createPublishedIndex<ToolContentKey, ToolContentEntry>({
      entries: tools,
      context: ({ toolId, locale }) => ({
        collection: 'tools',
        entityField: 'toolId',
        entityId: toolId,
        locale,
        status: 'published',
      }),
      getEntityId: (entry) => entry.data.toolId,
      getKeyEntityId: (key) => key.toolId,
      getKeyLocale: (key) => key.locale,
    }),
    toolCategories: createPublishedIndex<
      ToolCategoryContentKey,
      ToolCategoryContentEntry
    >({
      entries: toolCategories,
      context: ({ categoryId, locale }) => ({
        collection: 'toolCategories',
        entityField: 'categoryId',
        entityId: categoryId,
        locale,
        status: 'published',
      }),
      getEntityId: (entry) => entry.data.categoryId,
      getKeyEntityId: (key) => key.categoryId,
      getKeyLocale: (key) => key.locale,
    }),
    blog: createPublishedIndex<ArticleContentKey, ArticleContentEntry>({
      entries: blog,
      context: ({ articleId, locale }) => ({
        collection: 'blog',
        entityField: 'articleId',
        entityId: articleId,
        locale,
        status: 'published',
      }),
      getEntityId: (entry) => entry.data.articleId,
      getKeyEntityId: (key) => key.articleId,
      getKeyLocale: (key) => key.locale,
    }),
    blogCategories: createPublishedIndex<
      BlogCategoryContentKey,
      BlogCategoryContentEntry
    >({
      entries: blogCategories,
      context: ({ categoryId, locale }) => ({
        collection: 'blogCategories',
        entityField: 'categoryId',
        entityId: categoryId,
        locale,
        status: 'published',
      }),
      getEntityId: (entry) => entry.data.categoryId,
      getKeyEntityId: (key) => key.categoryId,
      getKeyLocale: (key) => key.locale,
    }),
  });
}

function createPublishedIndex<TKey, TEntry extends PublishedEntry>(
  input: CreatePublishedIndexInput<TKey, TEntry>,
): ContentIndex<TKey, TEntry> {
  const entriesByLocale = new Map<Locale, Map<string, TEntry[]>>();

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
  }

  const find = (key: TKey): TEntry | null => {
    const matches =
      entriesByLocale
        .get(input.getKeyLocale(key))
        ?.get(input.getKeyEntityId(key)) ?? [];

    return resolveExactMatch(matches, input.context(key));
  };

  return Object.freeze({
    find,
    require: (key: TKey) => {
      const entry = find(key);

      if (entry === null) {
        throw new ContentNotFoundError(input.context(key));
      }

      return entry;
    },
  });
}

let publishedContentIndexesPromise:
  | Promise<PublishedContentIndexes>
  | undefined;

export function getPublishedContentIndexes(): Promise<PublishedContentIndexes> {
  // Astro dev keeps the content store mutable across page reloads; rebuild there
  // so authoring changes are visible instead of favoring a stale singleton.
  if (import.meta.env.DEV) {
    return createPublishedContentIndexes();
  }

  publishedContentIndexesPromise ??= createPublishedContentIndexes();

  return publishedContentIndexesPromise;
}

export function resetPublishedContentIndexesForTesting(): void {
  publishedContentIndexesPromise = undefined;
}
