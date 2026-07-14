import { readFile } from 'node:fs/promises';

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import ArticleLayout from '@/layouts/ArticleLayout.astro';
import BaseLayout from '@/layouts/BaseLayout.astro';
import ToolLayout from '@/layouts/ToolLayout.astro';

const PROJECT_ROOT = new URL('../../../', import.meta.url);
const LAYOUT_FILES = [
  'src/layouts/BaseLayout.astro',
  'src/layouts/ToolLayout.astro',
  'src/layouts/ArticleLayout.astro',
] as const;

async function readProjectFile(path: string): Promise<string> {
  return readFile(new URL(path, PROJECT_ROOT), 'utf8');
}

async function renderBaseLayout(locale: 'en' | 'es'): Promise<string> {
  const container = await AstroContainer.create();

  return container.renderToString(BaseLayout, {
    partial: false,
    props: {
      locale,
      documentTitle: `${locale} document`,
    },
    slots: {
      head: '<meta name="layout-head-slot" content="rendered" />',
      default: '<p data-layout-region="default">Layout body</p>',
      'site-header': '<header data-layout-region="site-header">Header</header>',
      'site-footer': '<footer data-layout-region="site-footer">Footer</footer>',
    },
  });
}

describe('layout foundation', () => {
  it('renders English document metadata from locale configuration', async () => {
    const html = await renderBaseLayout('en');

    expect(html).toContain('<html lang="en" dir="ltr">');
    expect(html).toContain('<title>en document</title>');
  });

  it('renders Spanish document metadata from locale configuration', async () => {
    const html = await renderBaseLayout('es');

    expect(html).toContain('<html lang="es" dir="ltr">');
    expect(html).toContain('<title>es document</title>');
  });

  it('renders named head content inside the document head', async () => {
    const html = await renderBaseLayout('en');
    const headStart = html.indexOf('<head>');
    const headSlot = html.indexOf('<meta name="layout-head-slot" content="rendered"');
    const headEnd = html.indexOf('</head>');

    expect(headStart).toBeGreaterThanOrEqual(0);
    expect(headSlot).toBeGreaterThan(headStart);
    expect(headSlot).toBeLessThan(headEnd);
  });

  it('keeps one primary main landmark in BaseLayout', async () => {
    const html = await renderBaseLayout('en');

    expect(html.match(/<main\b/g)).toHaveLength(1);
    expect(html).toContain('<main id="main-content"');
    expect(html).toContain('data-layout-region="site-header"');
    expect(html).toContain('data-layout-region="site-footer"');
  });

  it('composes tool pages through the shared base shell', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ToolLayout, {
      partial: false,
      props: {
        locale: 'en',
        documentTitle: 'Tool document',
      },
      slots: {
        head: '<meta name="tool-head-slot" content="rendered" />',
        'page-header': '<h1>Tool title</h1>',
        tool: '<div data-tool-fixture>Tool UI</div>',
        content: '<p>Editorial content</p>',
        related: '<nav>Related tools</nav>',
      },
    });

    expect(html.match(/<html\b/g)).toHaveLength(1);
    expect(html.match(/<main\b/g)).toHaveLength(1);
    expect(html).toContain('<meta name="tool-head-slot" content="rendered"');
    expect(html).toContain('data-layout-region="tool-workspace"');
    expect(html).toContain('data-tool-fixture');
  });

  it('composes article pages through the shared base shell', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleLayout, {
      partial: false,
      props: {
        locale: 'es',
        documentTitle: 'Article document',
      },
      slots: {
        head: '<meta name="article-head-slot" content="rendered" />',
        'article-header': '<h1>Article title</h1>',
        metadata: '<p>Metadata</p>',
        default: '<p>Article body</p>',
        related: '<nav>Related articles</nav>',
      },
    });

    expect(html.match(/<html\b/g)).toHaveLength(1);
    expect(html.match(/<main\b/g)).toHaveLength(1);
    expect(html).toContain('<html lang="es" dir="ltr">');
    expect(html).toContain('<meta name="article-head-slot" content="rendered"');
    expect(html).toContain('data-layout-region="article-body"');
  });

  it('keeps layout dependency boundaries free of routing, content query, and feature imports', async () => {
    const sources = await Promise.all(LAYOUT_FILES.map(readProjectFile));
    const combinedSource = sources.join('\n');

    expect(combinedSource).not.toContain('@/routing/');
    expect(combinedSource).not.toContain('getCollection');
    expect(combinedSource).not.toContain('getEntry');
    expect(combinedSource).not.toContain('getPublishedToolContent');
    expect(combinedSource).not.toContain('getPublishedArticleContent');
    expect(combinedSource).not.toContain('@/features/tools/');
  });

  it('keeps document roots owned by BaseLayout', async () => {
    const [baseSource, toolSource, articleSource] = await Promise.all(
      LAYOUT_FILES.map(readProjectFile),
    );

    expect(baseSource).toContain('<html lang={localeDefinition.htmlLang} dir={localeDefinition.direction}>');
    expect(baseSource).toContain('const localeDefinition = LOCALES[locale];');

    expect(toolSource).toContain("import BaseLayout from './BaseLayout.astro';");
    expect(toolSource).not.toContain('<html');
    expect(toolSource).not.toContain('<body');

    expect(articleSource).toContain("import BaseLayout from './BaseLayout.astro';");
    expect(articleSource).not.toContain('<html');
    expect(articleSource).not.toContain('<body');
  });
});
