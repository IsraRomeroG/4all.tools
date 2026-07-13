import { SUPPORTED_LOCALES, type Locale } from '@/i18n/types';
import type { RouteTargetKey } from '@/routing/types';

export const ROUTE_VALIDATION_ISSUE_CODES = [
  'INVALID_ROUTE_RECORD',
  'EMPTY_SEGMENTS',
  'INVALID_SEGMENT',
  'INVALID_AREA_TARGET',
  'INVALID_BLOG_NAMESPACE',
  'RESERVED_ROOT_SEGMENT',
  'DUPLICATE_ROUTE_RECORD',
  'DUPLICATE_PUBLIC_PATH',
  'DUPLICATE_CANONICAL_TARGET',
] as const;

export type RouteValidationIssueCode =
  (typeof ROUTE_VALIDATION_ISSUE_CODES)[number];

export interface RouteValidationIssue {
  readonly code: RouteValidationIssueCode;
  readonly message: string;
  readonly locale?: Locale;
  readonly path?: string;
  readonly targetKey?: RouteTargetKey;
  readonly sourceIds?: readonly string[];
  readonly context: Readonly<Record<string, unknown>>;
}

export interface CreateRouteValidationIssueInput {
  readonly code: RouteValidationIssueCode;
  readonly message: string;
  readonly locale?: Locale;
  readonly path?: string;
  readonly targetKey?: RouteTargetKey;
  readonly sourceIds?: readonly string[];
  readonly context?: Readonly<Record<string, unknown>>;
}

const ISSUE_CODE_ORDER = new Map<RouteValidationIssueCode, number>(
  ROUTE_VALIDATION_ISSUE_CODES.map((code, index) => [code, index]),
);

const LOCALE_ORDER = new Map<Locale, number>(
  SUPPORTED_LOCALES.map((locale, index) => [locale, index]),
);

export function createRouteValidationIssue(
  input: CreateRouteValidationIssueInput,
): RouteValidationIssue {
  const sourceIds = normalizeStringList(input.sourceIds);

  return Object.freeze({
    code: input.code,
    message: input.message,
    ...(input.locale !== undefined ? { locale: input.locale } : {}),
    ...(input.path !== undefined ? { path: input.path } : {}),
    ...(input.targetKey !== undefined ? { targetKey: input.targetKey } : {}),
    ...(sourceIds.length > 0 ? { sourceIds } : {}),
    context: Object.freeze({ ...(input.context ?? {}) }),
  });
}

export function compareRouteValidationIssues(
  first: RouteValidationIssue,
  second: RouteValidationIssue,
): number {
  return (
    compareNumeric(
      ISSUE_CODE_ORDER.get(first.code) ?? Number.MAX_SAFE_INTEGER,
      ISSUE_CODE_ORDER.get(second.code) ?? Number.MAX_SAFE_INTEGER,
    ) ||
    compareNumeric(
      getLocaleOrder(first.locale),
      getLocaleOrder(second.locale),
    ) ||
    compareText(first.path ?? '', second.path ?? '') ||
    compareText(first.targetKey ?? '', second.targetKey ?? '') ||
    compareText(
      first.sourceIds?.join('|') ?? '',
      second.sourceIds?.join('|') ?? '',
    ) ||
    compareText(first.message, second.message)
  );
}

function normalizeStringList(values: readonly string[] | undefined): readonly string[] {
  if (!values) {
    return Object.freeze([]);
  }

  return Object.freeze([...new Set(values)].sort(compareText));
}

function getLocaleOrder(locale: Locale | undefined): number {
  if (!locale) {
    return Number.MAX_SAFE_INTEGER;
  }

  return LOCALE_ORDER.get(locale) ?? Number.MAX_SAFE_INTEGER;
}

function compareNumeric(first: number, second: number): number {
  return first - second;
}

function compareText(first: string, second: string): number {
  return first < second ? -1 : first > second ? 1 : 0;
}
