import type { ToolCategoryId } from '@/domain/shared/ids';
import type { Locale } from '@/i18n/types';

import { toolTaxonomy } from './registry';

export function hasToolCategory(id: ToolCategoryId): boolean {
  return toolTaxonomy.hasNode(id);
}

export function findToolCategory(id: ToolCategoryId) {
  return toolTaxonomy.findNode(id);
}

export function getToolCategory(id: ToolCategoryId) {
  return toolTaxonomy.getNode(id);
}

export function getToolRootCategory(id: ToolCategoryId) {
  return toolTaxonomy.getRoot(id);
}

export function getToolCategoryParent(id: ToolCategoryId) {
  return toolTaxonomy.getParent(id);
}

export function getToolCategoryChildren(id: ToolCategoryId) {
  return toolTaxonomy.getChildren(id);
}

export function getToolCategoryAncestors(id: ToolCategoryId) {
  return toolTaxonomy.getAncestors(id);
}

export function getToolCategoryPathFromRoot(id: ToolCategoryId) {
  return toolTaxonomy.getPathFromRoot(id);
}

export function getLocalizedToolCategoryPath(
  id: ToolCategoryId,
  locale: Locale,
) {
  return toolTaxonomy.getLocalizedPath(id, locale);
}
