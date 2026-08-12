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
    expect(toolTaxonomy.getParent('json')?.id).toBe('developer');
    expect(toolTaxonomy.getRoot('json').id).toBe('developer');
  });

  it('exposes the required classification-only taxonomy data', () => {
    expect(TOOL_CATEGORY_NODES.map((node) => node.id)).toEqual([
      'developer',
      'data-formats',
      'json',
    ]);

    for (const node of TOOL_CATEGORY_NODES) {
      expect(Object.keys(node.localized)).toEqual(['en', 'es', 'pt', 'fr']);
      expect(node).not.toHaveProperty('url');
      expect(node).not.toHaveProperty('canonicalUrl');
      expect(node).not.toHaveProperty('landingPage');
    }
  });

  it('resolves json ancestors and path from root', () => {
    expect(toolTaxonomy.getAncestors('json').map((node) => node.id)).toEqual([
      'developer',
    ]);
    expect(toolTaxonomy.getPathFromRoot('json').map((node) => node.id)).toEqual([
      'developer',
      'json',
    ]);
  });

  it('resolves localized taxonomy paths without public route semantics', () => {
    expect(toolTaxonomy.getLocalizedPath('json', 'en')).toEqual([
      'developer',
      'json',
    ]);
    expect(toolTaxonomy.getLocalizedPath('json', 'es')).toEqual([
      'desarrollo',
      'json',
    ]);
    expect(toolTaxonomy.getLocalizedPath('json', 'pt')).toEqual([
      'desenvolvedor',
      'json',
    ]);
    expect(toolTaxonomy.getLocalizedPath('json', 'fr')).toEqual([
      'developpement',
      'json',
    ]);
  });

  it('uses corrected user-facing labels while preserving ASCII slugs', () => {
    expect(toolTaxonomy.getNode('developer').localized.fr).toEqual({
      slug: 'developpement',
      label: 'Outils pour développeurs',
    });
    expect(toolTaxonomy.getNode('data-formats').localized.fr).toEqual({
      slug: 'formats-de-donnees',
      label: 'Formats de données',
    });
  });

  it('exposes tool-specific selectors over the shared engine', () => {
    expect(hasToolCategory('json')).toBe(true);
    expect(hasToolCategory('missing')).toBe(false);
    expect(findToolCategory('json')?.id).toBe('json');
    expect(findToolCategory('missing')).toBeUndefined();
    expect(getToolCategory('json').id).toBe('json');
    expect(getToolCategoryParent('json')?.id).toBe('developer');
    expect(getToolCategoryChildren('developer').map((node) => node.id)).toEqual([
      'data-formats',
      'json',
    ]);
    expect(getToolCategoryAncestors('json').map((node) => node.id)).toEqual([
      'developer',
    ]);
    expect(getToolRootCategory('json').id).toBe('developer');
    expect(getToolCategoryPathFromRoot('json').map((node) => node.id)).toEqual([
      'developer',
      'json',
    ]);
    expect(getLocalizedToolCategoryPath('json', 'es')).toEqual([
      'desarrollo',
      'json',
    ]);
  });

});
