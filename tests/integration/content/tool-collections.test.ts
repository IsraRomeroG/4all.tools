import { readdir } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

const TOOL_CONTENT_DIR = new URL('../../../src/content/tools/', import.meta.url);
const TOOL_CATEGORY_FIXTURE_DIR = new URL(
  '../../../src/content/tool-categories/en/',
  import.meta.url,
);

describe('tool content collections', () => {
  it('commits representative valid fixture entries', async () => {
    for (const locale of ['en', 'es', 'pt', 'fr'] as const) {
      await expect(
        readdir(new URL(`${locale}/developer/`, TOOL_CONTENT_DIR)),
      ).resolves.toContain('json-validator.md');
    }

    await expect(readdir(TOOL_CATEGORY_FIXTURE_DIR)).resolves.toContain(
      'developer.md',
    );
  });
});
