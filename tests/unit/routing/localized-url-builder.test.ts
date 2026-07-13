import { describe, expect, it } from 'vitest';

import { SITE_URL, TRAILING_SLASH_POLICY } from '@/config/site';
import { RoutingInvariantError } from '@/routing';
import {
  buildAbsoluteUrl,
  buildLocalizedPath,
  createLocalizedUrlBuilder,
} from '@/routing/builders';

describe('localized URL builder', () => {
  it('uses a shared site origin and trailing slash policy', () => {
    expect(SITE_URL.toString()).toBe('https://4all.tools/');
    expect(TRAILING_SLASH_POLICY).toBe('always');
  });

  it('builds unprefixed English tool URLs', () => {
    expect(
      buildLocalizedPath({
        locale: 'en',
        segments: ['developer', 'json-validator'],
      }),
    ).toBe('/developer/json-validator/');
  });

  it('builds localized tool URLs for every prefixed locale', () => {
    expect(
      buildLocalizedPath({
        locale: 'es',
        segments: ['desarrollo', 'validador-json'],
      }),
    ).toBe('/es/desarrollo/validador-json/');
    expect(
      buildLocalizedPath({
        locale: 'pt',
        segments: ['desenvolvedor', 'validador-json'],
      }),
    ).toBe('/pt/desenvolvedor/validador-json/');
    expect(
      buildLocalizedPath({
        locale: 'fr',
        segments: ['developpement', 'validateur-json'],
      }),
    ).toBe('/fr/developpement/validateur-json/');
  });

  it('preserves the blog namespace inside locale-relative segments', () => {
    expect(
      buildLocalizedPath({
        locale: 'en',
        segments: ['blog', 'what-is-json'],
      }),
    ).toBe('/blog/what-is-json/');
    expect(
      buildLocalizedPath({
        locale: 'es',
        segments: ['blog', 'que-es-json'],
      }),
    ).toBe('/es/blog/que-es-json/');
  });

  it('builds localized home paths from empty segment arrays', () => {
    expect(buildLocalizedPath({ locale: 'en', segments: [] })).toBe('/');
    expect(buildLocalizedPath({ locale: 'es', segments: [] })).toBe('/es/');
    expect(buildLocalizedPath({ locale: 'pt', segments: [] })).toBe('/pt/');
    expect(buildLocalizedPath({ locale: 'fr', segments: [] })).toBe('/fr/');
  });

  it('builds absolute URLs from the shared site origin', () => {
    expect(
      buildAbsoluteUrl({
        locale: 'en',
        segments: ['developer', 'json-validator'],
      }),
    ).toBe('https://4all.tools/developer/json-validator/');
    expect(
      buildAbsoluteUrl({
        locale: 'es',
        segments: ['desarrollo', 'validador-json'],
      }),
    ).toBe('https://4all.tools/es/desarrollo/validador-json/');
  });

  it('supports explicit site injection for isolated URL-builder tests', () => {
    const builder = createLocalizedUrlBuilder({
      site: new URL('https://example.com/base/'),
    });

    expect(
      builder.buildAbsolute({
        locale: 'fr',
        segments: ['developpement', 'validateur-json'],
      }),
    ).toBe('https://example.com/fr/developpement/validateur-json/');
  });

  it('rejects slash-containing segments instead of encoding raw paths', () => {
    expectRouteError(
      () =>
        buildLocalizedPath({
          locale: 'en',
          segments: ['developer/json-validator'],
        }),
      'INVALID_SEGMENT',
    );
  });

  it('rejects locale namespaces inside localized segments', () => {
    expectRouteError(
      () =>
        buildLocalizedPath({
          locale: 'es',
          segments: ['es', 'blog', 'que-es-json'],
        }),
      'INVALID_SEGMENT',
    );
    expectRouteError(
      () =>
        buildLocalizedPath({
          locale: 'en',
          segments: ['en', 'developer'],
        }),
      'INVALID_SEGMENT',
    );
    expectRouteError(
      () =>
        buildLocalizedPath({
          locale: 'en',
          segments: ['fr', 'developpement'],
        }),
      'INVALID_SEGMENT',
    );
  });

  it('does not duplicate locale prefixes or generate an English prefix', () => {
    expect(
      buildLocalizedPath({
        locale: 'es',
        segments: ['blog', 'que-es-json'],
      }),
    ).not.toContain('/es/es/');
    expect(
      buildLocalizedPath({
        locale: 'en',
        segments: ['developer', 'json-validator'],
      }),
    ).not.toContain('/en/');
  });

  it('always returns exactly one leading slash and a trailing slash', () => {
    const relativePath = buildLocalizedPath({
      locale: 'pt',
      segments: ['desenvolvedor', 'validador-json'],
    });

    expect(relativePath).toBe('/pt/desenvolvedor/validador-json/');
    expect(relativePath.startsWith('//')).toBe(false);
    expect(relativePath.endsWith('/')).toBe(true);
    expect(
      buildAbsoluteUrl({
        locale: 'pt',
        segments: ['desenvolvedor', 'validador-json'],
      }),
    ).toBe('https://4all.tools/pt/desenvolvedor/validador-json/');
  });
});

function expectRouteError(
  action: () => unknown,
  code: RoutingInvariantError['code'],
): void {
  expect(action).toThrow(RoutingInvariantError);

  try {
    action();
  } catch (error) {
    expect(error).toBeInstanceOf(RoutingInvariantError);
    expect((error as RoutingInvariantError).code).toBe(code);
  }
}
