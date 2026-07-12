import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import {
  TOOL_CATEGORY_NODES,
  toolTaxonomy,
} from '@/domain/taxonomy/tools/registry';
import {
  findToolCategory,
  getLocalizedToolCategoryPath,
  getToolCategory,
  getToolCategoryAncestors,
  getToolCategoryChildren,
  getToolCategoryParent,
  getToolCategoryPathFromRoot,
  getToolRootCategory,
  hasToolCategory,
} from '@/domain/taxonomy/tools/selectors';

describe('tool taxonomy registry', () => {
  it('builds the minimal tool category hierarchy', () => {
    expect(TOOL_CATEGORY_NODES).toHaveLength(3);
    expect(toolTaxonomy.getRoots().map((node) => node.id)).toEqual([
      'developer',
    ]);
    expect(toolTaxonomy.getNode('developer').parentId).toBeNull();
    expect(toolTaxonomy.getParent('data-formats')?.id).toBe('developer');
    expect(toolTaxonomy.getParent('json')?.id).toBe('data-formats');
    expect(toolTaxonomy.getRoot('json').id).toBe('developer');
  });

  it('exposes the required nodes as published taxonomy data', () => {
    expect(TOOL_CATEGORY_NODES.map((node) => node.id)).toEqual([
      'developer',
      'data-formats',
      'json',
    ]);

    for (const node of TOOL_CATEGORY_NODES) {
      expect(node.status).toBe('published');
      expect(Object.keys(node.localized)).toEqual(['en', 'es', 'pt', 'fr']);
      expect(node).not.toHaveProperty('url');
      expect(node).not.toHaveProperty('canonicalUrl');
      expect(node).not.toHaveProperty('landingPage');
    }
  });

  it('resolves json ancestors and path from root', () => {
    expect(toolTaxonomy.getAncestors('json').map((node) => node.id)).toEqual([
      'developer',
      'data-formats',
    ]);
    expect(toolTaxonomy.getPathFromRoot('json').map((node) => node.id)).toEqual([
      'developer',
      'data-formats',
      'json',
    ]);
  });

  it('resolves localized taxonomy paths without public route semantics', () => {
    expect(toolTaxonomy.getLocalizedPath('json', 'en')).toEqual([
      'developer',
      'data-formats',
      'json',
    ]);
    expect(toolTaxonomy.getLocalizedPath('json', 'es')).toEqual([
      'desarrollo',
      'formatos-de-datos',
      'json',
    ]);
    expect(toolTaxonomy.getLocalizedPath('json', 'pt')).toEqual([
      'desenvolvedor',
      'formatos-de-dados',
      'json',
    ]);
    expect(toolTaxonomy.getLocalizedPath('json', 'fr')).toEqual([
      'developpement',
      'formats-de-donnees',
      'json',
    ]);
  });

  it('exposes tool-specific selectors over the shared engine', () => {
    expect(hasToolCategory('json')).toBe(true);
    expect(hasToolCategory('missing')).toBe(false);
    expect(findToolCategory('json')?.id).toBe('json');
    expect(findToolCategory('missing')).toBeUndefined();
    expect(getToolCategory('json').id).toBe('json');
    expect(getToolCategoryParent('json')?.id).toBe('data-formats');
    expect(getToolCategoryChildren('developer').map((node) => node.id)).toEqual([
      'data-formats',
    ]);
    expect(getToolCategoryAncestors('json').map((node) => node.id)).toEqual([
      'developer',
      'data-formats',
    ]);
    expect(getToolRootCategory('json').id).toBe('developer');
    expect(getToolCategoryPathFromRoot('json').map((node) => node.id)).toEqual([
      'developer',
      'data-formats',
      'json',
    ]);
    expect(getLocalizedToolCategoryPath('json', 'es')).toEqual([
      'desarrollo',
      'formatos-de-datos',
      'json',
    ]);
  });

  it('keeps tool taxonomy files independent from routing and content systems', async () => {
    const registrySource = await readFile(
      new URL(
        '../../../../src/domain/taxonomy/tools/registry.ts',
        import.meta.url,
      ),
      'utf8',
    );
    const selectorsSource = await readFile(
      new URL(
        '../../../../src/domain/taxonomy/tools/selectors.ts',
        import.meta.url,
      ),
      'utf8',
    );

    for (const source of [registrySource, selectorsSource]) {
      expect(source).not.toContain('@/routing');
      expect(source).not.toContain('astro:content');
      expect(source).not.toContain('getStaticPaths');
      expect(source).not.toContain('canonicalUrl');
    }
  });
});
