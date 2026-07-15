import type { ToolId } from '@/domain/shared/ids';

export const JSON_VALIDATOR_TOOL_ID = 'json-validator' as const satisfies ToolId;

export type JsonValidatorToolId = typeof JSON_VALIDATOR_TOOL_ID;

export type JsonPrimitive = string | number | boolean | null;

export type JsonValue =
  | JsonPrimitive
  | readonly JsonValue[]
  | {
      readonly [key: string]: JsonValue;
    };

export type JsonValidationErrorCode = 'EMPTY_INPUT' | 'SYNTAX_ERROR';

export interface JsonValidationError {
  readonly code: JsonValidationErrorCode;
  /**
   * Engine-provided diagnostic text. This is intentionally not stable across
   * JavaScript engines and must not be used as a UI contract.
   */
  readonly rawMessage?: string;
  /** Zero-based character position when recoverable. */
  readonly position?: number;
  /** One-based line number when recoverable. */
  readonly line?: number;
  /** One-based column number when recoverable. */
  readonly column?: number;
}

export type JsonValidationResult =
  | {
      readonly valid: true;
      readonly value: JsonValue;
    }
  | {
      readonly valid: false;
      readonly error: JsonValidationError;
    };

export type JsonTransformResult =
  | {
      readonly ok: true;
      readonly value: JsonValue;
      readonly output: string;
    }
  | {
      readonly ok: false;
      readonly error: JsonValidationError;
    };

export const JSON_ENGINE_SEMANTIC_LIMITATIONS = [
  'Uses standard JavaScript JSON.parse and JSON.stringify semantics.',
  'Large integers may lose precision because JSON numbers become JavaScript numbers.',
  'Duplicate object keys are accepted by JSON.parse; later values win.',
  'JSON5, comments, trailing commas, NaN, Infinity, and undefined are not supported.',
  'No BOM normalization is performed before parsing.',
] as const;
