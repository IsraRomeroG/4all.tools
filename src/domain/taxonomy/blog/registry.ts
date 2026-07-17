import type { BlogCategoryId } from '@/domain/shared/ids';
import { createTaxonomyTree } from '@/domain/taxonomy/shared/tree';
import type { TaxonomyNode } from '@/domain/taxonomy/shared/types';

export const BLOG_CATEGORY_NODES = [
  {
    id: 'development',
    parentId: null,
    localized: {
      en: {
        slug: 'development',
        label: 'Development',
      },
      es: {
        slug: 'desarrollo',
        label: 'Desarrollo',
      },
      pt: {
        slug: 'desenvolvimento',
        label: 'Desenvolvimento',
      },
      fr: {
        slug: 'developpement',
        label: 'Développement',
      },
    },
    status: 'published',
    sortOrder: 100,
  },
  {
    id: 'json-guides',
    parentId: 'development',
    localized: {
      en: {
        slug: 'json-guides',
        label: 'JSON Guides',
      },
      es: {
        slug: 'guias-json',
        label: 'Guías de JSON',
      },
      pt: {
        slug: 'guias-json',
        label: 'Guias de JSON',
      },
      fr: {
        slug: 'guides-json',
        label: 'Guides JSON',
      },
    },
    status: 'published',
    sortOrder: 100,
  },
] as const satisfies readonly TaxonomyNode<BlogCategoryId>[];

export const blogTaxonomy =
  createTaxonomyTree<BlogCategoryId>(BLOG_CATEGORY_NODES);
