import { describe, expect, it } from 'vitest';

import type { ToolContentEntry } from '@/content/queries';
import type { ToolDefinition } from '@/domain/tools';
import { jsonValidatorDefinition } from '@/features/tools/developer/json-validator/tool.config';
import type { Locale } from '@/i18n/types';
import {
  createToolRouteProvider,
  toToolRouteDefinition,
  toolRouteProvider,
} from '@/routing/providers/tool-route-provider';

describe('tool route provider', () => {
  it('derives localized routes from ToolRegistry and published tool content', async () => {
    const routeDefinitions = await toolRouteProvider.getRouteDefinitions();

    expect(routeDefinitions).toHaveLength(4);
    expect(
      routeDefinitions.map((route) =>
        route.kind === 'tool'
          ? {
              toolId: route.definition.toolId,
              locale: route.definition.locale,
              sourceId: route.definition.sourceId,
              strategy: route.definition.strategy,
            }
          : route,
      ),
    ).toEqual([
      { toolId: 'json-validator', locale: 'en', sourceId: 'en/developer/json-validator', strategy: 'flat' },
      { toolId: 'json-validator', locale: 'es', sourceId: 'es/developer/json-validator', strategy: 'flat' },
      { toolId: 'json-validator', locale: 'pt', sourceId: 'pt/developer/json-validator', strategy: 'flat' },
      { toolId: 'json-validator', locale: 'fr', sourceId: 'fr/developer/json-validator', strategy: 'flat' },
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

  it('does not emit content for tools absent from ToolRegistry', async () => {
    const provider = createToolRouteProvider(async () => [
      toolEntry('en', 'unknown-tool'),
    ]);

    await expect(provider.getRouteDefinitions()).resolves.toEqual([]);
  });
});

function toolEntry(locale: Locale, toolId: string): ToolContentEntry {
  return {
    id: `${locale}/developer/${toolId}`,
    collection: 'tools',
    data: {
      toolId,
      locale,
      status: 'published',
      title: toolId,
      description: toolId,
      seo: { title: toolId, description: toolId, noindex: false },
      relatedToolIds: [],
    },
  } as unknown as ToolContentEntry;
}
