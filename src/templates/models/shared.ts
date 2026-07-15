import type { MarkdownHeading } from 'astro';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

import type {
  ArticleId,
  BlogCategoryId,
  ToolCategoryId,
  ToolId,
} from '@/domain/shared/ids';
import type { ToolExecutionType } from '@/domain/tools';
import type { GlobalMessages } from '@/i18n/messages/types';
import type { Locale } from '@/i18n/types';
import type { RouteRecord } from '@/routing/types';

export interface PageDocumentModel {
  readonly locale: Locale;
  readonly route: RouteRecord | null;
  readonly documentTitle?: string;
  readonly title: string;
  readonly description?: string;
}

export interface RenderedContentModel {
  readonly Content: AstroComponentFactory;
  readonly headings: readonly MarkdownHeading[];
}

export interface ToolPresentationDefinition {
  readonly toolId: ToolId;
  readonly primaryCategoryId: ToolCategoryId;
  readonly executionType: ToolExecutionType;
}

export interface HomePageModel extends PageDocumentModel {
  readonly kind: 'home';
  readonly route: null;
  readonly messages: GlobalMessages;
}

export interface ToolPageModel extends PageDocumentModel {
  readonly kind: 'tool';
  readonly route: RouteRecord;
  readonly toolId: ToolId;
  readonly content: {
    readonly title: string;
    readonly description: string;
    readonly editorial: RenderedContentModel;
  };
  readonly presentation: ToolPresentationDefinition;
}

export interface ToolCategoryPageModel extends PageDocumentModel {
  readonly kind: 'tool-category';
  readonly route: RouteRecord;
  readonly categoryId: ToolCategoryId;
  readonly category: {
    readonly label: string;
    readonly shortLabel?: string;
  };
  readonly content: {
    readonly title: string;
    readonly description: string;
    readonly editorial: RenderedContentModel;
  };
}

export interface BlogIndexPageModel extends PageDocumentModel {
  readonly kind: 'blog-index';
  readonly categoryId?: BlogCategoryId;
}

export interface ArticlePageModel extends PageDocumentModel {
  readonly kind: 'article';
  readonly route: RouteRecord | null;
  readonly articleId: ArticleId;
}
