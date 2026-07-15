import type { ToolId } from '@/domain/shared/ids';
import type { Locale } from '@/i18n/types';

export type ToolMessageDictionary = Readonly<Record<string, unknown>>;

export interface ToolMessageProvider<TMessages extends ToolMessageDictionary> {
  getMessages(locale: Locale): TMessages | null;
}

const TOOL_MESSAGE_PROVIDERS = {} as const satisfies Readonly<
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
