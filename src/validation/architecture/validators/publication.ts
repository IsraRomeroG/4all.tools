import { SUPPORTED_LOCALES, type Locale } from '@/i18n/types';
import { assertReciprocalSeoAlternates } from '@/seo';
import {
  composeBlogIndexPageModel,
  composeBlogAreaAdapterPage,
  composeHomePageModel,
  composeToolAreaAdapterPage,
} from '@/templates/composers';
import { getRouteTargetKey, type RouteRecord, type RouteTarget } from '@/routing/types';
import { inspectRouteRecords, type RouteValidationIssue } from '@/routing/validation';
import { buildAbsoluteUrl } from '@/routing/builders';
import { PageModelCompositionError } from '@/templates/composers/errors';

import {
  compareArchitectureValidationIssues,
  createArchitectureValidationIssue,
} from '../report';
import type {
  ArchitectureComposedPageModel,
  ArchitectureCompositionPorts,
  ArchitectureValidationContext,
} from '../context';
import type { ArchitectureValidationIssue } from '../types';

export async function validatePublicationAndSeo(
  context: Pick<ArchitectureValidationContext, 'routeDefinitions' | 'routeRegistry' | 'composition'>,
): Promise<readonly ArchitectureValidationIssue[]> {
  const issues: ArchitectureValidationIssue[] = [];
  const routeRecords = context.routeRegistry.getAll();

  issues.push(...validateRouteRecords(routeRecords));
  issues.push(...validatePublishedDefinitionCoverage(context.routeDefinitions, routeRecords));

  const composition =
    context.composition ?? createProductionCompositionPorts(context.routeRegistry);
  const composedPages: ArchitectureComposedPageModel[] = [];

  for (const record of [...routeRecords].sort(compareRouteRecords)) {
    try {
      const page = await composition.composeRoute(record);
      validateComposedRoute(issues, record, page);
      composedPages.push(page);
    } catch (error) {
      issues.push(compositionIssue('PUBLIC_ROUTE_COMPOSITION_FAILED', record, error));
    }
  }

  for (const locale of SUPPORTED_LOCALES) {
    try {
      composedPages.push(await composition.composeHome(locale));
    } catch (error) {
      issues.push(fixedRootIssue('home', locale, error));
    }

    try {
      composedPages.push(await composition.composeBlogIndex(locale));
    } catch (error) {
      issues.push(fixedRootIssue('blog-index', locale, error));
    }
  }

  issues.push(...validateSeo(composedPages));

  return Object.freeze([...issues].sort(compareArchitectureValidationIssues));
}

function validateRouteRecords(
  records: readonly RouteRecord[],
): readonly ArchitectureValidationIssue[] {
  return inspectRouteRecords(records).map(adaptRouteIssue);
}

function validatePublishedDefinitionCoverage(
  definitions: ArchitectureValidationContext['routeDefinitions'],
  records: readonly RouteRecord[],
): readonly ArchitectureValidationIssue[] {
  const issues: ArchitectureValidationIssue[] = [];

  for (const route of definitions) {
    if (route.definition.status !== 'published') {
      continue;
    }

    const target = routeTarget(route);
    const matches = records.filter(
      (record) => getRouteTargetKey(record.target) === getRouteTargetKey(target),
    );

    if (matches.length > 0) {
      continue;
    }

    const entityKey = getRouteTargetKey(target);
    issues.push(
      createArchitectureValidationIssue({
        code: 'PUBLISHED_ROUTE_DEFINITION_WITHOUT_PUBLIC_VARIANT',
        scope: 'routing',
        message: `Published route definition ${entityKey} produces no public route variant.`,
        entityKey,
        details: { target },
      }),
    );
  }

  return issues;
}

function validateComposedRoute(
  issues: ArchitectureValidationIssue[],
  record: RouteRecord,
  page: ArchitectureComposedPageModel,
): void {
  const expectedUrl = buildAbsoluteUrl({
    locale: record.locale,
    segments: record.segments,
  });
  const route = page.route;
  const pageTarget = route === null ? null : getRouteTargetKey(route.target);
  const expectedTarget = getRouteTargetKey(record.target);
  const valid =
    page.locale === record.locale &&
    page.kind === record.target.kind &&
    route !== null &&
    pageTarget === expectedTarget &&
    route.segments.join('/') === record.segments.join('/') &&
    page.seo.canonicalUrl === expectedUrl;

  if (valid) {
    return;
  }

  issues.push(
    createArchitectureValidationIssue({
      code: 'PUBLIC_ROUTE_COMPOSITION_FAILED',
      scope: 'composition',
      message: `Composed page model does not match public route ${record.locale}:${record.segments.join('/')}.`,
      entityKey: expectedTarget,
      locale: record.locale,
      sourceId: record.sourceId,
      details: {
        expectedTarget,
        actualTarget: pageTarget,
        expectedUrl,
        actualCanonicalUrl: page.seo.canonicalUrl,
      },
    }),
  );
}

function validateSeo(
  pages: readonly ArchitectureComposedPageModel[],
): readonly ArchitectureValidationIssue[] {
  const issues: ArchitectureValidationIssue[] = [];
  const groups = new Map<string, ArchitectureComposedPageModel[]>();

  for (const page of pages) {
    if (page.seo.canonicalUrl !== page.localizedRouteCluster.current.absoluteUrl) {
      issues.push(
        createArchitectureValidationIssue({
          code: 'NON_RECIPROCAL_SEO_CLUSTER',
          scope: 'seo',
          message: `SEO canonical does not match the current locale variant for ${page.locale}.`,
          entityKey: page.localizedRouteCluster.subject.kind === 'route'
            ? getRouteTargetKey(page.localizedRouteCluster.subject.target)
            : page.localizedRouteCluster.subject.kind,
          locale: page.locale,
          details: {
            expectedCanonical: page.localizedRouteCluster.current.absoluteUrl,
            actualCanonical: page.seo.canonicalUrl,
          },
        }),
      );
    }

    if (!page.seo.robots.index && (page.seo.alternates.length > 0 || page.seo.xDefaultUrl !== undefined)) {
      issues.push(
        createArchitectureValidationIssue({
          code: 'NOINDEX_SEO_ALTERNATE_CONFLICT',
          scope: 'seo',
          message: `Noindex page ${page.seo.canonicalUrl} must not publish alternate URLs.`,
          entityKey: page.localizedRouteCluster.subject.kind === 'route'
            ? getRouteTargetKey(page.localizedRouteCluster.subject.target)
            : page.localizedRouteCluster.subject.kind,
          locale: page.locale,
          details: {
            alternates: page.seo.alternates,
            xDefaultUrl: page.seo.xDefaultUrl ?? null,
          },
        }),
      );
    }

    const subject = page.localizedRouteCluster.subject;
    const key = subject.kind === 'route'
      ? getRouteTargetKey(subject.target)
      : subject.kind;
    const group = groups.get(key) ?? [];

    group.push(page);
    groups.set(key, group);
  }

  for (const [subjectKey, group] of [...groups].sort(([first], [second]) => compareText(first, second))) {
    try {
      assertReciprocalSeoAlternates(group);
    } catch (error) {
      issues.push(
        createArchitectureValidationIssue({
          code: 'NON_RECIPROCAL_SEO_CLUSTER',
          scope: 'seo',
          message: `SEO alternates are not reciprocal for ${subjectKey}.`,
          entityKey: subjectKey,
          details: { cause: error instanceof Error ? error.message : String(error) },
        }),
      );
    }
  }

  return issues;
}

function adaptRouteIssue(issue: RouteValidationIssue): ArchitectureValidationIssue {
  return createArchitectureValidationIssue({
    code: issue.code,
    scope: 'routing',
    message: issue.message,
    ...(issue.locale === undefined ? {} : { locale: issue.locale }),
    ...(issue.targetKey === undefined ? {} : { entityKey: issue.targetKey }),
    ...(issue.sourceIds?.[0] === undefined ? {} : { sourceId: issue.sourceIds[0] }),
    details: {
      causeCode: issue.code,
      path: issue.path ?? null,
      sourceIds: issue.sourceIds ?? [],
      context: issue.context,
    },
  });
}

function compositionIssue(
  code: 'PUBLIC_ROUTE_COMPOSITION_FAILED',
  record: RouteRecord,
  error: unknown,
): ArchitectureValidationIssue {
  const structured = error instanceof PageModelCompositionError;

  return createArchitectureValidationIssue({
    code,
    scope: 'composition',
    message: error instanceof Error ? error.message : `Failed to compose ${getRouteTargetKey(record.target)}.`,
    entityKey: getRouteTargetKey(record.target),
    locale: record.locale,
    sourceId: record.sourceId,
    details: {
      causeCode: structured ? error.code : 'UNKNOWN_COMPOSITION_ERROR',
      context: structured ? error.context : null,
    },
  });
}

function fixedRootIssue(
  root: 'home' | 'blog-index',
  locale: Locale,
  error: unknown,
): ArchitectureValidationIssue {
  return createArchitectureValidationIssue({
    code: 'FIXED_ROOT_COMPOSITION_FAILED',
    scope: 'composition',
    message: error instanceof Error ? error.message : `Failed to compose ${root}:${locale}.`,
    entityKey: root,
    locale,
    details: {
      causeCode: error instanceof PageModelCompositionError ? error.code : 'UNKNOWN_COMPOSITION_ERROR',
    },
  });
}

function routeTarget(route: ArchitectureValidationContext['routeDefinitions'][number]): RouteTarget {
  switch (route.kind) {
    case 'tool':
      return { kind: 'tool', toolId: route.definition.toolId };
    case 'tool-category':
      return { kind: 'tool-category', categoryId: route.definition.categoryId };
    case 'article':
      return { kind: 'article', articleId: route.definition.articleId };
    case 'blog-category':
      return { kind: 'blog-category', categoryId: route.definition.categoryId };
  }
}

function compareRouteRecords(first: RouteRecord, second: RouteRecord): number {
  return compareText(first.locale, second.locale) ||
    compareText(first.segments.join('/'), second.segments.join('/')) ||
    compareText(getRouteTargetKey(first.target), getRouteTargetKey(second.target));
}

function compareText(first: string, second: string): number {
  return first < second ? -1 : first > second ? 1 : 0;
}

function createProductionCompositionPorts(
  routeRegistry: ArchitectureValidationContext['routeRegistry'],
): ArchitectureCompositionPorts {
  return {
    composeRoute: async (record) => {
      switch (record.target.kind) {
        case 'tool':
        case 'tool-category':
          return (await composeToolAreaAdapterPage(record.locale, record.target, {
            routeRegistry,
          })) as ArchitectureComposedPageModel;
        case 'article':
        case 'blog-category':
          return (await composeBlogAreaAdapterPage(record.locale, record.target, {
            routeRegistry,
          })) as ArchitectureComposedPageModel;
      }
    },
    composeHome: async (locale) => (await composeHomePageModel(locale)) as ArchitectureComposedPageModel,
    composeBlogIndex: async (locale) =>
      (await composeBlogIndexPageModel(locale, { routeRegistry })) as ArchitectureComposedPageModel,
  };
}
