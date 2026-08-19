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
    area: 'site',
    locale: 'en',
    segments: ['about'],
    target: { kind: 'site-page', pageId: 'about' },
  },
  {
    area: 'site',
    locale: 'en',
    segments: ['contact'],
    target: { kind: 'site-page', pageId: 'contact' },
  },
  {
    area: 'site',
    locale: 'en',
    segments: ['privacy'],
    target: { kind: 'site-page', pageId: 'privacy' },
  },
  {
    area: 'site',
    locale: 'en',
    segments: ['terms'],
    target: { kind: 'site-page', pageId: 'terms' },
  },
  {
    area: 'tools',
    locale: 'es',
    segments: ['desarrollo'],
    target: { kind: 'tool-category', categoryId: 'developer' },
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
    area: 'site',
    locale: 'es',
    segments: ['acerca-de'],
    target: { kind: 'site-page', pageId: 'about' },
  },
  {
    area: 'site',
    locale: 'es',
    segments: ['contacto'],
    target: { kind: 'site-page', pageId: 'contact' },
  },
  {
    area: 'site',
    locale: 'es',
    segments: ['privacidad'],
    target: { kind: 'site-page', pageId: 'privacy' },
  },
  {
    area: 'site',
    locale: 'es',
    segments: ['terminos'],
    target: { kind: 'site-page', pageId: 'terms' },
  },
  {
    area: 'tools',
    locale: 'pt',
    segments: ['desenvolvedor'],
    target: { kind: 'tool-category', categoryId: 'developer' },
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
    area: 'site',
    locale: 'pt',
    segments: ['contato'],
    target: { kind: 'site-page', pageId: 'contact' },
  },
  {
    area: 'site',
    locale: 'pt',
    segments: ['privacidade'],
    target: { kind: 'site-page', pageId: 'privacy' },
  },
  {
    area: 'site',
    locale: 'pt',
    segments: ['sobre'],
    target: { kind: 'site-page', pageId: 'about' },
  },
  {
    area: 'site',
    locale: 'pt',
    segments: ['termos'],
    target: { kind: 'site-page', pageId: 'terms' },
  },
  {
    area: 'tools',
    locale: 'fr',
    segments: ['developpement'],
    target: { kind: 'tool-category', categoryId: 'developer' },
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
  {
    area: 'site',
    locale: 'fr',
    segments: ['a-propos'],
    target: { kind: 'site-page', pageId: 'about' },
  },
  {
    area: 'site',
    locale: 'fr',
    segments: ['conditions-utilisation'],
    target: { kind: 'site-page', pageId: 'terms' },
  },
  {
    area: 'site',
    locale: 'fr',
    segments: ['confidentialite'],
    target: { kind: 'site-page', pageId: 'privacy' },
  },
  {
    area: 'site',
    locale: 'fr',
    segments: ['contact'],
    target: { kind: 'site-page', pageId: 'contact' },
  },
] as const satisfies readonly PublicRouteContractRecord[];
