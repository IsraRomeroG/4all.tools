import type { ToolCategoryId, ToolId } from '@/domain/shared/ids';
import type { PublicationStatus } from '@/domain/shared/publication';
import type { PartialLocalized } from '@/i18n/types';

export type ToolExecutionType =
  | 'client'
  | 'astro-endpoint'
  | 'backend-api'
  | 'external-api';

export type ToolRouteMode = 'flat' | 'hierarchical';

export interface ToolLocalizedSlug {
  readonly slug: string;
}

export interface ToolDefinition {
  readonly id: ToolId;
  readonly rootCategoryId: ToolCategoryId;
  readonly taxonomy: {
    readonly primaryCategoryId: ToolCategoryId;
    readonly secondaryCategoryIds?: readonly ToolCategoryId[];
  };
  readonly route: {
    readonly strategy: ToolRouteMode;
    readonly localized: PartialLocalized<ToolLocalizedSlug>;
  };
  readonly execution: {
    readonly type: ToolExecutionType;
    readonly operationId?: string;
  };
  readonly status: PublicationStatus;
}
