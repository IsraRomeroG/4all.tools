import type { SitePageId } from '@/domain/shared/ids';
import { requirePublishedSitePageContent } from '@/content/queries';
import type { Locale } from '@/i18n/types';
import { getGlobalMessages } from '@/i18n/messages/registry';
import { buildLanguageSwitcherModel } from '@/navigation/language-switcher';
import type { RouteRegistry } from '@/routing/registry';
import type { SitePageModel } from '@/templates/models/site-page';

import {
  MissingCanonicalRouteError,
  PageModelCompositionError,
  wrapCompositionCause,
} from './errors';
import { renderContentEntry } from './rendered-content';
import { composeRouteSeoPageModel } from './seo';

export interface SitePageComposerDependencies {
  readonly routeRegistry: Pick<RouteRegistry, 'getCanonical' | 'getByTarget'>;
}

export async function composeSitePageModel(
  locale: Locale,
  pageId: SitePageId,
  dependencies: SitePageComposerDependencies,
): Promise<SitePageModel> {
  const context = {
    locale,
    targetKind: 'site-page',
    entityId: pageId,
  } as const;
  const route = dependencies.routeRegistry.getCanonical(locale, {
    kind: 'site-page',
    pageId,
  });

  if (route === null) {
    throw new MissingCanonicalRouteError(context);
  }

  if (
    route.area !== 'site' ||
    route.target.kind !== 'site-page' ||
    route.target.pageId !== pageId
  ) {
    throw new PageModelCompositionError(
      'PAGE_MODEL_COMPOSITION_FAILED',
      `Canonical route does not match site page ${pageId}:${locale}.`,
      context,
    );
  }

  const contentEntry = await withSitePageCompositionContext(
    context,
    () => requirePublishedSitePageContent(pageId, locale),
    'Failed to load published site page content.',
  );
  const content = await withSitePageCompositionContext(
    context,
    () => renderContentEntry(contentEntry),
    'Failed to render site page content.',
  );
  const seoComposition = await composeRouteSeoPageModel(
    {
      route,
      seo: contentEntry.data.seo,
    },
    dependencies.routeRegistry,
  );
  const messages = getGlobalMessages(locale);

  return {
    kind: 'site-page',
    locale,
    route,
    seo: seoComposition.seo,
    languageSwitcher: buildLanguageSwitcherModel({
      cluster: seoComposition.localizedRouteCluster,
      messages: messages.language,
    }),
    title: contentEntry.data.title,
    pageId,
    content,
  };
}

async function withSitePageCompositionContext<T>(
  context: {
    readonly locale: Locale;
    readonly targetKind: 'site-page';
    readonly entityId: SitePageId;
  },
  action: () => Promise<T>,
  message: string,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw wrapCompositionCause(message, context, error);
  }
}
