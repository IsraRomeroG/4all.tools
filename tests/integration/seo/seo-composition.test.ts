import { describe, expect, it } from 'vitest';

import {
  composeRootCategoryAdapterPage,
  composeToolAreaAdapterPage,
  getDeliveryRouteRegistry,
} from '@/templates/composers';

const JSON_VALIDATOR_ALTERNATES = [
  'https://4all.tools/developer/json-validator/',
  'https://4all.tools/es/desarrollo/validador-json/',
  'https://4all.tools/pt/desenvolvedor/validador-json/',
  'https://4all.tools/fr/developpement/validateur-json/',
] as const;

describe('SEO page model composition', () => {
  it('composes reciprocal json-validator canonical and alternate sets for every locale', async () => {
    const registry = await getDeliveryRouteRegistry();
    const pages = await Promise.all(
      (['en', 'es', 'pt', 'fr'] as const).map((locale) =>
        composeToolAreaAdapterPage(
          locale,
          {
            kind: 'tool',
            toolId: 'json-validator',
          },
          {
            routeRegistry: registry,
          },
        ),
      ),
    );

    for (const [index, page] of pages.entries()) {
      if (page.kind !== 'tool') {
        throw new Error('Expected JSON Validator route to compose a tool page.');
      }

      expect(page.locale).toBe((['en', 'es', 'pt', 'fr'] as const)[index]);
      expect(page.seo.canonicalUrl).toBe(JSON_VALIDATOR_ALTERNATES[index]);
      expect(page.seo.openGraph.url).toBe(page.seo.canonicalUrl);
      expect(page.seo.alternates.map((alternate) => alternate.url)).toEqual(
        JSON_VALIDATOR_ALTERNATES,
      );
      expect(page.seo.alternates.map((alternate) => alternate.hrefLang)).toEqual([
        'en',
        'es',
        'pt',
        'fr',
      ]);
      expect(page.seo.xDefaultUrl).toBe(JSON_VALIDATOR_ALTERNATES[0]);
      expect(page.localizedRouteCluster?.variants.map((variant) => variant.absoluteUrl)).toEqual(
        JSON_VALIDATOR_ALTERNATES,
      );
      expect(
        page.localizedRouteCluster?.variants.every(
          (variant) => variant.route?.target.kind === 'tool',
        ),
      ).toBe(true);
      expect(
        page.languageSwitcher.items.map((item) => item.locale),
      ).toEqual(['en', 'es', 'pt', 'fr']);
      expect(
        page.languageSwitcher.items.find((item) => item.locale === 'es'),
      ).toMatchObject(
        page.locale === 'es'
          ? { state: 'current' }
          : { state: 'available', url: '/es/desarrollo/validador-json/' },
      );
      expect(
        page.languageSwitcher.items.find((item) => item.locale === 'fr'),
      ).toMatchObject(
        page.locale === 'fr'
          ? { state: 'current' }
          : { state: 'available', url: '/fr/developpement/validateur-json/' },
      );
    }
  });

  it('composes the explicit developer category from route ownership', async () => {
    const registry = await getDeliveryRouteRegistry();
    const page = await composeRootCategoryAdapterPage(
      'en',
      {
        kind: 'tool-category',
        categoryId: 'developer',
      },
      {
        routeRegistry: registry,
      },
    );

    expect(page.seo.canonicalUrl).toBe('https://4all.tools/developer/');
    expect(page.seo.alternates).toEqual([
      {
        locale: 'en',
        hrefLang: 'en',
        url: 'https://4all.tools/developer/',
      },
    ]);
    expect(page.seo.xDefaultUrl).toBe('https://4all.tools/developer/');
    expect(page.localizedRouteCluster?.variants.map((variant) => variant.locale)).toEqual([
      'en',
    ]);
    expect(page.languageSwitcher.items).toEqual([
      expect.objectContaining({ locale: 'en', state: 'current' }),
      expect.objectContaining({ locale: 'es', state: 'unavailable' }),
      expect.objectContaining({ locale: 'pt', state: 'unavailable' }),
      expect.objectContaining({ locale: 'fr', state: 'unavailable' }),
    ]);
    expect(
      page.languageSwitcher.items
        .filter((item) => item.state === 'unavailable')
        .some((item) => 'url' in item),
    ).toBe(false);
  });

  it('does not introduce an English prefix while composing localized alternates', async () => {
    const registry = await getDeliveryRouteRegistry();
    const page = await composeToolAreaAdapterPage(
      'es',
      {
        kind: 'tool',
        toolId: 'json-validator',
      },
      {
        routeRegistry: registry,
      },
    );

    expect(page.seo.canonicalUrl).toBe(
      'https://4all.tools/es/desarrollo/validador-json/',
    );
    expect(page.seo.alternates.map((alternate) => alternate.url)).not.toContain(
      'https://4all.tools/en/developer/json-validator/',
    );
  });
});
