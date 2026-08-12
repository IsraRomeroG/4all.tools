import { describe, expect, it } from 'vitest';

import { createPublishedContentSeoIndexabilityResolver } from '@/seo';
import type { PublishedContentIndexes } from '@/content/queries';

describe('site-page SEO indexability', () => {
  it('resolves published, noindex, and missing site pages exactly', () => {
    const sitePageIndex = {
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
    const indexes = { sitePages: sitePageIndex } as unknown as PublishedContentIndexes;
    const resolver = createPublishedContentSeoIndexabilityResolver(indexes);

    expect(resolver.isIndexable({ kind: 'site-page', pageId: 'contact' }, 'en')).toBe(true);
    expect(resolver.isIndexable({ kind: 'site-page', pageId: 'contact' }, 'es')).toBe(false);
  });

  it('preserves noindex for a published site page', () => {
    const indexes = {
      sitePages: {
        find: () => ({ data: { seo: { noindex: true } } }),
        require: () => {
          throw new Error('not used');
        },
        list: () => [],
      },
    } as unknown as PublishedContentIndexes;

    expect(
      createPublishedContentSeoIndexabilityResolver(indexes).isIndexable(
        { kind: 'site-page', pageId: 'contact' },
        'en',
      ),
    ).toBe(false);
  });
});
