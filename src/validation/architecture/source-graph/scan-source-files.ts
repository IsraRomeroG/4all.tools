import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

import { extractSourceImports } from './extract-imports';
import { normalizePath, resolveProjectImport } from './resolve-project-import';
import type { SourceFileSnapshot, SourceGraph } from './types';

const SOURCE_EXTENSIONS = new Set([
  '.ts',
  '.astro',
  '.mts',
  '.cts',
  '.js',
  '.mjs',
]);

export async function scanSourceGraph(
  rootDirectory: string = process.cwd(),
): Promise<SourceGraph> {
  const sourceDirectory = path.join(rootDirectory, 'src');
  const absoluteFiles = await collectFiles(sourceDirectory);
  const files = Object.freeze(
    await Promise.all(
      absoluteFiles.map(async (filePath) => ({
        sourcePath: normalizePath(path.relative(rootDirectory, filePath)),
        source: await readFile(filePath, 'utf8'),
      })),
    ),
  );
  const knownFiles = new Set(files.map((file) => file.sourcePath));
  const edges = Object.freeze(
    files
      .flatMap((file) => extractSourceImports(file))
      .map((edge) => {
        const resolvedTargetPath = resolveProjectImport(
          edge.sourcePath,
          edge.specifier,
          knownFiles,
        );

        return Object.freeze({
          ...edge,
          ...(resolvedTargetPath === undefined ? {} : { resolvedTargetPath }),
        });
      })
      .sort(compareEdges),
  );

  return Object.freeze({ files, edges });
}

export function createSourceGraph(
  files: readonly SourceFileSnapshot[],
): SourceGraph {
  const orderedFiles = Object.freeze(
    [...files].map((file) => Object.freeze({
      sourcePath: normalizePath(file.sourcePath),
      source: file.source,
    })).sort((first, second) => compareText(first.sourcePath, second.sourcePath)),
  );
  const knownFiles = new Set(orderedFiles.map((file) => file.sourcePath));
  const edges = Object.freeze(
    orderedFiles
      .flatMap((file) => extractSourceImports(file))
      .map((edge) => {
        const resolvedTargetPath = resolveProjectImport(
          edge.sourcePath,
          edge.specifier,
          knownFiles,
        );

        return Object.freeze({
          ...edge,
          ...(resolvedTargetPath === undefined ? {} : { resolvedTargetPath }),
        });
      })
      .sort(compareEdges),
  );

  return Object.freeze({ files: orderedFiles, edges });
}

async function collectFiles(directory: string): Promise<readonly string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries.sort((first, second) => compareText(first.name, second.name))) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)));
    } else if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files.sort(compareText);
}

function compareEdges(
  first: { readonly sourcePath: string; readonly specifier: string; readonly resolvedTargetPath?: string },
  second: { readonly sourcePath: string; readonly specifier: string; readonly resolvedTargetPath?: string },
): number {
  return compareText(first.sourcePath, second.sourcePath) ||
    compareText(first.resolvedTargetPath ?? first.specifier, second.resolvedTargetPath ?? second.specifier) ||
    compareText(first.specifier, second.specifier);
}

function compareText(first: string, second: string): number {
  return first < second ? -1 : first > second ? 1 : 0;
}
