import {
  AmbiguousContentError,
  ContentNotFoundError,
  type ContentQueryContext,
} from './errors';

export interface ContentEntryIdentity {
  readonly id: string;
}

export function resolveExactMatch<TEntry extends ContentEntryIdentity>(
  matches: readonly TEntry[],
  context: ContentQueryContext,
): TEntry | null {
  if (matches.length === 0) {
    return null;
  }

  if (matches.length === 1) {
    return matches[0] ?? null;
  }

  throw new AmbiguousContentError({
    ...context,
    matchedEntryIds: matches.map((entry) => entry.id),
  });
}

export function requireExactMatch<TEntry extends ContentEntryIdentity>(
  matches: readonly TEntry[],
  context: ContentQueryContext,
): TEntry {
  const entry = resolveExactMatch(matches, context);

  if (entry === null) {
    throw new ContentNotFoundError(context);
  }

  return entry;
}
