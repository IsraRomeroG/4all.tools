import type { CollectionEntry } from 'astro:content';

import type { ToolId } from '@/domain/shared/ids';
import type { Locale } from '@/i18n/types';

import { getCollection } from './astro-content';
import { ContentNotFoundError, type ContentQueryContext } from './errors';
import { resolveExactMatch } from './shared';

export type ToolContentEntry = CollectionEntry<'tools'>;

function toolContext(toolId: ToolId, locale: Locale): ContentQueryContext {
  return {
    collection: 'tools',
    entityField: 'toolId',
    entityId: toolId,
    locale,
    status: 'published',
  };
}

export async function getPublishedToolContent(
  toolId: ToolId,
  locale: Locale,
): Promise<ToolContentEntry | null> {
  const matches = await getCollection(
    'tools',
    ({ data }) =>
      data.toolId === toolId &&
      data.locale === locale &&
      data.status === 'published',
  );

  return resolveExactMatch(matches, toolContext(toolId, locale));
}

export async function requirePublishedToolContent(
  toolId: ToolId,
  locale: Locale,
): Promise<ToolContentEntry> {
  const entry = await getPublishedToolContent(toolId, locale);

  if (entry === null) {
    throw new ContentNotFoundError(toolContext(toolId, locale));
  }

  return entry;
}
