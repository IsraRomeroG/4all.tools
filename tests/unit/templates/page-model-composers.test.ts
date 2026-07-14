import { readFile } from 'node:fs/promises';

import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { describe, expect, it, vi } from 'vitest';

import type { ToolCategoryId, ToolId } from '@/domain/shared/ids';
import { createTaxonomyTree } from '@/domain/taxonomy/shared/tree';
import type { TaxonomyNode } from '@/domain/taxonomy/shared/types';
import { AmbiguousContentError, ContentNotFoundError } from '@/content/queries/errors';
import type { ToolCategoryContentEntry } from '@/content/queries/tool-categories';
import type { ToolContentEntry } from '@/content/queries/tools';
import type { Locale } from '@/i18n/types';
import {
  MissingCanonicalRouteError,
  MissingTaxonomyNodeError,
  PageModelCompositionError,
  UnsupportedLocaleError,
  composeCategoryPageModel,
  composeHomePageModel,
  composeToolPageModel,
} from '@/templates/composers';
import type { RenderContent } from '@/templates/composers/rendered-content';
import type { RouteRecord, RouteTarget } from '@/routing/types';
import { createRouteRegistryFromRecords } from '@/routing/registry';

import FixtureContent from '../../fixtures/templates/FixtureContent.astro';

const PROJECT_ROOT = new URL('../../../', import.meta.url);
const COMPOSER_FILES = [
  'src/templates/composers/home.ts',
  'src/templates/composers/tool.ts',
  'src/templates/composers/category.ts',
] as const;

describe('page model composers', () => {
  it('composes a tool model from stable identity and localized canonical route', async () => {
    const model = await composeToolPageModel('es', 'json-validator', {
      routeRegistry: fixtureRouteRegistry(),
      requirePublishedToolContent: async (toolId, locale) =>
        toolContentEntry({
          toolId,
          locale,
          title: 'Validador JSON',
          description: 'Valida JSON.',
        }),
      renderContent: fixtureRenderContent,
      toolPresentationProvider: {
        getToolPresentation: (toolId) => ({
          toolId,
          primaryCategoryId: 'developer',
        }),
      },
    });

    expect(model.kind).toBe('tool');
    expect(model.locale).toBe('es');
    expect(model.toolId).toBe('json-validator');
    expect(model.route.segments).toEqual(['desarrollo', 'validador-json']);
    expect(model.content.title).toBe('Validador JSON');
    expect(model.presentation).toEqual({
      toolId: 'json-validator',
      primaryCategoryId: 'developer',
    });
  });

  it('fails explicitly when tool content is missing', async () => {
    const missing = new ContentNotFoundError({
      collection: 'tools',
      entityField: 'toolId',
      entityId: 'json-validator',
      locale: 'es',
      status: 'published',
    });

    await expectComposerError(
      composeToolPageModel('es', 'json-validator', {
        routeRegistry: fixtureRouteRegistry(),
        requirePublishedToolContent: async () => {
          throw missing;
        },
        renderContent: fixtureRenderContent,
      }),
      PageModelCompositionError,
      missing,
    );
  });

  it('wraps ambiguous tool content with composition context', async () => {
    const ambiguous = new AmbiguousContentError({
      collection: 'tools',
      entityField: 'toolId',
      entityId: 'json-validator',
      locale: 'es',
      status: 'published',
      matchedEntryIds: ['a', 'b'],
    });

    await expectComposerError(
      composeToolPageModel('es', 'json-validator', {
        routeRegistry: fixtureRouteRegistry(),
        requirePublishedToolContent: async () => {
          throw ambiguous;
        },
        renderContent: fixtureRenderContent,
      }),
      PageModelCompositionError,
      ambiguous,
    );
  });

  it('fails explicitly when a tool canonical route is missing', async () => {
    await expect(
      composeToolPageModel('es', 'missing-tool', {
        routeRegistry: fixtureRouteRegistry(),
        requirePublishedToolContent: async (toolId, locale) =>
          toolContentEntry({
            toolId,
            locale,
            title: 'Missing',
            description: 'Missing.',
          }),
        renderContent: fixtureRenderContent,
      }),
    ).rejects.toBeInstanceOf(MissingCanonicalRouteError);
  });

  it('does not fall back to English when localized tool content is missing', async () => {
    const requestedLocales: Locale[] = [];
    const missing = new ContentNotFoundError({
      collection: 'tools',
      entityField: 'toolId',
      entityId: 'json-validator',
      locale: 'es',
      status: 'published',
    });

    await expectComposerError(
      composeToolPageModel('es', 'json-validator', {
        routeRegistry: fixtureRouteRegistry(),
        requirePublishedToolContent: async (_toolId, locale) => {
          requestedLocales.push(locale);
          throw missing;
        },
        renderContent: fixtureRenderContent,
      }),
      PageModelCompositionError,
      missing,
    );
    expect(requestedLocales).toEqual(['es']);
  });

  it('composes a category model from stable taxonomy identity', async () => {
    const model = await composeCategoryPageModel('es', 'developer', {
      routeRegistry: fixtureRouteRegistry(),
      toolTaxonomy: fixtureToolTaxonomy(),
      requirePublishedToolCategoryContent: async (categoryId, locale) =>
        categoryContentEntry({
          categoryId,
          locale,
          title: 'Desarrollo',
          description: 'Herramientas para desarrolladores.',
        }),
      renderContent: fixtureRenderContent,
    });

    expect(model.kind).toBe('tool-category');
    expect(model.categoryId).toBe('developer');
    expect(model.route.segments).toEqual(['desarrollo']);
    expect(model.category.label).toBe('Herramientas para desarrolladores');
    expect(model.content.title).toBe('Desarrollo');
  });

  it('fails explicitly when localized category content is missing', async () => {
    const missing = new ContentNotFoundError({
      collection: 'toolCategories',
      entityField: 'categoryId',
      entityId: 'developer',
      locale: 'es',
      status: 'published',
    });

    await expectComposerError(
      composeCategoryPageModel('es', 'developer', {
        routeRegistry: fixtureRouteRegistry(),
        toolTaxonomy: fixtureToolTaxonomy(),
        requirePublishedToolCategoryContent: async () => {
          throw missing;
        },
        renderContent: fixtureRenderContent,
      }),
      PageModelCompositionError,
      missing,
    );
  });

  it('fails explicitly when the taxonomy node is missing', async () => {
    await expect(
      composeCategoryPageModel('es', 'unknown-category', {
        routeRegistry: fixtureRouteRegistry(),
        toolTaxonomy: createTaxonomyTree<ToolCategoryId>([]),
        requirePublishedToolCategoryContent: async (categoryId, locale) =>
          categoryContentEntry({
            categoryId,
            locale,
            title: 'Unknown',
            description: 'Unknown.',
          }),
        renderContent: fixtureRenderContent,
      }),
    ).rejects.toBeInstanceOf(MissingTaxonomyNodeError);
  });

  it('composes locale-specific home models without route parsing', () => {
    const getGlobalMessages = vi.fn((locale: Locale) => ({
      marker: locale,
    }));
    const model = composeHomePageModel('fr', {
      getGlobalMessages: getGlobalMessages as never,
    });

    expect(model.kind).toBe('home');
    expect(model.locale).toBe('fr');
    expect(model.route).toBeNull();
    expect(model.messages).toEqual({ marker: 'fr' });
    expect(getGlobalMessages).toHaveBeenCalledWith('fr');
  });

  it('rejects unsupported home locales instead of falling back to English', () => {
    expect(() => composeHomePageModel('de' as Locale)).toThrow(
      UnsupportedLocaleError,
    );
  });

  it('composes the same stable tool identity across localized route fixtures', async () => {
    const locales = ['en', 'es', 'pt', 'fr'] as const;
    const models = await Promise.all(
      locales.map((locale) =>
        composeToolPageModel(locale, 'json-validator', {
          routeRegistry: fixtureRouteRegistry(),
          requirePublishedToolContent: async (toolId, contentLocale) =>
            toolContentEntry({
              toolId,
              locale: contentLocale,
              title: `${contentLocale} JSON`,
              description: `${contentLocale} description`,
            }),
          renderContent: fixtureRenderContent,
        }),
      ),
    );

    expect(models.map((model) => model.toolId)).toEqual([
      'json-validator',
      'json-validator',
      'json-validator',
      'json-validator',
    ]);
    expect(models.map((model) => model.route.segments.join('/'))).toEqual([
      'developer/json-validator',
      'desarrollo/validador-json',
      'desenvolvedor/validador-json',
      'developpement/validateur-json',
    ]);
  });

  it('keeps composer dependencies on supported P03/P04 boundaries', async () => {
    const sources = await Promise.all(
      COMPOSER_FILES.map((path) =>
        readFile(new URL(path, PROJECT_ROOT), 'utf8'),
      ),
    );
    const combinedSource = sources.join('\n');

    expect(combinedSource).toContain('requirePublishedToolContent');
    expect(combinedSource).toContain('requirePublishedToolCategoryContent');
    expect(combinedSource).toContain('getCanonical');
    expect(combinedSource).not.toContain('getCollection');
    expect(combinedSource).not.toContain('getEntry');
    expect(combinedSource).not.toContain('Astro.params');
    expect(combinedSource).not.toContain('Astro.url');
    expect(combinedSource).not.toContain('pathname');
    expect(combinedSource).not.toContain('@/features/');
  });
});

const fixtureRenderContent: RenderContent = async () => ({
  Content: FixtureContent as AstroComponentFactory,
  headings: [],
});

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
  ]);
}

function fixtureToolTaxonomy() {
  return createTaxonomyTree<ToolCategoryId>([
    {
      id: 'developer',
      parentId: null,
      localized: {
        en: {
          slug: 'developer',
          label: 'Developer Tools',
        },
        es: {
          slug: 'desarrollo',
          label: 'Herramientas para desarrolladores',
        },
        pt: {
          slug: 'desenvolvedor',
          label: 'Ferramentas para desenvolvedores',
        },
        fr: {
          slug: 'developpement',
          label: 'Outils pour developpeurs',
        },
      },
      status: 'published',
      sortOrder: 100,
    },
  ] satisfies readonly TaxonomyNode<ToolCategoryId>[]);
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
    sourceId: 'fixture:page-model-composer',
  };
}

function toolContentEntry(input: {
  readonly toolId: ToolId;
  readonly locale: Locale;
  readonly title: string;
  readonly description: string;
}): ToolContentEntry {
  return {
    id: `${input.locale}/developer/${input.toolId}`,
    collection: 'tools',
    data: {
      toolId: input.toolId,
      locale: input.locale,
      status: 'published',
      title: input.title,
      description: input.description,
      seo: {
        title: input.title,
        description: input.description,
        noindex: false,
      },
      relatedToolIds: [],
    },
  } as ToolContentEntry;
}

function categoryContentEntry(input: {
  readonly categoryId: ToolCategoryId;
  readonly locale: Locale;
  readonly title: string;
  readonly description: string;
}): ToolCategoryContentEntry {
  return {
    id: `${input.locale}/${input.categoryId}`,
    collection: 'toolCategories',
    data: {
      categoryId: input.categoryId,
      locale: input.locale,
      status: 'published',
      title: input.title,
      description: input.description,
      seo: {
        title: input.title,
        description: input.description,
        noindex: false,
      },
    },
  } as ToolCategoryContentEntry;
}

async function expectComposerError(
  promise: Promise<unknown>,
  expectedError: new (...args: never[]) => Error,
  expectedCause: Error,
): Promise<void> {
  let caughtError: unknown;

  try {
    await promise;
  } catch (error) {
    caughtError = error;
  }

  expect(caughtError).toBeInstanceOf(expectedError);
  expect((caughtError as Error).cause).toBe(expectedCause);
}
