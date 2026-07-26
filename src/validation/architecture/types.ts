import type { Locale } from '@/i18n/types';

export type ArchitectureValidationScope =
  | 'content'
  | 'identity'
  | 'taxonomy'
  | 'tool-module'
  | 'relation'
  | 'routing'
  | 'source-boundary';

export type ArchitectureValidationIssueCode =
  | 'DUPLICATE_CONTENT_IDENTITY'
  | 'UNKNOWN_TOOL_CONTENT_ID'
  | 'UNKNOWN_TOOL_CATEGORY_CONTENT_ID'
  | 'UNKNOWN_BLOG_CATEGORY_CONTENT_ID'
  | 'UNKNOWN_ARTICLE_PRIMARY_CATEGORY'
  | 'UNKNOWN_ARTICLE_SECONDARY_CATEGORY'
  | 'ARTICLE_TRANSLATION_PRIMARY_CATEGORY_MISMATCH'
  | 'MISSING_TOOL_MODULE_COMPONENT'
  | 'MISSING_TOOL_MODULE_MESSAGES'
  | 'TOOL_FEATURE_PATH_MISMATCH'
  | 'UNKNOWN_RELATED_TOOL'
  | 'UNPUBLISHED_RELATED_TOOL'
  | 'UNKNOWN_RELATED_ARTICLE'
  | 'SELF_RELATED_ARTICLE'
  | 'PUBLISHED_ROUTE_DEFINITION_WITHOUT_PUBLIC_VARIANT'
  | 'FORBIDDEN_SOURCE_NAMESPACE'
  | 'INVALID_ROUTE_RECORD'
  | 'EMPTY_SEGMENTS'
  | 'INVALID_SEGMENT'
  | 'INVALID_AREA_TARGET'
  | 'INVALID_BLOG_NAMESPACE'
  | 'RESERVED_ROOT_SEGMENT'
  | 'DUPLICATE_ROUTE_RECORD'
  | 'DUPLICATE_PUBLIC_PATH'
  | 'DUPLICATE_CANONICAL_TARGET';

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
}

export interface ArchitectureValidationReport {
  readonly issues: readonly ArchitectureValidationIssue[];
  readonly inspected: ArchitectureValidationCounts;
}
