import { existsSync } from 'node:fs';
import path from 'node:path';

import { createArchitectureValidationIssue } from '../report';
import type { ArchitectureValidationIssue } from '../types';

export function validateSourceBoundaries(
  options: {
    readonly rootDirectory?: string;
    readonly forbiddenNamespaceExists?: boolean;
  } = {},
): readonly ArchitectureValidationIssue[] {
  const rootDirectory = options.rootDirectory ?? process.cwd();

  const forbiddenNamespaceExists =
    options.forbiddenNamespaceExists ??
    existsSync(path.join(rootDirectory, 'src', 'views'));

  return forbiddenNamespaceExists
    ? [
        createArchitectureValidationIssue({
          code: 'FORBIDDEN_SOURCE_NAMESPACE',
          scope: 'source-boundary',
          message: 'The src/views namespace is forbidden.',
          entityKey: 'src/views',
        }),
      ]
    : [];
}
