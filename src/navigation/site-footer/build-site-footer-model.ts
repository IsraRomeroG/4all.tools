import type { SitePageId } from '@/domain/shared/ids';
import type { GlobalMessages } from '@/i18n/messages/types';
import type { Locale } from '@/i18n/types';
import { buildLocalizedPath } from '@/routing/builders';
import type { RouteRegistry } from '@/routing/registry';

import type { SiteFooterModel } from './types';

export const CORE_SITE_FOOTER_PAGE_IDS = [
  'about',
  'contact',
  'privacy',
  'terms',
] as const satisfies readonly SitePageId[];

export interface BuildSiteFooterModelInput {
  readonly locale: Locale;
  readonly routeRegistry: Pick<RouteRegistry, 'getCanonical'>;
  readonly messages: GlobalMessages['footer'];
}

export class SiteFooterRouteError extends Error {
  readonly code = 'SITE_FOOTER_ROUTE_INVALID' as const;

  constructor(
    readonly locale: Locale,
    readonly pageId: SitePageId,
  ) {
    super(
      `Site footer requires a canonical site-page route for ${pageId}:${locale}.`,
    );
    this.name = 'SiteFooterRouteError';
  }
}

export function buildSiteFooterModel(
  input: BuildSiteFooterModelInput,
): SiteFooterModel {
  const links = CORE_SITE_FOOTER_PAGE_IDS.map((pageId) => {
    const route = input.routeRegistry.getCanonical(input.locale, {
      kind: 'site-page',
      pageId,
    });

    if (
      route === null ||
      route.area !== 'site' ||
      route.locale !== input.locale ||
      route.target.kind !== 'site-page' ||
      route.target.pageId !== pageId
    ) {
      throw new SiteFooterRouteError(input.locale, pageId);
    }

    const url = buildLocalizedPath({
      locale: route.locale,
      segments: route.segments,
    });

    if (!url.startsWith('/') || url.startsWith('//')) {
      throw new SiteFooterRouteError(input.locale, pageId);
    }

    return {
      pageId,
      label: input.messages[pageId],
      url,
    };
  });

  return {
    ariaLabel: input.messages.label,
    links,
  };
}

/**
 * Keeps isolated composer fixtures that intentionally contain only one route
 * family usable. Production registries publish all four destinations, so they
 * always receive the complete footer model; the strict builder remains the
 * validation boundary for missing or mismatched routes.
 */
export function buildSiteFooterModelIfAvailable(
  input: BuildSiteFooterModelInput,
): SiteFooterModel | undefined {
  try {
    return buildSiteFooterModel(input);
  } catch (error) {
    if (error instanceof SiteFooterRouteError) {
      if (import.meta.env.PROD) {
        throw error;
      }

      return undefined;
    }

    throw error;
  }
}
