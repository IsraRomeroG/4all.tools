import type { JsonTransformResult } from '../types';
import { validateJson } from './validate';

export function minifyJson(input: string): JsonTransformResult {
  const parsed = validateJson(input);

  if (!parsed.valid) {
    return {
      ok: false,
      error: parsed.error,
    };
  }

  return {
    ok: true,
    value: parsed.value,
    output: JSON.stringify(parsed.value),
  };
}
