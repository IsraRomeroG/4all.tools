import { access, copyFile, mkdir } from 'node:fs/promises';

const projectRoot = new URL('../', import.meta.url);
const productionStore = new URL('node_modules/.astro/data-store.json', projectRoot);
const vitestStore = new URL('.astro/data-store.json', projectRoot);
const vitestStoreDir = new URL('.astro/', projectRoot);

async function assertReadableStore() {
  try {
    await access(productionStore);
  } catch (error) {
    throw new Error(
      [
        'Astro content store was not generated at node_modules/.astro/data-store.json.',
        'Run `astro sync --force` before preparing Vitest integration tests.',
      ].join(' '),
      { cause: error },
    );
  }
}

await assertReadableStore();
await mkdir(vitestStoreDir, { recursive: true });
await copyFile(productionStore, vitestStore);

console.log('Prepared Astro content store for Vitest integration tests.');
