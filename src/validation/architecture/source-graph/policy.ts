export interface SourceDependencyRule {
  readonly id: string;
  readonly from: readonly string[];
  readonly forbiddenTargets: readonly string[];
  readonly allowedExceptions?: readonly SourceDependencyException[];
  readonly rationale: string;
}

export interface SourceDependencyException {
  readonly source: string;
  readonly target: string;
  readonly rationale: string;
}

export const SOURCE_DEPENDENCY_RULES: readonly SourceDependencyRule[] = Object.freeze([
  {
    id: 'domain-no-delivery',
    from: ['src/domain/**'],
    forbiddenTargets: [
      'src/pages/**',
      'src/templates/**',
      'src/content/queries/**',
      'src/components/seo/**',
    ],
    rationale: 'Domain contracts remain independent from delivery and content adapters.',
  },
  {
    id: 'content-queries-no-delivery',
    from: ['src/content/queries/**'],
    forbiddenTargets: [
      'src/routing/**',
      'src/templates/**',
      'src/pages/**',
      'src/features/**',
      'src/domain/taxonomy/**/registry.ts',
    ],
    rationale: 'Content queries own content access and do not depend on delivery authorities.',
  },
  {
    id: 'routing-no-delivery',
    from: ['src/routing/definitions/**', 'src/routing/providers/**', 'src/routing/registry/**'],
    forbiddenTargets: ['src/pages/**', 'src/templates/**'],
    rationale: 'Routing definitions and registries remain independent from page delivery.',
  },
  {
    id: 'astro-templates-no-direct-data',
    from: ['src/templates/*.astro'],
    forbiddenTargets: [
      'astro:content',
      'src/content/queries/**',
      'src/routing/registry/**',
      'src/routing/static-paths/**',
    ],
    rationale: 'Astro templates receive composed models and do not query data or routing directly.',
  },
  {
    id: 'pages-no-direct-feature-data-seo',
    from: ['src/pages/**'],
    forbiddenTargets: [
      'astro:content',
      'src/content/queries/**',
      'src/features/**',
      'src/seo/**',
    ],
    rationale: 'Pages remain route adapters over static paths, composers, and templates.',
  },
  {
    id: 'features-no-delivery',
    from: ['src/features/**'],
    forbiddenTargets: [
      'src/routing/**',
      'src/content/**',
      'src/pages/**',
      'src/templates/**',
    ],
    rationale: 'Feature engines remain independent from delivery and content orchestration.',
  },
  {
    id: 'runtime-no-architecture-validation',
    from: ['src/pages/**', 'src/templates/**', 'src/features/**'],
    forbiddenTargets: ['src/validation/architecture/**'],
    rationale: 'Architecture validation is build-only and must not reach runtime or client modules.',
  },
] as const);

export function matchesPolicyPattern(value: string, pattern: string): boolean {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replaceAll('**', '\u0000')
    .replaceAll('*', '[^/]*')
    .replaceAll('\u0000', '.*');

  return new RegExp(`^${escaped}$`).test(value);
}
