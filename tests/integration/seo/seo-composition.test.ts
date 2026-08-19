import { describe, expect, it } from 'vitest';

import {
  composeRootAdapterPage,
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
            toolId: 'json-formatter-validator',
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
      page.siteHeader.languageSwitcher.items.map((item) => item.locale),
      ).toEqual(['en', 'es', 'pt', 'fr']);
      expect(
        page.siteHeader.languageSwitcher.items.find((item) => item.locale === 'es'),
      ).toMatchObject(
        page.locale === 'es'
          ? { state: 'current' }
          : { state: 'available', url: '/es/desarrollo/validador-json/' },
      );
      expect(
        page.siteHeader.languageSwitcher.items.find((item) => item.locale === 'fr'),
      ).toMatchObject(
        page.locale === 'fr'
          ? { state: 'current' }
          : { state: 'available', url: '/fr/developpement/validateur-json/' },
      );
      expect(page.breadcrumbs.items.map((item) => item.label)).toEqual(
        page.locale === 'en'
          ? ['Home', 'Developer Tools', 'JSON', 'JSON Validator']
          : page.locale === 'es'
            ? ['Inicio', 'Herramientas para desarrolladores', 'JSON', 'Validador JSON']
            : page.locale === 'pt'
              ? ['Início', 'Ferramentas para desenvolvedores', 'JSON', 'Validador JSON']
              : ['Accueil', 'Outils pour développeurs', 'JSON', 'Validateur JSON'],
      );
      expect(page.breadcrumbs.items.filter((item) => item.state === 'link')).toHaveLength(
        2,
      );
    }
  });

  it('composes the explicit developer category from route ownership', async () => {
    const registry = await getDeliveryRouteRegistry();
    const page = await composeRootAdapterPage(
      'en',
      {
        kind: 'tool-category',
        categoryId: 'developer',
      },
      {
        routeRegistry: registry,
      },
    );

    if (page.kind !== 'tool-category') {
      throw new Error('Expected developer root target to compose a tool category page.');
    }

    expect(page.seo.canonicalUrl).toBe('https://4all.tools/developer/');
    expect(page.seo.alternates).toEqual([
      {
        locale: 'en',
        hrefLang: 'en',
        url: 'https://4all.tools/developer/',
      },
      {
        locale: 'es',
        hrefLang: 'es',
        url: 'https://4all.tools/es/desarrollo/',
      },
      {
        locale: 'pt',
        hrefLang: 'pt',
        url: 'https://4all.tools/pt/desenvolvedor/',
      },
      {
        locale: 'fr',
        hrefLang: 'fr',
        url: 'https://4all.tools/fr/developpement/',
      },
    ]);
    expect(page.seo.xDefaultUrl).toBe('https://4all.tools/developer/');
    expect(page.localizedRouteCluster?.variants.map((variant) => variant.locale)).toEqual([
      'en',
      'es',
      'pt',
      'fr',
    ]);
    expect(page.siteHeader.languageSwitcher.items).toEqual([
      expect.objectContaining({ locale: 'en', state: 'current' }),
      expect.objectContaining({ locale: 'es', state: 'available', url: '/es/desarrollo/' }),
      expect.objectContaining({ locale: 'pt', state: 'available', url: '/pt/desenvolvedor/' }),
      expect.objectContaining({ locale: 'fr', state: 'available', url: '/fr/developpement/' }),
    ]);
    expect(
      page.siteHeader.languageSwitcher.items
        .filter((item) => item.state === 'unavailable')
    ).toEqual([]);
    expect(page.breadcrumbs.items).toEqual([
      { kind: 'home', state: 'link', label: 'Home', url: '/' },
      { kind: 'taxonomy', state: 'current', label: 'Developer Tools' },
    ]);
  });

  it('does not introduce an English prefix while composing localized alternates', async () => {
    const registry = await getDeliveryRouteRegistry();
    const page = await composeToolAreaAdapterPage(
      'es',
      {
        kind: 'tool',
        toolId: 'json-formatter-validator',
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
