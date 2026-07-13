import { describe, expect, it } from 'vitest';

import { LOCALES, SUPPORTED_LOCALES } from '@/i18n/config';
import {
  RESERVED_NAMESPACES,
  RoutingInvariantError,
  assertNoReservedNamespaceConflict,
  getReservedNamespaceConflict,
  getReservedNamespaceEntries,
  type ReservedPathValidationInput,
  type RouteTarget,
} from '@/routing';

describe('routing reserved namespaces', () => {
  it('centralizes site-root and locale-root reservations', () => {
    expect(
      getReservedNamespaceEntries('site-root').map((entry) => entry.segment),
    ).toContain('es');
    expect(
      getReservedNamespaceEntries('locale-root').map((entry) => entry.segment),
    ).toContain('blog');
  });

  it('derives site-root locale namespace reservations from P01 locale config', () => {
    const expectedLocaleSegments = new Set([
      ...SUPPORTED_LOCALES,
      ...SUPPORTED_LOCALES.map((locale) => LOCALES[locale].pathPrefix).filter(
        (prefix) => prefix.length > 0,
      ),
    ]);
    const actualLocaleSegments = new Set(
      RESERVED_NAMESPACES.filter(
        (entry) => entry.scope === 'site-root' && entry.owner === 'i18n',
      ).map((entry) => entry.segment),
    );

    expect(actualLocaleSegments).toEqual(expectedLocaleSegments);
  });

  it('rejects an English tool route that claims a Spanish locale prefix', () => {
    const conflict = getReservedNamespaceConflict(
      toolInput('en', ['es', 'example-tool']),
    );

    expect(conflict).toMatchObject({
      code: 'RESERVED_ROOT_SEGMENT',
      locale: 'en',
      segment: 'es',
      scope: 'site-root',
      reservedOwner: 'i18n',
      routeArea: 'tools',
    });
  });

  it('rejects an English tool route that claims the blog namespace', () => {
    const conflict = getReservedNamespaceConflict(
      toolInput('en', ['blog', 'example-tool']),
    );

    expect(conflict).toMatchObject({
      code: 'RESERVED_ROOT_SEGMENT',
      locale: 'en',
      segment: 'blog',
      scope: 'locale-root',
      reservedOwner: 'blog-platform',
      routeArea: 'tools',
    });
  });

  it('rejects a Spanish tool route that claims the blog namespace', () => {
    const conflict = getReservedNamespaceConflict(
      toolInput('es', ['blog', 'ejemplo']),
    );

    expect(conflict).toMatchObject({
      code: 'RESERVED_ROOT_SEGMENT',
      locale: 'es',
      segment: 'blog',
      scope: 'locale-root',
      reservedOwner: 'blog-platform',
      routeArea: 'tools',
    });
  });

  it('allows English article routes to use the blog-owned namespace', () => {
    expect(
      getReservedNamespaceConflict(
        articleInput('en', ['blog', 'what-is-json']),
      ),
    ).toBeNull();
  });

  it('allows Spanish article routes to use the blog-owned namespace', () => {
    expect(
      getReservedNamespaceConflict(
        articleInput('es', ['blog', 'que-es-json']),
      ),
    ).toBeNull();
  });

  it('does not reserve the English developer root', () => {
    expect(
      getReservedNamespaceConflict(
        toolInput('en', ['developer', 'json-validator']),
      ),
    ).toBeNull();
  });

  it('does not reserve the Spanish localized developer root', () => {
    expect(
      getReservedNamespaceConflict(
        toolInput('es', ['desarrollo', 'validador-json']),
      ),
    ).toBeNull();
  });

  it('rejects internal Astro namespaces for dynamic entity routes', () => {
    const conflict = getReservedNamespaceConflict(
      toolInput('en', ['_astro', 'example-tool']),
    );

    expect(conflict).toMatchObject({
      code: 'RESERVED_ROOT_SEGMENT',
      segment: '_astro',
      scope: 'site-root',
      reservedOwner: 'astro',
    });
  });

  it('rejects API namespace ownership by tools', () => {
    const conflict = getReservedNamespaceConflict(
      toolInput('pt', ['api', 'exemplo']),
    );

    expect(conflict).toMatchObject({
      code: 'RESERVED_ROOT_SEGMENT',
      segment: 'api',
      scope: 'locale-root',
      reservedOwner: 'api',
    });
  });

  it('compares reserved roots case-insensitively without normalizing output', () => {
    const conflict = getReservedNamespaceConflict(
      toolInput('en', ['Blog', 'example-tool']),
    );

    expect(conflict).toMatchObject({
      segment: 'Blog',
      reservedOwner: 'blog-platform',
    });
  });

  it('does not introduce broad generic reservations', () => {
    expect(
      getReservedNamespaceConflict(toolInput('en', ['tools', 'example-tool'])),
    ).toBeNull();
    expect(
      getReservedNamespaceConflict(toolInput('en', ['help', 'example-tool'])),
    ).toBeNull();
  });

  it('throws actionable diagnostics with owner and reason', () => {
    expect(() =>
      assertNoReservedNamespaceConflict(
        toolInput('es', ['blog', 'ejemplo'], 'fixture:reserved-namespaces'),
      ),
    ).toThrow(RoutingInvariantError);

    try {
      assertNoReservedNamespaceConflict(
        toolInput('es', ['blog', 'ejemplo'], 'fixture:reserved-namespaces'),
      );
    } catch (error) {
      expect(error).toBeInstanceOf(RoutingInvariantError);

      const routingError = error as RoutingInvariantError;

      expect(routingError.code).toBe('RESERVED_ROOT_SEGMENT');
      expect(routingError.message).toBe(
        'Route tool:example-tool cannot claim locale-root segment "blog" for locale "es". Namespace is reserved by "blog-platform".',
      );
      expect(routingError.context).toMatchObject({
        locale: 'es',
        segment: 'blog',
        reservedOwner: 'blog-platform',
        routeArea: 'tools',
        targetKey: 'tool:example-tool',
        reason: 'Blog namespace',
        sourceId: 'fixture:reserved-namespaces',
      });
    }
  });
});

function toolInput(
  locale: ReservedPathValidationInput['locale'],
  segments: readonly string[],
  sourceId?: string,
): ReservedPathValidationInput {
  return input({
    locale,
    area: 'tools',
    segments,
    target: {
      kind: 'tool',
      toolId: 'example-tool',
    },
    ...(sourceId !== undefined ? { sourceId } : {}),
  });
}

function articleInput(
  locale: ReservedPathValidationInput['locale'],
  segments: readonly string[],
): ReservedPathValidationInput {
  return input({
    locale,
    area: 'blog',
    segments,
    target: {
      kind: 'article',
      articleId: 'what-is-json',
    },
  });
}

function input(params: {
  readonly locale: ReservedPathValidationInput['locale'];
  readonly area: ReservedPathValidationInput['area'];
  readonly segments: readonly string[];
  readonly target: RouteTarget;
  readonly sourceId?: string;
}): ReservedPathValidationInput {
  return params;
}
