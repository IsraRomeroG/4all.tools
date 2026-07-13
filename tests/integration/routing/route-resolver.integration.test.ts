import { describe, expect, it } from 'vitest';

import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import type { Locale } from '@/i18n/types';
import type { RouteDefinitionProvider } from '@/routing/definitions';
import {
  createRouteRegistry,
  createRouteResolver,
  getRouteTargetKey,
  type RoutePublicationAvailability,
  type RouteTarget,
} from '@/routing';

import { ROUTE_DEFINITION_FIXTURES } from '../../fixtures/routing/route-definitions';

describe('route resolver integration', () => {
  it('resolves provider-built localized routes through registry ownership', async () => {
    const registry = await createRouteRegistry({
      providers: [
        {
          sourceId: 'fixture:resolver-tools',
          getRouteDefinitions: () => [ROUTE_DEFINITION_FIXTURES[0]!],
        } satisfies RouteDefinitionProvider,
      ],
      toolTaxonomy,
      blogTaxonomy,
      publicationAvailability: missingLocales({
        'tool:json-validator': ['pt'],
      }),
    });
    const resolver = createRouteResolver(registry);
    const target = {
      kind: 'tool',
      toolId: 'json-validator',
    } satisfies RouteTarget;

    expect(
      getRouteTargetKey(
        resolver.resolve({
          locale: 'en',
          segments: ['developer', 'json-validator'],
        })?.target ?? missingTarget(),
      ),
    ).toBe('tool:json-validator');
    expect(
      getRouteTargetKey(
        resolver.resolve({
          locale: 'es',
          segments: ['desarrollo', 'validador-json'],
        })?.target ?? missingTarget(),
      ),
    ).toBe('tool:json-validator');
    expect(
      resolver
        .getAlternates(target)
        .map((record) => `${record.locale}:${record.segments.join('/')}`),
    ).toEqual([
      'en:developer/json-validator',
      'es:desarrollo/validador-json',
      'fr:developpement/validateur-json',
    ]);
    expect(
      resolver.getCanonical({
        locale: 'pt',
        target,
      }),
    ).toBeNull();
    expect(
      resolver.resolve({
        locale: 'pt',
        segments: ['desenvolvedor', 'validador-json'],
      }),
    ).toBeNull();
  });
});

function missingLocales(
  missingByTarget: Readonly<Record<string, readonly Locale[]>>,
): RoutePublicationAvailability {
  return {
    isPublishable: (target: RouteTarget, locale) => {
      const missingLocalesForTarget =
        missingByTarget[getRouteTargetKey(target)] ?? [];

      return !missingLocalesForTarget.includes(locale);
    },
  };
}

function missingTarget(): RouteTarget {
  return {
    kind: 'tool',
    toolId: 'missing-target',
  };
}
