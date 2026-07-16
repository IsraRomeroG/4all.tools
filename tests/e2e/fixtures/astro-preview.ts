import { spawn, type ChildProcessByStdio } from 'node:child_process';
import type { Readable } from 'node:stream';
import { setTimeout as delay } from 'node:timers/promises';

export interface AstroPreviewServer {
  stop(): Promise<void>;
}

const PREVIEW_URL = 'http://127.0.0.1:4321/';
const PREVIEW_HOST = '127.0.0.1';
const PREVIEW_PORT = '4321';

type AstroPreviewProcess = ChildProcessByStdio<null, Readable, Readable>;

export async function startAstroPreview(): Promise<AstroPreviewServer> {
  const child = spawn(
    process.execPath,
    [
      './node_modules/astro/bin/astro.mjs',
      'preview',
      '--host',
      PREVIEW_HOST,
      '--port',
      PREVIEW_PORT,
    ],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        FORCE_COLOR: '0',
        NO_COLOR: '1',
      },
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    },
  );
  const output: string[] = [];
  const exitPromise = waitForExit(child);

  child.stdout.on('data', (chunk: Buffer) => {
    output.push(chunk.toString());
  });
  child.stderr.on('data', (chunk: Buffer) => {
    output.push(chunk.toString());
  });

  await Promise.race([
    waitForPreview(PREVIEW_URL),
    exitPromise.then((exit) => {
      throw new Error(
        `Astro preview exited before ${PREVIEW_URL} became available. ` +
          `Exit code: ${exit.code ?? 'null'}. Signal: ${exit.signal ?? 'null'}.\n` +
          output.join(''),
      );
    }),
  ]);

  return {
    async stop() {
      await stopPreview(child, exitPromise);
    },
  };
}

async function waitForPreview(url: string): Promise<void> {
  const deadline = Date.now() + 30_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return;
      }
    } catch {
      // Preview is still starting.
    }

    await delay(250);
  }

  throw new Error(`Timed out waiting for Astro preview at ${url}.`);
}

async function stopPreview(
  child: AstroPreviewProcess,
  exitPromise: Promise<{ code: number | null; signal: NodeJS.Signals | null }>,
): Promise<void> {
  if (child.exitCode !== null) {
    return;
  }

  child.kill();

  const exited = await Promise.race([
    exitPromise.then(() => true),
    delay(5_000).then(() => false),
  ]);

  if (exited || child.exitCode !== null) {
    return;
  }

  child.kill('SIGKILL');
  await Promise.race([exitPromise, delay(5_000)]);
}

function waitForExit(
  child: AstroPreviewProcess,
): Promise<{ code: number | null; signal: NodeJS.Signals | null }> {
  return new Promise((resolve) => {
    child.once('exit', (code, signal) => {
      resolve({ code, signal });
    });
  });
}
