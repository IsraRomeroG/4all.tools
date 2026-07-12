import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './src/i18n/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://4all.tools',
  output: 'static',
  trailingSlash: 'always',
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
