import type { ToolCategoryId } from '@/domain/shared/ids';
import { createTaxonomyTree } from '@/domain/taxonomy/shared/tree';
import type { TaxonomyNode } from '@/domain/taxonomy/shared/types';

export const TOOL_CATEGORY_NODES = [
  {
    id: 'developer',
    parentId: null,
    localized: {
      en: {
        slug: 'developer',
        label: 'Developer Tools',
      },
      es: {
        slug: 'desarrollo',
        label: 'Herramientas para desarrolladores',
      },
      pt: {
        slug: 'desenvolvedor',
        label: 'Ferramentas para desenvolvedores',
      },
      fr: {
        slug: 'developpement',
        label: 'Outils pour développeurs',
      },
    },
    status: 'published',
    sortOrder: 100,
  },
  {
    id: 'data-formats',
    parentId: 'developer',
    localized: {
      en: {
        slug: 'data-formats',
        label: 'Data Formats',
      },
      es: {
        slug: 'formatos-de-datos',
        label: 'Formatos de datos',
      },
      pt: {
        slug: 'formatos-de-dados',
        label: 'Formatos de dados',
      },
      fr: {
        slug: 'formats-de-donnees',
        label: 'Formats de données',
      },
    },
    status: 'published',
    sortOrder: 100,
  },
  {
    id: 'json',
    parentId: 'data-formats',
    localized: {
      en: {
        slug: 'json',
        label: 'JSON',
      },
      es: {
        slug: 'json',
        label: 'JSON',
      },
      pt: {
        slug: 'json',
        label: 'JSON',
      },
      fr: {
        slug: 'json',
        label: 'JSON',
      },
    },
    status: 'published',
    sortOrder: 100,
  },
] as const satisfies readonly TaxonomyNode<ToolCategoryId>[];

export const toolTaxonomy =
  createTaxonomyTree<ToolCategoryId>(TOOL_CATEGORY_NODES);
