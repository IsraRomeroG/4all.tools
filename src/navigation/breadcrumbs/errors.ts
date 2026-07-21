import type { Locale } from '@/i18n/types';

export class UnknownBreadcrumbTaxonomyNodeError extends Error {
  readonly categoryId: string;

  constructor(categoryId: string) {
    super(`Unknown breadcrumb taxonomy node: ${categoryId}.`);
    this.name = 'UnknownBreadcrumbTaxonomyNodeError';
    this.categoryId = categoryId;
  }
}

export class BreadcrumbCurrentItemError extends Error {
  constructor(message = 'Breadcrumb current item must be the final item.') {
    super(message);
    this.name = 'BreadcrumbCurrentItemError';
  }
}

export class MissingLocalizedTaxonomyLabelError extends Error {
  readonly categoryId: string;
  readonly locale: Locale;

  constructor(categoryId: string, locale: Locale) {
    super(`Missing localized breadcrumb label for ${categoryId}:${locale}.`);
    this.name = 'MissingLocalizedTaxonomyLabelError';
    this.categoryId = categoryId;
    this.locale = locale;
  }
}

export class BreadcrumbRouteTargetMismatchError extends Error {
  constructor(
    categoryId: string,
    locale: Locale,
    actualTarget: string,
  ) {
    super(
      `Breadcrumb route target mismatch for ${categoryId}:${locale}; received ${actualTarget}.`,
    );
    this.name = 'BreadcrumbRouteTargetMismatchError';
  }
}
