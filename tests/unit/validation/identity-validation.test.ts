import { describe, expect, it } from 'vitest';

import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import { jsonValidatorDefinition } from '@/features/tools/developer/json-validator/tool.config';
import type { ToolDefinition } from '@/domain/tools';
import type { ContentSourceSnapshot } from '@/content/queries';
import {
  validateContentIdentities,
  validateTaxonomyReferences,
  validateToolRegistryIntegrity,
} from '@/validation/architecture';
import type { ArchitectureValidationContext } from '@/validation/architecture';

describe('architecture identity validation', () => {
  it('rejects duplicate identities across statuses and preserves all source context', () => {
    const snapshot = contentSnapshot({
      tools: [
        entry('tools/es/developer/json-validator-published', {
          toolId: 'json-validator',
          locale: 'es',
          status: 'published',
        }),
        entry('tools/es/developer/json-validator-draft', {
          toolId: 'json-validator',
          locale: 'es',
          status: 'draft',
        }),
      ],
    });

    const issues = validateContentIdentities({ content: snapshot });

    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      code: 'DUPLICATE_CONTENT_IDENTITY',
      entityKey: 'json-validator',
      locale: 'es',
      details: {
        matches: [
          { entryId: 'tools/es/developer/json-validator-draft', status: 'draft' },
          {
            entryId: 'tools/es/developer/json-validator-published',
            status: 'published',
          },
        ],
      },
    });
  });

  it('rejects duplicate article identities across statuses', () => {
    const snapshot = contentSnapshot({
      blog: [
        entry('blog/es/article-draft', {
          articleId: 'article',
          locale: 'es',
          status: 'draft',
        }),
        entry('blog/es/article-published', {
          articleId: 'article',
          locale: 'es',
          status: 'published',
        }),
      ],
    });

    const issues = validateContentIdentities({ content: snapshot });

    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      code: 'DUPLICATE_CONTENT_IDENTITY',
      scope: 'content',
      entityKey: 'article',
      locale: 'es',
      details: {
        collection: 'blog',
        matches: [
          { entryId: 'blog/es/article-draft', status: 'draft' },
          { entryId: 'blog/es/article-published', status: 'published' },
        ],
      },
    });
  });

  it('rejects tool content that references an unknown definition', () => {
    const issues = validateTaxonomyReferences({
      content: contentSnapshot({
        tools: [
          entry('tools/en/unknown-tool', {
            toolId: 'unknown-tool',
            locale: 'en',
            status: 'draft',
          }),
        ],
      }),
      toolDefinitions: fakeToolDefinitions([]),
      toolTaxonomy,
      blogTaxonomy,
    });

    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      code: 'UNKNOWN_TOOL_CONTENT_ID',
      entityKey: 'unknown-tool',
      locale: 'en',
      sourceId: 'tools/en/unknown-tool',
    });
  });

  it('validates all content taxonomy and translation references', () => {
    const snapshot = contentSnapshot({
      toolCategories: [
        entry('tool-categories/en/unknown', {
          categoryId: 'unknown-tool-category',
          locale: 'en',
          status: 'draft',
        }),
      ],
      blogCategories: [
        entry('blog-categories/en/unknown', {
          categoryId: 'unknown-blog-category',
          locale: 'en',
          status: 'published',
        }),
      ],
      blog: [
        entry('blog/en/article', {
          articleId: 'article',
          locale: 'en',
          primaryCategoryId: 'json-guides',
          secondaryCategoryIds: ['unknown-secondary'],
          status: 'published',
        }),
        entry('blog/es/article', {
          articleId: 'article',
          locale: 'es',
          primaryCategoryId: 'development',
          secondaryCategoryIds: [],
          status: 'published',
        }),
        entry('blog/fr/unknown-primary', {
          articleId: 'unknown-primary',
          locale: 'fr',
          primaryCategoryId: 'unknown-primary-category',
          secondaryCategoryIds: [],
          status: 'draft',
        }),
      ],
    });
    const context = {
      content: snapshot,
      toolDefinitions: fakeToolDefinitions([]),
      toolTaxonomy,
      blogTaxonomy,
    } as Pick<
      ArchitectureValidationContext,
      'content' | 'toolDefinitions' | 'toolTaxonomy' | 'blogTaxonomy'
    >;

    const codes = validateTaxonomyReferences(context).map((issue) => issue.code);

    expect(codes).toEqual([
      'ARTICLE_TRANSLATION_PRIMARY_CATEGORY_MISMATCH',
      'UNKNOWN_ARTICLE_PRIMARY_CATEGORY',
      'UNKNOWN_ARTICLE_SECONDARY_CATEGORY',
      'UNKNOWN_BLOG_CATEGORY_CONTENT_ID',
      'UNKNOWN_TOOL_CATEGORY_CONTENT_ID',
    ]);
  });

  it('validates published module ownership and diagnostic feature paths', () => {
    const validModule = moduleFor(jsonValidatorDefinition);
    const context = {
      toolDefinitions: fakeToolDefinitions([jsonValidatorDefinition]),
      toolModules: fakeToolModules([validModule]),
      toolModuleRegistrations: [{ toolId: 'json-validator', module: validModule }],
      toolModuleSourceDirectories: { 'json-validator': 'developer/json-validator' },
      toolTaxonomy,
    } as Pick<
      ArchitectureValidationContext,
      | 'toolDefinitions'
      | 'toolModules'
      | 'toolModuleRegistrations'
      | 'toolModuleSourceDirectories'
      | 'toolTaxonomy'
    >;

    expect(validateToolRegistryIntegrity(context)).toEqual([]);

    const missing = validateToolRegistryIntegrity({
      ...context,
      toolModules: fakeToolModules([]),
      toolModuleRegistrations: [],
    });
    expect(missing.map((issue) => issue.code)).toEqual([
      'MISSING_PUBLISHED_TOOL_MODULE',
    ]);

    const wrongPath = validateToolRegistryIntegrity({
      ...context,
      toolModuleSourceDirectories: { 'json-validator': 'wrong/path' },
    });
    expect(wrongPath.map((issue) => issue.code)).toEqual([
      'TOOL_FEATURE_PATH_MISMATCH',
    ]);
  });

  it('rejects an orphan tool module', () => {
    const orphanDefinition = {
      ...jsonValidatorDefinition,
      id: 'orphan-tool',
    } as ToolDefinition;
    const orphanModule = moduleFor(orphanDefinition);
    const context = {
      toolDefinitions: fakeToolDefinitions([]),
      toolModules: fakeToolModules([orphanModule]),
      toolModuleRegistrations: [{ toolId: 'orphan-tool', module: orphanModule }],
      toolModuleSourceDirectories: {},
      toolTaxonomy,
    } as Pick<
      ArchitectureValidationContext,
      | 'toolDefinitions'
      | 'toolModules'
      | 'toolModuleRegistrations'
      | 'toolModuleSourceDirectories'
      | 'toolTaxonomy'
    >;

    expect(validateToolRegistryIntegrity(context).map((issue) => issue.code)).toEqual([
      'ORPHAN_TOOL_MODULE',
    ]);
  });

  it.each([
    {
      label: 'primary category',
      definition: {
        ...jsonValidatorDefinition,
        taxonomy: { primaryCategoryId: 'developer' },
      },
    },
    {
      label: 'execution type',
      definition: {
        ...jsonValidatorDefinition,
        execution: { type: 'backend-api' },
      },
    },
  ])('rejects tool module metadata mismatch: $label', ({ definition }) => {
    const mismatchedModule = moduleFor(definition as ToolDefinition);
    const context = {
      toolDefinitions: fakeToolDefinitions([jsonValidatorDefinition]),
      toolModules: fakeToolModules([mismatchedModule]),
      toolModuleRegistrations: [
        { toolId: jsonValidatorDefinition.id, module: mismatchedModule },
      ],
      toolModuleSourceDirectories: { 'json-validator': 'developer/json-validator' },
      toolTaxonomy,
    } as Pick<
      ArchitectureValidationContext,
      | 'toolDefinitions'
      | 'toolModules'
      | 'toolModuleRegistrations'
      | 'toolModuleSourceDirectories'
      | 'toolTaxonomy'
    >;

    expect(validateToolRegistryIntegrity(context).map((issue) => issue.code)).toEqual([
      'TOOL_MODULE_IDENTITY_MISMATCH',
    ]);
  });

  it('rejects a published module without a component', () => {
    const module = {
      ...moduleFor(jsonValidatorDefinition),
      component: null,
    } as unknown as ReturnType<typeof moduleFor>;
    const context = moduleValidationContext(module);

    expect(validateToolRegistryIntegrity(context).map((issue) => issue.code)).toEqual([
      'MISSING_TOOL_MODULE_COMPONENT',
    ]);
  });

  it('rejects a published module without a message resolver', () => {
    const module = {
      ...moduleFor(jsonValidatorDefinition),
      getMessages: undefined,
    } as unknown as ReturnType<typeof moduleFor>;
    const context = moduleValidationContext(module);

    expect(validateToolRegistryIntegrity(context).map((issue) => issue.code)).toEqual([
      'MISSING_TOOL_MODULE_MESSAGES',
    ]);
  });
});

function contentSnapshot(fixtures: {
  readonly tools?: readonly unknown[];
  readonly toolCategories?: readonly unknown[];
  readonly blog?: readonly unknown[];
  readonly blogCategories?: readonly unknown[];
}): ContentSourceSnapshot {
  return {
    all: {
      tools: (fixtures.tools ?? []) as never,
      toolCategories: (fixtures.toolCategories ?? []) as never,
      blog: (fixtures.blog ?? []) as never,
      blogCategories: (fixtures.blogCategories ?? []) as never,
    },
    published: {} as never,
  };
}

function fakeToolDefinitions(definitions: readonly ToolDefinition[]) {
  const byId = new Map(definitions.map((definition) => [definition.id, definition]));

  return {
    definitions: Object.fromEntries(
      definitions.map((definition) => [definition.id, definition]),
    ),
    findToolDefinition: (toolId: string) => byId.get(toolId) ?? null,
    getToolDefinition: (toolId: string) => byId.get(toolId)!,
    getAllToolDefinitions: () => definitions,
  } as ArchitectureValidationContext['toolDefinitions'];
}

function fakeToolModules(modules: readonly ReturnType<typeof moduleFor>[]) {
  const byId = new Map(modules.map((module) => [module.definition.id, module]));

  return {
    modules: Object.fromEntries(modules.map((module) => [module.definition.id, module])),
    findToolModule: (toolId: string) => byId.get(toolId) ?? null,
    getToolModule: (toolId: string) => byId.get(toolId)!,
    getAllToolModules: () => modules,
  } as ArchitectureValidationContext['toolModules'];
}

function moduleValidationContext(module: ReturnType<typeof moduleFor>) {
  return {
    toolDefinitions: fakeToolDefinitions([jsonValidatorDefinition]),
    toolModules: fakeToolModules([module]),
    toolModuleRegistrations: [
      { toolId: jsonValidatorDefinition.id, module },
    ],
    toolModuleSourceDirectories: { 'json-validator': 'developer/json-validator' },
    toolTaxonomy,
  } as Pick<
    ArchitectureValidationContext,
    | 'toolDefinitions'
    | 'toolModules'
    | 'toolModuleRegistrations'
    | 'toolModuleSourceDirectories'
    | 'toolTaxonomy'
  >;
}

function moduleFor(definition: ToolDefinition) {
  return {
    definition,
    component: {},
    getMessages: () => ({}),
  };
}

function entry(id: string, data: Record<string, unknown>) {
  return {
    id,
    collection: id.split('/')[0],
    data,
  };
}
