import type { ToolId } from '@/domain/shared/ids';
import type { Locale } from '@/i18n/types';
import {
  findToolModule,
  type ToolMessageDictionary,
  type ToolMessageProvider,
} from '@/features/tools/module-registry';

export type { ToolMessageDictionary, ToolMessageProvider };

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

export function getToolMessages(
  toolId: ToolId,
  locale: Locale,
): ToolMessageDictionary | null {
  return findToolModule(toolId)?.getMessages(locale) ?? null;
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
