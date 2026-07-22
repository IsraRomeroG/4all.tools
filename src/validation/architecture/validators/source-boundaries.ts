import { existsSync } from 'node:fs';
import path from 'node:path';

import {
  compareArchitectureValidationIssues,
  createArchitectureValidationIssue,
} from '../report';
import type { ArchitectureValidationIssue } from '../types';
import {
  SOURCE_DEPENDENCY_RULES,
  matchesPolicyPattern,
  type SourceDependencyRule,
} from '../source-graph/policy';
import type { SourceGraph } from '../source-graph/types';

export function validateSourceBoundaries(
  graph: SourceGraph,
  options: {
    readonly rootDirectory?: string;
    readonly rules?: readonly SourceDependencyRule[];
    readonly forbiddenNamespaceExists?: boolean;
  } = {},
): readonly ArchitectureValidationIssue[] {
  const rules = options.rules ?? SOURCE_DEPENDENCY_RULES;
  const issues: ArchitectureValidationIssue[] = [];
  const rootDirectory = options.rootDirectory ?? process.cwd();

  const forbiddenNamespaceExists =
    options.forbiddenNamespaceExists ??
    existsSync(path.join(rootDirectory, 'src', 'views'));

  if (forbiddenNamespaceExists) {
    issues.push(
      createArchitectureValidationIssue({
        code: 'FORBIDDEN_SOURCE_NAMESPACE',
        scope: 'source-boundary',
        message: 'The src/views namespace is forbidden.',
        entityKey: 'src/views',
      }),
    );
  }

  for (const edge of graph.edges) {
    for (const rule of rules) {
      if (!rule.from.some((pattern) => matchesPolicyPattern(edge.sourcePath, pattern))) {
        continue;
      }

      const target = edge.resolvedTargetPath ?? edge.specifier;
      const exception = rule.allowedExceptions?.some(
        (candidate) =>
          matchesPolicyPattern(edge.sourcePath, candidate.source) &&
          (matchesPolicyPattern(target, candidate.target) ||
            matchesPolicyPattern(edge.specifier, candidate.target)),
      );

      if (exception) {
        continue;
      }
      const forbidden = rule.forbiddenTargets.some((pattern) =>
        matchesPolicyPattern(target, pattern) || matchesPolicyPattern(edge.specifier, pattern),
      );

      if (!forbidden) {
        continue;
      }

      issues.push(
        createArchitectureValidationIssue({
          code: 'FORBIDDEN_SOURCE_DEPENDENCY',
          scope: 'source-boundary',
          message: `Source dependency violates ${rule.id}: ${edge.sourcePath} imports ${edge.specifier}.`,
          entityKey: edge.sourcePath,
          sourceId: edge.sourcePath,
          details: {
            ruleId: rule.id,
            sourcePath: edge.sourcePath,
            specifier: edge.specifier,
            resolvedTargetPath: edge.resolvedTargetPath ?? null,
            rationale: rule.rationale,
          },
        }),
      );
    }
  }

  return Object.freeze([...issues].sort(compareArchitectureValidationIssues));
}
