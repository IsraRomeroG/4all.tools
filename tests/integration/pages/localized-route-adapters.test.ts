import { access } from 'node:fs/promises';

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import FrenchHomePage from '@/pages/fr/index.astro';
import PortugueseHomePage from '@/pages/pt/index.astro';
import SpanishHomePage from '@/pages/es/index.astro';
import {
  composeToolAreaAdapterPage,
  UnsupportedPageTargetError,
} from '@/templates/composers';
import {
  getRootStaticPathEntries,
  getToolAreaStaticPathEntries,
} from '@/routing/static-paths';
import { createRouteRegistryFromRecords } from '@/routing/registry';
import type { Locale } from '@/i18n/types';
import type { RouteRecord, RouteTarget } from '@/routing/types';

const PROJECT_ROOT = new URL('../../../', import.meta.url);
const LOCALIZED_PAGE_FILES = [
  'src/pages/es/index.astro',
  'src/pages/es/[root]/index.astro',
  'src/pages/es/[root]/[...path].astro',
  'src/pages/pt/index.astro',
  'src/pages/pt/[root]/index.astro',
  'src/pages/pt/[root]/[...path].astro',
  'src/pages/fr/index.astro',
  'src/pages/fr/[root]/index.astro',
  'src/pages/fr/[root]/[...path].astro',
] as const;

describe('localized route adapters', () => {
  it('renders the Spanish home adapter with Spanish document metadata', async () => {
    const html = await renderHome(SpanishHomePage, 'https://example.com/es/');

    expect(html).toContain('<html lang="es" dir="ltr">');
    expect(html).toContain('data-template="home"');
    expect(html).toContain('Categorías destacadas');
    expect(html).toContain('Herramientas populares');
    expect(html).not.toContain('Featured categories');
    expect(html).not.toContain('Popular tools');
  });

  it('renders the Portuguese home adapter with Portuguese document metadata', async () => {
    const html = await renderHome(PortugueseHomePage, 'https://example.com/pt/');

    expect(html).toContain('<html lang="pt" dir="ltr">');
    expect(html).toContain('data-template="home"');
    expect(html).toContain('Categorias em destaque');
    expect(html).toContain('Ferramentas populares');
    expect(html).not.toContain('Featured categories');
    expect(html).not.toContain('Popular tools');
  });

  it('renders the French home adapter with French document metadata', async () => {
    const html = await renderHome(FrenchHomePage, 'https://example.com/fr/');

    expect(html).toContain('<html lang="fr" dir="ltr">');
    expect(html).toContain('data-template="home"');
    expect(html).toContain('Catégories en vedette');
    expect(html).toContain('Outils populaires');
    expect(html).not.toContain('Featured categories');
    expect(html).not.toContain('Popular tools');
  });

  it('projects localized category slugs while preserving stable category identity', () => {
    const entries = getRootStaticPathEntries(fixtureRouteRegistry(), 'es');

    expect(entries).toEqual([
      {
        params: {
          root: 'desarrollo',
        },
        props: {
          routeTarget: {
            kind: 'tool-category',
            categoryId: 'developer',
          },
        },
      },
    ]);
  });

  it('keeps json-validator stable across English and localized tool paths', () => {
    const registry = fixtureRouteRegistry();
    const expected = {
      en: {
        root: 'developer',
        path: 'json-validator',
      },
      es: {
        root: 'desarrollo',
        path: 'validador-json',
      },
      pt: {
        root: 'desenvolvedor',
        path: 'validador-json',
      },
      fr: {
        root: 'developpement',
        path: 'validateur-json',
      },
    } as const;

    for (const locale of ['en', 'es', 'pt', 'fr'] as const) {
      const entries = getToolAreaStaticPathEntries(registry, locale);

      expect(entries).toContainEqual({
        params: expected[locale],
        props: {
          routeTarget: {
            kind: 'tool',
            toolId: 'json-validator',
          },
        },
      });
    }
  });

  it('supports future nested localized rest paths without new page files', () => {
    const entries = getToolAreaStaticPathEntries(fixtureRouteRegistry(), 'es');

    expect(entries).toContainEqual({
      params: {
        root: 'desarrollo',
        path: 'formatos-de-datos/json/validador-json',
      },
      props: {
        routeTarget: {
          kind: 'tool',
          toolId: 'json-validator-nested',
        },
      },
    });
  });

  it('fails explicitly for unsupported localized targets', async () => {
    await expect(
      composeToolAreaAdapterPage(
        'fr',
        {
          kind: 'blog-category',
          categoryId: 'json-guides',
        },
        {
          routeRegistry: fixtureRouteRegistry(),
        },
      ),
    ).rejects.toBeInstanceOf(UnsupportedPageTargetError);
  });

  it('keeps localized route adapter files available without an English page tree', async () => {
    expect(await projectPathExists('src/pages/en')).toBe(false);

    for (const file of LOCALIZED_PAGE_FILES) {
      expect(await projectPathExists(file)).toBe(true);
    }
  });
});

async function renderHome(component: typeof SpanishHomePage, url: string): Promise<string> {
  const container = await AstroContainer.create();

  return container.renderToString(component, {
    partial: false,
    request: new Request(url),
  });
}

async function projectPathExists(path: string): Promise<boolean> {
  try {
    await access(new URL(path, PROJECT_ROOT));
    return true;
  } catch {
    return false;
  }
}

function fixtureRouteRegistry() {
  return createRouteRegistryFromRecords([
    route({
      locale: 'en',
      segments: ['developer'],
      target: {
        kind: 'tool-category',
        categoryId: 'developer',
      },
    }),
    route({
      locale: 'es',
      segments: ['desarrollo'],
      target: {
        kind: 'tool-category',
        categoryId: 'developer',
      },
    }),
    route({
      locale: 'pt',
      segments: ['desenvolvedor'],
      target: {
        kind: 'tool-category',
        categoryId: 'developer',
      },
    }),
    route({
      locale: 'fr',
      segments: ['developpement'],
      target: {
        kind: 'tool-category',
        categoryId: 'developer',
      },
    }),
    route({
      locale: 'en',
      segments: ['developer', 'json-validator'],
      target: {
        kind: 'tool',
        toolId: 'json-validator',
      },
    }),
    route({
      locale: 'es',
      segments: ['desarrollo', 'validador-json'],
      target: {
        kind: 'tool',
        toolId: 'json-validator',
      },
    }),
    route({
      locale: 'pt',
      segments: ['desenvolvedor', 'validador-json'],
      target: {
        kind: 'tool',
        toolId: 'json-validator',
      },
    }),
    route({
      locale: 'fr',
      segments: ['developpement', 'validateur-json'],
      target: {
        kind: 'tool',
        toolId: 'json-validator',
      },
    }),
    route({
      locale: 'es',
      segments: ['desarrollo', 'formatos-de-datos', 'json', 'validador-json'],
      target: {
        kind: 'tool',
        toolId: 'json-validator-nested',
      },
    }),
  ]);
}

function route(input: {
  readonly locale: Locale;
  readonly segments: readonly string[];
  readonly target: RouteTarget;
}): RouteRecord {
  return {
    area: input.target.kind === 'article' || input.target.kind === 'blog-category' ? 'blog' : 'tools',
    locale: input.locale,
    segments: input.segments,
    target: input.target,
    sourceId: 'fixture:localized-route-adapters',
  };
}
