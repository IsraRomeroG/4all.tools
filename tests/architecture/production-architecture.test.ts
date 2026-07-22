import { describe, expect, it } from 'vitest';

import {
  formatArchitectureValidationReport,
  validateProductionArchitecture,
} from '@/validation/architecture';

describe('production architecture validation', () => {
  it('passes the complete production repository model', async () => {
    const report = await validateProductionArchitecture();

    expect(report.issues, formatArchitectureValidationReport(report)).toEqual([]);
    expect(report.inspected.contentEntries).toBeGreaterThan(0);
    expect(report.inspected.toolDefinitions).toBeGreaterThan(0);
    expect(report.inspected.routeRecords).toBeGreaterThan(0);
    expect(report.inspected.sourceFiles).toBeGreaterThan(0);
  });
});
