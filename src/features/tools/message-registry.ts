import type { ToolId } from '@/domain/shared/ids';
import type { Locale } from '@/i18n/types';
import { getJsonValidatorMessages } from '@/features/tools/developer/json-validator/messages/registry';
import { JSON_VALIDATOR_TOOL_ID } from '@/features/tools/developer/json-validator/types';

export type ToolMessageDictionary = Readonly<object>;

export interface ToolMessageProvider<TMessages extends ToolMessageDictionary> {
  getMessages(locale: Locale): TMessages | null;
}

const TOOL_MESSAGE_PROVIDERS = {
  [JSON_VALIDATOR_TOOL_ID]: {
    getMessages: getJsonValidatorMessages,
  },
} as const satisfies Readonly<
  Record<ToolId, ToolMessageProvider<ToolMessageDictionary>>
>;

const TOOL_MESSAGE_PROVIDER_LOOKUP: Readonly<
  Record<ToolId, ToolMessageProvider<ToolMessageDictionary>>
> = TOOL_MESSAGE_PROVIDERS;

export function getToolMessages(
  toolId: ToolId,
  locale: Locale,
): ToolMessageDictionary | null {
  return TOOL_MESSAGE_PROVIDER_LOOKUP[toolId]?.getMessages(locale) ?? null;
}
