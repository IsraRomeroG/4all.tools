import type { Locale } from '@/i18n/types';
import type { ToolId } from '@/domain/shared/ids';

export type PageModelCompositionErrorCode =
  | 'PAGE_MODEL_COMPOSITION_FAILED'
  | 'MISSING_CANONICAL_ROUTE'
  | 'MISSING_TOOL_PRESENTATION'
  | 'MISSING_TAXONOMY_NODE'
  | 'TOOL_PRESENTATION_MISMATCH'
  | 'UNSUPPORTED_LOCALE'
  | 'UNSUPPORTED_PAGE_TARGET';

export interface PageModelCompositionContext {
  readonly locale?: Locale | string;
  readonly targetKind?: string;
  readonly entityId?: string;
}

export class PageModelCompositionError extends Error {
  readonly code: PageModelCompositionErrorCode;
  readonly context: PageModelCompositionContext;

  constructor(
    code: PageModelCompositionErrorCode,
    message: string,
    context: PageModelCompositionContext,
    cause?: unknown,
  ) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = 'PageModelCompositionError';
    this.code = code;
    this.context = context;
  }
}

export class MissingCanonicalRouteError extends PageModelCompositionError {
  constructor(context: Required<PageModelCompositionContext>) {
    super(
      'MISSING_CANONICAL_ROUTE',
      `No canonical ${context.targetKind} route found for ${context.entityId}:${context.locale}.`,
      context,
    );
    this.name = 'MissingCanonicalRouteError';
  }
}

export class MissingTaxonomyNodeError extends PageModelCompositionError {
  constructor(context: Required<PageModelCompositionContext>) {
    super(
      'MISSING_TAXONOMY_NODE',
      `No taxonomy node found for ${context.targetKind} ${context.entityId}.`,
      context,
    );
    this.name = 'MissingTaxonomyNodeError';
  }
}

export class MissingToolPresentationError extends PageModelCompositionError {
  constructor(context: Required<PageModelCompositionContext>) {
    super(
      'MISSING_TOOL_PRESENTATION',
      `No tool presentation metadata found for ${context.entityId}:${context.locale}.`,
      context,
    );
    this.name = 'MissingToolPresentationError';
  }
}

export class ToolPresentationMismatchError extends PageModelCompositionError {
  readonly requestedToolId: ToolId;
  readonly presentationToolId: ToolId;
  readonly locale: Locale;

  constructor(params: {
    readonly requestedToolId: ToolId;
    readonly presentationToolId: ToolId;
    readonly locale: Locale;
  }) {
    super(
      'TOOL_PRESENTATION_MISMATCH',
      `Tool presentation metadata for ${params.requestedToolId}:${params.locale} returned tool ID ${params.presentationToolId}.`,
      {
        locale: params.locale,
        targetKind: 'tool',
        entityId: params.requestedToolId,
      },
    );
    this.name = 'ToolPresentationMismatchError';
    this.requestedToolId = params.requestedToolId;
    this.presentationToolId = params.presentationToolId;
    this.locale = params.locale;
  }
}

export class UnsupportedPageTargetError extends PageModelCompositionError {
  constructor(context: PageModelCompositionContext) {
    super(
      'UNSUPPORTED_PAGE_TARGET',
      `Unsupported page target${context.targetKind === undefined ? '' : `: ${context.targetKind}`}.`,
      context,
    );
    this.name = 'UnsupportedPageTargetError';
  }
}

export class UnsupportedLocaleError extends PageModelCompositionError {
  constructor(locale: string) {
    super('UNSUPPORTED_LOCALE', `Unsupported locale: "${locale}".`, {
      locale,
    });
    this.name = 'UnsupportedLocaleError';
  }
}

export function wrapCompositionCause(
  message: string,
  context: PageModelCompositionContext,
  cause: unknown,
): PageModelCompositionError {
  if (cause instanceof PageModelCompositionError) {
    return cause;
  }

  return new PageModelCompositionError(
    'PAGE_MODEL_COMPOSITION_FAILED',
    message,
    context,
    cause,
  );
}
