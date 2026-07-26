import { describe, expect, it } from 'vitest';

import { readActiveAstroConfig } from '../helpers/astro-config';

describe('project baseline', () => {
  it('uses a single supported Astro config file', async () => {
    const config = await readActiveAstroConfig();

    expect(config.name).toBe('astro.config.ts');
  });

});
