import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import SiteHeader from '@/components/navigation/SiteHeader.astro';
import type { SiteHeaderModel } from '@/navigation/site-header';

describe('SiteHeader.astro', () => {
  it('renders one prepared semantic header with separate navigation landmarks', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SiteHeader, {
      partial: false,
      props: { model: model('es', 'blog-descendant') },
    });

    expect(html).toContain('data-site-header');
    expect(html).toContain('data-site-brand');
    expect(html).toContain('href="/es/"');
    expect(html).toContain('aria-label="Navegación principal"');
    expect(html).toContain('data-site-primary-navigation');
    expect(html).toContain('data-site-header-link="blog"');
    expect(html).toContain('href="/es/blog/"');
    expect(html).toContain('data-language-switcher');
    expect(html).not.toContain('<script');
  });

  it('renders visual activity without treating a Blog descendant as the Blog index', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SiteHeader, {
      partial: false,
      props: { model: model('en', 'blog-descendant') },
    });

    expect(html).toContain('data-site-header-link="blog"');
    expect(html).toContain('data-active="true"');
    expect(html).not.toContain('data-site-header-link="blog" aria-current="page"');
  });

  it('renders exact current-page attributes from the prepared model', async () => {
    const container = await AstroContainer.create();
    const home = await container.renderToString(SiteHeader, {
      partial: false,
      props: { model: model('en', 'home') },
    });
    const blogIndex = await container.renderToString(SiteHeader, {
      partial: false,
      props: { model: model('en', 'blog-index') },
    });

    expect(home).toMatch(/<a[^>]*aria-current="page"[^>]*data-site-brand/);
    expect(blogIndex).toMatch(
      /<a[^>]*aria-current="page"[^>]*data-site-header-link="blog"/,
    );
    expect(blogIndex).not.toMatch(
      /<a[^>]*aria-current="page"[^>]*data-site-brand/,
    );
  });
});

function model(
  locale: 'en' | 'es',
  context: 'home' | 'blog-index' | 'blog-descendant',
): SiteHeaderModel {
  const home = locale === 'en' ? '/' : `/${locale}/`;
  const blog = locale === 'en' ? '/blog/' : `/${locale}/blog/`;
  const messages = locale === 'en'
    ? {
        primaryNavigationLabel: 'Primary navigation',
        blog: 'Blog',
        language: 'Languages',
      }
    : {
        primaryNavigationLabel: 'Navegación principal',
        blog: 'Blog',
        language: 'Idiomas',
      };
  const isHome = context === 'home';
  const isBlogIndex = context === 'blog-index';

  return {
    brand: {
      label: '4all.tools',
      ariaLabel: locale === 'en' ? '4all.tools — Home' : '4all.tools — Inicio',
      url: home,
      active: isHome,
      ...(isHome ? { ariaCurrent: 'page' as const } : {}),
    },
    primaryNavigationLabel: messages.primaryNavigationLabel,
    primaryLinks: [
      {
        id: 'blog',
        label: messages.blog,
        url: blog,
        active: isBlogIndex || context === 'blog-descendant',
        ...(isBlogIndex ? { ariaCurrent: 'page' as const } : {}),
      },
    ],
    languageSwitcher: {
      ariaLabel: messages.language,
      currentLanguage: locale === 'en' ? 'Current language' : 'Idioma actual',
      unavailableLabel: locale === 'en' ? 'Not available' : 'No disponible',
      items: [
        {
          state: 'current',
          locale,
          label: locale === 'en' ? 'English' : 'Español',
          htmlLang: locale,
        },
      ],
    },
  };
}
