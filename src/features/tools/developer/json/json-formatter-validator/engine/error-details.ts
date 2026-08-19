import type { JsonValidationError } from '../types';

const POSITION_PATTERNS = [
  /\bposition\s+(\d+)\b/i,
  /\bat\s+(\d+)\b/i,
] as const;

export function deriveJsonErrorDetails(
  input: string,
  error: unknown,
): JsonValidationError {
  const rawMessage = getRawMessage(error);
  const position =
    rawMessage === undefined ? undefined : extractPosition(rawMessage);
  const location =
    position === undefined ? undefined : getLocationFromPosition(input, position);

  return {
    code: 'SYNTAX_ERROR',
    ...(rawMessage === undefined ? {} : { rawMessage }),
    ...(position === undefined ? {} : { position }),
    ...(location === undefined
      ? {}
      : {
          line: location.line,
          column: location.column,
        }),
  };
}

export function getLocationFromPosition(
  input: string,
  position: number,
): { readonly line: number; readonly column: number } | undefined {
  if (!Number.isInteger(position) || position < 0 || position > input.length) {
    return undefined;
  }

  let line = 1;
  let column = 1;

  for (let index = 0; index < position; index += 1) {
    const character = input[index];

    if (character === '\n') {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }

  return { line, column };
}

function getRawMessage(error: unknown): string | undefined {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  return undefined;
}

function extractPosition(message: string): number | undefined {
  for (const pattern of POSITION_PATTERNS) {
    const match = pattern.exec(message);
    const rawPosition = match?.[1];

    if (rawPosition === undefined) {
      continue;
    }

    const position = Number.parseInt(rawPosition, 10);

    if (Number.isSafeInteger(position) && position >= 0) {
      return position;
    }
  }

  return undefined;
}
