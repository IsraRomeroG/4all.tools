import type { ToolCategoryId, BlogCategoryId } from '@/domain/shared/ids';
import type { PublicationStatus } from '@/domain/shared/publication';
import type { Locale, Localized } from '@/i18n/types';

export const TAXONOMY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface TaxonomyLocaleData {
  slug: string;
  label: string;
  shortLabel?: string;
}

export interface TaxonomyNode<TId extends string = string> {
  id: TId;
  parentId: TId | null;
  localized: Localized<TaxonomyLocaleData>;
  status: PublicationStatus;
  sortOrder: number;
}

export interface TaxonomyTree<TId extends string = string> {
  hasNode(id: TId): boolean;
  findNode(id: TId): TaxonomyNode<TId> | undefined;
  getNode(id: TId): TaxonomyNode<TId>;
  getRoots(): readonly TaxonomyNode<TId>[];
  getParent(id: TId): TaxonomyNode<TId> | null;
  getChildren(id: TId): readonly TaxonomyNode<TId>[];
  getAncestors(id: TId): readonly TaxonomyNode<TId>[];
  getDescendants(id: TId): readonly TaxonomyNode<TId>[];
  getRoot(id: TId): TaxonomyNode<TId>;
  getPathFromRoot(id: TId): readonly TaxonomyNode<TId>[];
  /**
   * Returns conceptual taxonomy path segments, not a canonical public URL.
   */
  getLocalizedPath(id: TId, locale: Locale): readonly string[];
}

export type ToolTaxonomyNode = TaxonomyNode<ToolCategoryId>;
export type BlogTaxonomyNode = TaxonomyNode<BlogCategoryId>;

export function isTaxonomySlug(value: unknown): value is string {
  return typeof value === 'string' && TAXONOMY_SLUG_PATTERN.test(value);
}
