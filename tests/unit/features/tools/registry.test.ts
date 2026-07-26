import { describe, expect, it } from 'vitest';

import type { ToolDefinition } from '@/domain/tools';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import {
  DuplicateToolError,
  TOOL_DEFINITIONS,
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

describe('canonical tool registry', () => {
  it('registers each production tool as one definition/component/messages module', () => {
    expect(TOOL_MODULES).toHaveLength(1);
    expect(TOOL_MODULES[0]).toBe(jsonValidatorModule);
    expect(toolRegistry.get('json-validator')).toBe(jsonValidatorModule);
    expect(TOOL_DEFINITIONS).toEqual({
      'json-validator': jsonValidatorModule.definition,
    });
    expect(findToolDefinition('json-validator')).toBe(
      jsonValidatorModule.definition,
    );
    expect(getToolDefinition('json-validator')).toBe(
      jsonValidatorModule.definition,
    );
    expect(getAllToolDefinitions()).toEqual([jsonValidatorModule.definition]);
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
});
