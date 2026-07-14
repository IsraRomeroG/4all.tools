import type { CollectionEntry, RenderResult } from 'astro:content';
import { render } from 'astro:content';

import type { RenderedContentModel } from '@/templates/models/shared';

export type RenderableContentEntry =
  | CollectionEntry<'tools'>
  | CollectionEntry<'toolCategories'>;

export type RenderContent = (
  entry: RenderableContentEntry,
) => Promise<RenderedContentModel>;

export async function renderContentEntry(
  entry: RenderableContentEntry,
): Promise<RenderedContentModel> {
  return toRenderedContentModel(await render(entry));
}

export function toRenderedContentModel(
  rendered: RenderResult,
): RenderedContentModel {
  return Object.freeze({
    Content: rendered.Content,
    headings: Object.freeze([...rendered.headings]),
  });
}
