import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import { SITE_URL, TRAILING_SLASH_POLICY } from './src/config/site';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './src/i18n/config';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL.toString(),
  output: 'static',
  trailingSlash: TRAILING_SLASH_POLICY,
  i18n: {
    locales: [...SUPPORTED_LOCALES],
    defaultLocale: DEFAULT_LOCALE,
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
