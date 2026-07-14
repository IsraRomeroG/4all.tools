import type { ToolCategoryId, ToolId } from '@/domain/shared/ids';
import {
  requirePublishedToolContent,
  type ToolContentEntry,
} from '@/content/queries/tools';
import type { Locale } from '@/i18n/types';
import type { RouteRegistry } from '@/routing/registry';
import type {
  ToolPageModel,
  ToolPresentationDefinition,
} from '@/templates/models/tool';

import {
  MissingCanonicalRouteError,
  wrapCompositionCause,
} from './errors';
import {
  renderContentEntry,
  type RenderContent,
} from './rendered-content';

export interface ToolPresentationProvider {
  getToolPresentation(
    toolId: ToolId,
  ): ToolPresentationDefinition | null | Promise<ToolPresentationDefinition | null>;
}

export interface ToolPageComposerDependencies {
  readonly routeRegistry: Pick<RouteRegistry, 'getCanonical'>;
  readonly requirePublishedToolContent?: (
    toolId: ToolId,
    locale: Locale,
  ) => Promise<ToolContentEntry>;
  readonly renderContent?: RenderContent;
  readonly toolPresentationProvider?: ToolPresentationProvider;
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
  const presentation = await dependencies.toolPresentationProvider?.getToolPresentation(
    toolId,
  );
  const modelBase = {
    kind: 'tool',
    locale,
    route,
    documentTitle: contentEntry.data.title,
    title: contentEntry.data.title,
    description: contentEntry.data.description,
    toolId,
    content: {
      title: contentEntry.data.title,
      description: contentEntry.data.description,
      editorial,
    },
  } as const;

  return Object.freeze(
    presentation === undefined || presentation === null
      ? modelBase
      : {
          ...modelBase,
          presentation: normalizePresentation(presentation),
        },
  );
}

function normalizePresentation(
  presentation: ToolPresentationDefinition,
): ToolPresentationDefinition {
  return presentation.primaryCategoryId === undefined
    ? Object.freeze({
        toolId: presentation.toolId,
      })
    : Object.freeze({
        toolId: presentation.toolId,
        primaryCategoryId: presentation.primaryCategoryId as ToolCategoryId,
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
