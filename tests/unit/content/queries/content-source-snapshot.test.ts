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

    expect(source.getCollection).toHaveBeenCalledTimes(5);
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

  it('indexes static pages by exact page identity and locale', async () => {
    const englishPage = entry('static-pages/en/contact', {
      pageId: 'contact',
      locale: 'en',
      routeSlug: 'contact',
      status: 'published',
    });
    const spanishDraft = entry('static-pages/es/contact', {
      pageId: 'contact',
      locale: 'es',
      routeSlug: 'contacto',
      status: 'draft',
    });
    const snapshot = await createContentSourceSnapshot(
      contentSource({ staticPages: [englishPage, spanishDraft] }),
    );

    expect(snapshot.all.staticPages).toEqual([englishPage, spanishDraft]);
    expect(
      snapshot.published.staticPages.find({ pageId: 'contact', locale: 'en' }),
    ).toBe(englishPage);
    expect(
      snapshot.published.staticPages.find({ pageId: 'contact', locale: 'es' }),
    ).toBeNull();
    expect(snapshot.published.staticPages.list('es')).toEqual([]);
  });
});

function contentSource(fixtures: {
  readonly tools?: readonly unknown[];
  readonly staticPages?: readonly unknown[];
}): ContentCollectionSource & { readonly getCollection: ReturnType<typeof vi.fn> } {
  const collections = {
    tools: [...(fixtures.tools ?? [])],
    toolCategories: [],
    blog: [],
    blogCategories: [],
    staticPages: [...(fixtures.staticPages ?? [])],
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
