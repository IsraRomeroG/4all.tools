import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import Breadcrumbs from '@/components/navigation/Breadcrumbs.astro';
import { getGlobalMessages } from '@/i18n/messages/registry';

describe('Breadcrumbs.astro', () => {
  it('renders semantic ordered navigation with hidden separators', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Breadcrumbs, {
      partial: false,
      props: {
        model: {
          ariaLabel: getGlobalMessages('en').navigation.breadcrumbsLabel,
          items: [
            { kind: 'home', state: 'link', label: 'Home', url: '/' },
            { kind: 'taxonomy', state: 'text', label: 'Data Formats' },
            {
              kind: 'entity',
              state: 'current',
              label: 'JSON Validator',
            },
          ],
        },
      },
    });

    expect(html).toContain('<nav aria-label="Breadcrumbs" data-breadcrumbs>');
    expect(html).toContain('<ol');
    expect(html).toContain('href="/"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain('href=""');
    expect(html).not.toContain('<script');
  });
});
