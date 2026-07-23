import { describe, expect, it } from 'vitest';

import {
  createSourceGraph,
  extractSourceImports,
  matchesPolicyPattern,
  resolveProjectImport,
  SOURCE_DEPENDENCY_RULES,
  validateSourceBoundaries,
} from '@/validation/architecture';

describe('architecture source graph', () => {
  it('extracts static, type, export, dynamic literal, Astro frontmatter, and script imports', () => {
    const imports = extractSourceImports({
      sourcePath: 'src/example.astro',
      source: `
        <!-- import fake from '@/ignored'; -->
        ---
        import value from '@/domain/shared/ids';
        import type { X } from './types';
        export { value as other } from './other';
        const load = () => import('./lazy');
        // import ignored from './comment';
        ---
        <script>
          import client from './client';
        </script>
      `,
    });

    expect(imports.map((edge) => edge.specifier)).toEqual([
      './client',
      './lazy',
      './other',
      './types',
      '@/domain/shared/ids',
    ]);
  });

  it('resolves aliases and relative imports against known source files', () => {
    const files = new Set([
      'src/domain/shared/ids.ts',
      'src/example.ts',
      'src/example/index.ts',
    ]);

    expect(resolveProjectImport('src/example.ts', '@/domain/shared/ids', files)).toBe(
      'src/domain/shared/ids.ts',
    );
    expect(resolveProjectImport('src/example.ts', './example', files)).toBe(
      'src/example.ts',
    );
    expect(resolveProjectImport('src/example.ts', 'typescript', files)).toBeUndefined();
  });

  it('applies declarative source rules deterministically', () => {
    expect(matchesPolicyPattern('src/pages/index.astro', 'src/pages/**')).toBe(true);
    expect(matchesPolicyPattern('src/pages/index.astro', 'src/templates/*.astro')).toBe(false);

    const graph = createSourceGraph([
      {
        sourcePath: 'src/pages/index.astro',
        source: "---\nimport { getCollection } from '@/content/queries';\n---",
      },
      { sourcePath: 'src/content/queries/index.ts', source: '' },
    ]);
    const issues = validateSourceBoundaries(graph, { rules: [
      {
        id: 'test-page-rule',
        from: ['src/pages/**'],
        forbiddenTargets: ['src/content/queries/**'],
        rationale: 'Pages use composed data.',
      },
    ] });

    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      code: 'FORBIDDEN_SOURCE_DEPENDENCY',
      sourceId: 'src/pages/index.astro',
      details: {
        ruleId: 'test-page-rule',
        resolvedTargetPath: 'src/content/queries/index.ts',
      },
    });

    const excepted = validateSourceBoundaries(graph, {
      rules: [{
        id: 'test-page-rule',
        from: ['src/pages/**'],
        forbiddenTargets: ['src/content/queries/**'],
        allowedExceptions: [{
          source: 'src/pages/index.astro',
          target: 'src/content/queries/**',
          rationale: 'Fixture-only exception.',
        }],
        rationale: 'Pages use composed data.',
      }],
    });

    expect(excepted).toEqual([]);
    expect(validateSourceBoundaries(createSourceGraph([]), {
      rules: [],
      forbiddenNamespaceExists: true,
    }).map((issue) => issue.code)).toEqual(['FORBIDDEN_SOURCE_NAMESPACE']);
  });

  it('forbids pure engine component dependencies without banning feature UI components', () => {
    const pureEngineGraph = createSourceGraph([
      {
        sourcePath: 'src/features/example/engine.ts',
        source: "import Button from '@/components/Button.astro';",
      },
      { sourcePath: 'src/components/Button.astro', source: '' },
    ]);
    const pureEngineIssues = validateSourceBoundaries(pureEngineGraph);

    expect(pureEngineIssues).toHaveLength(1);
    expect(pureEngineIssues[0]).toMatchObject({
      code: 'FORBIDDEN_SOURCE_DEPENDENCY',
      details: { ruleId: 'pure-feature-engines-no-components' },
    });

    const featureUiGraph = createSourceGraph([
      {
        sourcePath: 'src/features/example/ui.ts',
        source: "import Button from '@/components/Button.astro';",
      },
      { sourcePath: 'src/components/Button.astro', source: '' },
    ]);

    expect(validateSourceBoundaries(featureUiGraph)).toEqual([]);
    expect(SOURCE_DEPENDENCY_RULES).toContainEqual(
      expect.objectContaining({ id: 'pure-feature-engines-no-components' }),
    );
  });
});
