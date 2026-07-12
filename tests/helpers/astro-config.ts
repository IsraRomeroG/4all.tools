import { access, readFile } from 'node:fs/promises';

const ASTRO_CONFIG_CANDIDATES = ['astro.config.ts', 'astro.config.mjs'] as const;
const PROJECT_ROOT = new URL('../../', import.meta.url);

export interface ActiveAstroConfig {
  name: (typeof ASTRO_CONFIG_CANDIDATES)[number];
  source: string;
  url: URL;
}

async function exists(url: URL): Promise<boolean> {
  try {
    await access(url);
    return true;
  } catch {
    return false;
  }
}

export async function readActiveAstroConfig(): Promise<ActiveAstroConfig> {
  const existing: Array<Pick<ActiveAstroConfig, 'name' | 'url'>> = [];

  for (const name of ASTRO_CONFIG_CANDIDATES) {
    const url = new URL(name, PROJECT_ROOT);

    if (await exists(url)) {
      existing.push({ name, url });
    }
  }

  const [config] = existing;

  if (existing.length !== 1 || config === undefined) {
    throw new Error(
      `Expected exactly one Astro config from ${ASTRO_CONFIG_CANDIDATES.join(
        ', ',
      )}; found ${existing.map(({ name }) => name).join(', ') || 'none'}.`,
    );
  }

  return {
    ...config,
    source: await readFile(config.url, 'utf8'),
  };
}
