import { access } from 'node:fs/promises';

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import HomePage from '@/pages/index.astro';
import RootPage, {
  getStaticPaths as getRootStaticPaths,
} from '@/pages/[root]/index.astro';
import {
  composeToolAreaAdapterPage,
  getDeliveryRouteRegistry,
  UnsupportedPageTargetError,
} from '@/templates/composers';
import {
  getToolAreaStaticPathEntries,
  type StaticPathFactory,
  type StaticPathProps,
} from '@/routing/static-paths';
import { createRouteRegistryFromRecords } from '@/routing/registry';
import type { RouteRecord, RouteTarget } from '@/routing/types';

const PROJECT_ROOT = new URL('../../../', import.meta.url);
const STATIC_PATH_OPTIONS = {} as Parameters<StaticPathFactory>[0];

describe('English route adapters', () => {
  it('renders the unprefixed English home adapter', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(HomePage, {
      partial: false,
      request: new Request('https://example.com/'),
    });

    expect(html).toContain('<html lang="en" dir="ltr">');
    expect(html).toContain('data-template="home"');
    expect(html).not.toContain('/en/');
  });

  it('delegates root static paths to P04 using stable target props', async () => {
    const paths = await getRootStaticPaths(STATIC_PATH_OPTIONS);

    expect(paths).toContainEqual({
      params: {
        root: 'developer',
      },
      props: {
        routeTarget: {
          kind: 'tool-category',
          categoryId: 'developer',
        },
      },
    });
  });

  it('renders a root page from routeTarget props, not params identity', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(RootPage, {
      partial: false,
      request: new Request('https://example.com/not-the-category-id/'),
      params: {
        root: 'not-the-category-id',
      },
      props: {
        routeTarget: {
          kind: 'tool-category',
          categoryId: 'developer',
        },
      } satisfies StaticPathProps,
    });

    expect(html).toContain('data-template="tool-category"');
    expect(html).toContain('data-template-identity="developer"');
    expect(html).toContain('Developer Tools');
    expect(html).not.toContain('not-the-category-id');
  });

  it('projects tool catch-all fixtures with stable tool identity', () => {
    const entries = getToolAreaStaticPathEntries(fixtureRouteRegistry(), 'en');

    expect(entries).toContainEqual({
      params: {
        root: 'developer',
        path: 'json-validator',
      },
      props: {
        routeTarget: {
          kind: 'tool',
          toolId: 'json-validator',
        },
      },
    });
  });

  it('supports nested future tool-area fixtures without adapter changes', () => {
    const entries = getToolAreaStaticPathEntries(fixtureRouteRegistry(), 'en');

    expect(entries).toContainEqual({
      params: {
        root: 'developer',
        path: 'data-formats/json/json-validator',
      },
      props: {
        routeTarget: {
          kind: 'tool',
          toolId: 'json-validator-nested',
        },
      },
    });
  });

  it('fails explicitly for unsupported catch-all targets', async () => {
    await expect(
      composeToolAreaAdapterPage(
        'en',
        {
          kind: 'article',
          articleId: 'what-is-json',
        },
        {
          routeRegistry: fixtureRouteRegistry(),
        },
      ),
    ).rejects.toBeInstanceOf(UnsupportedPageTargetError);
  });

  it('keeps the English source tree unprefixed', async () => {
    expect(await projectPathExists('src/pages/en')).toBe(false);
  });

  it('publishes the production json-validator catch-all route through registry data', async () => {
    const registry = await getDeliveryRouteRegistry();
    const entries = getToolAreaStaticPathEntries(registry, 'en');

    expect(entries).toContainEqual({
      params: {
        root: 'developer',
        path: 'json-validator',
      },
      props: {
        routeTarget: {
          kind: 'tool',
          toolId: 'json-formatter-validator',
        },
      },
    });
  });
});

async function projectPathExists(path: string): Promise<boolean> {
  try {
    await access(new URL(path, PROJECT_ROOT));
    return true;
  } catch {
    return false;
  }
}

function fixtureRouteRegistry() {
  return createRouteRegistryFromRecords([
    route({
      locale: 'en',
      segments: ['developer', 'json-validator'],
      target: {
        kind: 'tool',
        toolId: 'json-validator',
      },
    }),
    route({
      locale: 'en',
      segments: ['developer', 'data-formats', 'json', 'json-validator'],
      target: {
        kind: 'tool',
        toolId: 'json-validator-nested',
      },
    }),
    route({
      locale: 'en',
      segments: ['developer'],
      target: {
        kind: 'tool-category',
        categoryId: 'developer',
      },
    }),
  ]);
}

function route(input: {
  readonly locale: RouteRecord['locale'];
  readonly segments: readonly string[];
  readonly target: RouteTarget;
}): RouteRecord {
  return {
    area: input.target.kind === 'article' || input.target.kind === 'blog-category' ? 'blog' : 'tools',
    locale: input.locale,
    segments: input.segments,
    target: input.target,
    sourceId: 'fixture:english-route-adapters',
  };
}
