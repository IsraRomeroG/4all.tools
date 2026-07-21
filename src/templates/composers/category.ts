import type { ToolCategoryId } from '@/domain/shared/ids';
import type { TaxonomyTree } from '@/domain/taxonomy/shared/types';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import {
  requirePublishedToolCategoryContent,
  type ToolCategoryContentEntry,
} from '@/content/queries/tool-categories';
import type { Locale } from '@/i18n/types';
import { getGlobalMessages } from '@/i18n/messages/registry';
import type { GlobalMessages } from '@/i18n/messages/types';
import type { RouteRegistry } from '@/routing/registry';
import { buildLanguageSwitcherModel } from '@/navigation/language-switcher';
import type { SeoIndexabilityResolver } from '@/seo';
import type { ToolCategoryPageModel } from '@/templates/models/category';

import {
  MissingCanonicalRouteError,
  MissingTaxonomyNodeError,
  wrapCompositionCause,
} from './errors';
import {
  renderContentEntry,
  type RenderContent,
} from './rendered-content';
import { composeRouteSeoPageModel } from './seo';

export interface CategoryPageComposerDependencies {
  readonly routeRegistry: Pick<RouteRegistry, 'getCanonical' | 'getByTarget'>;
  readonly seoIndexabilityResolver?: SeoIndexabilityResolver;
  readonly toolTaxonomy?: Pick<TaxonomyTree<ToolCategoryId>, 'findNode'>;
  readonly requirePublishedToolCategoryContent?: (
    categoryId: ToolCategoryId,
    locale: Locale,
  ) => Promise<ToolCategoryContentEntry>;
  readonly renderContent?: RenderContent;
  readonly getGlobalMessages?: (locale: Locale) => GlobalMessages;
}

export async function composeCategoryPageModel(
  locale: Locale,
  categoryId: ToolCategoryId,
  dependencies: CategoryPageComposerDependencies,
): Promise<ToolCategoryPageModel> {
  const context = {
    locale,
    targetKind: 'tool-category',
    entityId: categoryId,
  } as const;
  const taxonomy = dependencies.toolTaxonomy ?? toolTaxonomy;
  const categoryNode = taxonomy.findNode(categoryId);

  if (categoryNode === undefined) {
    throw new MissingTaxonomyNodeError(context);
  }

  const route = dependencies.routeRegistry.getCanonical(locale, {
    kind: 'tool-category',
    categoryId,
  });

  if (route === null) {
    throw new MissingCanonicalRouteError(context);
  }

  const contentQuery =
    dependencies.requirePublishedToolCategoryContent ??
    requirePublishedToolCategoryContent;
  const renderContent = dependencies.renderContent ?? renderContentEntry;
  const globalMessages = dependencies.getGlobalMessages ?? getGlobalMessages;
  const contentEntry = await withCategoryCompositionContext(
    context,
    () => contentQuery(categoryId, locale),
    'Failed to load published tool category content.',
  );
  const editorial = await withCategoryCompositionContext(
    context,
    () => renderContent(contentEntry),
    'Failed to render tool category editorial content.',
  );
  const localizedCategory = categoryNode.localized[locale];
  const category =
    localizedCategory.shortLabel === undefined
      ? { label: localizedCategory.label }
      : {
          label: localizedCategory.label,
          shortLabel: localizedCategory.shortLabel,
        };
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

  return Object.freeze({
    kind: 'tool-category',
    locale,
    route,
    seo: seoComposition.seo,
    localizedRouteCluster: seoComposition.localizedRouteCluster,
    languageSwitcher: buildLanguageSwitcherModel({
      cluster: seoComposition.localizedRouteCluster,
      messages: messages.language,
    }),
    title: contentEntry.data.title,
    description: contentEntry.data.description,
    categoryId,
    messages,
    category,
    content: {
      title: contentEntry.data.title,
      description: contentEntry.data.description,
      editorial,
    },
  });
}

async function withCategoryCompositionContext<T>(
  context: {
    readonly locale: Locale;
    readonly targetKind: 'tool-category';
    readonly entityId: ToolCategoryId;
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
