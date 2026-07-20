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
