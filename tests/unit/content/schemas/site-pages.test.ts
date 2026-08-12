import { describe, expect, it } from 'vitest';

import { sitePageContentSchema } from '@/content/schemas/site-pages';

const validSitePageEntry = {
  pageId: 'contact',
  locale: 'en',
  routeSlug: 'contact',
  status: 'published',
  title: 'Contact',
  seo: {
    title: 'Contact - 4all.tools',
    description: 'Contact the 4all.tools team.',
  },
};

describe('site page content schema', () => {
  it('accepts the minimal editorial contract', () => {
    expect(sitePageContentSchema.parse(validSitePageEntry)).toMatchObject(
      validSitePageEntry,
    );
  });

  it.each([
    ['invalid page ID', { pageId: 'contact/details' }],
    ['invalid locale', { locale: 'de' }],
    ['invalid route slug', { routeSlug: 'Contact Us' }],
    ['invalid status', { status: 'active' }],
    ['missing title', { title: undefined }],
    ['incomplete SEO', { seo: { title: 'Contact' } }],
    ['unknown field', { summary: 'Not part of the contract' }],
  ])('rejects %s', (_name, override) => {
    expect(() =>
      sitePageContentSchema.parse({ ...validSitePageEntry, ...override }),
    ).toThrow();
  });

  it('rejects canonical ownership in SEO metadata', () => {
    expect(() =>
      sitePageContentSchema.parse({
        ...validSitePageEntry,
        seo: {
          ...validSitePageEntry.seo,
          canonicalUrl: 'https://4all.tools/contact/',
        },
      }),
    ).toThrow();
  });
});
