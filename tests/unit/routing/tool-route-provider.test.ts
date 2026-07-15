import { describe, expect, it } from 'vitest';

import type { ToolDefinition } from '@/domain/tools';
import { jsonValidatorDefinition } from '@/features/tools/developer/json-validator/tool.config';
import {
  createToolRouteProvider,
  toToolRouteDefinition,
  toolRouteProvider,
} from '@/routing/providers/tool-route-provider';

describe('tool route provider', () => {
  it('adapts the production tool registry into P04 route definitions', async () => {
    const routeDefinitions = await toolRouteProvider.getRouteDefinitions();

    expect(routeDefinitions).toEqual([
      {
        kind: 'tool',
        definition: {
          toolId: 'json-validator',
          rootCategoryId: 'developer',
          primaryCategoryId: 'json',
          strategy: 'flat',
          localized: {
            en: { slug: 'json-validator' },
            es: { slug: 'validador-json' },
            pt: { slug: 'validador-json' },
            fr: { slug: 'validateur-json' },
          },
          status: 'published',
        },
      },
    ]);
  });

  it('maps route strategy through the adapter boundary', () => {
    const hierarchicalDefinition = {
      ...jsonValidatorDefinition,
      route: {
        ...jsonValidatorDefinition.route,
        strategy: 'hierarchical',
      },
    } as const satisfies ToolDefinition;

    expect(toToolRouteDefinition(hierarchicalDefinition).strategy).toBe(
      'hierarchical',
    );
  });

  it('does not emit draft tool definitions', async () => {
    const provider = createToolRouteProvider(() => [
      jsonValidatorDefinition,
      {
        ...jsonValidatorDefinition,
        id: 'draft-tool',
        status: 'draft',
      },
    ]);

    const routeDefinitions = await provider.getRouteDefinitions();

    expect(routeDefinitions).toHaveLength(1);
    expect(routeDefinitions[0]).toMatchObject({
      kind: 'tool',
      definition: {
        toolId: 'json-validator',
      },
    });
  });
});
