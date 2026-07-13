import type { RouteRecord, RouteTarget } from '@/routing/types';

export const DUPLICATE_PATH_TWO_TOOLS = [
  toolRecord({
    toolId: 'shared-tool-a',
    segments: ['developer', 'shared'],
    sourceId: 'fixture:tool-a',
  }),
  toolRecord({
    toolId: 'shared-tool-b',
    segments: ['developer', 'shared'],
    sourceId: 'fixture:tool-b',
  }),
] satisfies readonly RouteRecord[];

export const DUPLICATE_PATH_CROSS_KIND = [
  toolRecord({
    toolId: 'shared-tool',
    segments: ['developer', 'shared'],
    sourceId: 'fixture:tool',
  }),
  toolCategoryRecord({
    categoryId: 'shared-category',
    segments: ['developer', 'shared'],
    sourceId: 'fixture:category',
  }),
] satisfies readonly RouteRecord[];

export const DUPLICATE_TARGET_TWO_PATHS = [
  toolRecord({
    toolId: 'json-validator',
    segments: ['developer', 'json-validator'],
    sourceId: 'fixture:flat-tool',
  }),
  toolRecord({
    toolId: 'json-validator',
    segments: ['developer', 'json', 'check'],
    sourceId: 'fixture:hierarchical-tool',
  }),
] satisfies readonly RouteRecord[];

export const SAME_TARGET_DIFFERENT_LOCALES = [
  toolRecord({
    locale: 'en',
    toolId: 'json-validator',
    segments: ['developer', 'json-validator'],
    sourceId: 'fixture:tool-en',
  }),
  toolRecord({
    locale: 'es',
    toolId: 'json-validator',
    segments: ['desarrollo', 'validador-json'],
    sourceId: 'fixture:tool-es',
  }),
] satisfies readonly RouteRecord[];

export const SAME_TEXT_PATH_DIFFERENT_LOCALES = [
  articleRecord({
    locale: 'en',
    articleId: 'json-en',
    segments: ['blog', 'json'],
    sourceId: 'fixture:article-en',
  }),
  articleRecord({
    locale: 'es',
    articleId: 'json-es',
    segments: ['blog', 'json'],
    sourceId: 'fixture:article-es',
  }),
] satisfies readonly RouteRecord[];

export const LOCALE_PREFIX_ROOT = [
  toolRecord({
    toolId: 'locale-prefix-tool',
    segments: ['es', 'example-tool'],
    sourceId: 'fixture:locale-prefix',
  }),
] satisfies readonly RouteRecord[];

export const DUPLICATE_CURRENT_LOCALE_PREFIX = [
  toolRecord({
    locale: 'es',
    toolId: 'duplicate-locale-prefix-tool',
    segments: ['es', 'example-tool'],
    sourceId: 'fixture:duplicate-current-locale-prefix',
  }),
] satisfies readonly RouteRecord[];

export const OTHER_LOCALE_CODE_IN_PREFIXED_LOCALE = [
  toolRecord({
    locale: 'es',
    toolId: 'other-locale-code-tool',
    segments: ['fr', 'example-tool'],
    sourceId: 'fixture:other-locale-code',
  }),
] satisfies readonly RouteRecord[];

export const RESERVED_BLOG_TOOL_ROOT = [
  toolRecord({
    toolId: 'blog-tool',
    segments: ['blog', 'example-tool'],
    sourceId: 'fixture:blog-tool',
  }),
] satisfies readonly RouteRecord[];

export const BLOG_OWNS_BLOG_ROOT = [
  articleRecord({
    articleId: 'what-is-json',
    segments: ['blog', 'what-is-json'],
    sourceId: 'fixture:blog-article',
  }),
] satisfies readonly RouteRecord[];

export const INVALID_SEGMENT_UPPERCASE = [
  toolRecord({
    toolId: 'uppercase-tool',
    segments: ['developer', 'Json'],
    sourceId: 'fixture:uppercase',
  }),
] satisfies readonly RouteRecord[];

export const INVALID_SEGMENT_SLASH = [
  toolRecord({
    toolId: 'slash-tool',
    segments: ['developer/json-validator'],
    sourceId: 'fixture:slash',
  }),
] satisfies readonly RouteRecord[];

export const DUPLICATE_IDENTICAL_RECORD = [
  toolRecord({
    toolId: 'json-validator',
    segments: ['developer', 'json-validator'],
    sourceId: 'fixture:duplicate-a',
  }),
  toolRecord({
    toolId: 'json-validator',
    segments: ['developer', 'json-validator'],
    sourceId: 'fixture:duplicate-b',
  }),
] satisfies readonly RouteRecord[];

export const AREA_TARGET_MISMATCH = [
  record({
    area: 'blog',
    target: {
      kind: 'tool',
      toolId: 'json-validator',
    },
    segments: ['blog', 'json-validator'],
    sourceId: 'fixture:area-target-mismatch',
  }),
] satisfies readonly RouteRecord[];

export const INVALID_BLOG_NAMESPACE = [
  articleRecord({
    articleId: 'what-is-json',
    segments: ['development', 'what-is-json'],
    sourceId: 'fixture:invalid-blog-namespace',
  }),
] satisfies readonly RouteRecord[];

export function toolRecord(input: {
  readonly locale?: RouteRecord['locale'];
  readonly toolId: string;
  readonly segments: readonly string[];
  readonly sourceId: string;
}): RouteRecord {
  return record({
    area: 'tools',
    segments: input.segments,
    sourceId: input.sourceId,
    target: {
      kind: 'tool',
      toolId: input.toolId,
    },
    ...(input.locale !== undefined ? { locale: input.locale } : {}),
  });
}

export function toolCategoryRecord(input: {
  readonly locale?: RouteRecord['locale'];
  readonly categoryId: string;
  readonly segments: readonly string[];
  readonly sourceId: string;
}): RouteRecord {
  return record({
    area: 'tools',
    segments: input.segments,
    sourceId: input.sourceId,
    target: {
      kind: 'tool-category',
      categoryId: input.categoryId,
    },
    ...(input.locale !== undefined ? { locale: input.locale } : {}),
  });
}

export function articleRecord(input: {
  readonly locale?: RouteRecord['locale'];
  readonly articleId: string;
  readonly segments: readonly string[];
  readonly sourceId: string;
}): RouteRecord {
  return record({
    area: 'blog',
    segments: input.segments,
    sourceId: input.sourceId,
    target: {
      kind: 'article',
      articleId: input.articleId,
    },
    ...(input.locale !== undefined ? { locale: input.locale } : {}),
  });
}

function record(input: {
  readonly area: RouteRecord['area'];
  readonly locale?: RouteRecord['locale'];
  readonly segments: readonly string[];
  readonly target: RouteTarget;
  readonly sourceId: string;
}): RouteRecord {
  return {
    area: input.area,
    locale: input.locale ?? 'en',
    segments: input.segments,
    target: input.target,
    sourceId: input.sourceId,
  };
}
