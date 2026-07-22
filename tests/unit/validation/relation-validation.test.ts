import { describe, expect, it } from 'vitest';

import type { ContentSourceSnapshot } from '@/content/queries';
import type { ToolDefinition } from '@/domain/tools';
import type { ArchitectureValidationContext } from '@/validation/architecture';
import { validateContentRelations } from '@/validation/architecture';

describe('architecture relation validation', () => {
  it('accepts published global targets across locales and without routes', () => {
    const snapshot = contentSnapshot([
      article('source', 'es', 'published', {
        relatedToolIds: ['published-tool'],
        relatedArticleIds: ['target-en'],
      }),
      article('target-en', 'en', 'published', {}),
    ]);
    const issues = validateContentRelations({
      content: snapshot,
      toolDefinitions: toolDefinitions([
        definition('published-tool', 'published'),
      ]),
    });

    expect(issues).toEqual([]);
  });

  it('rejects unknown and unpublished tools, draft-only articles, and self relations', () => {
    const snapshot = contentSnapshot([
      article('source', 'en', 'published', {
        relatedToolIds: ['missing-tool', 'draft-tool'],
        relatedArticleIds: ['draft-article', 'source', 'missing-article'],
      }),
      article('draft-article', 'fr', 'draft', {}),
    ]);
    const issues = validateContentRelations({
      content: snapshot,
      toolDefinitions: toolDefinitions([
        definition('draft-tool', 'draft'),
      ]),
    });

    expect(issues.map((issue) => issue.code)).toEqual([
      'SELF_RELATED_ARTICLE',
      'UNKNOWN_RELATED_ARTICLE',
      'UNKNOWN_RELATED_ARTICLE',
      'UNKNOWN_RELATED_TOOL',
      'UNPUBLISHED_RELATED_TOOL',
    ]);
    expect(issues.every((issue) => issue.sourceId === 'blog/en/source')).toBe(true);
    expect(issues[0]?.details).toMatchObject({
      relationField: 'relatedArticleIds',
    });
  });

  it('reports the same invalid target separately for each published source locale', () => {
    const issues = validateContentRelations({
      content: contentSnapshot([
        article('source', 'en', 'published', {
          relatedArticleIds: ['missing'],
        }),
        article('source', 'es', 'published', {
          relatedArticleIds: ['missing'],
        }),
      ]),
      toolDefinitions: toolDefinitions([]),
    });

    expect(issues).toHaveLength(2);
    expect(issues.map((issue) => issue.locale)).toEqual(['en', 'es']);
    expect(issues.map((issue) => issue.sourceId)).toEqual([
      'blog/en/source',
      'blog/es/source',
    ]);
  });
});

function contentSnapshot(entries: readonly unknown[]): ContentSourceSnapshot {
  return {
    all: {
      tools: [],
      toolCategories: [],
      blog: entries as never,
      blogCategories: [],
    },
    published: {} as never,
  };
}

function article(
  articleId: string,
  locale: string,
  status: string,
  relations: { readonly relatedToolIds?: readonly string[]; readonly relatedArticleIds?: readonly string[] },
) {
  return {
    id: `blog/${locale}/${articleId}`,
    collection: 'blog',
    data: {
      articleId,
      locale,
      status,
      relatedToolIds: relations.relatedToolIds ?? [],
      relatedArticleIds: relations.relatedArticleIds ?? [],
    },
  };
}

function toolDefinitions(definitions: readonly ToolDefinition[]) {
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

function definition(id: string, status: string): ToolDefinition {
  return {
    id,
    rootCategoryId: 'developer',
    taxonomy: { primaryCategoryId: 'json' },
    route: {
      strategy: 'flat',
      localized: { en: { slug: id } },
    },
    execution: { type: 'client' },
    status: status as ToolDefinition['status'],
  };
}
