import { readdir, readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

const CONTENT_CONFIG_URL = new URL('../../../src/content.config.ts', import.meta.url);
const BLOG_FIXTURE_DIR = new URL(
  '../../../src/content/blog/en/development/',
  import.meta.url,
);
const BLOG_CATEGORY_FIXTURE_DIR = new URL(
  '../../../src/content/blog-categories/en/',
  import.meta.url,
);

describe('blog content collections', () => {
  it('preserves T02 collections and adds blog collection keys', async () => {
    const source = await readFile(CONTENT_CONFIG_URL, 'utf8');

    expect(source).toContain('tools,');
    expect(source).toContain('toolCategories,');
    expect(source).toContain('blog,');
    expect(source).toContain('blogCategories,');
  });

  it('uses explicit Markdown glob loaders for both blog content roots', async () => {
    const source = await readFile(CONTENT_CONFIG_URL, 'utf8');

    expect(source).toContain("import { defineCollection } from 'astro:content'");
    expect(source).toContain("import { glob } from 'astro/loaders'");
    expect(source).toContain("base: './src/content/blog'");
    expect(source).toContain("base: './src/content/blog-categories'");
    expect(source).toContain("pattern: '**/*.md'");
  });

  it('commits representative valid blog fixture entries', async () => {
    await expect(readdir(BLOG_FIXTURE_DIR)).resolves.toContain(
      'what-is-json.md',
    );
    await expect(readdir(BLOG_CATEGORY_FIXTURE_DIR)).resolves.toContain(
      'json-guides.md',
    );
  });
});
