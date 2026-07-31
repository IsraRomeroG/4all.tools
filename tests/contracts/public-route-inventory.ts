import type { RouteRecord } from '@/routing/types';

export type PublicRouteContractRecord = Readonly<{
  readonly area: RouteRecord['area'];
  readonly locale: RouteRecord['locale'];
  readonly segments: readonly string[];
  readonly target: RouteRecord['target'];
}>;

/**
 * Explicit review ledger for the baseline production RouteRegistry inventory.
 * Update this fixture intentionally when a public route is added, removed, or
 * changed, and evaluate any required SEO migration separately.
 */
export const PUBLIC_ROUTE_INVENTORY = [
  {
    area: 'tools',
    locale: 'en',
    segments: ['developer'],
    target: { kind: 'tool-category', categoryId: 'developer' },
  },
  {
    area: 'tools',
    locale: 'en',
    segments: ['developer', 'json-validator'],
    target: { kind: 'tool', toolId: 'json-validator' },
  },
  {
    area: 'blog',
    locale: 'en',
    segments: ['blog', 'development'],
    target: { kind: 'blog-category', categoryId: 'development' },
  },
  {
    area: 'blog',
    locale: 'en',
    segments: ['blog', 'development', 'json-guides'],
    target: { kind: 'blog-category', categoryId: 'json-guides' },
  },
  {
    area: 'blog',
    locale: 'en',
    segments: ['blog', 'development', 'json-guides', 'what-is-json'],
    target: { kind: 'article', articleId: 'what-is-json' },
  },
  {
    area: 'tools',
    locale: 'es',
    segments: ['desarrollo', 'validador-json'],
    target: { kind: 'tool', toolId: 'json-validator' },
  },
  {
    area: 'blog',
    locale: 'es',
    segments: ['blog', 'desarrollo'],
    target: { kind: 'blog-category', categoryId: 'development' },
  },
  {
    area: 'blog',
    locale: 'es',
    segments: ['blog', 'desarrollo', 'guias-json'],
    target: { kind: 'blog-category', categoryId: 'json-guides' },
  },
  {
    area: 'blog',
    locale: 'es',
    segments: ['blog', 'desarrollo', 'guias-json', 'que-es-json'],
    target: { kind: 'article', articleId: 'what-is-json' },
  },
  {
    area: 'tools',
    locale: 'pt',
    segments: ['desenvolvedor', 'validador-json'],
    target: { kind: 'tool', toolId: 'json-validator' },
  },
  {
    area: 'blog',
    locale: 'pt',
    segments: ['blog', 'desenvolvimento'],
    target: { kind: 'blog-category', categoryId: 'development' },
  },
  {
    area: 'blog',
    locale: 'pt',
    segments: ['blog', 'desenvolvimento', 'guias-json'],
    target: { kind: 'blog-category', categoryId: 'json-guides' },
  },
  {
    area: 'blog',
    locale: 'pt',
    segments: ['blog', 'desenvolvimento', 'guias-json', 'o-que-e-json'],
    target: { kind: 'article', articleId: 'what-is-json' },
  },
  {
    area: 'tools',
    locale: 'fr',
    segments: ['developpement', 'validateur-json'],
    target: { kind: 'tool', toolId: 'json-validator' },
  },
  {
    area: 'blog',
    locale: 'fr',
    segments: ['blog', 'developpement'],
    target: { kind: 'blog-category', categoryId: 'development' },
  },
  {
    area: 'blog',
    locale: 'fr',
    segments: ['blog', 'developpement', 'guides-json'],
    target: { kind: 'blog-category', categoryId: 'json-guides' },
  },
  {
    area: 'blog',
    locale: 'fr',
    segments: ['blog', 'developpement', 'guides-json', 'qu-est-ce-que-json'],
    target: { kind: 'article', articleId: 'what-is-json' },
  },
] as const satisfies readonly PublicRouteContractRecord[];
