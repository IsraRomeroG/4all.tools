import { readdir, readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

const CONTENT_CONFIG_URL = new URL('../../../src/content.config.ts', import.meta.url);
const TOOL_FIXTURE_DIR = new URL(
  '../../../src/content/tools/en/developer/',
  import.meta.url,
);
const TOOL_CATEGORY_FIXTURE_DIR = new URL(
  '../../../src/content/tool-categories/en/',
  import.meta.url,
);

describe('tool content collections', () => {
  it('exports stable collection keys for tools and tool categories', async () => {
    const source = await readFile(CONTENT_CONFIG_URL, 'utf8');

    expect(source).toContain('export const collections = {');
    expect(source).toContain('tools,');
    expect(source).toContain('toolCategories,');
  });

  it('uses explicit Markdown glob loaders for both content roots', async () => {
    const source = await readFile(CONTENT_CONFIG_URL, 'utf8');

    expect(source).toContain("import { defineCollection } from 'astro:content'");
    expect(source).toContain("import { glob } from 'astro/loaders'");
    expect(source).toContain("base: './src/content/tools'");
    expect(source).toContain("base: './src/content/tool-categories'");
    expect(source).toContain("pattern: '**/*.md'");
  });

  it('commits representative valid fixture entries', async () => {
    await expect(readdir(TOOL_FIXTURE_DIR)).resolves.toContain(
      'json-validator.md',
    );
    await expect(readdir(TOOL_CATEGORY_FIXTURE_DIR)).resolves.toContain(
      'developer.md',
    );
  });
});
