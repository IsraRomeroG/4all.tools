export type TaxonomyInvariantCode =
  | 'DUPLICATE_ID'
  | 'MISSING_PARENT'
  | 'SELF_PARENT'
  | 'CYCLE'
  | 'INVALID_SLUG'
  | 'DUPLICATE_SIBLING_SLUG'
  | 'EMPTY_LABEL'
  | 'INVALID_SORT_ORDER'
  | 'UNKNOWN_NODE';

export class TaxonomyInvariantError extends Error {
  readonly code: TaxonomyInvariantCode;
  readonly context: Readonly<Record<string, unknown>>;

  constructor(params: {
    code: TaxonomyInvariantCode;
    message: string;
    context?: Readonly<Record<string, unknown>>;
  }) {
    super(params.message);
    this.name = 'TaxonomyInvariantError';
    this.code = params.code;
    this.context = Object.freeze({ ...(params.context ?? {}) });
  }
}
