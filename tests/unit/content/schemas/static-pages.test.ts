import { describe, expect, it } from 'vitest';

import { staticPageContentSchema } from '@/content/schemas/static-pages';

const validStaticPageEntry = {
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

describe('static page content schema', () => {
  it('accepts the minimal editorial contract', () => {
    expect(staticPageContentSchema.parse(validStaticPageEntry)).toMatchObject(
      validStaticPageEntry,
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
      staticPageContentSchema.parse({ ...validStaticPageEntry, ...override }),
    ).toThrow();
  });

  it('rejects canonical ownership in SEO metadata', () => {
    expect(() =>
      staticPageContentSchema.parse({
        ...validStaticPageEntry,
        seo: {
          ...validStaticPageEntry.seo,
          canonicalUrl: 'https://4all.tools/contact/',
        },
      }),
    ).toThrow();
  });
});
