import { access, readFile } from 'node:fs/promises';

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it, vi } from 'vitest';

import FrenchHomePage from '@/pages/fr/index.astro';
import PortugueseHomePage from '@/pages/pt/index.astro';
import SpanishHomePage from '@/pages/es/index.astro';
import {
  composeToolAreaAdapterPage,
  UnsupportedPageTargetError,
} from '@/templates/composers';
import { getGlobalMessages } from '@/i18n/messages/registry';
import { LOCALES, SUPPORTED_LOCALES } from '@/i18n/config';
import type { LanguageSwitcherModel } from '@/navigation/language-switcher';
import type { BreadcrumbModel } from '@/navigation/breadcrumbs';
import type { ToolPageModel } from '@/templates/models/shared';
import {
  getRootCategoryStaticPathEntries,
  getToolAreaStaticPathEntries,
} from '@/routing/static-paths';
import { createRouteRegistryFromRecords } from '@/routing/registry';
import type { Locale } from '@/i18n/types';
import type { RouteRecord, RouteTarget } from '@/routing/types';
import { createSeoPageModel } from '@/seo';

import FixtureContent from '../../fixtures/templates/FixtureContent.astro';

const PROJECT_ROOT = new URL('../../../', import.meta.url);
const LOCALIZED_PAGE_FILES = [
  'src/pages/es/index.astro',
  'src/pages/es/[category]/index.astro',
  'src/pages/es/[category]/[...path].astro',
  'src/pages/pt/index.astro',
  'src/pages/pt/[category]/index.astro',
  'src/pages/pt/[category]/[...path].astro',
  'src/pages/fr/index.astro',
  'src/pages/fr/[category]/index.astro',
  'src/pages/fr/[category]/[...path].astro',
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
    const entries = getRootCategoryStaticPathEntries(fixtureRouteRegistry(), 'es');

    expect(entries).toEqual([
      {
        params: {
          category: 'desarrollo',
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
        category: 'developer',
        path: 'json-validator',
      },
      es: {
        category: 'desarrollo',
        path: 'validador-json',
      },
      pt: {
        category: 'desenvolvedor',
        path: 'validador-json',
      },
      fr: {
        category: 'developpement',
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
        category: 'desarrollo',
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

  it('reuses shared catch-all dispatch for localized tool targets', async () => {
    const composeToolPageModel = vi.fn(async () => fixtureToolModel('es'));
    const page = await composeToolAreaAdapterPage(
      'es',
      {
        kind: 'tool',
        toolId: 'json-validator',
      },
      {
        routeRegistry: fixtureRouteRegistry(),
        composeToolPageModel,
      },
    );

    expect(page.kind).toBe('tool');
    expect(page.locale).toBe('es');
    expect(composeToolPageModel).toHaveBeenCalledWith(
      'es',
      'json-validator',
      expect.objectContaining({
        routeRegistry: expect.any(Object),
      }),
    );
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
          composeToolPageModel: async () => fixtureToolModel('fr'),
        },
      ),
    ).rejects.toBeInstanceOf(UnsupportedPageTargetError);
  });

  it('does not fall back to English for missing localized tool content', async () => {
    const requestedLocales: Locale[] = [];

    await expect(
      composeToolAreaAdapterPage(
        'es',
        {
          kind: 'tool',
          toolId: 'json-validator',
        },
        {
          routeRegistry: fixtureRouteRegistry(),
          composeToolPageModel: async (locale) => {
            requestedLocales.push(locale);
            throw new Error('Missing localized content');
          },
        },
      ),
    ).rejects.toThrow('Missing localized content');
    expect(requestedLocales).toEqual(['es']);
  });

  it('keeps localized adapters thin and shared', async () => {
    expect(await projectPathExists('src/pages/en')).toBe(false);

    for (const file of LOCALIZED_PAGE_FILES) {
      expect(await projectPathExists(file)).toBe(true);
    }

    const sources = await Promise.all(
      LOCALIZED_PAGE_FILES.map((path) =>
        readFile(new URL(path, PROJECT_ROOT), 'utf8'),
      ),
    );
    const combinedSource = sources.join('\n');

    expect(combinedSource).toContain('composeHomePageModel');
    expect(combinedSource).toContain('composeRootCategoryAdapterPage');
    expect(combinedSource).toContain('composeToolAreaAdapterPage');
    expect(combinedSource).toContain('createRootCategoryStaticPaths');
    expect(combinedSource).toContain('createToolAreaStaticPaths');
    expect(combinedSource).not.toContain('Astro.url');
    expect(combinedSource).not.toContain('pathname');
    expect(combinedSource).not.toContain('navigator.language');
    expect(combinedSource).not.toContain('Accept-Language');
    expect(combinedSource).not.toContain('getCollection');
    expect(combinedSource).not.toContain('getEntry');
    expect(combinedSource).not.toContain('@/features/');
    expect(combinedSource).not.toContain("locale === 'es'");
    expect(combinedSource).not.toContain("locale === 'pt'");
    expect(combinedSource).not.toContain("locale === 'fr'");
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

function fixtureToolModel(locale: Locale): ToolPageModel {
  return {
    kind: 'tool',
    locale,
    route: route({
      locale,
      segments: ['fixture', 'json-validator'],
      target: {
        kind: 'tool',
        toolId: 'json-validator',
      },
    }),
    seo: createSeoPageModel({
      title: 'JSON Validator',
      description: 'Validate JSON.',
      canonicalUrl:
        locale === 'en'
          ? 'https://4all.tools/fixture/json-validator/'
          : `https://4all.tools/${locale}/fixture/json-validator/`,
    }),
    languageSwitcher: languageSwitcher(locale),
    breadcrumbs: breadcrumbs(locale),
    toolId: 'json-validator',
    title: 'JSON Validator',
    messages: getGlobalMessages(locale),
    content: {
      title: 'JSON Validator',
      description: 'Validate JSON.',
      editorial: {
        Content: FixtureContent,
        headings: [],
      },
    },
    presentation: {
      toolId: 'json-validator',
      primaryCategoryId: 'json',
      executionType: 'client',
    },
  };
}

function languageSwitcher(locale: Locale): LanguageSwitcherModel {
  const messages = getGlobalMessages(locale).language;

  return {
    ariaLabel: messages.switcherLabel,
    currentLanguage: messages.currentLanguage,
    unavailableLabel: messages.unavailable,
    items: SUPPORTED_LOCALES.map((itemLocale) =>
      itemLocale === locale
        ? {
            state: 'current' as const,
            locale: itemLocale,
            label: LOCALES[itemLocale].label,
            htmlLang: LOCALES[itemLocale].htmlLang,
          }
        : {
            state: 'available' as const,
            locale: itemLocale,
            label: LOCALES[itemLocale].label,
            htmlLang: LOCALES[itemLocale].htmlLang,
            url: `/${itemLocale}/`,
          },
    ),
  };
}

function breadcrumbs(locale: Locale): BreadcrumbModel {
  const messages = getGlobalMessages(locale).navigation;

  return {
    ariaLabel: messages.breadcrumbsLabel,
    items: [
      {
        kind: 'home',
        state: 'link',
        label: messages.home,
        url: locale === 'en' ? '/' : `/${locale}/`,
      },
      {
        kind: 'entity',
        state: 'current',
        label: 'JSON Validator',
      },
    ],
  };
}
