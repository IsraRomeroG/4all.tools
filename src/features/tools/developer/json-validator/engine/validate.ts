import type { JsonValidationResult, JsonValue } from '../types';
import { deriveJsonErrorDetails } from './error-details';

export function validateJson(input: string): JsonValidationResult {
  if (input.trim().length === 0) {
    return {
      valid: false,
      error: {
        code: 'EMPTY_INPUT',
      },
    };
  }

  try {
    return {
      valid: true,
      value: JSON.parse(input) as JsonValue,
    };
  } catch (error) {
    return {
      valid: false,
      error: deriveJsonErrorDetails(input, error),
    };
  }
}
