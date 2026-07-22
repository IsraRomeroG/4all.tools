import { describe, expect, it } from 'vitest';

import {
  ArchitectureValidationError,
  assertArchitectureValid,
  createArchitectureValidationIssue,
  createArchitectureValidationReport,
  formatArchitectureValidationReport,
} from '@/validation/architecture';

describe('architecture validation contracts', () => {
  it('freezes issues, nested details, report arrays, and counts', () => {
    const issue = createArchitectureValidationIssue({
      code: 'DUPLICATE_CONTENT_IDENTITY',
      scope: 'content',
      message: 'Duplicate content identity.',
      entityKey: 'json-validator',
      details: { entryIds: ['b', 'a'], nested: { status: 'draft' } },
    });
    const report = createArchitectureValidationReport([issue], {
      contentEntries: 2,
    });

    expect(Object.isFrozen(issue)).toBe(true);
    expect(Object.isFrozen(issue.details)).toBe(true);
    expect(Object.isFrozen(issue.details?.entryIds)).toBe(true);
    expect(Object.isFrozen(report)).toBe(true);
    expect(Object.isFrozen(report.issues)).toBe(true);
    expect(Object.isFrozen(report.inspected)).toBe(true);
    expect(() => {
      (report.issues as unknown as unknown[]).push(issue);
    }).toThrow(TypeError);
    expect(report.inspected.contentEntries).toBe(2);
  });

  it('sorts deterministically, deduplicates exact issues, and formats stable output', () => {
    const first = createArchitectureValidationIssue({
      code: 'UNKNOWN_RELATED_ARTICLE',
      scope: 'relation',
      message: 'Unknown related article.',
      entityKey: 'source-b',
      locale: 'es',
      sourceId: 'blog/es/source-b',
    });
    const duplicate = createArchitectureValidationIssue({ ...first });
    const second = createArchitectureValidationIssue({
      code: 'UNKNOWN_RELATED_TOOL',
      scope: 'relation',
      message: 'Unknown related tool.',
      entityKey: 'source-a',
      locale: 'en',
      sourceId: 'blog/en/source-a',
    });

    const report = createArchitectureValidationReport([first, duplicate, second]);
    const reordered = createArchitectureValidationReport([second, first]);

    expect(report.issues).toHaveLength(2);
    expect(report.issues.map((issue) => issue.code)).toEqual([
      'UNKNOWN_RELATED_ARTICLE',
      'UNKNOWN_RELATED_TOOL',
    ]);
    expect(formatArchitectureValidationReport(report)).toBe(
      formatArchitectureValidationReport(reordered),
    );
  });

  it('accepts an empty report and throws one typed aggregate error for issues', () => {
    const valid = createArchitectureValidationReport();
    expect(() => assertArchitectureValid(valid)).not.toThrow();

    const invalid = createArchitectureValidationReport([
      createArchitectureValidationIssue({
        code: 'FORBIDDEN_SOURCE_DEPENDENCY',
        scope: 'source-boundary',
        message: 'Forbidden dependency.',
      }),
    ]);

    expect(() => assertArchitectureValid(invalid)).toThrow(
      ArchitectureValidationError,
    );
    try {
      assertArchitectureValid(invalid);
    } catch (error) {
      expect(error).toBeInstanceOf(ArchitectureValidationError);
      expect((error as ArchitectureValidationError).report).toBe(invalid);
    }
  });
});
