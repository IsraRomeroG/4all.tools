import type { ToolCategoryId } from '@/domain/shared/ids';
import type { Locale } from '@/i18n/types';
import { UnknownBreadcrumbTaxonomyNodeError } from './errors';

import {
  createBreadcrumbModel,
  createCurrentBreadcrumb,
  createHomeBreadcrumb,
  createTaxonomyBreadcrumb,
  type BreadcrumbRouteRegistry,
  type ToolTaxonomy,
} from './shared';
import type { BreadcrumbMessages, BreadcrumbModel } from './types';

export interface BuildToolCategoryBreadcrumbsInput {
  readonly locale: Locale;
  readonly categoryId: ToolCategoryId;
  readonly currentTitle: string;
  readonly taxonomy: ToolTaxonomy;
  readonly routeRegistry: BreadcrumbRouteRegistry;
  readonly messages: BreadcrumbMessages;
}

export function buildToolCategoryBreadcrumbs(
  input: BuildToolCategoryBreadcrumbsInput,
): BreadcrumbModel {
  if (input.taxonomy.findNode(input.categoryId) === undefined) {
    throw new UnknownBreadcrumbTaxonomyNodeError(input.categoryId);
  }

  const taxonomyPath = input.taxonomy.getPathFromRoot(input.categoryId);
  const localeInput = {
    locale: input.locale,
    messages: input.messages,
  };
  const ancestors = taxonomyPath.slice(0, -1).map((node) =>
    createTaxonomyBreadcrumb(node, localeInput, input.routeRegistry),
  );
  const items = [
    createHomeBreadcrumb(localeInput),
    ...ancestors,
    createCurrentBreadcrumb('taxonomy', input.currentTitle),
  ];

  return createBreadcrumbModel(input.messages.breadcrumbsLabel, items);
}
