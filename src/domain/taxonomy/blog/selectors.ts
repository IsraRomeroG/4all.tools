import type { BlogCategoryId } from '@/domain/shared/ids';
import type { Locale } from '@/i18n/types';

import { blogTaxonomy } from './registry';

export function hasBlogCategory(id: BlogCategoryId): boolean {
  return blogTaxonomy.hasNode(id);
}

export function findBlogCategory(id: BlogCategoryId) {
  return blogTaxonomy.findNode(id);
}

export function getBlogCategory(id: BlogCategoryId) {
  return blogTaxonomy.getNode(id);
}

export function getBlogRootCategory(id: BlogCategoryId) {
  return blogTaxonomy.getRoot(id);
}

export function getBlogCategoryParent(id: BlogCategoryId) {
  return blogTaxonomy.getParent(id);
}

export function getBlogCategoryChildren(id: BlogCategoryId) {
  return blogTaxonomy.getChildren(id);
}

export function getBlogCategoryAncestors(id: BlogCategoryId) {
  return blogTaxonomy.getAncestors(id);
}

export function getBlogCategoryPathFromRoot(id: BlogCategoryId) {
  return blogTaxonomy.getPathFromRoot(id);
}

export function getLocalizedBlogCategoryPath(
  id: BlogCategoryId,
  locale: Locale,
) {
  return blogTaxonomy.getLocalizedPath(id, locale);
}
