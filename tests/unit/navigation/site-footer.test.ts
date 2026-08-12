import { describe, expect, it } from 'vitest';

import { getGlobalMessages } from '@/i18n/messages/registry';
import { buildSiteFooterModel, SiteFooterRouteError } from '@/navigation/site-footer';
import { createRouteRegistryFromRecords } from '@/routing/registry';
import type { RouteRecord } from '@/routing/types';

const ROUTE_MATRIX = {
  en: { about: 'about', contact: 'contact', privacy: 'privacy', terms: 'terms' },
  es: { about: 'acerca-de', contact: 'contacto', privacy: 'privacidad', terms: 'terminos' },
  pt: { about: 'sobre', contact: 'contato', privacy: 'privacidade', terms: 'termos' },
  fr: {
    about: 'a-propos',
    contact: 'contact',
    privacy: 'confidentialite',
    terms: 'conditions-utilisation',
  },
} as const;

describe('site footer model builder', () => {
  it.each(Object.keys(ROUTE_MATRIX) as Array<keyof typeof ROUTE_MATRIX>)(
    'resolves the same-locale canonical routes and labels for %s',
    (locale) => {
      const model = buildSiteFooterModel({
        locale,
        routeRegistry: createRouteRegistryFromRecords(allFooterRoutes()),
        messages: getGlobalMessages(locale).footer,
      });

      expect(model.links.map((link) => link.pageId)).toEqual([
        'about',
        'contact',
        'privacy',
        'terms',
      ]);
      expect(model.links.map((link) => link.url)).toEqual(
        Object.values(ROUTE_MATRIX[locale]).map((slug) =>
          locale === 'en' ? `/${slug}/` : `/${locale}/${slug}/`,
        ),
      );
      expect(model.links.map((link) => link.label)).toEqual(
        [
          getGlobalMessages(locale).footer.about,
          getGlobalMessages(locale).footer.contact,
          getGlobalMessages(locale).footer.privacy,
          getGlobalMessages(locale).footer.terms,
        ],
      );
      expect(model.ariaLabel).toBe(getGlobalMessages(locale).footer.label);
      expect(model.links.every((link) => !link.url.includes('/en/'))).toBe(true);
    },
  );

  it('fails explicitly when a required canonical route is missing', () => {
    const registry = createRouteRegistryFromRecords(
      allFooterRoutes().filter(
        (route) => !(route.locale === 'en' && route.target.kind === 'site-page' && route.target.pageId === 'terms'),
      ),
    );

    expect(() =>
      buildSiteFooterModel({
        locale: 'en',
        routeRegistry: registry,
        messages: getGlobalMessages('en').footer,
      }),
    ).toThrow(SiteFooterRouteError);
  });

  it('rejects a canonical record from another route family', () => {
    const routeRegistry = {
      getCanonical: () => ({
        area: 'tools',
        locale: 'en',
        segments: ['about'],
        target: { kind: 'tool', toolId: 'json-validator' },
        sourceId: 'fixture:mismatch',
      } as RouteRecord),
    };

    expect(() =>
      buildSiteFooterModel({
        locale: 'en',
        routeRegistry,
        messages: getGlobalMessages('en').footer,
      }),
    ).toThrow(SiteFooterRouteError);
  });
});

function allFooterRoutes(): readonly RouteRecord[] {
  return (Object.keys(ROUTE_MATRIX) as Array<keyof typeof ROUTE_MATRIX>).flatMap(
    (locale) =>
      Object.entries(ROUTE_MATRIX[locale]).map(([pageId, slug]) => ({
        area: 'site' as const,
        locale,
        segments: [slug],
        target: { kind: 'site-page' as const, pageId },
        sourceId: `fixture:${locale}:${pageId}`,
      })),
  );
}
