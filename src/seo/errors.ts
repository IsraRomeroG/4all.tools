export type SeoUrlPurpose =
  | 'canonical'
  | 'alternate'
  | 'x-default'
  | 'open-graph-image';

export class InvalidSeoUrlError extends Error {
  readonly code = 'INVALID_SEO_URL';

  constructor(
    readonly url: string,
    readonly reason: string,
    readonly purpose: SeoUrlPurpose,
  ) {
    super(`Invalid ${purpose} SEO URL "${url}": ${reason}.`);
    this.name = 'InvalidSeoUrlError';
  }
}

export class DuplicateSeoAlternateError extends Error {
  readonly code = 'DUPLICATE_SEO_ALTERNATE';

  constructor(
    readonly field: 'locale' | 'hrefLang' | 'url',
    readonly value: string,
  ) {
    super(`Duplicate SEO alternate ${field} "${value}".`);
    this.name = 'DuplicateSeoAlternateError';
  }
}

export class InvalidSeoAlternateError extends Error {
  readonly code = 'INVALID_SEO_ALTERNATE';

  constructor(readonly reason: string) {
    super(`Invalid SEO alternate: ${reason}.`);
    this.name = 'InvalidSeoAlternateError';
  }
}

export class InvalidSeoTitleError extends Error {
  readonly code = 'INVALID_SEO_TITLE';

  constructor() {
    super('SEO title must be non-empty after trimming.');
    this.name = 'InvalidSeoTitleError';
  }
}

export class InvalidSeoDescriptionError extends Error {
  readonly code = 'INVALID_SEO_DESCRIPTION';

  constructor() {
    super('SEO description must be non-empty after trimming.');
    this.name = 'InvalidSeoDescriptionError';
  }
}

export class NoindexSeoAlternateConflictError extends Error {
  readonly code = 'NOINDEX_SEO_ALTERNATE_CONFLICT';

  constructor(
    readonly field: 'alternates' | 'x-default',
    readonly canonicalUrl: string,
  ) {
    super(
      `Noindex SEO page "${canonicalUrl}" cannot declare ${field}.`,
    );
    this.name = 'NoindexSeoAlternateConflictError';
  }
}

export class MissingCanonicalRouteError extends Error {
  readonly code = 'MISSING_CANONICAL_ROUTE';

  constructor(
    readonly subjectKey: string,
    readonly locale: string,
  ) {
    super(`Missing canonical route for ${subjectKey}:${locale}.`);
    this.name = 'MissingCanonicalRouteError';
  }
}

export class CanonicalTargetMismatchError extends Error {
  readonly code = 'CANONICAL_TARGET_MISMATCH';

  constructor(
    readonly expectedSubjectKey: string,
    readonly actualSubjectKey: string,
    readonly locale: string,
    readonly sourceId: string,
  ) {
    super(
      `Canonical route ${sourceId} for ${locale} targets ${actualSubjectKey}, expected ${expectedSubjectKey}.`,
    );
    this.name = 'CanonicalTargetMismatchError';
  }
}

export class DuplicateLocaleVariantError extends Error {
  readonly code = 'DUPLICATE_LOCALE_VARIANT';

  constructor(
    readonly subjectKey: string,
    readonly locale: string,
    readonly sourceIds: readonly string[],
  ) {
    super(
      `Duplicate ${locale} variants for ${subjectKey}: ${sourceIds.join(', ')}.`,
    );
    this.name = 'DuplicateLocaleVariantError';
  }
}

export class MissingCurrentVariantError extends Error {
  readonly code = 'MISSING_CURRENT_VARIANT';

  constructor(
    readonly subjectKey: string,
    readonly locale: string,
  ) {
    super(`Missing current ${locale} variant for ${subjectKey}.`);
    this.name = 'MissingCurrentVariantError';
  }
}

export class SeoIndexabilityMismatchError extends Error {
  readonly code = 'SEO_INDEXABILITY_MISMATCH';

  constructor(input: {
    readonly subjectKey: string;
    readonly locale: string;
    readonly contentNoindex: boolean;
    readonly resolvedIndexable: boolean;
  }) {
    super(
      `SEO indexability mismatch for ${input.subjectKey}:${input.locale}; content noindex=${input.contentNoindex}, resolved indexable=${input.resolvedIndexable}.`,
    );
    this.name = 'SeoIndexabilityMismatchError';
  }
}
