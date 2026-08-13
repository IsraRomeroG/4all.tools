import { describe, expect, it } from 'vitest';

import { composeSitePageModel, getDeliveryRouteRegistry } from '@/templates/composers';

describe('production site-page language switcher contract', () => {
  it.each([
    ['en', 'about', '/about/', '/es/acerca-de/', '/pt/sobre/', '/fr/a-propos/'],
    ['es', 'privacy', '/privacy/', '/es/privacidad/', '/pt/privacidade/', '/fr/confidentialite/'],
  ] as const)(
    'publishes all localized variants for %s %s',
    async (locale, pageId, englishUrl, spanishUrl, portugueseUrl, frenchUrl) => {
      const routeRegistry = await getDeliveryRouteRegistry();
      const page = await composeSitePageModel(locale, pageId, { routeRegistry });

      expect(page.siteHeader.languageSwitcher.items).toEqual([
        expect.objectContaining(
          locale === 'en'
            ? { locale: 'en', state: 'current' }
            : { locale: 'en', state: 'available', url: englishUrl },
        ),
        expect.objectContaining(
          locale === 'es'
            ? { locale: 'es', state: 'current' }
            : { locale: 'es', state: 'available', url: spanishUrl },
        ),
        expect.objectContaining({
          locale: 'pt',
          state: 'available',
          url: portugueseUrl,
        }),
        expect.objectContaining({
          locale: 'fr',
          state: 'available',
          url: frenchUrl,
        }),
      ]);
      expect(page.siteHeader.languageSwitcher.items.filter((item) => item.state === 'current')).toHaveLength(1);
      expect(page.siteHeader.languageSwitcher.items.filter((item) => item.state === 'available')).toHaveLength(3);
      expect(page.siteHeader.languageSwitcher.items.some((item) => item.state === 'unavailable')).toBe(false);
    },
  );
});
