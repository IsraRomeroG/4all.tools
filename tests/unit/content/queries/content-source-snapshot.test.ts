import { describe, expect, it, vi } from 'vitest';

import {
  createContentSourceSnapshot,
  type ContentCollectionSource,
} from '@/content/queries/indexed-content-source';

describe('content source snapshot', () => {
  it('uses one load per collection and derives published indexes from all entries', async () => {
    const toolEntry = entry('tools/en/developer/json-validator', {
      toolId: 'json-validator',
      locale: 'en',
      status: 'published',
    });
    const source = contentSource({ tools: [toolEntry] });

    const snapshot = await createContentSourceSnapshot(source);

    expect(source.getCollection).toHaveBeenCalledTimes(4);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.all)).toBe(true);
    expect(Object.isFrozen(snapshot.all.tools)).toBe(true);
    expect(snapshot.all.tools[0]).toBe(toolEntry);
    expect(
      snapshot.published.tools.find({ toolId: 'json-validator', locale: 'en' }),
    ).toBe(toolEntry);
  });

  it('keeps non-published entries available for all-entry inspection', async () => {
    const draftEntry = entry('tools/es/developer/json-validator', {
      toolId: 'json-validator',
      locale: 'es',
      status: 'draft',
    });
    const snapshot = await createContentSourceSnapshot(
      contentSource({ tools: [draftEntry] }),
    );

    expect(snapshot.all.tools).toContain(draftEntry);
    expect(snapshot.published.tools.find({ toolId: 'json-validator', locale: 'es' }))
      .toBeNull();
  });
});

function contentSource(fixtures: {
  readonly tools?: readonly unknown[];
}): ContentCollectionSource & { readonly getCollection: ReturnType<typeof vi.fn> } {
  const collections = {
    tools: [...(fixtures.tools ?? [])],
    toolCategories: [],
    blog: [],
    blogCategories: [],
  };
  const getCollection = vi.fn(async (collection: keyof typeof collections) =>
    collections[collection] as never,
  );

  return { getCollection };
}

function entry(id: string, data: Record<string, unknown>) {
  return {
    id,
    collection: id.split('/')[0],
    data,
  };
}
