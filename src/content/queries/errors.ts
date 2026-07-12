import type { PublicationStatus } from '@/domain/shared/publication';
import type { Locale } from '@/i18n/types';

export type ContentQueryErrorCode =
  | 'CONTENT_NOT_FOUND'
  | 'AMBIGUOUS_CONTENT';

export interface ContentQueryContext {
  readonly collection: string;
  readonly entityField: string;
  readonly entityId: string;
  readonly locale: Locale;
  readonly status?: PublicationStatus;
  readonly matchedEntryIds?: readonly string[];
}

function describeQuery(context: ContentQueryContext): string {
  const status = context.status === undefined ? '' : `${context.status} `;

  return `${status}${context.collection} entry for ${context.entityId}:${context.locale}`;
}

export class ContentQueryError extends Error {
  readonly code: ContentQueryErrorCode;
  readonly context: ContentQueryContext;

  constructor(
    code: ContentQueryErrorCode,
    message: string,
    context: ContentQueryContext,
  ) {
    super(message);
    this.name = 'ContentQueryError';
    this.code = code;
    this.context = context;
  }
}

export class ContentNotFoundError extends ContentQueryError {
  constructor(context: ContentQueryContext) {
    super(
      'CONTENT_NOT_FOUND',
      `No ${describeQuery(context)} found.`,
      context,
    );
    this.name = 'ContentNotFoundError';
  }
}

export class AmbiguousContentError extends ContentQueryError {
  constructor(context: ContentQueryContext) {
    super(
      'AMBIGUOUS_CONTENT',
      `Expected exactly one ${describeQuery(context)}; found ${
        context.matchedEntryIds?.length ?? 0
      }.`,
      context,
    );
    this.name = 'AmbiguousContentError';
  }
}
