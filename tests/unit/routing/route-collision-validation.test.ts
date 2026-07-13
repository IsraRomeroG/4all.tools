import { describe, expect, it } from 'vitest';

import {
  RouteValidationError,
  assertValidRouteRecords,
  createRouteRegistryFromRecords,
  inspectRouteRecords,
  type RouteRecord,
  type RouteValidationIssue,
} from '@/routing';

import {
  AREA_TARGET_MISMATCH,
  BLOG_OWNS_BLOG_ROOT,
  DUPLICATE_CURRENT_LOCALE_PREFIX,
  DUPLICATE_IDENTICAL_RECORD,
  DUPLICATE_PATH_CROSS_KIND,
  DUPLICATE_PATH_TWO_TOOLS,
  DUPLICATE_TARGET_TWO_PATHS,
  INVALID_BLOG_NAMESPACE,
  INVALID_SEGMENT_SLASH,
  INVALID_SEGMENT_UPPERCASE,
  LOCALE_PREFIX_ROOT,
  OTHER_LOCALE_CODE_IN_PREFIXED_LOCALE,
  RESERVED_BLOG_TOOL_ROOT,
  SAME_TARGET_DIFFERENT_LOCALES,
  SAME_TEXT_PATH_DIFFERENT_LOCALES,
} from '../../fixtures/routing/invalid-route-records';

describe('route collision validation', () => {
  it('detects two tools claiming the same public path', () => {
    expect(issueCodes(DUPLICATE_PATH_TWO_TOOLS)).toContain(
      'DUPLICATE_PUBLIC_PATH',
    );
  });

  it('detects cross-kind public path collisions', () => {
    const issues = inspectRouteRecords(DUPLICATE_PATH_CROSS_KIND);

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: 'DUPLICATE_PUBLIC_PATH',
        locale: 'en',
        path: 'developer/shared',
      }),
    );
  });

  it('detects one canonical target with two paths in the same locale', () => {
    expect(issueCodes(DUPLICATE_TARGET_TWO_PATHS)).toEqual([
      'DUPLICATE_CANONICAL_TARGET',
    ]);
  });

  it('allows the same target to have one canonical route per locale', () => {
    expect(inspectRouteRecords(SAME_TARGET_DIFFERENT_LOCALES)).toEqual([]);
  });

  it('allows the same locale-relative path text in different locale namespaces', () => {
    expect(inspectRouteRecords(SAME_TEXT_PATH_DIFFERENT_LOCALES)).toEqual([]);
  });

  it('rejects an English route claiming a locale prefix at site root', () => {
    expect(issueCodes(LOCALE_PREFIX_ROOT)).toContain(
      'RESERVED_ROOT_SEGMENT',
    );
  });

  it('rejects a prefixed locale route that duplicates its own locale prefix', () => {
    const issues = inspectRouteRecords(DUPLICATE_CURRENT_LOCALE_PREFIX);

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: 'RESERVED_ROOT_SEGMENT',
        locale: 'es',
        path: 'es/example-tool',
      }),
    );
  });

  it('allows another locale code inside an already-prefixed locale namespace', () => {
    expect(inspectRouteRecords(OTHER_LOCALE_CODE_IN_PREFIXED_LOCALE)).toEqual(
      [],
    );
  });

  it('rejects a tool route claiming the blog namespace', () => {
    expect(issueCodes(RESERVED_BLOG_TOOL_ROOT)).toContain(
      'RESERVED_ROOT_SEGMENT',
    );
  });

  it('allows blog records to own the blog namespace', () => {
    expect(inspectRouteRecords(BLOG_OWNS_BLOG_ROOT)).toEqual([]);
  });

  it('rejects invalid uppercase segments through the shared segment validator', () => {
    expect(issueCodes(INVALID_SEGMENT_UPPERCASE)).toContain(
      'INVALID_SEGMENT',
    );
  });

  it('rejects slash-containing segments through the shared segment validator', () => {
    expect(issueCodes(INVALID_SEGMENT_SLASH)).toContain('INVALID_SEGMENT');
  });

  it('reports duplicate identical route records explicitly', () => {
    expectRouteValidationError(
      () => assertValidRouteRecords(DUPLICATE_IDENTICAL_RECORD),
      'DUPLICATE_ROUTE_RECORD',
    );
  });

  it('orders issue reports deterministically regardless of input order', () => {
    const invalidRecords = [
      ...DUPLICATE_PATH_CROSS_KIND,
      ...DUPLICATE_TARGET_TWO_PATHS,
      ...INVALID_SEGMENT_UPPERCASE,
      ...RESERVED_BLOG_TOOL_ROOT,
      ...INVALID_BLOG_NAMESPACE,
    ];
    const firstSummary = summarizeIssues(inspectRouteRecords(invalidRecords));
    const secondSummary = summarizeIssues(
      inspectRouteRecords([...invalidRecords].reverse()),
    );

    expect(secondSummary).toEqual(firstSummary);
  });

  it('rejects area and target kind mismatches', () => {
    expect(issueCodes(AREA_TARGET_MISMATCH)).toContain('INVALID_AREA_TARGET');
  });

  it('rejects blog records outside the blog namespace', () => {
    expect(issueCodes(INVALID_BLOG_NAMESPACE)).toContain(
      'INVALID_BLOG_NAMESPACE',
    );
  });

  it('reports structurally invalid route records', () => {
    const malformedRecords = [
      {
        area: 'tools',
        locale: 'en',
        segments: 'developer/json-validator',
        target: {
          kind: 'tool',
          toolId: 'json-validator',
        },
        sourceId: 'fixture:malformed',
      },
    ] as unknown as readonly RouteRecord[];

    expect(issueCodes(malformedRecords)).toContain('INVALID_ROUTE_RECORD');
  });

  it('integrates aggregate validation into registry construction', () => {
    expectRouteValidationError(
      () => createRouteRegistryFromRecords(DUPLICATE_PATH_TWO_TOOLS),
      'DUPLICATE_PUBLIC_PATH',
    );
  });
});

function issueCodes(
  records: readonly RouteRecord[],
): readonly RouteValidationIssue['code'][] {
  return inspectRouteRecords(records).map((issue) => issue.code);
}

function summarizeIssues(
  issues: readonly RouteValidationIssue[],
): readonly string[] {
  return issues.map((issue) =>
    [
      issue.code,
      issue.locale ?? '',
      issue.path ?? '',
      issue.targetKey ?? '',
      issue.sourceIds?.join(',') ?? '',
      issue.message,
    ].join('|'),
  );
}

function expectRouteValidationError(
  action: () => unknown,
  code: RouteValidationIssue['code'],
): void {
  expect(action).toThrow(RouteValidationError);

  try {
    action();
  } catch (error) {
    expect(error).toBeInstanceOf(RouteValidationError);
    expect((error as RouteValidationError).code).toBe(code);
    expect((error as RouteValidationError).issues[0]?.code).toBe(code);
  }
}
