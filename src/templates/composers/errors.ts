import type { Locale } from '@/i18n/types';

export type PageModelCompositionErrorCode =
  | 'PAGE_MODEL_COMPOSITION_FAILED'
  | 'MISSING_CANONICAL_ROUTE'
  | 'MISSING_TAXONOMY_NODE'
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
