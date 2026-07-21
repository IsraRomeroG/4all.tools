import type { ToolId } from '@/domain/shared/ids';
import {
  requirePublishedToolContent,
  type ToolContentEntry,
} from '@/content/queries/tools';
import type { Locale } from '@/i18n/types';
import { getGlobalMessages } from '@/i18n/messages/registry';
import type { GlobalMessages } from '@/i18n/messages/types';
import type { RouteRegistry } from '@/routing/registry';
import type { SeoIndexabilityResolver } from '@/seo';
import type {
  ToolPageModel,
  ToolPresentationDefinition,
} from '@/templates/models/tool';

import {
  MissingCanonicalRouteError,
  MissingToolPresentationError,
  ToolPresentationMismatchError,
  wrapCompositionCause,
} from './errors';
import {
  renderContentEntry,
  type RenderContent,
} from './rendered-content';
import { composeRouteSeoPageModel } from './seo';

export interface ToolPresentationProvider {
  getToolPresentation(
    toolId: ToolId,
  ): ToolPresentationDefinition | null | Promise<ToolPresentationDefinition | null>;
}

export interface ToolPageComposerDependencies {
  readonly routeRegistry: Pick<RouteRegistry, 'getCanonical' | 'getByTarget'>;
  readonly seoIndexabilityResolver?: SeoIndexabilityResolver;
  readonly requirePublishedToolContent?: (
    toolId: ToolId,
    locale: Locale,
  ) => Promise<ToolContentEntry>;
  readonly renderContent?: RenderContent;
  readonly toolPresentationProvider: ToolPresentationProvider;
  readonly getGlobalMessages?: (locale: Locale) => GlobalMessages;
}

export async function composeToolPageModel(
  locale: Locale,
  toolId: ToolId,
  dependencies: ToolPageComposerDependencies,
): Promise<ToolPageModel> {
  const context = {
    locale,
    targetKind: 'tool',
    entityId: toolId,
  } as const;
  const route = dependencies.routeRegistry.getCanonical(locale, {
    kind: 'tool',
    toolId,
  });

  if (route === null) {
    throw new MissingCanonicalRouteError(context);
  }

  const contentQuery =
    dependencies.requirePublishedToolContent ?? requirePublishedToolContent;
  const renderContent = dependencies.renderContent ?? renderContentEntry;
  const globalMessages = dependencies.getGlobalMessages ?? getGlobalMessages;
  const contentEntry = await withToolCompositionContext(
    context,
    () => contentQuery(toolId, locale),
    'Failed to load published tool content.',
  );
  const editorial = await withToolCompositionContext(
    context,
    () => renderContent(contentEntry),
    'Failed to render tool editorial content.',
  );
  const presentation = await dependencies.toolPresentationProvider.getToolPresentation(toolId);

  if (presentation === null) {
    throw new MissingToolPresentationError(context);
  }

  if (presentation.toolId !== toolId) {
    throw new ToolPresentationMismatchError({
      requestedToolId: toolId,
      presentationToolId: presentation.toolId,
      locale,
    });
  }

  const seoComposition = await composeRouteSeoPageModel(
    {
      route,
      seo: contentEntry.data.seo,
    },
    {
      routeRegistry: dependencies.routeRegistry,
      ...(dependencies.seoIndexabilityResolver === undefined
        ? {}
        : { indexabilityResolver: dependencies.seoIndexabilityResolver }),
    },
  );

  return Object.freeze({
    kind: 'tool',
    locale,
    route,
    seo: seoComposition.seo,
    localizedRouteCluster: seoComposition.localizedRouteCluster,
    title: contentEntry.data.title,
    description: contentEntry.data.description,
    toolId,
    messages: globalMessages(locale),
    content: {
      title: contentEntry.data.title,
      description: contentEntry.data.description,
      editorial,
    },
    presentation: normalizePresentation(presentation),
  });
}

function normalizePresentation(
  presentation: ToolPresentationDefinition,
): ToolPresentationDefinition {
  return Object.freeze({
    toolId: presentation.toolId,
    primaryCategoryId: presentation.primaryCategoryId,
    executionType: presentation.executionType,
  });
}

async function withToolCompositionContext<T>(
  context: {
    readonly locale: Locale;
    readonly targetKind: 'tool';
    readonly entityId: ToolId;
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
