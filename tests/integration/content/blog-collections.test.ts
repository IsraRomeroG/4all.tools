import { readdir } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

const BLOG_FIXTURE_DIR = new URL(
  '../../../src/content/blog/en/development/json-guides/',
  import.meta.url,
);
const BLOG_CATEGORY_FIXTURE_DIR = new URL(
  '../../../src/content/blog-categories/en/development/',
  import.meta.url,
);

describe('blog content collections', () => {
  it('commits representative valid blog fixture entries', async () => {
    await expect(readdir(BLOG_FIXTURE_DIR)).resolves.toContain(
      'what-is-json.md',
    );
    await expect(readdir(BLOG_CATEGORY_FIXTURE_DIR)).resolves.toContain(
      'json-guides.md',
    );
  });
});
