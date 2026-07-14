import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

const indexUrl = new URL('../../dist/index.html', import.meta.url);

describe('static build output', () => {
  it('generates the root page through the home template', async () => {
    const html = await readFile(indexUrl, 'utf8');

    expect(html).toContain('data-template="home"');
  });
});
