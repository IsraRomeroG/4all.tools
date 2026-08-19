import { readdir } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

const TOOL_CONTENT_DIR = new URL('../../../src/content/tools/', import.meta.url);
const TOOL_CATEGORY_CONTENT_DIR = new URL(
  '../../../src/content/tool-categories/',
  import.meta.url,
);

describe('tool content collections', () => {
  it('commits representative valid fixture entries', async () => {
    for (const locale of ['en', 'es', 'pt', 'fr'] as const) {
      await expect(
        readdir(new URL(`${locale}/developer/json/`, TOOL_CONTENT_DIR)),
      ).resolves.toContain('json-formatter-validator.md');
    }

    for (const locale of ['en', 'es', 'pt', 'fr'] as const) {
      await expect(
        readdir(new URL(`${locale}/`, TOOL_CATEGORY_CONTENT_DIR)),
      ).resolves.toContain('developer.md');
    }
  });
});
