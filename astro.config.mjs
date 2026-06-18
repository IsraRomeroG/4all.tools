// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

const site = 'https://4all.tools';

function isBlogPath(page) {
  const pathname = page.startsWith('http') ? new URL(page).pathname : page;
  return /^\/(?:es\/|pt\/)?blog(?:$|\/)/.test(pathname);
}

// https://astro.build/config
export default defineConfig({
  site,
  trailingSlash: 'never',
  build: {
    format: 'file'
  },
  i18n: {
    locales: ['en', 'es', 'pt'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: false
    }
  },
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !isBlogPath(page),
      customSitemaps: [`${site}/blog-sitemap.xml`]
    })
  ]
});
