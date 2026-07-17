import { describe, expect, it } from 'vitest';

import { createTaxonomyTree } from '@/domain/taxonomy/shared/tree';
import { TOOL_CATEGORY_NODES } from '@/domain/taxonomy/tools/registry';
import {
  TOOL_CATEGORY_ROUTE_DEFINITIONS,
  toolCategoryRouteProvider,
} from '@/routing/providers/tool-category-route-provider';

describe('tool category route provider', () => {
  it('adapts explicit production category routes only', async () => {
    const routeDefinitions =
      await toolCategoryRouteProvider.getRouteDefinitions();

    expect(routeDefinitions).toEqual([
      {
        kind: 'tool-category',
        definition: {
          categoryId: 'developer',
          strategy: 'root',
          status: 'published',
        },
      },
    ]);
    expect(categoryIds(routeDefinitions)).not.toContain('data-formats');
    expect(categoryIds(routeDefinitions)).not.toContain('json');
  });

  it('does not change output when taxonomy gains classification nodes', async () => {
    const before = await toolCategoryRouteProvider.getRouteDefinitions();
    const taxonomy = createTaxonomyTree([
      ...TOOL_CATEGORY_NODES,
      {
        id: 'string-tools',
        parentId: 'developer',
        localized: {
          en: { slug: 'string-tools', label: 'String Tools' },
          es: { slug: 'herramientas-de-texto', label: 'Herramientas de texto' },
          pt: { slug: 'ferramentas-de-texto', label: 'Ferramentas de texto' },
          fr: { slug: 'outils-de-texte', label: 'Outils de texte' },
        },
        status: 'published',
        sortOrder: 200,
      },
    ]);
    const after = await toolCategoryRouteProvider.getRouteDefinitions();

    expect(taxonomy.hasNode('string-tools')).toBe(true);
    expect(after).toEqual(before);
  });

  it('returns deterministic frozen production definitions', async () => {
    const first = await toolCategoryRouteProvider.getRouteDefinitions();
    const second = await toolCategoryRouteProvider.getRouteDefinitions();

    expect(second).toEqual(first);
    expect(Object.isFrozen(TOOL_CATEGORY_ROUTE_DEFINITIONS)).toBe(true);
    expect(Object.isFrozen(TOOL_CATEGORY_ROUTE_DEFINITIONS[0])).toBe(true);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first[0])).toBe(true);
    expect(Object.isFrozen(first[0]?.definition)).toBe(true);
  });
});

function categoryIds(
  routeDefinitions: Awaited<
    ReturnType<typeof toolCategoryRouteProvider.getRouteDefinitions>
  >,
): string[] {
  return routeDefinitions.flatMap((routeDefinition) =>
    routeDefinition.kind === 'tool-category'
      ? [routeDefinition.definition.categoryId]
      : [],
  );
}
