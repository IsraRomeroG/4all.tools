import type { StaticPageId } from '@/domain/shared/ids';
import { requirePublishedStaticPageContent } from '@/content/queries';
import type { Locale } from '@/i18n/types';
import { getGlobalMessages } from '@/i18n/messages/registry';
import { buildLanguageSwitcherModel } from '@/navigation/language-switcher';
import type { RouteRegistry } from '@/routing/registry';
import type { StaticPageModel } from '@/templates/models/static-page';

import {
  MissingCanonicalRouteError,
  PageModelCompositionError,
  wrapCompositionCause,
} from './errors';
import { renderContentEntry } from './rendered-content';
import { composeRouteSeoPageModel } from './seo';

export interface StaticPageComposerDependencies {
  readonly routeRegistry: Pick<RouteRegistry, 'getCanonical' | 'getByTarget'>;
}

export async function composeStaticPageModel(
  locale: Locale,
  pageId: StaticPageId,
  dependencies: StaticPageComposerDependencies,
): Promise<StaticPageModel> {
  const context = {
    locale,
    targetKind: 'static-page',
    entityId: pageId,
  } as const;
  const route = dependencies.routeRegistry.getCanonical(locale, {
    kind: 'static-page',
    pageId,
  });

  if (route === null) {
    throw new MissingCanonicalRouteError(context);
  }

  if (
    route.area !== 'static' ||
    route.target.kind !== 'static-page' ||
    route.target.pageId !== pageId
  ) {
    throw new PageModelCompositionError(
      'PAGE_MODEL_COMPOSITION_FAILED',
      `Canonical route does not match static page ${pageId}:${locale}.`,
      context,
    );
  }

  const contentEntry = await withStaticPageCompositionContext(
    context,
    () => requirePublishedStaticPageContent(pageId, locale),
    'Failed to load published static page content.',
  );
  const content = await withStaticPageCompositionContext(
    context,
    () => renderContentEntry(contentEntry),
    'Failed to render static page content.',
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
    kind: 'static-page',
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

async function withStaticPageCompositionContext<T>(
  context: {
    readonly locale: Locale;
    readonly targetKind: 'static-page';
    readonly entityId: StaticPageId;
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
