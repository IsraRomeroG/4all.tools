import type { ToolId } from '@/domain/shared/ids';
import type { Locale } from '@/i18n/types';
import { getJsonValidatorMessages } from '@/features/tools/developer/json-validator/messages/registry';
import { JSON_VALIDATOR_TOOL_ID } from '@/features/tools/developer/json-validator/types';

export type ToolMessageDictionary = Readonly<object>;

export interface ToolMessageProvider<TMessages extends ToolMessageDictionary> {
  getMessages(locale: Locale): TMessages | null;
}

export class MissingToolMessagesError extends Error {
  readonly toolId: ToolId;
  readonly locale: Locale;

  constructor(toolId: ToolId, locale: Locale) {
    super(
      `Missing tool messages for stable ID ${JSON.stringify(
        toolId,
      )} and locale ${JSON.stringify(locale)}.`,
    );
    this.name = 'MissingToolMessagesError';
    this.toolId = toolId;
    this.locale = locale;
  }
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

export function requireToolMessages(
  toolId: ToolId,
  locale: Locale,
): ToolMessageDictionary {
  const messages = getToolMessages(toolId, locale);

  if (messages === null) {
    throw new MissingToolMessagesError(toolId, locale);
  }

  return messages;
}
