import path from 'node:path';

const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.astro', '.mts', '.cts', '.js', '.mjs'] as const;

export function resolveProjectImport(
  sourcePath: string,
  specifier: string,
  knownFiles: ReadonlySet<string>,
): string | undefined {
  if (specifier.startsWith('astro:')) {
    return undefined;
  }

  let basePath: string;

  if (specifier.startsWith('@/')) {
    basePath = path.posix.join('src', specifier.slice(2));
  } else if (specifier.startsWith('.')) {
    basePath = path.posix.join(path.posix.dirname(sourcePath), specifier);
  } else {
    return undefined;
  }

  const normalized = normalizePath(basePath);
  const candidates = path.posix.extname(normalized)
    ? [normalized]
    : [
        ...SOURCE_EXTENSIONS.map((extension) => `${normalized}${extension}`),
        ...SOURCE_EXTENSIONS.map((extension) =>
          path.posix.join(normalized, `index${extension}`),
        ),
      ];

  return candidates.find((candidate) => knownFiles.has(candidate));
}

export function normalizePath(value: string): string {
  return value.replaceAll('\\', '/').replace(/^\.\//, '');
}
