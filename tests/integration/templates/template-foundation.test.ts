import { access, readFile } from 'node:fs/promises';

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import ArticleTemplate from '@/templates/ArticleTemplate.astro';
import BlogIndexTemplate from '@/templates/BlogIndexTemplate.astro';
import CategoryTemplate from '@/templates/CategoryTemplate.astro';
import HomeTemplate from '@/templates/HomeTemplate.astro';
import ToolTemplate from '@/templates/ToolTemplate.astro';
import { getGlobalMessages } from '@/i18n/messages/registry';
import type { RouteRecord, RouteTarget } from '@/routing/types';

import FixtureContent from '../../fixtures/templates/FixtureContent.astro';

const PROJECT_ROOT = new URL('../../../', import.meta.url);
const TEMPLATE_FILES = [
  'src/templates/HomeTemplate.astro',
  'src/templates/ToolTemplate.astro',
  'src/templates/CategoryTemplate.astro',
  'src/templates/BlogIndexTemplate.astro',
  'src/templates/ArticleTemplate.astro',
] as const;

async function readProjectFile(path: string): Promise<string> {
  return readFile(new URL(path, PROJECT_ROOT), 'utf8');
}

async function projectPathExists(path: string): Promise<boolean> {
  try {
    await access(new URL(path, PROJECT_ROOT));
    return true;
  } catch {
    return false;
  }
}

describe('template foundation', () => {
  it('renders a localized tool page from model identity without URL discovery', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ToolTemplate, {
      partial: false,
      request: new Request('https://example.com/unrelated/path/'),
      props: {
        page: {
          kind: 'tool',
          locale: 'es',
          route: route({
            locale: 'es',
            segments: ['desarrollo', 'validador-json'],
            target: {
              kind: 'tool',
              toolId: 'json-validator',
            },
          }),
          documentTitle: 'Documento de herramienta',
          toolId: 'json-validator',
          title: 'Validador JSON',
          description: 'Valida documentos JSON desde un modelo preparado.',
          content: {
            title: 'Validador JSON',
            description: 'Valida documentos JSON desde un modelo preparado.',
            editorial: {
              Content: FixtureContent,
              headings: [],
            },
          },
          presentation: {
            toolId: 'json-validator',
            primaryCategoryId: 'developer',
          },
        },
      },
      slots: {
        tool: '<div data-fixture-tool-runtime>Runtime fixture</div>',
        content: '<p data-fixture-tool-content>Contenido editorial</p>',
        related: '<nav data-fixture-related>Relacionado</nav>',
      },
    });

    expect(html).toContain('<html lang="es" dir="ltr">');
    expect(html).toContain('data-template-identity="json-validator"');
    expect(html).toContain('Validador JSON');
    expect(html).toContain('data-fixture-rendered-content');
    expect(html).not.toContain('unrelated');
  });

  it('inserts the executable tool slot at the template runtime boundary', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ToolTemplate, {
      partial: false,
      props: {
        page: {
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
          toolId: 'json-validator',
          title: 'JSON Validator',
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
            primaryCategoryId: 'developer',
          },
        },
      },
      slots: {
        tool: '<div data-fixture-tool-runtime>Runtime fixture</div>',
      },
    });

    const boundaryIndex = html.indexOf('data-template-region="tool-executable"');
    const runtimeIndex = html.indexOf('data-fixture-tool-runtime');

    expect(boundaryIndex).toBeGreaterThanOrEqual(0);
    expect(runtimeIndex).toBeGreaterThan(boundaryIndex);
  });

  it('renders a localized category page from a stable category model', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CategoryTemplate, {
      partial: false,
      request: new Request('https://example.com/desarrollo/'),
      props: {
        page: {
          kind: 'tool-category',
          locale: 'es',
          route: route({
            locale: 'es',
            segments: ['desarrollo'],
            target: {
              kind: 'tool-category',
              categoryId: 'developer',
            },
          }),
          documentTitle: 'Desarrollo',
          categoryId: 'developer',
          title: 'Desarrollo',
          description: 'Herramientas para desarrolladores.',
          category: {
            label: 'Herramientas para desarrolladores',
          },
          content: {
            title: 'Desarrollo',
            description: 'Herramientas para desarrolladores.',
            editorial: {
              Content: FixtureContent,
              headings: [],
            },
          },
        },
      },
      slots: {
        content: '<p data-fixture-category-body>Contenido de categoria preparado.</p>',
        tools: '<ul data-fixture-category-tools><li>Validador JSON</li></ul>',
      },
    });

    expect(html).toContain('<html lang="es" dir="ltr">');
    expect(html).toContain('data-template-identity="developer"');
    expect(html).toContain('Desarrollo');
    expect(html).toContain('data-fixture-rendered-content');
    expect(html).toContain('data-fixture-category-body');
    expect(html).not.toContain('categoryId =');
  });

  it('renders home, blog, and article shells through prepared models', async () => {
    const container = await AstroContainer.create();
    const home = await container.renderToString(HomeTemplate, {
      partial: false,
      props: {
        page: {
          kind: 'home',
          locale: 'en',
          route: null,
          title: '4all.tools',
          description: 'Useful tools for everyday work.',
          messages: getGlobalMessages('en'),
        },
      },
      slots: {
        search: '<form data-fixture-home-search></form>',
      },
    });
    const blog = await container.renderToString(BlogIndexTemplate, {
      partial: false,
      props: {
        page: {
          kind: 'blog-index',
          locale: 'fr',
          route: null,
          title: 'Guides',
        },
      },
      slots: {
        articles: '<ol data-fixture-blog-articles></ol>',
      },
    });
    const article = await container.renderToString(ArticleTemplate, {
      partial: false,
      props: {
        page: {
          kind: 'article',
          locale: 'pt',
          route: null,
          articleId: 'what-is-json',
          title: 'O que e JSON?',
        },
      },
      slots: {
        default: '<p data-fixture-article-body>Article body</p>',
      },
    });

    expect(home).toContain('data-template="home"');
    expect(home).toContain('data-fixture-home-search');
    expect(blog).toContain('<html lang="fr" dir="ltr">');
    expect(blog).toContain('data-fixture-blog-articles');
    expect(article).toContain('<html lang="pt" dir="ltr">');
    expect(article).toContain('data-template-identity="what-is-json"');
    expect(article).toContain('data-fixture-article-body');
  });

  it('keeps template layout usage explicit', async () => {
    const sources = await Promise.all(TEMPLATE_FILES.map(readProjectFile));
    const combinedSource = sources.join('\n');

    expect(combinedSource).toContain("import BaseLayout from '@/layouts/BaseLayout.astro';");
    expect(combinedSource).toContain("import ToolLayout from '@/layouts/ToolLayout.astro';");
    expect(combinedSource).toContain("import ArticleLayout from '@/layouts/ArticleLayout.astro';");

    for (const source of sources) {
      expect(source).not.toContain('<html');
      expect(source).not.toContain('<body');
    }
  });

  it('keeps template dependency boundaries free of routes, content queries, and features', async () => {
    const sources = await Promise.all(TEMPLATE_FILES.map(readProjectFile));
    const combinedSource = sources.join('\n');

    expect(combinedSource).not.toContain('@/routing/');
    expect(combinedSource).not.toContain('routing/resolvers');
    expect(combinedSource).not.toContain('routing/static-paths');
    expect(combinedSource).not.toContain('routing/registry');
    expect(combinedSource).not.toContain('astro:content');
    expect(combinedSource).not.toContain('getCollection');
    expect(combinedSource).not.toContain('getEntry');
    expect(combinedSource).not.toContain('@/features/');
    expect(combinedSource).not.toContain('Astro.url');
    expect(combinedSource).not.toContain('pathname');
  });

  it('uses src/templates without introducing src/views', async () => {
    for (const file of TEMPLATE_FILES) {
      expect(await projectPathExists(file)).toBe(true);
    }

    expect(await projectPathExists('src/views')).toBe(false);
  });
});

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
    sourceId: 'fixture:template',
  };
}
