import { access, readFile } from 'node:fs/promises';

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it, vi } from 'vitest';

import HomePage from '@/pages/index.astro';
import RootCategoryPage, {
  getStaticPaths as getRootCategoryStaticPaths,
} from '@/pages/[category]/index.astro';
import {
  composeToolAreaAdapterPage,
  getDeliveryRouteRegistry,
  UnsupportedPageTargetError,
} from '@/templates/composers';
import { getGlobalMessages } from '@/i18n/messages/registry';
import { LOCALES, SUPPORTED_LOCALES } from '@/i18n/config';
import type { LanguageSwitcherModel } from '@/navigation/language-switcher';
import type {
  ToolCategoryPageModel,
  ToolPageModel,
} from '@/templates/models/shared';
import {
  getToolAreaStaticPathEntries,
  type StaticPathFactory,
  type StaticPathProps,
} from '@/routing/static-paths';
import { createRouteRegistryFromRecords } from '@/routing/registry';
import type { RouteRecord, RouteTarget } from '@/routing/types';
import { createSeoPageModel } from '@/seo';

import FixtureContent from '../../fixtures/templates/FixtureContent.astro';

const PROJECT_ROOT = new URL('../../../', import.meta.url);
const PAGE_FILES = [
  'src/pages/index.astro',
  'src/pages/[category]/index.astro',
  'src/pages/[category]/[...path].astro',
] as const;
const STATIC_PATH_OPTIONS = {} as Parameters<StaticPathFactory>[0];

describe('English route adapters', () => {
  it('renders the unprefixed English home adapter', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(HomePage, {
      partial: false,
      request: new Request('https://example.com/'),
    });

    expect(html).toContain('<html lang="en" dir="ltr">');
    expect(html).toContain('data-template="home"');
    expect(html).not.toContain('/en/');
  });

  it('delegates root category static paths to P04 using stable target props', async () => {
    const paths = await getRootCategoryStaticPaths(STATIC_PATH_OPTIONS);

    expect(paths).toContainEqual({
      params: {
        category: 'developer',
      },
      props: {
        routeTarget: {
          kind: 'tool-category',
          categoryId: 'developer',
        },
      },
    });
  });

  it('renders a root category page from routeTarget props, not params identity', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(RootCategoryPage, {
      partial: false,
      request: new Request('https://example.com/not-the-category-id/'),
      params: {
        category: 'not-the-category-id',
      },
      props: {
        routeTarget: {
          kind: 'tool-category',
          categoryId: 'developer',
        },
      } satisfies StaticPathProps,
    });

    expect(html).toContain('data-template="tool-category"');
    expect(html).toContain('data-template-identity="developer"');
    expect(html).toContain('Developer Tools');
    expect(html).not.toContain('not-the-category-id');
  });

  it('projects tool catch-all fixtures with stable tool identity', () => {
    const entries = getToolAreaStaticPathEntries(fixtureRouteRegistry(), 'en');

    expect(entries).toContainEqual({
      params: {
        category: 'developer',
        path: 'json-validator',
      },
      props: {
        routeTarget: {
          kind: 'tool',
          toolId: 'json-validator',
        },
      },
    });
  });

  it('supports nested future tool-area fixtures without adapter changes', () => {
    const entries = getToolAreaStaticPathEntries(fixtureRouteRegistry(), 'en');

    expect(entries).toContainEqual({
      params: {
        category: 'developer',
        path: 'data-formats/json/json-validator',
      },
      props: {
        routeTarget: {
          kind: 'tool',
          toolId: 'json-validator-nested',
        },
      },
    });
  });

  it('dispatches catch-all route targets by discriminant', async () => {
    const composeToolPageModel = vi.fn(async () => fixtureToolModel());
    const page = await composeToolAreaAdapterPage(
      'en',
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
    expect(composeToolPageModel).toHaveBeenCalledWith(
      'en',
      'json-validator',
      expect.objectContaining({
        routeRegistry: expect.any(Object),
      }),
    );
  });

  it('fails explicitly for unsupported catch-all targets', async () => {
    await expect(
      composeToolAreaAdapterPage(
        'en',
        {
          kind: 'article',
          articleId: 'what-is-json',
        },
        {
          routeRegistry: fixtureRouteRegistry(),
          composeCategoryPageModel: async () => fixtureCategoryModel(),
          composeToolPageModel: async () => fixtureToolModel(),
        },
      ),
    ).rejects.toBeInstanceOf(UnsupportedPageTargetError);
  });

  it('keeps the English source tree unprefixed and adapter dependencies thin', async () => {
    expect(await projectPathExists('src/pages/en')).toBe(false);

    const sources = await Promise.all(
      PAGE_FILES.map((path) => readFile(new URL(path, PROJECT_ROOT), 'utf8')),
    );
    const combinedSource = sources.join('\n');

    expect(combinedSource).toContain("const locale = 'en' as const;");
    expect(combinedSource).toContain('createRootCategoryStaticPaths');
    expect(combinedSource).toContain('createToolAreaStaticPaths');
    expect(combinedSource).not.toContain('getCollection');
    expect(combinedSource).not.toContain('getEntry');
    expect(combinedSource).not.toContain('Astro.params');
    expect(combinedSource).not.toContain('Astro.url');
    expect(combinedSource).not.toContain('@/features/');
  });

  it('publishes the production json-validator catch-all route through registry data', async () => {
    const registry = await getDeliveryRouteRegistry();
    const entries = getToolAreaStaticPathEntries(registry, 'en');

    expect(entries).toContainEqual({
      params: {
        category: 'developer',
        path: 'json-validator',
      },
      props: {
        routeTarget: {
          kind: 'tool',
          toolId: 'json-validator',
        },
      },
    });
  });
});

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
      segments: ['developer', 'json-validator'],
      target: {
        kind: 'tool',
        toolId: 'json-validator',
      },
    }),
    route({
      locale: 'en',
      segments: ['developer', 'data-formats', 'json', 'json-validator'],
      target: {
        kind: 'tool',
        toolId: 'json-validator-nested',
      },
    }),
    route({
      locale: 'en',
      segments: ['developer'],
      target: {
        kind: 'tool-category',
        categoryId: 'developer',
      },
    }),
  ]);
}

function route(input: {
  readonly locale: RouteRecord['locale'];
  readonly segments: readonly string[];
  readonly target: RouteTarget;
}): RouteRecord {
  return {
    area: input.target.kind === 'article' || input.target.kind === 'blog-category' ? 'blog' : 'tools',
    locale: input.locale,
    segments: input.segments,
    target: input.target,
    sourceId: 'fixture:english-route-adapters',
  };
}

function fixtureToolModel(): ToolPageModel {
  return {
    kind: 'tool',
    locale: 'en',
    route: route({
      locale: 'en',
      segments: ['developer', 'json-validator'],
      target: {
        kind: 'tool',
        toolId: 'json-validator',
      },
    }),
    seo: seo({
      title: 'JSON Validator',
      description: 'Validate JSON.',
      canonicalUrl: 'https://4all.tools/developer/json-validator/',
    }),
    languageSwitcher: languageSwitcher('en'),
    toolId: 'json-validator',
    title: 'JSON Validator',
    messages: getGlobalMessages('en'),
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

function fixtureCategoryModel(): ToolCategoryPageModel {
  return {
    kind: 'tool-category',
    locale: 'en',
    route: route({
      locale: 'en',
      segments: ['developer'],
      target: {
        kind: 'tool-category',
        categoryId: 'developer',
      },
    }),
    seo: seo({
      title: 'Developer Tools',
      description: 'Developer utilities.',
      canonicalUrl: 'https://4all.tools/developer/',
    }),
    languageSwitcher: languageSwitcher('en'),
    categoryId: 'developer',
    title: 'Developer Tools',
    messages: getGlobalMessages('en'),
    category: {
      label: 'Developer Tools',
    },
    content: {
      title: 'Developer Tools',
      description: 'Developer utilities.',
      editorial: {
        Content: FixtureContent,
        headings: [],
      },
    },
  };
}

function seo(input: {
  readonly title: string;
  readonly description: string;
  readonly canonicalUrl: string;
}) {
  return createSeoPageModel(input);
}

function languageSwitcher(locale: 'en'): LanguageSwitcherModel {
  return {
    ariaLabel: 'Languages',
    currentLanguage: 'Current language',
    unavailableLabel: 'Not available',
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
