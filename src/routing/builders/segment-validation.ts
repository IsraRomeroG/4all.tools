import { RoutingInvariantError } from '@/routing/errors';

export const ROUTE_SEGMENT_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface RouteSegmentValidationContext {
  readonly segment?: string;
  readonly segments?: readonly string[];
  readonly source?: string;
  readonly [key: string]: unknown;
}

export function isValidRouteSegment(value: unknown): value is string {
  return typeof value === 'string' && ROUTE_SEGMENT_PATTERN.test(value);
}

export function assertValidRouteSegment(
  segment: string,
  context: RouteSegmentValidationContext = {},
): void {
  if (isValidRouteSegment(segment)) {
    return;
  }

  throw new RoutingInvariantError(
    'INVALID_SEGMENT',
    `Invalid route segment ${JSON.stringify(segment)}. Route segments must match ${ROUTE_SEGMENT_PATTERN.source}.`,
    {
      ...context,
      segment,
      pattern: ROUTE_SEGMENT_PATTERN.source,
    },
  );
}

export function assertValidRouteSegments(
  segments: readonly string[],
  context: RouteSegmentValidationContext = {},
): void {
  if (segments.length === 0) {
    throw new RoutingInvariantError(
      'EMPTY_SEGMENTS',
      'Route segments must contain at least one segment.',
      {
        ...context,
        segments,
      },
    );
  }

  for (const segment of segments) {
    assertValidRouteSegment(segment, {
      ...context,
      segments,
    });
  }
}
