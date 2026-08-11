import { describe, expect, it } from 'vitest';

import { createPublishedContentSeoIndexabilityResolver } from '@/seo';
import type { PublishedContentIndexes } from '@/content/queries';

describe('static-page SEO indexability', () => {
  it('resolves published, noindex, and missing static pages exactly', () => {
    const staticPageIndex = {
      find: ({ pageId, locale }: { pageId: string; locale: 'en' | 'es' }) => {
        if (pageId !== 'contact' || locale !== 'en') {
          return null;
        }

        return { data: { seo: { noindex: false } } };
      },
      require: () => {
        throw new Error('not used');
      },
      list: () => [],
    };
    const indexes = { staticPages: staticPageIndex } as unknown as PublishedContentIndexes;
    const resolver = createPublishedContentSeoIndexabilityResolver(indexes);

    expect(resolver.isIndexable({ kind: 'static-page', pageId: 'contact' }, 'en')).toBe(true);
    expect(resolver.isIndexable({ kind: 'static-page', pageId: 'contact' }, 'es')).toBe(false);
  });

  it('preserves noindex for a published static page', () => {
    const indexes = {
      staticPages: {
        find: () => ({ data: { seo: { noindex: true } } }),
        require: () => {
          throw new Error('not used');
        },
        list: () => [],
      },
    } as unknown as PublishedContentIndexes;

    expect(
      createPublishedContentSeoIndexabilityResolver(indexes).isIndexable(
        { kind: 'static-page', pageId: 'contact' },
        'en',
      ),
    ).toBe(false);
  });
});
