import { LOCALES, SUPPORTED_LOCALES } from '@/i18n/config';
import type { Locale } from '@/i18n/types';
import type { RouteArea } from '@/routing/types';

export type ReservedNamespaceScope = 'site-root' | 'locale-root';

export interface ReservedNamespaceEntry {
  readonly segment: string;
  readonly scope: ReservedNamespaceScope;
  readonly owner: string;
  readonly reason: string;
  readonly locale?: Locale;
  readonly allowedAreas?: readonly RouteArea[];
}

const INTERNAL_ROUTE_SEGMENTS = [
  '_astro',
  '_server_islands',
  '_actions',
] as const;

const FILE_ROUTE_SEGMENTS = ['robots.txt', 'sitemap.xml'] as const;

const APPLICATION_LOCALE_ROOT_NAMESPACES = [
  {
    segment: 'blog',
    owner: 'blog-platform',
    reason: 'Blog namespace',
    allowedAreas: ['blog'],
  },
  {
    segment: 'api',
    owner: 'api',
    reason: 'API endpoint namespace',
  },
] as const satisfies readonly Omit<
  ReservedNamespaceEntry,
  'scope'
>[];

export const RESERVED_NAMESPACES = Object.freeze([
  ...getLocaleNamespaceEntries(),
  ...INTERNAL_ROUTE_SEGMENTS.flatMap((segment): ReservedNamespaceEntry[] => [
    {
      segment,
      scope: 'site-root',
      owner: 'astro',
      reason: 'Astro internal reserved route',
    },
    {
      segment,
      scope: 'locale-root',
      owner: 'astro',
      reason: 'Astro internal reserved route',
    },
  ]),
  ...FILE_ROUTE_SEGMENTS.flatMap((segment): ReservedNamespaceEntry[] => [
    {
      segment,
      scope: 'site-root',
      owner: 'static-files',
      reason: 'Site-level static file route',
    },
    {
      segment,
      scope: 'locale-root',
      owner: 'static-files',
      reason: 'Static file route',
    },
  ]),
  ...APPLICATION_LOCALE_ROOT_NAMESPACES.map(
    (entry): ReservedNamespaceEntry => ({
      ...entry,
      scope: 'locale-root',
    }),
  ),
] satisfies readonly ReservedNamespaceEntry[]);

export function getReservedNamespaceEntries(
  scope?: ReservedNamespaceScope,
): readonly ReservedNamespaceEntry[] {
  if (!scope) {
    return RESERVED_NAMESPACES;
  }

  return Object.freeze(
    RESERVED_NAMESPACES.filter((entry) => entry.scope === scope),
  );
}

export function isReservedNamespaceAuthorized(
  entry: ReservedNamespaceEntry,
  area: RouteArea,
): boolean {
  return entry.allowedAreas?.includes(area) ?? false;
}

export function normalizeReservedSegment(segment: string): string {
  return segment.toLowerCase();
}

export function getLocalePrefix(locale: Locale): string {
  return LOCALES[locale].pathPrefix;
}

function getLocaleNamespaceEntries(): readonly ReservedNamespaceEntry[] {
  const segments = new Set<string>();

  for (const locale of SUPPORTED_LOCALES) {
    segments.add(locale);

    const pathPrefix = LOCALES[locale].pathPrefix;

    if (pathPrefix.length > 0) {
      segments.add(pathPrefix);
    }
  }

  return Object.freeze(
    [...segments].sort().map((segment): ReservedNamespaceEntry => ({
      segment,
      scope: 'site-root',
      owner: 'i18n',
      reason: 'Locale namespace',
    })),
  );
}
