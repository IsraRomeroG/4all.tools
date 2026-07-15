import type { ToolId } from '@/domain/shared/ids';

export const JSON_VALIDATOR_TOOL_ID = 'json-validator' as const satisfies ToolId;

export type JsonValidatorToolId = typeof JSON_VALIDATOR_TOOL_ID;
