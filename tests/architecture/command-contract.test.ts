import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('architecture command contract', () => {
  it('keeps architecture validation independently wired into verify and CI', async () => {
    const packageJson = JSON.parse(
      await readFile(new URL('../../package.json', import.meta.url), 'utf8'),
    ) as { readonly scripts: Record<string, string> };
    const workflow = await readFile(
      new URL('../../.github/workflows/verify.yml', import.meta.url),
      'utf8',
    );

    expect(packageJson.scripts['validate:architecture']).toContain(
      'vitest run tests/architecture',
    );
    expect(packageJson.scripts.verify).toContain('npm run validate:architecture');
    expect(workflow).toContain('npm run verify');
  });
});
