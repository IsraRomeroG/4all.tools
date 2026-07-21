import { buildLocalizedPath } from '@/routing/builders';
import type { RouteRegistry } from '@/routing/registry';
import type { RouteTarget } from '@/routing/types';
import type { TaxonomyNode, TaxonomyTree } from '@/domain/taxonomy/shared/types';
import type { ToolCategoryId } from '@/domain/shared/ids';
import type { BreadcrumbItem, BreadcrumbLocaleInput, BreadcrumbModel } from './types';
import {
  BreadcrumbCurrentItemError,
  BreadcrumbRouteTargetMismatchError,
  MissingLocalizedTaxonomyLabelError,
} from './errors';

export type ToolTaxonomy = Pick<
  TaxonomyTree<ToolCategoryId>,
  'findNode' | 'getPathFromRoot'
>;
export type BreadcrumbRouteRegistry = Pick<RouteRegistry, 'getCanonical'>;

export function createHomeBreadcrumb(
  input: BreadcrumbLocaleInput,
): BreadcrumbItem {
  return {
    kind: 'home',
    state: 'link',
    label: input.messages.home,
    url: buildLocalizedPath({ locale: input.locale, segments: [] }),
  };
}

export function createTaxonomyBreadcrumb(
  node: TaxonomyNode<ToolCategoryId>,
  input: BreadcrumbLocaleInput,
  routeRegistry: BreadcrumbRouteRegistry,
): BreadcrumbItem {
  const label = getTaxonomyLabel(node, input);
  const route = routeRegistry.getCanonical(input.locale, {
    kind: 'tool-category',
    categoryId: node.id,
  });

  if (route === null) {
    return {
      kind: 'taxonomy',
      state: 'text',
      label,
    };
  }

  assertCategoryRouteTarget(route.target, node.id, input.locale);

  return {
    kind: 'taxonomy',
    state: 'link',
    label,
    url: buildLocalizedPath({
      locale: input.locale,
      segments: route.segments,
    }),
  };
}

export function createCurrentBreadcrumb(
  kind: 'taxonomy' | 'entity',
  label: string,
): BreadcrumbItem {
  return {
    kind,
    state: 'current',
    label,
  };
}

export function createBreadcrumbModel(
  ariaLabel: string,
  items: readonly BreadcrumbItem[],
): BreadcrumbModel {
  const currentItems = items.filter((item) => item.state === 'current');

  if (
    currentItems.length !== 1 ||
    items.at(-1)?.state !== 'current'
  ) {
    throw new BreadcrumbCurrentItemError();
  }

  return Object.freeze({
    ariaLabel,
    items: Object.freeze(items.map((item) => Object.freeze(item))),
  });
}

function getTaxonomyLabel(
  node: TaxonomyNode<ToolCategoryId>,
  input: BreadcrumbLocaleInput,
): string {
  const localized = node.localized[input.locale];

  if (localized === undefined || localized.label.trim().length === 0) {
    throw new MissingLocalizedTaxonomyLabelError(node.id, input.locale);
  }

  return localized.label;
}

function assertCategoryRouteTarget(
  target: RouteTarget,
  categoryId: ToolCategoryId,
  locale: BreadcrumbLocaleInput['locale'],
): void {
  if (target.kind === 'tool-category' && target.categoryId === categoryId) {
    return;
  }

  throw new BreadcrumbRouteTargetMismatchError(
    categoryId,
    locale,
    target.kind === 'tool-category' ? target.categoryId : target.kind,
  );
}
