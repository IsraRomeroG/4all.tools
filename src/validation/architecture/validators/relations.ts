import type { ToolId } from '@/domain/shared/ids';

import {
  compareArchitectureValidationIssues,
  createArchitectureValidationIssue,
} from '../report';
import type { ArchitectureValidationContext } from '../context';
import type { ArchitectureValidationIssue } from '../types';

export function validateContentRelations(
  context: Pick<ArchitectureValidationContext, 'content' | 'toolDefinitions'>,
): readonly ArchitectureValidationIssue[] {
  const issues: ArchitectureValidationIssue[] = [];
  const publishedArticleIds = new Set(
    context.content.all.blog
      .filter((entry) => entry.data.status === 'published')
      .map((entry) => entry.data.articleId),
  );
  const publishedArticles = context.content.all.blog
    .filter((entry) => entry.data.status === 'published')
    .sort((first, second) =>
      first.data.articleId.localeCompare(second.data.articleId) ||
      first.data.locale.localeCompare(second.data.locale) ||
      first.id.localeCompare(second.id),
    );

  for (const entry of publishedArticles) {
    for (const relatedToolId of [...(entry.data.relatedToolIds ?? [])].sort(compareText)) {
      const definition = context.toolDefinitions.findToolDefinition(relatedToolId as ToolId);

      if (definition === null) {
        issues.push(
          relationIssue({
            code: 'UNKNOWN_RELATED_TOOL',
            message: `Published article ${entry.data.articleId} references unknown tool ${relatedToolId}.`,
            entry,
            relationField: 'relatedToolIds',
            referencedId: relatedToolId,
          }),
        );
      } else if (definition.status !== 'published') {
        issues.push(
          relationIssue({
            code: 'UNPUBLISHED_RELATED_TOOL',
            message: `Published article ${entry.data.articleId} references unpublished tool ${relatedToolId}.`,
            entry,
            relationField: 'relatedToolIds',
            referencedId: relatedToolId,
          }),
        );
      }
    }

    for (const relatedArticleId of [
      ...(entry.data.relatedArticleIds ?? []),
    ].sort(compareText)) {
      if (relatedArticleId === entry.data.articleId) {
        issues.push(
          relationIssue({
            code: 'SELF_RELATED_ARTICLE',
            message: `Article ${entry.data.articleId} cannot relate to itself.`,
            entry,
            relationField: 'relatedArticleIds',
            referencedId: relatedArticleId,
          }),
        );
      } else if (!publishedArticleIds.has(relatedArticleId)) {
        issues.push(
          relationIssue({
            code: 'UNKNOWN_RELATED_ARTICLE',
            message: `Published article ${entry.data.articleId} references an article without published content: ${relatedArticleId}.`,
            entry,
            relationField: 'relatedArticleIds',
            referencedId: relatedArticleId,
          }),
        );
      }
    }
  }

  return Object.freeze([...issues].sort(compareArchitectureValidationIssues));
}

function relationIssue(input: {
  readonly code:
    | 'UNKNOWN_RELATED_TOOL'
    | 'UNPUBLISHED_RELATED_TOOL'
    | 'UNKNOWN_RELATED_ARTICLE'
    | 'SELF_RELATED_ARTICLE';
  readonly message: string;
  readonly entry: {
    readonly id: string;
    readonly data: {
      readonly articleId: string;
      readonly locale: 'en' | 'es' | 'pt' | 'fr';
    };
  };
  readonly relationField: 'relatedToolIds' | 'relatedArticleIds';
  readonly referencedId: string;
}): ArchitectureValidationIssue {
  return createArchitectureValidationIssue({
    code: input.code,
    scope: 'relation',
    message: input.message,
    entityKey: input.entry.data.articleId,
    locale: input.entry.data.locale,
    sourceId: input.entry.id,
    details: {
      relationField: input.relationField,
      referencedId: input.referencedId,
    },
  });
}

function compareText(first: string, second: string): number {
  return first < second ? -1 : first > second ? 1 : 0;
}
