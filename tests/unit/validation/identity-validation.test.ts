import { describe, expect, it } from 'vitest';

import type { ContentSourceSnapshot } from '@/content/queries';
import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import type { ToolDefinition } from '@/domain/tools';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import { jsonValidatorDefinition } from '@/features/tools/developer/json/json-formatter-validator/tool.config';
import {
  jsonValidatorModule,
  type ToolModule,
  type ToolRegistry,
} from '@/features/tools/registry';
import {
  validateContentIdentities,
  validateTaxonomyReferences,
  validateToolRegistryIntegrity,
} from '@/validation/architecture';

describe('architecture identity validation', () => {
  it('rejects duplicate content identities across statuses', () => {
    const issues = validateContentIdentities({
      content: contentSnapshot({
        tools: [
          entry('tools/es/published', {
            toolId: 'json-validator', locale: 'es', status: 'published',
          }),
          entry('tools/es/draft', {
            toolId: 'json-validator', locale: 'es', status: 'draft',
          }),
        ],
      }),
    });

    expect(issues).toMatchObject([{
      code: 'DUPLICATE_CONTENT_IDENTITY',
      entityKey: 'json-validator',
      locale: 'es',
      details: {
        matches: [
          { entryId: 'tools/es/draft', status: 'draft' },
          { entryId: 'tools/es/published', status: 'published' },
        ],
      },
    }]);
  });

  it('reports duplicate site-page identities through the common validator', () => {
    const issues = validateContentIdentities({
      content: contentSnapshot({
        sitePages: [
          entry('site-pages/en/contact-a', {
            pageId: 'contact', locale: 'en', status: 'published',
          }),
          entry('site-pages/en/contact-b', {
            pageId: 'contact', locale: 'en', status: 'draft',
          }),
        ],
      }),
    });

    expect(issues).toMatchObject([{
      code: 'DUPLICATE_CONTENT_IDENTITY',
      entityKey: 'contact',
      locale: 'en',
    }]);
  });

  it('rejects content that references an unknown tool module', () => {
    const issues = validateTaxonomyReferences({
      content: contentSnapshot({
        tools: [entry('tools/en/unknown', {
          toolId: 'unknown-tool', locale: 'en', status: 'draft',
        })],
      }),
      toolRegistry: registry([]),
      toolTaxonomy,
      blogTaxonomy,
    });

    expect(issues).toMatchObject([{
      code: 'UNKNOWN_TOOL_CONTENT_ID',
      entityKey: 'unknown-tool',
      locale: 'en',
      sourceId: 'tools/en/unknown',
    }]);
  });

  it('validates taxonomy and translation references', () => {
    const issues = validateTaxonomyReferences({
      content: contentSnapshot({
        toolCategories: [entry('tool-categories/en/unknown', {
          categoryId: 'unknown-tool-category', locale: 'en', status: 'draft',
        })],
        blogCategories: [entry('blog-categories/en/unknown', {
          categoryId: 'unknown-blog-category', locale: 'en', status: 'published',
        })],
        blog: [
          entry('blog/en/article', {
            articleId: 'article', locale: 'en', primaryCategoryId: 'json-guides',
            secondaryCategoryIds: ['unknown-secondary'], status: 'published',
          }),
          entry('blog/es/article', {
            articleId: 'article', locale: 'es', primaryCategoryId: 'development',
            secondaryCategoryIds: [], status: 'published',
          }),
        ],
      }),
      toolRegistry: registry([]),
      toolTaxonomy,
      blogTaxonomy,
    });

    expect(issues.map((issue) => issue.code)).toEqual([
      'ARTICLE_TRANSLATION_PRIMARY_CATEGORY_MISMATCH',
      'UNKNOWN_ARTICLE_SECONDARY_CATEGORY',
      'UNKNOWN_BLOG_CATEGORY_CONTENT_ID',
      'UNKNOWN_TOOL_CATEGORY_CONTENT_ID',
    ]);
  });

  it('validates modules and the taxonomy-to-feature convention', () => {
    expect(validateToolRegistryIntegrity({
      toolRegistry: registry([jsonValidatorModule]),
      toolTaxonomy,
    })).toEqual([]);

    const missingComponent = moduleFor(jsonValidatorDefinition, { component: null });
    expect(validateToolRegistryIntegrity({
      toolRegistry: registry([missingComponent]),
      toolTaxonomy,
    }).map((issue) => issue.code)).toEqual(['MISSING_TOOL_MODULE_COMPONENT']);

    const missingMessages = moduleFor(jsonValidatorDefinition, { getMessages: undefined });
    expect(validateToolRegistryIntegrity({
      toolRegistry: registry([missingMessages]),
      toolTaxonomy,
    }).map((issue) => issue.code)).toEqual(['MISSING_TOOL_MODULE_MESSAGES']);

    const missingFeature = moduleFor({
      ...jsonValidatorDefinition,
      id: 'missing-feature',
      route: {
        ...jsonValidatorDefinition.route,
        localized: {
          ...jsonValidatorDefinition.route.localized,
          en: { slug: 'unrelated-public-slug' },
        },
      },
    });
    expect(validateToolRegistryIntegrity({
      toolRegistry: registry([missingFeature]),
      toolTaxonomy,
    })).toMatchObject([{
      code: 'TOOL_FEATURE_PATH_MISMATCH',
      entityKey: 'missing-feature',
      details: { expected: 'developer/json/missing-feature' },
    }]);
  });
});

function registry(modules: readonly ToolModule[]): ToolRegistry {
  const byId = new Map(modules.map((module) => [module.definition.id, module]));

  return {
    find: (toolId) => byId.get(toolId) ?? null,
    get: (toolId) => byId.get(toolId)!,
    getAll: () => modules,
  };
}

function moduleFor(
  definition: ToolDefinition,
  overrides: {
    readonly component?: ToolModule['component'] | null;
    readonly getMessages?: ToolModule['getMessages'] | undefined;
  } = {},
): ToolModule {
  return {
    definition,
    component: jsonValidatorModule.component,
    getMessages: () => ({}),
    ...overrides,
  } as ToolModule;
}

function contentSnapshot(fixtures: {
  readonly tools?: readonly unknown[];
  readonly toolCategories?: readonly unknown[];
  readonly blog?: readonly unknown[];
  readonly blogCategories?: readonly unknown[];
  readonly sitePages?: readonly unknown[];
}): ContentSourceSnapshot {
  return {
    all: {
      tools: (fixtures.tools ?? []) as never,
      toolCategories: (fixtures.toolCategories ?? []) as never,
      blog: (fixtures.blog ?? []) as never,
      blogCategories: (fixtures.blogCategories ?? []) as never,
      sitePages: (fixtures.sitePages ?? []) as never,
    },
    published: {} as never,
  };
}

function entry(id: string, data: Record<string, unknown>) {
  return { id, collection: id.split('/')[0], data };
}
