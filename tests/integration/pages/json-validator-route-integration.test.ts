import { access, readFile } from 'node:fs/promises';

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import EnglishToolAreaPage, {
  getStaticPaths as getEnglishToolAreaStaticPaths,
} from '@/pages/[category]/[...path].astro';
import SpanishToolAreaPage, {
  getStaticPaths as getSpanishToolAreaStaticPaths,
} from '@/pages/es/[category]/[...path].astro';
import PortugueseToolAreaPage, {
  getStaticPaths as getPortugueseToolAreaStaticPaths,
} from '@/pages/pt/[category]/[...path].astro';
import FrenchToolAreaPage, {
  getStaticPaths as getFrenchToolAreaStaticPaths,
} from '@/pages/fr/[category]/[...path].astro';
import {
  composeToolAreaAdapterPage,
  getDeliveryRouteRegistry,
} from '@/templates/composers';
import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import { getToolComponent } from '@/features/tools/component-registry';
import { getToolDefinition } from '@/features/tools/registry';
import { getToolMessages } from '@/features/tools/message-registry';
import type { RouteDefinitionProvider } from '@/routing/definitions';
import { createRouteRegistry } from '@/routing/registry';
import { RouteValidationError } from '@/routing/validation';
import type { StaticPathFactory } from '@/routing/static-paths';
import { getToolAreaStaticPathEntries } from '@/routing/static-paths';
import type { Locale } from '@/i18n/types';

const PROJECT_ROOT = new URL('../../../', import.meta.url);
const STATIC_PATH_OPTIONS = {} as Parameters<StaticPathFactory>[0];

const EXPECTED = {
  en: {
    page: EnglishToolAreaPage,
    getStaticPaths: getEnglishToolAreaStaticPaths,
    params: {
      category: 'developer',
      path: 'json-validator',
    },
    segments: ['developer', 'json-validator'],
    url: 'https://example.com/developer/json-validator/',
    title: 'JSON Validator',
    label: 'Input JSON',
    validate: 'Validate JSON',
    editorial: 'How to use the JSON Validator',
  },
  es: {
    page: SpanishToolAreaPage,
    getStaticPaths: getSpanishToolAreaStaticPaths,
    params: {
      category: 'desarrollo',
      path: 'validador-json',
    },
    segments: ['desarrollo', 'validador-json'],
    url: 'https://example.com/es/desarrollo/validador-json/',
    title: 'Validador JSON',
    label: 'JSON de entrada',
    validate: 'Validar JSON',
    editorial: 'Cómo usar el Validador JSON',
  },
  pt: {
    page: PortugueseToolAreaPage,
    getStaticPaths: getPortugueseToolAreaStaticPaths,
    params: {
      category: 'desenvolvedor',
      path: 'validador-json',
    },
    segments: ['desenvolvedor', 'validador-json'],
    url: 'https://example.com/pt/desenvolvedor/validador-json/',
    title: 'Validador JSON',
    label: 'JSON de entrada',
    validate: 'Validar JSON',
    editorial: 'Como usar o Validador JSON',
  },
  fr: {
    page: FrenchToolAreaPage,
    getStaticPaths: getFrenchToolAreaStaticPaths,
    params: {
      category: 'developpement',
      path: 'validateur-json',
    },
    segments: ['developpement', 'validateur-json'],
    url: 'https://example.com/fr/developpement/validateur-json/',
    title: 'Validateur JSON',
    label: 'JSON d’entrée',
    validate: 'Valider le JSON',
    editorial: 'Comment utiliser le Validateur JSON',
  },
} as const;

describe('json-validator end-to-end route integration', () => {
  it('creates four production route records with one stable target and flat strategy', async () => {
    const registry = await getDeliveryRouteRegistry();

    for (const locale of Object.keys(EXPECTED) as Locale[]) {
      const expected = EXPECTED[locale];
      const record = registry.getCanonical(locale, {
        kind: 'tool',
        toolId: 'json-validator',
      });

      expect(record).toMatchObject({
        area: 'tools',
        locale,
        segments: expected.segments,
        target: {
          kind: 'tool',
          toolId: 'json-validator',
        },
        sourceId: 'tool-registry',
      });
      expect(record?.segments).not.toContain('data-formats');
      expect(record?.segments).not.toContain('json');
    }

    expect(
      registry.getByTarget({
        kind: 'tool',
        toolId: 'json-validator',
      }).map((record) => `${record.locale}:${record.segments.join('/')}`),
    ).toEqual([
      'en:developer/json-validator',
      'es:desarrollo/validador-json',
      'pt:desenvolvedor/validador-json',
      'fr:developpement/validateur-json',
    ]);
  });

  it('emits the expected static path params and stable props for every route adapter', async () => {
    for (const locale of Object.keys(EXPECTED) as Locale[]) {
      const expected = EXPECTED[locale];
      const paths = await expected.getStaticPaths(STATIC_PATH_OPTIONS);

      expect(paths).toContainEqual({
        params: expected.params,
        props: {
          routeTarget: {
            kind: 'tool',
            toolId: 'json-validator',
          },
        },
      });
    }
  });

  it('renders localized pages with the registered component, messages, and editorial content', async () => {
    const container = await AstroContainer.create();

    for (const locale of Object.keys(EXPECTED) as Locale[]) {
      const expected = EXPECTED[locale];
      const html = await container.renderToString(expected.page, {
        partial: false,
        request: new Request(expected.url),
        params: expected.params,
        props: {
          routeTarget: {
            kind: 'tool',
            toolId: 'json-validator',
          },
        },
      });

      expect(html).toContain(`<html lang="${locale}" dir="ltr">`);
      expect(html).toContain('data-template-identity="json-validator"');
      expect(html).toContain('data-json-validator');
      expect(html).toContain(expected.title);
      expect(html).toContain(expected.label);
      expect(html).toContain(expected.validate);
      expect(html).toContain(expected.editorial);
      expect(html).not.toContain('data-formats/json/json-validator');
      expect(html).not.toContain('/en/developer/json-validator/');
    }
  });

  it('traces the Spanish route through stable identity, definition, component, messages, and content', async () => {
    const registry = await getDeliveryRouteRegistry();
    const route = registry.findByPath('es', ['desarrollo', 'validador-json']);

    expect(route?.target).toEqual({
      kind: 'tool',
      toolId: 'json-validator',
    });

    if (route?.target.kind !== 'tool') {
      throw new Error('Expected Spanish JSON Validator route to target a tool.');
    }

    const page = await composeToolAreaAdapterPage('es', route.target, {
      routeRegistry: registry,
    });

    expect(page.kind).toBe('tool');

    if (page.kind !== 'tool') {
      throw new Error('Expected Spanish JSON Validator page model to be a tool.');
    }

    expect(page.toolId).toBe('json-validator');
    expect(page.route.segments).toEqual(['desarrollo', 'validador-json']);
    expect(page.presentation).toEqual({
      toolId: 'json-validator',
      primaryCategoryId: 'json',
      executionType: 'client',
    });
    expect(getToolDefinition(page.toolId).id).toBe('json-validator');
    expect(getToolComponent(page.toolId)).toBeTypeOf('function');
    expect(getToolMessages(page.toolId, page.locale)).toMatchObject({
      actions: {
        validate: 'Validar JSON',
      },
    });
    expect(page.content.title).toBe('Validador JSON');
  });

  it('keeps route adapters generic and avoids per-tool page files', async () => {
    const routeFiles = [
      'src/pages/[category]/[...path].astro',
      'src/pages/es/[category]/[...path].astro',
      'src/pages/pt/[category]/[...path].astro',
      'src/pages/fr/[category]/[...path].astro',
    ] as const;
    const sources = await Promise.all(
      routeFiles.map((path) => readFile(new URL(path, PROJECT_ROOT), 'utf8')),
    );
    const combinedSource = sources.join('\n');

    expect(combinedSource).not.toContain('json-validator');
    expect(combinedSource).not.toContain('JsonValidatorTool');
    expect(combinedSource).not.toContain('@/features/');
    await expect(
      access(new URL('src/pages/developer/json-validator.astro', PROJECT_ROOT)),
    ).rejects.toThrow();
    await expect(
      access(
        new URL(
          'src/pages/es/desarrollo/validador-json.astro',
          PROJECT_ROOT,
        ),
      ),
    ).rejects.toThrow();
  });

  it('projects production static paths from the delivery registry without an English prefix route', async () => {
    const registry = await getDeliveryRouteRegistry();
    const englishEntries = getToolAreaStaticPathEntries(registry, 'en');

    expect(englishEntries).toContainEqual({
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
    expect(await pathExists('src/pages/en')).toBe(false);
  });

  it('rejects a duplicate localized tool path through route collision validation', async () => {
    await expect(
      createRouteRegistry({
        providers: [duplicateSpanishToolPathProvider],
        toolTaxonomy,
        blogTaxonomy,
        publicationAvailability: {
          isPublishable: () => true,
        },
      }),
    ).rejects.toMatchObject({
      name: 'RouteValidationError',
      code: 'DUPLICATE_PUBLIC_PATH',
    } satisfies Partial<RouteValidationError>);
  });
});

const duplicateSpanishToolPathProvider: RouteDefinitionProvider = {
  sourceId: 'fixture:duplicate-spanish-tool-path',
  getRouteDefinitions: () => [
    {
      kind: 'tool',
      definition: {
        toolId: 'json-validator',
        rootCategoryId: 'developer',
        primaryCategoryId: 'json',
        strategy: 'flat',
        localized: {
          es: {
            slug: 'validador-json',
          },
        },
        status: 'published',
      },
    },
    {
      kind: 'tool',
      definition: {
        toolId: 'json-checker',
        rootCategoryId: 'developer',
        primaryCategoryId: 'json',
        strategy: 'flat',
        localized: {
          es: {
            slug: 'validador-json',
          },
        },
        status: 'published',
      },
    },
  ],
};

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(new URL(path, PROJECT_ROOT));
    return true;
  } catch {
    return false;
  }
}
