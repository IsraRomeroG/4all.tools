import type { Locale } from '@/i18n/types';
import { RoutingInvariantError } from '@/routing/errors';
import {
  getLocalePrefix,
  isReservedNamespaceAuthorized,
  normalizeReservedSegment,
  RESERVED_NAMESPACES,
  type ReservedNamespaceEntry,
  type ReservedNamespaceScope,
} from '@/routing/registry/reserved-routes';
import {
  getRouteTargetKey,
  type RouteArea,
  type RouteTarget,
} from '@/routing/types';

export interface ReservedPathValidationInput {
  readonly locale: Locale;
  readonly area: RouteArea;
  readonly segments: readonly string[];
  readonly target: RouteTarget;
  readonly sourceId?: string;
}

export interface ReservedNamespaceConflict {
  readonly code: 'RESERVED_ROOT_SEGMENT';
  readonly locale: Locale;
  readonly segment: string;
  readonly scope: ReservedNamespaceScope;
  readonly reservedOwner: string;
  readonly routeArea: RouteArea;
  readonly target: RouteTarget;
  readonly reason: string;
  readonly sourceId?: string;
}

export function getReservedNamespaceConflict(
  input: ReservedPathValidationInput,
): ReservedNamespaceConflict | null {
  const rootSegment = input.segments[0];

  if (rootSegment === undefined) {
    return null;
  }

  const siteRootConflict = getSiteRootConflict(input, rootSegment);

  if (siteRootConflict) {
    return siteRootConflict;
  }

  return getLocaleRootConflict(input, rootSegment);
}

export function assertNoReservedNamespaceConflict(
  input: ReservedPathValidationInput,
): void {
  const conflict = getReservedNamespaceConflict(input);

  if (!conflict) {
    return;
  }

  throw new RoutingInvariantError(
    conflict.code,
    formatReservedNamespaceConflict(conflict),
    {
      locale: conflict.locale,
      segment: conflict.segment,
      scope: conflict.scope,
      reservedOwner: conflict.reservedOwner,
      routeArea: conflict.routeArea,
      targetKey: getRouteTargetKey(conflict.target),
      reason: conflict.reason,
      sourceId: conflict.sourceId,
    },
  );
}

export function formatReservedNamespaceConflict(
  conflict: ReservedNamespaceConflict,
): string {
  return `Route ${getRouteTargetKey(conflict.target)} cannot claim ${conflict.scope} segment "${conflict.segment}" for locale "${conflict.locale}". Namespace is reserved by "${conflict.reservedOwner}".`;
}

function getSiteRootConflict(
  input: ReservedPathValidationInput,
  rootSegment: string,
): ReservedNamespaceConflict | null {
  if (getLocalePrefix(input.locale).length > 0) {
    return null;
  }

  const entry = findReservedEntry('site-root', rootSegment, input.locale);

  return getUnauthorizedConflict(entry, input, rootSegment);
}

function getLocaleRootConflict(
  input: ReservedPathValidationInput,
  rootSegment: string,
): ReservedNamespaceConflict | null {
  const entry = findReservedEntry('locale-root', rootSegment, input.locale);

  return getUnauthorizedConflict(entry, input, rootSegment);
}

function getUnauthorizedConflict(
  entry: ReservedNamespaceEntry | undefined,
  input: ReservedPathValidationInput,
  segment: string,
): ReservedNamespaceConflict | null {
  if (!entry || isReservedNamespaceAuthorized(entry, input.area)) {
    return null;
  }

  return {
    code: 'RESERVED_ROOT_SEGMENT',
    locale: input.locale,
    segment,
    scope: entry.scope,
    reservedOwner: entry.owner,
    routeArea: input.area,
    target: input.target,
    reason: entry.reason,
    ...(input.sourceId !== undefined ? { sourceId: input.sourceId } : {}),
  };
}

function findReservedEntry(
  scope: ReservedNamespaceScope,
  segment: string,
  locale: Locale,
): ReservedNamespaceEntry | undefined {
  const normalizedSegment = normalizeReservedSegment(segment);

  return RESERVED_NAMESPACES.find((entry) => {
    if (entry.scope !== scope) {
      return false;
    }

    if (entry.locale !== undefined && entry.locale !== locale) {
      return false;
    }

    return normalizeReservedSegment(entry.segment) === normalizedSegment;
  });
}
