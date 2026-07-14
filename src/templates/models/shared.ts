import type {
  ArticleId,
  BlogCategoryId,
  ToolCategoryId,
  ToolId,
} from '@/domain/shared/ids';
import type { Locale } from '@/i18n/types';

export interface PageDocumentModel {
  locale: Locale;
  documentTitle?: string;
  title: string;
  description?: string;
}

export interface HomePageModel extends PageDocumentModel {
  kind: 'home';
}

export interface ToolPageModel extends PageDocumentModel {
  kind: 'tool';
  toolId: ToolId;
}

export interface ToolCategoryPageModel extends PageDocumentModel {
  kind: 'tool-category';
  categoryId: ToolCategoryId;
}

export interface BlogIndexPageModel extends PageDocumentModel {
  kind: 'blog-index';
  categoryId?: BlogCategoryId;
}

export interface ArticlePageModel extends PageDocumentModel {
  kind: 'article';
  articleId: ArticleId;
}
