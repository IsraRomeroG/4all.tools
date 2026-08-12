import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import SiteFooter from '@/components/navigation/SiteFooter.astro';
import { getGlobalMessages } from '@/i18n/messages/registry';
import type { SiteFooterModel } from '@/navigation/site-footer';

describe('SiteFooter presentation', () => {
  it('renders semantic navigation from a prepared English model', async () => {
    const model: SiteFooterModel = {
      ariaLabel: getGlobalMessages('en').footer.label,
      links: [
        { pageId: 'about', label: 'About', url: '/about/' },
        { pageId: 'contact', label: 'Contact', url: '/contact/' },
        { pageId: 'privacy', label: 'Privacy', url: '/privacy/' },
        { pageId: 'terms', label: 'Terms', url: '/terms/' },
      ],
    };
    const container = await AstroContainer.create();
    const html = await container.renderToString(SiteFooter, {
      partial: false,
      props: { model },
    });

    expect(html).toContain('data-site-footer');
    expect(html).toContain('<nav');
    expect(html).toContain('aria-label="Footer navigation"');
    expect(html).toContain('data-site-footer-link="about"');
    expect(html).toContain('href="/about/"');
    expect(html).toContain('href="/contact/"');
    expect(html).toContain('href="/privacy/"');
    expect(html).toContain('href="/terms/"');
  });
});
