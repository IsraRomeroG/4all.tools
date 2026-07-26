import type { ToolCategoryId, ToolId } from '@/domain/shared/ids';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import type { TaxonomyTree } from '@/domain/taxonomy/shared/types';
import { toolRegistry, type ToolRegistry } from '@/features/tools/registry';
import {
  requirePublishedToolContent,
  type ToolContentEntry,
} from '@/content/queries/tools';
import type { Locale } from '@/i18n/types';
import { getGlobalMessages } from '@/i18n/messages/registry';
import type { GlobalMessages } from '@/i18n/messages/types';
import type { RouteRegistry } from '@/routing/registry';
import { buildLanguageSwitcherModel } from '@/navigation/language-switcher';
import { buildToolBreadcrumbs } from '@/navigation/breadcrumbs';
import type { SeoIndexabilityResolver } from '@/seo';
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
import { composeRouteSeoPageModel } from './seo';

export interface ToolPageComposerDependencies {
  readonly routeRegistry: Pick<RouteRegistry, 'getCanonical' | 'getByTarget'>;
  readonly seoIndexabilityResolver?: SeoIndexabilityResolver;
  readonly toolTaxonomy?: Pick<
    TaxonomyTree<ToolCategoryId>,
    'findNode' | 'getPathFromRoot'
  >;
  readonly requirePublishedToolContent?: (
    toolId: ToolId,
    locale: Locale,
  ) => Promise<ToolContentEntry>;
  readonly renderContent?: RenderContent;
  readonly toolRegistry?: Pick<ToolRegistry, 'get'>;
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
  const taxonomy = dependencies.toolTaxonomy ?? toolTaxonomy;
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
  const definition = (dependencies.toolRegistry ?? toolRegistry).get(toolId)
    .definition;
  const presentation = normalizePresentation({
    toolId: definition.id,
    primaryCategoryId: definition.taxonomy.primaryCategoryId,
    executionType: definition.execution.type,
  });

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
  const messages = globalMessages(locale);
  const breadcrumbs = buildToolBreadcrumbs({
    locale,
    toolId,
    primaryCategoryId: presentation.primaryCategoryId,
    currentTitle: contentEntry.data.title,
    taxonomy,
    routeRegistry: dependencies.routeRegistry,
    messages: messages.navigation,
  });

  return Object.freeze({
    kind: 'tool',
    locale,
    route,
    seo: seoComposition.seo,
    localizedRouteCluster: seoComposition.localizedRouteCluster,
    languageSwitcher: buildLanguageSwitcherModel({
      cluster: seoComposition.localizedRouteCluster,
      messages: messages.language,
    }),
    breadcrumbs,
    title: contentEntry.data.title,
    description: contentEntry.data.description,
    toolId,
    messages,
    content: {
      title: contentEntry.data.title,
      description: contentEntry.data.description,
      editorial,
    },
    presentation,
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
