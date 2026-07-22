import type {
  ArticleContentEntry,
  BlogCategoryContentEntry,
  ToolCategoryContentEntry,
  ToolContentEntry,
} from '@/content/queries';
import type { ToolDefinition } from '@/domain/tools';
import type { ToolModule } from '@/features/tools/module-registry';
import type { Locale } from '@/i18n/types';

import {
  compareArchitectureValidationIssues,
  createArchitectureValidationIssue,
} from '../report';
import type {
  ArchitectureValidationContext,
  ArchitectureToolModuleRegistration,
} from '../context';
import type { ArchitectureValidationIssue } from '../types';

type ContentIdentityEntry =
  | ToolContentEntry
  | ToolCategoryContentEntry
  | ArticleContentEntry
  | BlogCategoryContentEntry;

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
    'content' | 'toolDefinitions' | 'toolTaxonomy' | 'blogTaxonomy'
  >,
): readonly ArchitectureValidationIssue[] {
  const issues: ArchitectureValidationIssue[] = [];

  for (const entry of context.content.all.tools) {
    if (context.toolDefinitions.findToolDefinition(entry.data.toolId)) {
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
    | 'toolDefinitions'
    | 'toolModules'
    | 'toolModuleRegistrations'
    | 'toolModuleSourceDirectories'
    | 'toolTaxonomy'
  >,
): readonly ArchitectureValidationIssue[] {
  const issues: ArchitectureValidationIssue[] = [];
  const definitions = context.toolDefinitions.getAllToolDefinitions();
  const modules = getModuleRegistrations(context);
  const modulesById = new Map<string, ArchitectureToolModuleRegistration>();

  for (const registration of modules) {
    const moduleId = registration.toolId;
    const definition = context.toolDefinitions.findToolDefinition(moduleId);

    if (definition === null) {
      issues.push(
        createArchitectureValidationIssue({
          code: 'ORPHAN_TOOL_MODULE',
          scope: 'tool-module',
          message: `Tool module ${moduleId} has no registered tool definition.`,
          entityKey: moduleId,
        }),
      );
      continue;
    }

    modulesById.set(moduleId, registration);
    validateModuleIdentity(issues, definition, registration.module);
  }

  for (const definition of definitions) {
    if (definition.status !== 'published') {
      continue;
    }

    const registration = modulesById.get(definition.id);

    if (!registration) {
      issues.push(
        createArchitectureValidationIssue({
          code: 'MISSING_PUBLISHED_TOOL_MODULE',
          scope: 'tool-module',
          message: `Published tool ${definition.id} has no registered module.`,
          entityKey: definition.id,
        }),
      );
      continue;
    }

    if (registration.module.component === null || registration.module.component === undefined) {
      issues.push(
        createArchitectureValidationIssue({
          code: 'MISSING_TOOL_MODULE_COMPONENT',
          scope: 'tool-module',
          message: `Tool module ${definition.id} has no component.`,
          entityKey: definition.id,
        }),
      );
    }

    if (typeof registration.module.getMessages !== 'function') {
      issues.push(
        createArchitectureValidationIssue({
          code: 'MISSING_TOOL_MODULE_MESSAGES',
          scope: 'tool-module',
          message: `Tool module ${definition.id} has no message resolver.`,
          entityKey: definition.id,
        }),
      );
    }

    validateSourceDirectory(issues, definition, context.toolModuleSourceDirectories?.[definition.id]);
  }

  return sortIssues(issues);
}

function validateModuleIdentity(
  issues: ArchitectureValidationIssue[],
  definition: ToolDefinition,
  module: ToolModule,
): void {
  const moduleDefinition = module.definition;

  if (
    moduleDefinition.id === definition.id &&
    moduleDefinition.taxonomy.primaryCategoryId === definition.taxonomy.primaryCategoryId &&
    moduleDefinition.execution.type === definition.execution.type
  ) {
    return;
  }

  issues.push(
    createArchitectureValidationIssue({
      code: 'TOOL_MODULE_IDENTITY_MISMATCH',
      scope: 'tool-module',
      message: `Tool module metadata does not match definition ${definition.id}.`,
      entityKey: definition.id,
      details: {
        definition: {
          toolId: definition.id,
          primaryCategoryId: definition.taxonomy.primaryCategoryId,
          executionType: definition.execution.type,
        },
        module: {
          toolId: moduleDefinition.id,
          primaryCategoryId: moduleDefinition.taxonomy.primaryCategoryId,
          executionType: moduleDefinition.execution.type,
        },
      },
    }),
  );
}

function validateSourceDirectory(
  issues: ArchitectureValidationIssue[],
  definition: ToolDefinition,
  actual: string | undefined,
): void {
  const expected = expectedFeaturePath(definition);
  const normalized = actual === undefined ? undefined : normalizeFeaturePath(actual);

  if (normalized === expected) {
    return;
  }

  issues.push(
    createArchitectureValidationIssue({
      code: 'TOOL_FEATURE_PATH_MISMATCH',
      scope: 'tool-module',
      message: `Tool module source directory for ${definition.id} must be ${expected}.`,
      entityKey: definition.id,
      details: { expected, actual: normalized ?? null },
    }),
  );
}

function expectedFeaturePath(definition: ToolDefinition): string {
  const categorySegments = definition.route.strategy === 'flat'
    ? [definition.rootCategoryId]
    : [definition.rootCategoryId, definition.taxonomy.primaryCategoryId];

  return [...categorySegments, definition.route.localized.en?.slug ?? ''].join('/');
}

function normalizeFeaturePath(path: string): string {
  return path.replaceAll('\\', '/').replace(/^\/+|\/+$/g, '');
}

function getModuleRegistrations(
  context: Pick<ArchitectureValidationContext, 'toolModules' | 'toolModuleRegistrations'>,
): readonly ArchitectureToolModuleRegistration[] {
  return context.toolModuleRegistrations ?? context.toolModules.getAllToolModules().map((module) => ({
    toolId: module.definition.id,
    module,
  }));
}

function contentCollections(
  content: ArchitectureValidationContext['content'],
): readonly [string, readonly ContentIdentityEntry[]][] {
  return [
    ['tools', content.all.tools],
    ['toolCategories', content.all.toolCategories],
    ['blog', content.all.blog],
    ['blogCategories', content.all.blogCategories],
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
  return Object.freeze([...issues].sort(compareArchitectureValidationIssues));
}
