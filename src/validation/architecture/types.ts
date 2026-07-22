import type { Locale } from '@/i18n/types';

export type ArchitectureValidationScope =
  | 'content'
  | 'identity'
  | 'taxonomy'
  | 'tool-module'
  | 'relation'
  | 'routing'
  | 'composition'
  | 'seo'
  | 'source-boundary';

export type ArchitectureValidationIssueCode =
  | 'DUPLICATE_CONTENT_IDENTITY'
  | 'UNKNOWN_TOOL_CONTENT_ID'
  | 'UNKNOWN_TOOL_CATEGORY_CONTENT_ID'
  | 'UNKNOWN_BLOG_CATEGORY_CONTENT_ID'
  | 'UNKNOWN_ARTICLE_PRIMARY_CATEGORY'
  | 'UNKNOWN_ARTICLE_SECONDARY_CATEGORY'
  | 'ARTICLE_TRANSLATION_PRIMARY_CATEGORY_MISMATCH'
  | 'MISSING_PUBLISHED_TOOL_MODULE'
  | 'ORPHAN_TOOL_MODULE'
  | 'TOOL_MODULE_IDENTITY_MISMATCH'
  | 'TOOL_FEATURE_PATH_MISMATCH'
  | 'UNKNOWN_RELATED_TOOL'
  | 'UNPUBLISHED_RELATED_TOOL'
  | 'UNKNOWN_RELATED_ARTICLE'
  | 'SELF_RELATED_ARTICLE'
  | 'PUBLISHED_ROUTE_DEFINITION_WITHOUT_PUBLIC_VARIANT'
  | 'PUBLIC_ROUTE_COMPOSITION_FAILED'
  | 'FIXED_ROOT_COMPOSITION_FAILED'
  | 'NON_RECIPROCAL_SEO_CLUSTER'
  | 'FORBIDDEN_SOURCE_NAMESPACE'
  | 'FORBIDDEN_SOURCE_DEPENDENCY';

export interface ArchitectureValidationIssue {
  readonly code: ArchitectureValidationIssueCode;
  readonly scope: ArchitectureValidationScope;
  readonly message: string;
  readonly entityKey?: string;
  readonly locale?: Locale;
  readonly sourceId?: string;
  readonly details?: Readonly<Record<string, unknown>>;
}

export interface ArchitectureValidationCounts {
  readonly contentEntries: number;
  readonly toolDefinitions: number;
  readonly toolModules: number;
  readonly routeDefinitions: number;
  readonly routeRecords: number;
  readonly pageModels: number;
  readonly sourceFiles: number;
}

export interface ArchitectureValidationReport {
  readonly issues: readonly ArchitectureValidationIssue[];
  readonly inspected: ArchitectureValidationCounts;
}
