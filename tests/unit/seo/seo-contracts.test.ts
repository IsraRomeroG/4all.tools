import { describe, expect, expectTypeOf, it } from 'vitest';

import {
  DuplicateSeoAlternateError,
  InvalidSeoDescriptionError,
  InvalidSeoTitleError,
  InvalidSeoUrlError,
  NoindexSeoAlternateConflictError,
  createSeoPageModel,
  serializeRobots,
  type SeoPageModel,
} from '@/seo';

describe('SEO contracts', () => {
  it('creates a valid indexable SEO model', () => {
    const model = createSeoPageModel({
      title: ' JSON Validator ',
      description: ' Validate JSON online. ',
      canonicalUrl: 'https://4all.tools/developer/json-validator/',
      alternates: [
        {
          locale: 'en',
          hrefLang: 'en',
          url: 'https://4all.tools/developer/json-validator/',
        },
      ],
      xDefaultUrl: 'https://4all.tools/developer/json-validator/',
    });

    expect(model.title).toBe('JSON Validator');
    expect(model.description).toBe('Validate JSON online.');
    expect(model.canonicalUrl).toBe('https://4all.tools/developer/json-validator/');
    expect(model.robots).toEqual({
      index: true,
      follow: true,
    });
    expect(serializeRobots(model.robots)).toBe('index,follow');
    expect(model.alternates).toHaveLength(1);
    expect(model.xDefaultUrl).toBe(
      'https://4all.tools/developer/json-validator/',
    );
    expect(model.openGraph).toMatchObject({
      type: 'website',
      title: 'JSON Validator',
      description: 'Validate JSON online.',
      url: 'https://4all.tools/developer/json-validator/',
      siteName: '4all.tools',
    });
    expect(model.openGraph).not.toHaveProperty('image');
  });

  it('accepts valid website and article Open Graph combinations', () => {
    const model = createSeoPageModel({
      title: 'What Is JSON',
      description: 'A practical introduction to JSON.',
      canonicalUrl: 'https://4all.tools/blog/development/what-is-json/',
      openGraphType: 'article',
      openGraphArticle: {
        publishedTime: '2026-07-21T00:00:00.000Z',
        section: 'Development',
      },
    });

    expect(model.openGraph).toMatchObject({
      type: 'article',
      article: {
        publishedTime: '2026-07-21T00:00:00.000Z',
        section: 'Development',
      },
    });
  });

  it('rejects invalid Open Graph combinations at runtime', () => {
    const base = {
      title: 'JSON Validator',
      description: 'Validate JSON online.',
      canonicalUrl: 'https://4all.tools/developer/json-validator/',
    };
    const websiteWithArticle = {
      ...base,
      openGraphType: 'website',
      openGraphArticle: {
        publishedTime: '2026-07-21T00:00:00.000Z',
        section: 'Developer Tools',
      },
    };
    const articleWithoutMetadata = {
      ...base,
      openGraphType: 'article',
    };

    expect(() => {
      createSeoPageModel(
        websiteWithArticle as unknown as Parameters<
          typeof createSeoPageModel
        >[0],
      );
    }).toThrow('only valid when openGraphType is article');
    expect(() => {
      createSeoPageModel(
        articleWithoutMetadata as unknown as Parameters<
          typeof createSeoPageModel
        >[0],
      );
    }).toThrow('required when openGraphType is article');
  });

  it('creates a valid noindex model', () => {
    const model = createSeoPageModel({
      title: 'Preview',
      description: 'Preview content.',
      canonicalUrl: 'https://4all.tools/developer/preview/',
      noindex: true,
    });

    expect(model.robots).toEqual({
      index: false,
      follow: true,
    });
    expect(serializeRobots(model.robots)).toBe('noindex,follow');
    expect(model.alternates).toEqual([]);
    expect(Object.isFrozen(model.alternates)).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(model, 'xDefaultUrl')).toBe(
      false,
    );
  });

  it('rejects noindex alternates and x-default at runtime and compile time', () => {
    const base = {
      title: 'Preview',
      description: 'Preview content.',
      canonicalUrl: 'https://4all.tools/developer/preview/',
    };
    const alternate = {
      locale: 'en' as const,
      hrefLang: 'en',
      url: 'https://4all.tools/developer/preview/',
    };
    const noindexWithAlternate = {
      ...base,
      noindex: true as const,
      alternates: [alternate] as const,
    };
    const noindexWithXDefault = {
      ...base,
      noindex: true as const,
      xDefaultUrl: 'https://4all.tools/developer/preview/',
    };

    expect(() => {
      // @ts-expect-error noindex pages cannot declare alternates
      createSeoPageModel(noindexWithAlternate);
    }).toThrow(NoindexSeoAlternateConflictError);
    expect(() => {
      // @ts-expect-error noindex pages cannot declare x-default
      createSeoPageModel(noindexWithXDefault);
    }).toThrow(NoindexSeoAlternateConflictError);
    expect(() => {
      createSeoPageModel(
        noindexWithAlternate as unknown as Parameters<
          typeof createSeoPageModel
        >[0],
      );
    }).toThrow('cannot declare alternates');
    expect(() => {
      createSeoPageModel(
        noindexWithXDefault as unknown as Parameters<
          typeof createSeoPageModel
        >[0],
      );
    }).toThrow('cannot declare x-default');
  });

  it('keeps noindex models narrow in the public type', () => {
    type NoindexModel = Extract<SeoPageModel, { robots: { index: false } }>;

    expectTypeOf<NoindexModel['alternates']>().toEqualTypeOf<readonly []>();
    expectTypeOf<NoindexModel['xDefaultUrl']>().toEqualTypeOf<undefined>();
  });

  it('keeps optional Open Graph image fields explicit when supplied', () => {
    const model = createSeoPageModel({
      title: 'JSON Validator',
      description: 'Validate JSON online.',
      canonicalUrl: 'https://4all.tools/developer/json-validator/',
      openGraphImage: {
        url: 'https://4all.tools/assets/json-validator.png',
        alt: 'JSON Validator preview',
        width: 1200,
        height: 630,
      },
    });

    expect(model.openGraph.image).toEqual({
      url: 'https://4all.tools/assets/json-validator.png',
      alt: 'JSON Validator preview',
      width: 1200,
      height: 630,
    });
  });

  it('rejects duplicate alternate locales and URLs', () => {
    const base = {
      title: 'JSON Validator',
      description: 'Validate JSON online.',
      canonicalUrl: 'https://4all.tools/developer/json-validator/',
    };

    expect(() =>
      createSeoPageModel({
        ...base,
        alternates: [
          {
            locale: 'en',
            hrefLang: 'en',
            url: 'https://4all.tools/developer/json-validator/',
          },
          {
            locale: 'en',
            hrefLang: 'en',
            url: 'https://4all.tools/es/desarrollo/validador-json/',
          },
        ],
      }),
    ).toThrow(DuplicateSeoAlternateError);

    expect(() =>
      createSeoPageModel({
        ...base,
        alternates: [
          {
            locale: 'en',
            hrefLang: 'en',
            url: 'https://4all.tools/developer/json-validator/',
          },
          {
            locale: 'es',
            hrefLang: 'es',
            url: 'https://4all.tools/developer/json-validator/',
          },
        ],
      }),
    ).toThrow(DuplicateSeoAlternateError);
  });

  it('rejects relative, query, hash, off-origin, non-HTTPS, and unnormalized canonical URLs', () => {
    const base = {
      title: 'JSON Validator',
      description: 'Validate JSON online.',
    };

    for (const canonicalUrl of [
      '/developer/json-validator/',
      'https://4all.tools/developer/json-validator/?debug=1',
      'https://4all.tools/developer/json-validator/#intro',
      'https://example.com/developer/json-validator/',
      'http://4all.tools/developer/json-validator/',
      'https://4all.tools/developer/json-validator',
    ]) {
      expect(() =>
        createSeoPageModel({
          ...base,
          canonicalUrl,
        }),
      ).toThrow(InvalidSeoUrlError);
    }
  });

  it('rejects missing title and description', () => {
    expect(() =>
      createSeoPageModel({
        title: '   ',
        description: 'Validate JSON online.',
        canonicalUrl: 'https://4all.tools/developer/json-validator/',
      }),
    ).toThrow(InvalidSeoTitleError);

    expect(() =>
      createSeoPageModel({
        title: 'JSON Validator',
        description: '   ',
        canonicalUrl: 'https://4all.tools/developer/json-validator/',
      }),
    ).toThrow(InvalidSeoDescriptionError);
  });
});
