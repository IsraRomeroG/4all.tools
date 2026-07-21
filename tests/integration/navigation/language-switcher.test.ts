import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import LanguageSwitcher from '@/components/navigation/LanguageSwitcher.astro';
import { getGlobalMessages } from '@/i18n/messages/registry';
import { buildLanguageSwitcherModel } from '@/navigation/language-switcher';

describe('LanguageSwitcher.astro', () => {
  it('renders accessible static navigation states and localized attributes', async () => {
    const model = buildLanguageSwitcherModel({
      cluster: {
        subject: { kind: 'home' },
        currentLocale: 'es',
        current: variant('es', '/es/'),
        variants: [
          variant('en', '/'),
          variant('es', '/es/'),
          {
            ...variant('pt', '/pt/'),
            indexable: false,
          },
        ],
      },
      messages: getGlobalMessages('es').language,
    });
    const container = await AstroContainer.create();
    const html = await container.renderToString(LanguageSwitcher, {
      partial: false,
      props: { model },
    });

    expect(html).toContain('data-language-switcher');
    expect(html).toContain('aria-label="Idiomas"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('href="/" hreflang="en" lang="en"');
    expect(html).toContain('href="/pt/" hreflang="pt" lang="pt"');
    expect(html).toContain('lang="es"');
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain('No disponible');
    expect(html).not.toContain('href="/fr/"');
    expect(html).not.toContain('<script');
  });
});

function variant(locale: 'en' | 'es' | 'pt', relativeUrl: string) {
  return {
    locale,
    hrefLang: locale,
    relativeUrl,
    absoluteUrl: `https://4all.tools${relativeUrl}`,
    route: null,
    published: true as const,
    indexable: true,
  };
}
