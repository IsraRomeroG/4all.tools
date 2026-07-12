import { describe, expect, it } from 'vitest';

import type { ToolCategoryId } from '@/domain/shared/ids';
import {
  getToolCategoryAncestors,
  getToolCategoryPathFromRoot,
  getToolRootCategory,
} from '@/domain/taxonomy/tools/selectors';

describe('tool taxonomy classification semantics', () => {
  it('supports future json-validator classification without generating a URL', () => {
    const primaryCategoryId: ToolCategoryId = 'json';

    expect(getToolRootCategory(primaryCategoryId).id).toBe('developer');
    expect(
      getToolCategoryAncestors(primaryCategoryId).map((node) => node.id),
    ).toEqual(['developer', 'data-formats']);
    expect(
      getToolCategoryPathFromRoot(primaryCategoryId).map((node) => node.id),
    ).toEqual(['developer', 'data-formats', 'json']);
  });
});
