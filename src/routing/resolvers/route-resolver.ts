import type { Locale } from '@/i18n/types';
import { assertValidRouteSegment } from '@/routing/builders';
import { RoutingInvariantError } from '@/routing/errors';
import type { RouteRegistry } from '@/routing/registry';
import {
  getLocalizedPathKey,
  getLocalizedTargetKey,
  type RouteRecord,
  type RouteTarget,
} from '@/routing/types';

export interface ResolveRouteInput {
  readonly locale: Locale;
  readonly segments: readonly string[];
}

export interface CanonicalRouteInput {
  readonly locale: Locale;
  readonly target: RouteTarget;
}

export interface RouteResolver {
  resolve(input: ResolveRouteInput): RouteRecord | null;
  requireResolved(input: ResolveRouteInput): RouteRecord;
  getCanonical(input: CanonicalRouteInput): RouteRecord | null;
  requireCanonical(input: CanonicalRouteInput): RouteRecord;
  getAlternates(target: RouteTarget): readonly RouteRecord[];
}

export function createRouteResolver(registry: RouteRegistry): RouteResolver {
  return Object.freeze({
    resolve: (input: ResolveRouteInput) => {
      assertValidResolverSegments(input);

      return registry.findByPath(input.locale, input.segments);
    },
    requireResolved: (input: ResolveRouteInput) => {
      assertValidResolverSegments(input);

      const record = registry.findByPath(input.locale, input.segments);

      if (record) {
        return record;
      }

      throw new RoutingInvariantError(
        'UNKNOWN_ROUTE',
        `Unknown route ${getLocalizedPathKey(input.locale, input.segments)}.`,
        {
          locale: input.locale,
          segments: input.segments,
          localizedPathKey: getLocalizedPathKey(input.locale, input.segments),
        },
      );
    },
    getCanonical: (input: CanonicalRouteInput) =>
      registry.getCanonical(input.locale, input.target),
    requireCanonical: (input: CanonicalRouteInput) => {
      const record = registry.getCanonical(input.locale, input.target);

      if (record) {
        return record;
      }

      throw new RoutingInvariantError(
        'MISSING_LOCALIZED_ROUTE',
        `Missing canonical route ${getLocalizedTargetKey(input.locale, input.target)}.`,
        {
          locale: input.locale,
          target: input.target,
          localizedTargetKey: getLocalizedTargetKey(input.locale, input.target),
        },
      );
    },
    getAlternates: (target: RouteTarget) => registry.getByTarget(target),
  });
}

function assertValidResolverSegments(input: ResolveRouteInput): void {
  for (const segment of input.segments) {
    assertValidRouteSegment(segment, {
      locale: input.locale,
      segments: input.segments,
      source: 'route-resolver',
    });
  }
}
