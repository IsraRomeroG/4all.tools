import { readFile } from 'node:fs/promises';

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import SeoHead from '@/components/seo/SeoHead.astro';
import { createSeoPageModel } from '@/seo';

const PROJECT_ROOT = new URL('../../../', import.meta.url);

describe('SeoHead', () => {
  it('renders the resolved SEO model without duplicate baseline tags', async () => {
    const html = await renderSeoHead();

    expect(html.match(/<title>/g)).toHaveLength(1);
    expect(html.match(/name="description"/g)).toHaveLength(1);
    expect(html.match(/name="robots"/g)).toHaveLength(1);
    expect(html.match(/rel="canonical"/g)).toHaveLength(1);
    expect(html).toContain('<title>JSON &lt;Validator&gt;</title>');
    expect(html).toContain('content="Validate &quot;JSON&quot; &amp; more."');
    expect(html).toContain('content="index,follow"');
    expect(html).toContain('href="https://4all.tools/developer/json-validator/"');
  });

  it('renders locale alternates, optional x-default, and Open Graph baseline', async () => {
    const html = await renderSeoHead();

    expect(html.match(/rel="alternate"/g)).toHaveLength(3);
    expect(html).toContain('hreflang="en"');
    expect(html).toContain('hreflang="es"');
    expect(html).toContain('hreflang="x-default"');
    expect(html).toContain('property="og:title"');
    expect(html).toContain('property="og:description"');
    expect(html).toContain('property="og:type" content="website"');
    expect(html).toContain(
      'property="og:url" content="https://4all.tools/developer/json-validator/"',
    );
    expect(html).toContain('property="og:site_name" content="4all.tools"');
  });

  it('renders noindex pages without alternates or x-default', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SeoHead, {
      partial: true,
      props: {
        seo: createSeoPageModel({
          title: 'Preview',
          description: 'Preview content.',
          canonicalUrl: 'https://4all.tools/developer/preview/',
          noindex: true,
        }),
      },
    });

    expect(html.match(/rel="canonical"/g)).toHaveLength(1);
    expect(html).toContain('content="noindex,follow"');
    expect(html.match(/rel="alternate"/g)).toBeNull();
    expect(html).not.toContain('hreflang="x-default"');
    expect(html).toContain(
      'property="og:url" content="https://4all.tools/developer/preview/"',
    );
  });

  it('preserves article Open Graph metadata on a noindex article', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SeoHead, {
      partial: true,
      props: {
        seo: createSeoPageModel({
          title: 'What Is JSON',
          description: 'A practical introduction to JSON.',
          canonicalUrl: 'https://4all.tools/blog/development/what-is-json/',
          noindex: true,
          openGraphType: 'article',
          openGraphArticle: {
            publishedTime: '2026-07-21T00:00:00.000Z',
            modifiedTime: '2026-07-22T00:00:00.000Z',
            section: 'JSON Guides',
          },
        }),
      },
    });

    expect(html).toContain('content="noindex,follow"');
    expect(html.match(/rel="alternate"/g)).toBeNull();
    expect(html).not.toContain('hreflang="x-default"');
    expect(html).toContain('property="og:type" content="article"');
    expect(html).toContain(
      'property="article:published_time" content="2026-07-21T00:00:00.000Z"',
    );
    expect(html).toContain(
      'property="article:modified_time" content="2026-07-22T00:00:00.000Z"',
    );
    expect(html).toContain('property="article:section" content="JSON Guides"');
  });

  it('omits x-default and image tags when absent', async () => {
    const html = await renderSeoHead({
      xDefaultUrl: null,
      image: false,
    });

    expect(html).not.toContain('hreflang="x-default"');
    expect(html).not.toContain('property="og:image"');
    expect(html).not.toContain('property="og:image:alt"');
  });

  it('renders the complete optional Open Graph image family', async () => {
    const html = await renderSeoHead({
      image: true,
    });

    expect(html).toContain(
      'property="og:image" content="https://4all.tools/assets/json-validator.png"',
    );
    expect(html).toContain(
      'property="og:image:alt" content="JSON Validator preview"',
    );
    expect(html).toContain('property="og:image:width" content="1200"');
    expect(html).toContain('property="og:image:height" content="630"');
  });

  it('contains no client script or route/content query logic', async () => {
    const source = await readFile(
      new URL('src/components/seo/SeoHead.astro', PROJECT_ROOT),
      'utf8',
    );
    const html = await renderSeoHead();

    expect(html).not.toContain('<script');
    expect(source).not.toContain('<script');
    expect(source).not.toContain('client:');
    expect(source).not.toContain('Astro.url');
    expect(source).not.toContain('Astro.params');
    expect(source).not.toContain('@/routing');
    expect(source).not.toContain('RouteRegistry');
    expect(source).not.toContain('astro:content');
    expect(source).not.toContain('@/content/');
    expect(source).not.toContain('@/domain/taxonomy');
    expect(source).not.toContain('@/i18n/messages');
  });
});

async function renderSeoHead(options: {
  readonly xDefaultUrl?: string | null;
  readonly image?: boolean;
} = {}): Promise<string> {
  const container = await AstroContainer.create();
  const includeImage = options.image ?? false;
  const xDefaultUrl =
    options.xDefaultUrl === null
      ? undefined
      : (options.xDefaultUrl ?? 'https://4all.tools/developer/json-validator/');

  return container.renderToString(SeoHead, {
    partial: true,
    props: {
      seo: createSeoPageModel({
        title: 'JSON <Validator>',
        description: 'Validate "JSON" & more.',
        canonicalUrl: 'https://4all.tools/developer/json-validator/',
        alternates: [
          {
            locale: 'en',
            hrefLang: 'en',
            url: 'https://4all.tools/developer/json-validator/',
          },
          {
            locale: 'es',
            hrefLang: 'es',
            url: 'https://4all.tools/es/desarrollo/validador-json/',
          },
        ],
        ...(xDefaultUrl === undefined ? {} : { xDefaultUrl }),
        ...(includeImage
          ? {
              openGraphImage: {
                url: 'https://4all.tools/assets/json-validator.png',
                alt: 'JSON Validator preview',
                width: 1200,
                height: 630,
              },
            }
          : {}),
      }),
    },
  });
}
