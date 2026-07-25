import { describe, expect, it } from 'vitest';

import {
  isSitemapUrlEligible,
  registerSitemapUrlIndexability,
} from '@/seo/sitemap-eligibility';

const DEFAULT_URL = 'https://4all.tools/test/sitemap-eligibility/default/';
const NOINDEX_URL = 'https://4all.tools/test/sitemap-eligibility/noindex/';
const REENABLED_URL = 'https://4all.tools/test/sitemap-eligibility/reenabled/';

describe('sitemap eligibility', () => {
  it('treats an unregistered URL as eligible', () => {
    expect(isSitemapUrlEligible(DEFAULT_URL)).toBe(true);
  });

  it('excludes a registered noindex URL', () => {
    registerSitemapUrlIndexability(NOINDEX_URL, false);
    expect(isSitemapUrlEligible(NOINDEX_URL)).toBe(false);
    registerSitemapUrlIndexability(NOINDEX_URL, true);
  });

  it('re-enables a URL when it is registered as indexable again', () => {
    registerSitemapUrlIndexability(REENABLED_URL, false);
    registerSitemapUrlIndexability(REENABLED_URL, true);
    expect(isSitemapUrlEligible(REENABLED_URL)).toBe(true);
  });
});
