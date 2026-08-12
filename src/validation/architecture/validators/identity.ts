import type {
  ArticleContentEntry,
  BlogCategoryContentEntry,
  SitePageContentEntry,
  ToolCategoryContentEntry,
  ToolContentEntry,
} from '@/content/queries';
import type { ToolDefinition } from '@/domain/tools';
import type { Locale } from '@/i18n/types';

import {
  compareArchitectureValidationIssues,
  createArchitectureValidationIssue,
} from '../report';
import type {
  ArchitectureValidationContext,
} from '../context';
import type { ArchitectureValidationIssue } from '../types';

type ContentIdentityEntry =
  | ToolContentEntry
  | ToolCategoryContentEntry
  | ArticleContentEntry
  | BlogCategoryContentEntry
  | SitePageContentEntry;

interface IdentityMatch {
  readonly entry: ContentIdentityEntry;
  readonly status: string;
}

export function validateContentIdentities(
  context: Pick<ArchitectureValidationContext, 'content'>,
): readonly ArchitectureValidationIssue[] {
  const issues: ArchitectureValidationIssue[] = [];
  const groups = new Map<string, IdentityMatch[]>();

  for (const [collection, entries] of contentCollections(context.content)) {
    for (const entry of entries) {
      const identity = getContentIdentity(collection, entry);
      const key = `${collection}:${identity.id}:${identity.locale}`;
      const matches = groups.get(key) ?? [];

      matches.push({ entry, status: entry.data.status });
      groups.set(key, matches);
    }
  }

  for (const [key, matches] of [...groups].sort(([first], [second]) =>
    compareText(first, second),
  )) {
    if (matches.length < 2) {
      continue;
    }

    const [collection = '', entityKey = '', locale = 'en'] = key.split(':');
    const sortedMatches = [...matches].sort((first, second) =>
      compareText(first.entry.id, second.entry.id),
    );

    issues.push(
      createArchitectureValidationIssue({
        code: 'DUPLICATE_CONTENT_IDENTITY',
        scope: 'content',
        message: `Duplicate ${collection} content identity ${entityKey}:${locale}.`,
        entityKey,
        locale: locale as Locale,
        ...(sortedMatches[0] === undefined
          ? {}
          : { sourceId: sortedMatches[0].entry.id }),
        details: {
          collection,
          matches: sortedMatches.map((match) => ({
            entryId: match.entry.id,
            status: match.status,
          })),
        },
      }),
    );
  }

  return sortIssues(issues);
}

export function validateTaxonomyReferences(
  context: Pick<
    ArchitectureValidationContext,
    'content' | 'toolRegistry' | 'toolTaxonomy' | 'blogTaxonomy'
  >,
): readonly ArchitectureValidationIssue[] {
  const issues: ArchitectureValidationIssue[] = [];

  for (const entry of context.content.all.tools) {
    if (context.toolRegistry.find(entry.data.toolId)) {
      continue;
    }

    issues.push(
      createArchitectureValidationIssue({
        code: 'UNKNOWN_TOOL_CONTENT_ID',
        scope: 'identity',
        message: `Tool content references unknown tool ${entry.data.toolId}.`,
        entityKey: entry.data.toolId,
        locale: entry.data.locale,
        sourceId: entry.id,
      }),
    );
  }

  for (const entry of context.content.all.toolCategories) {
    if (context.toolTaxonomy.hasNode(entry.data.categoryId)) {
      continue;
    }

    issues.push(
      createArchitectureValidationIssue({
        code: 'UNKNOWN_TOOL_CATEGORY_CONTENT_ID',
        scope: 'taxonomy',
        message: `Tool-category content references unknown category ${entry.data.categoryId}.`,
        entityKey: entry.data.categoryId,
        locale: entry.data.locale,
        sourceId: entry.id,
      }),
    );
  }

  for (const entry of context.content.all.blogCategories) {
    if (context.blogTaxonomy.hasNode(entry.data.categoryId)) {
      continue;
    }

    issues.push(
      createArchitectureValidationIssue({
        code: 'UNKNOWN_BLOG_CATEGORY_CONTENT_ID',
        scope: 'taxonomy',
        message: `Blog-category content references unknown category ${entry.data.categoryId}.`,
        entityKey: entry.data.categoryId,
        locale: entry.data.locale,
        sourceId: entry.id,
      }),
    );
  }

  const articleCategories = new Map<string, Map<string, ArticleContentEntry[]>>();

  for (const entry of context.content.all.blog) {
    if (!context.blogTaxonomy.hasNode(entry.data.primaryCategoryId)) {
      issues.push(
        createArchitectureValidationIssue({
          code: 'UNKNOWN_ARTICLE_PRIMARY_CATEGORY',
          scope: 'taxonomy',
          message: `Article references unknown primary category ${entry.data.primaryCategoryId}.`,
          entityKey: entry.data.articleId,
          locale: entry.data.locale,
          sourceId: entry.id,
          details: { categoryId: entry.data.primaryCategoryId },
        }),
      );
    }

    for (const categoryId of entry.data.secondaryCategoryIds) {
      if (context.blogTaxonomy.hasNode(categoryId)) {
        continue;
      }

      issues.push(
        createArchitectureValidationIssue({
          code: 'UNKNOWN_ARTICLE_SECONDARY_CATEGORY',
          scope: 'taxonomy',
          message: `Article references unknown secondary category ${categoryId}.`,
          entityKey: entry.data.articleId,
          locale: entry.data.locale,
          sourceId: entry.id,
          details: { categoryId },
        }),
      );
    }

    const categories = articleCategories.get(entry.data.articleId) ?? new Map();
    const entriesForCategory = categories.get(entry.data.primaryCategoryId) ?? [];

    entriesForCategory.push(entry);
    categories.set(entry.data.primaryCategoryId, entriesForCategory);
    articleCategories.set(entry.data.articleId, categories);
  }

  for (const [articleId, categories] of [...articleCategories].sort(([first], [second]) =>
    compareText(first, second),
  )) {
    if (categories.size < 2) {
      continue;
    }

    const categoryDetails = [...categories]
      .sort(([first], [second]) => compareText(first, second))
      .map(([categoryId, entries]) => ({
        categoryId,
        entries: [...entries]
          .sort((first, second) => compareText(first.id, second.id))
          .map((entry) => ({ locale: entry.data.locale, sourceId: entry.id })),
      }));

    issues.push(
      createArchitectureValidationIssue({
        code: 'ARTICLE_TRANSLATION_PRIMARY_CATEGORY_MISMATCH',
        scope: 'taxonomy',
        message: `Article translations disagree on primary category for ${articleId}.`,
        entityKey: articleId,
        ...(categoryDetails[0]?.entries[0]?.sourceId === undefined
          ? {}
          : { sourceId: categoryDetails[0].entries[0].sourceId }),
        details: { categories: categoryDetails },
      }),
    );
  }

  return sortIssues(issues);
}

export function validateToolRegistryIntegrity(
  context: Pick<
    ArchitectureValidationContext,
    'toolRegistry' | 'toolTaxonomy'
  >,
): readonly ArchitectureValidationIssue[] {
  const issues: ArchitectureValidationIssue[] = [];
  const modules = context.toolRegistry.getAll();

  for (const module of modules) {
    const definition = module.definition;
    if (definition.status !== 'published') {
      continue;
    }

    if (module.component === null || module.component === undefined) {
      issues.push(
        createArchitectureValidationIssue({
          code: 'MISSING_TOOL_MODULE_COMPONENT',
          scope: 'tool-module',
          message: `Tool module ${definition.id} has no component.`,
          entityKey: definition.id,
        }),
      );
    }

    if (typeof module.getMessages !== 'function') {
      issues.push(
        createArchitectureValidationIssue({
          code: 'MISSING_TOOL_MODULE_MESSAGES',
          scope: 'tool-module',
          message: `Tool module ${definition.id} has no message resolver.`,
          entityKey: definition.id,
        }),
      );
    }

    validateSourceDirectory(issues, definition);
  }

  return sortIssues(issues);
}

function validateSourceDirectory(
  issues: ArchitectureValidationIssue[],
  definition: ToolDefinition,
): void {
  const expected = expectedFeaturePath(definition);
  const sourceDirectory = new URL(
    `../../../features/tools/${expected}/`,
    import.meta.url,
  );

  if (exists(sourceDirectory)) {
    return;
  }

  issues.push(
    createArchitectureValidationIssue({
      code: 'TOOL_FEATURE_PATH_MISMATCH',
      scope: 'tool-module',
      message: `Tool feature directory for ${definition.id} must exist at ${expected}.`,
      entityKey: definition.id,
      details: { expected },
    }),
  );
}

function expectedFeaturePath(definition: ToolDefinition): string {
  const categorySegments = definition.route.strategy === 'flat'
    ? [definition.rootCategoryId]
    : [definition.rootCategoryId, definition.taxonomy.primaryCategoryId];

  return [...categorySegments, definition.route.localized.en?.slug ?? ''].join('/');
}

function exists(directory: URL): boolean {
  try {
    accessSync(directory);
    return true;
  } catch {
    return false;
  }
}

function contentCollections(
  content: ArchitectureValidationContext['content'],
): readonly [string, readonly ContentIdentityEntry[]][] {
  return [
    ['tools', content.all.tools],
    ['toolCategories', content.all.toolCategories],
    ['blog', content.all.blog],
    ['blogCategories', content.all.blogCategories],
    ['sitePages', content.all.sitePages],
  ];
}

function getContentIdentity(
  collection: string,
  entry: ContentIdentityEntry,
): { readonly id: string; readonly locale: Locale } {
  switch (collection) {
    case 'tools':
      return { id: (entry as ToolContentEntry).data.toolId, locale: entry.data.locale };
    case 'toolCategories':
      return { id: (entry as ToolCategoryContentEntry).data.categoryId, locale: entry.data.locale };
    case 'blog':
      return { id: (entry as ArticleContentEntry).data.articleId, locale: entry.data.locale };
    case 'blogCategories':
      return { id: (entry as BlogCategoryContentEntry).data.categoryId, locale: entry.data.locale };
    case 'sitePages':
      return { id: (entry as SitePageContentEntry).data.pageId, locale: entry.data.locale };
    default:
      throw new Error(`Unknown content collection ${collection}.`);
  }
}

function compareText(first: string, second: string): number {
  return first < second ? -1 : first > second ? 1 : 0;
}

function sortIssues(
  issues: readonly ArchitectureValidationIssue[],
): readonly ArchitectureValidationIssue[] {
  return [...issues].sort(compareArchitectureValidationIssues);
}
import { accessSync } from 'node:fs';
