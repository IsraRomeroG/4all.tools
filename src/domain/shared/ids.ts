export type StableEntityId = string;

export type ToolId = StableEntityId;
export type ToolCategoryId = StableEntityId;
export type BlogCategoryId = StableEntityId;
export type ArticleId = StableEntityId;
export type LandingId = StableEntityId;

export const STABLE_ENTITY_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isStableEntityId(value: string): value is StableEntityId {
  return STABLE_ENTITY_ID_PATTERN.test(value);
}

export function assertStableEntityId(
  value: string,
): asserts value is StableEntityId {
  if (isStableEntityId(value)) {
    return;
  }

  throw new Error(
    `Invalid stable entity ID ${JSON.stringify(
      value,
    )}. Stable IDs must match ${STABLE_ENTITY_ID_PATTERN.source}.`,
  );
}
