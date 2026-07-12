import { describe, expect, it } from 'vitest';

import type { BlogCategoryId } from '@/domain/shared/ids';
import {
  getBlogCategoryAncestors,
  getBlogCategoryPathFromRoot,
  getBlogRootCategory,
} from '@/domain/taxonomy/blog/selectors';
import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';

describe('blog taxonomy independence', () => {
  it('coexists with tool taxonomy while keeping separate root identities', () => {
    const blogCategoryId: BlogCategoryId = 'json-guides';

    expect(blogTaxonomy).not.toBe(toolTaxonomy);
    expect(toolTaxonomy.getRoot('json').id).toBe('developer');
    expect(getBlogRootCategory(blogCategoryId).id).toBe('development');
    expect(
      getBlogCategoryAncestors(blogCategoryId).map((node) => node.id),
    ).toEqual(['development']);
    expect(
      getBlogCategoryPathFromRoot(blogCategoryId).map((node) => node.id),
    ).toEqual(['development', 'json-guides']);
  });
});
