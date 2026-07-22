export type RoutingInvariantCode =
  | 'INVALID_ROUTE_RECORD'
  | 'INVALID_SEGMENT'
  | 'EMPTY_SEGMENTS'
  | 'INVALID_AREA_TARGET'
  | 'INVALID_BLOG_NAMESPACE'
  | 'RESERVED_ROOT_SEGMENT'
  | 'DUPLICATE_PUBLIC_PATH'
  | 'DUPLICATE_ROUTE_RECORD'
  | 'DUPLICATE_CANONICAL_TARGET'
  | 'DUPLICATE_ROUTE_DEFINITION'
  | 'MISSING_LOCALIZED_ROUTE'
  | 'UNKNOWN_TAXONOMY_NODE'
  | 'ROOT_CATEGORY_MISMATCH'
  | 'UNPUBLISHABLE_ROUTE'
  | 'UNKNOWN_ROUTE'
  | 'INVALID_STATIC_PATH_PROJECTION';

export type RoutingInvariantContext = Readonly<Record<string, unknown>>;

export class RoutingInvariantError extends Error {
  readonly code: RoutingInvariantCode;
  readonly context: RoutingInvariantContext;

  constructor(
    code: RoutingInvariantCode,
    message: string,
    context: RoutingInvariantContext = {},
  ) {
    super(message);

    this.name = 'RoutingInvariantError';
    this.code = code;
    this.context = Object.freeze({ ...context });
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
