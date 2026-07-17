import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import {
  BLOG_CATEGORY_NODES,
  blogTaxonomy,
} from '@/domain/taxonomy/blog/registry';
import {
  findBlogCategory,
  getBlogCategory,
  getBlogCategoryAncestors,
  getBlogCategoryChildren,
  getBlogCategoryParent,
  getBlogCategoryPathFromRoot,
  getBlogRootCategory,
  getLocalizedBlogCategoryPath,
  hasBlogCategory,
} from '@/domain/taxonomy/blog/selectors';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';

describe('blog taxonomy registry', () => {
  it('builds the minimal blog category hierarchy independently', () => {
    expect(BLOG_CATEGORY_NODES).toHaveLength(2);
    expect(blogTaxonomy).not.toBe(toolTaxonomy);
    expect(blogTaxonomy.getRoots().map((node) => node.id)).toEqual([
      'development',
    ]);
    expect(blogTaxonomy.getNode('development').parentId).toBeNull();
    expect(blogTaxonomy.getParent('json-guides')?.id).toBe('development');
    expect(blogTaxonomy.getRoot('json-guides').id).toBe('development');
  });

  it('exposes the required blog nodes as published taxonomy data', () => {
    expect(BLOG_CATEGORY_NODES.map((node) => node.id)).toEqual([
      'development',
      'json-guides',
    ]);

    for (const node of BLOG_CATEGORY_NODES) {
      expect(node.status).toBe('published');
      expect(Object.keys(node.localized)).toEqual(['en', 'es', 'pt', 'fr']);
      expect(node).not.toHaveProperty('url');
      expect(node).not.toHaveProperty('canonicalUrl');
      expect(node).not.toHaveProperty('landingPage');
    }
  });

  it('resolves json-guides ancestors and path from root', () => {
    expect(
      blogTaxonomy.getAncestors('json-guides').map((node) => node.id),
    ).toEqual(['development']);
    expect(
      blogTaxonomy.getPathFromRoot('json-guides').map((node) => node.id),
    ).toEqual(['development', 'json-guides']);
  });

  it('resolves localized taxonomy paths without public blog route semantics', () => {
    expect(blogTaxonomy.getLocalizedPath('json-guides', 'en')).toEqual([
      'development',
      'json-guides',
    ]);
    expect(blogTaxonomy.getLocalizedPath('json-guides', 'es')).toEqual([
      'desarrollo',
      'guias-json',
    ]);
    expect(blogTaxonomy.getLocalizedPath('json-guides', 'pt')).toEqual([
      'desenvolvimento',
      'guias-json',
    ]);
    expect(blogTaxonomy.getLocalizedPath('json-guides', 'fr')).toEqual([
      'developpement',
      'guides-json',
    ]);
  });

  it('uses corrected user-facing labels while preserving ASCII slugs', () => {
    expect(blogTaxonomy.getNode('development').localized.fr).toEqual({
      slug: 'developpement',
      label: 'Développement',
    });
    expect(blogTaxonomy.getNode('json-guides').localized.es).toEqual({
      slug: 'guias-json',
      label: 'Guías de JSON',
    });
  });

  it('exposes blog-specific selectors over the shared engine', () => {
    expect(hasBlogCategory('json-guides')).toBe(true);
    expect(hasBlogCategory('json')).toBe(false);
    expect(findBlogCategory('json-guides')?.id).toBe('json-guides');
    expect(findBlogCategory('json')).toBeUndefined();
    expect(getBlogCategory('json-guides').id).toBe('json-guides');
    expect(getBlogCategoryParent('json-guides')?.id).toBe('development');
    expect(getBlogCategoryChildren('development').map((node) => node.id)).toEqual([
      'json-guides',
    ]);
    expect(getBlogCategoryAncestors('json-guides').map((node) => node.id)).toEqual([
      'development',
    ]);
    expect(getBlogRootCategory('json-guides').id).toBe('development');
    expect(
      getBlogCategoryPathFromRoot('json-guides').map((node) => node.id),
    ).toEqual(['development', 'json-guides']);
    expect(getLocalizedBlogCategoryPath('json-guides', 'es')).toEqual([
      'desarrollo',
      'guias-json',
    ]);
  });

  it('keeps blog taxonomy files independent from tools, routing, and content systems', async () => {
    const registrySource = await readFile(
      new URL('../../../../src/domain/taxonomy/blog/registry.ts', import.meta.url),
      'utf8',
    );
    const selectorsSource = await readFile(
      new URL('../../../../src/domain/taxonomy/blog/selectors.ts', import.meta.url),
      'utf8',
    );

    for (const source of [registrySource, selectorsSource]) {
      expect(source).not.toContain('@/domain/taxonomy/tools');
      expect(source).not.toContain('toolTaxonomy');
      expect(source).not.toContain('TOOL_CATEGORY_NODES');
      expect(source).not.toContain('@/routing');
      expect(source).not.toContain('astro:content');
      expect(source).not.toContain('getStaticPaths');
      expect(source).not.toContain('ArticleDefinition');
      expect(source).not.toContain('canonicalUrl');
    }
  });
});
