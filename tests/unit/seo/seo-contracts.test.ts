import { describe, expect, it } from 'vitest';

import {
  DuplicateSeoAlternateError,
  InvalidSeoDescriptionError,
  InvalidSeoTitleError,
  InvalidSeoUrlError,
  createSeoPageModel,
  serializeRobots,
} from '@/seo';

describe('SEO contracts', () => {
  it('creates a valid indexable SEO model', () => {
    const model = createSeoPageModel({
      title: ' JSON Validator ',
      description: ' Validate JSON online. ',
      canonicalUrl: 'https://4all.tools/developer/json-validator/',
    });

    expect(model.title).toBe('JSON Validator');
    expect(model.description).toBe('Validate JSON online.');
    expect(model.canonicalUrl).toBe('https://4all.tools/developer/json-validator/');
    expect(model.robots).toEqual({
      index: true,
      follow: true,
    });
    expect(serializeRobots(model.robots)).toBe('index,follow');
    expect(model.alternates).toEqual([]);
    expect(model.openGraph).toMatchObject({
      type: 'website',
      title: 'JSON Validator',
      description: 'Validate JSON online.',
      url: 'https://4all.tools/developer/json-validator/',
      siteName: '4all.tools',
    });
    expect(model.openGraph).not.toHaveProperty('image');
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
