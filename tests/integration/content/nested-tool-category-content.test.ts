import { getCollection } from 'astro:content';
import { describe, expect, it } from 'vitest';

describe('nested tool-category content', () => {
  it('loads subcategory content from a root-category subfolder', async () => {
    const entries = await getCollection('toolCategories');
    const entry = entries.find(
      (candidate) => candidate.data.categoryId === 'data-formats',
    );

    expect(entry).toMatchObject({
      id: 'en/developer/data-formats',
      data: {
        categoryId: 'data-formats',
        locale: 'en',
        status: 'draft',
      },
    });
  });
});
