import { access } from 'node:fs/promises';

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import type { ToolDefinition } from '@/domain/tools';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import {
  DuplicateToolError,
  MissingToolComponentError,
  MissingToolMessagesError,
  TOOL_MODULES,
  ToolTaxonomyMismatchError,
  UnknownToolError,
  createToolRegistry,
  defineToolModule,
  findToolDefinition,
  getAllToolDefinitions,
  getToolDefinition,
  getToolModule,
  jsonValidatorModule,
  toolRegistry,
} from '@/features/tools/registry';
import { SUPPORTED_LOCALES } from '@/i18n/types';

const PROJECT_ROOT = new URL('../../../../', import.meta.url);

describe('canonical tool registry', () => {
  it('registers every production tool through the canonical module projections', () => {
    expect(toolRegistry.get('json-validator')).toBe(jsonValidatorModule);

    for (const module of TOOL_MODULES) {
      expect(toolRegistry.get(module.definition.id)).toBe(module);
      expect(findToolDefinition(module.definition.id)).toBe(module.definition);
      expect(getToolDefinition(module.definition.id)).toBe(module.definition);
    }

    expect(getAllToolDefinitions()).toEqual(
      toolRegistry.getAll().map((module) => module.definition),
    );
  });

  it('resolves the component and localized messages through the same module', () => {
    const module = toolRegistry.get('json-validator');

    expect(module.component).toBeTypeOf('function');
    expect(module.getMessages('en')).toMatchObject({
      input: { label: 'Input JSON' },
      actions: { validate: 'Validate JSON' },
    });
    expect(getToolModule('json-validator')).toBe(module);
  });

  it('validates every registered locale and renders every registered component', async () => {
    const container = await AstroContainer.create();

    for (const module of toolRegistry.getAll()) {
      expect(module.definition.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(module.component).toBeTypeOf('function');

      for (const locale of SUPPORTED_LOCALES) {
        const messages = module.getMessages(locale);
        expect(messages).toBeTypeOf('object');

        const html = await container.renderToString(module.component, {
          partial: true,
          props: {
            locale,
            messages,
            instanceId: `${module.definition.id}-${locale}-registry-test`,
          },
        });

        expect(html).toContain(`data-locale="${locale}"`);
      }
    }
  });

  it('derives the taxonomy-to-feature directory convention generically', async () => {
    for (const module of toolRegistry.getAll()) {
      const definition = module.definition;
      const categorySegments = toolTaxonomy
        .getPathFromRoot(definition.taxonomy.primaryCategoryId)
        .map((node) => node.id);
      const featurePath = [
        'src/features/tools',
        ...categorySegments,
        definition.id,
      ].join('/');

      await expect(access(new URL(`${featurePath}/`, PROJECT_ROOT))).resolves.toBeUndefined();
    }
  });

  it('sorts modules by stable ID and rejects duplicates', () => {
    const jsonFormatterModule = defineToolModule({
      ...jsonValidatorModule,
      definition: {
        ...jsonValidatorModule.definition,
        id: 'json-formatter',
        route: {
          ...jsonValidatorModule.definition.route,
          localized: { en: { slug: 'json-formatter' } },
        },
      } as const satisfies ToolDefinition,
    });

    const registry = createToolRegistry([
      jsonValidatorModule,
      jsonFormatterModule,
    ]);

    expect(registry.getAll().map((module) => module.definition.id)).toEqual([
      'json-formatter',
      'json-validator',
    ]);
    expect(() =>
      createToolRegistry([jsonValidatorModule, jsonValidatorModule]),
    ).toThrow(DuplicateToolError);
  });

  it('rejects taxonomy mismatches and makes unknown lookup explicit', () => {
    expect(() => toolRegistry.get('missing-tool')).toThrow(UnknownToolError);
    expect(toolRegistry.find('missing-tool')).toBeNull();
    expect(() =>
      createToolRegistry([
        defineToolModule({
          ...jsonValidatorModule,
          definition: {
            ...jsonValidatorModule.definition,
            rootCategoryId: 'data-formats',
          } as const satisfies ToolDefinition,
        }),
      ], { taxonomy: toolTaxonomy }),
    ).toThrow(ToolTaxonomyMismatchError);
  });

  it('rejects modules without a component or complete message resolver', () => {
    expect(() => createToolRegistry([{
      ...jsonValidatorModule,
      component: undefined as never,
    }])).toThrow(MissingToolComponentError);
    expect(() => createToolRegistry([{
      ...jsonValidatorModule,
      getMessages: () => null as never,
    }])).toThrow(MissingToolMessagesError);
  });
});
