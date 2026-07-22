import type {
  ArchitectureValidationCounts,
  ArchitectureValidationIssue,
  ArchitectureValidationReport,
} from './types';

export type ArchitectureValidationIssueInput = ArchitectureValidationIssue;

const EMPTY_COUNTS: ArchitectureValidationCounts = {
  contentEntries: 0,
  toolDefinitions: 0,
  toolModules: 0,
  routeDefinitions: 0,
  routeRecords: 0,
  pageModels: 0,
  sourceFiles: 0,
};

export function createArchitectureValidationIssue(
  input: ArchitectureValidationIssueInput,
): ArchitectureValidationIssue {
  return freezeIssue(input);
}

export function createArchitectureValidationReport(
  issues: readonly ArchitectureValidationIssue[] = [],
  inspected: Partial<ArchitectureValidationCounts> = {},
): ArchitectureValidationReport {
  const uniqueIssues = new Map<string, ArchitectureValidationIssue>();

  for (const issue of issues) {
    const frozenIssue = freezeIssue(issue);
    uniqueIssues.set(issueKey(frozenIssue), frozenIssue);
  }

  const sortedIssues = Object.freeze(
    [...uniqueIssues.values()].sort(compareArchitectureValidationIssues),
  );
  const counts = Object.freeze({ ...EMPTY_COUNTS, ...inspected });

  return Object.freeze({
    issues: sortedIssues,
    inspected: counts,
  });
}

export function compareArchitectureValidationIssues(
  first: ArchitectureValidationIssue,
  second: ArchitectureValidationIssue,
): number {
  return (
    compareCodePointStrings(first.scope, second.scope) ||
    compareCodePointStrings(first.code, second.code) ||
    compareCodePointStrings(first.entityKey ?? '', second.entityKey ?? '') ||
    compareCodePointStrings(first.locale ?? '', second.locale ?? '') ||
    compareCodePointStrings(first.sourceId ?? '', second.sourceId ?? '') ||
    compareCodePointStrings(first.message, second.message) ||
    compareCodePointStrings(serialize(first.details), serialize(second.details))
  );
}

export function formatArchitectureValidationReport(
  report: ArchitectureValidationReport,
): string {
  if (report.issues.length === 0) {
    return 'Architecture validation passed.';
  }

  const lines = report.issues.map((issue) => {
    const context = [
      issue.entityKey === undefined ? null : `entity=${issue.entityKey}`,
      issue.locale === undefined ? null : `locale=${issue.locale}`,
      issue.sourceId === undefined ? null : `source=${issue.sourceId}`,
    ].filter((value): value is string => value !== null);
    const suffix = context.length === 0 ? '' : ` (${context.join(', ')})`;

    return `- [${issue.scope}/${issue.code}] ${issue.message}${suffix}`;
  });

  return [
    `Architecture validation failed with ${report.issues.length} issue(s).`,
    ...lines,
  ].join('\n');
}

export class ArchitectureValidationError extends Error {
  readonly report: ArchitectureValidationReport;

  constructor(report: ArchitectureValidationReport) {
    super(formatArchitectureValidationReport(report));
    this.name = 'ArchitectureValidationError';
    this.report = report;
  }
}

export function assertArchitectureValid(
  report: ArchitectureValidationReport,
): asserts report is ArchitectureValidationReport & { readonly issues: readonly [] } {
  if (report.issues.length > 0) {
    throw new ArchitectureValidationError(report);
  }
}

function freezeIssue(
  issue: ArchitectureValidationIssue,
): ArchitectureValidationIssue {
  return Object.freeze({
    ...issue,
    ...(issue.details === undefined
      ? {}
      : { details: freezeRecord(issue.details) }),
  });
}

function freezeRecord(
  record: Readonly<Record<string, unknown>>,
): Readonly<Record<string, unknown>> {
  return freezeValue(record) as Readonly<Record<string, unknown>>;
}

function freezeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return Object.freeze(value.map(freezeValue));
  }

  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value).map(([key, child]) => [
      key,
      freezeValue(child),
    ]);
    return Object.freeze(Object.fromEntries(entries));
  }

  return value;
}

function issueKey(issue: ArchitectureValidationIssue): string {
  return serialize({
    code: issue.code,
    scope: issue.scope,
    message: issue.message,
    entityKey: issue.entityKey ?? null,
    locale: issue.locale ?? null,
    sourceId: issue.sourceId ?? null,
    details: issue.details ?? null,
  });
}

function serialize(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value) ?? String(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(serialize).join(',')}]`;
  }

  return `{${Object.keys(value)
    .sort(compareCodePointStrings)
    .map(
      (key) =>
        `${JSON.stringify(key)}:${serialize((value as Record<string, unknown>)[key])}`,
    )
    .join(',')}}`;
}

function compareCodePointStrings(first: string, second: string): number {
  const firstPoints = Array.from(first);
  const secondPoints = Array.from(second);
  const length = Math.min(firstPoints.length, secondPoints.length);

  for (let index = 0; index < length; index += 1) {
    const firstPoint = firstPoints[index]?.codePointAt(0) ?? 0;
    const secondPoint = secondPoints[index]?.codePointAt(0) ?? 0;

    if (firstPoint !== secondPoint) {
      return firstPoint - secondPoint;
    }
  }

  return firstPoints.length - secondPoints.length;
}
