import { access } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import type { ToolDefinition } from '@/domain/tools';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import { jsonValidatorDefinition } from '@/features/tools/developer/json-validator/tool.config';
import { JSON_VALIDATOR_TOOL_ID } from '@/features/tools/developer/json-validator/types';
import {
  MissingToolComponentError,
  getToolComponent,
  hasToolComponent,
} from '@/features/tools/component-registry';
import { getToolMessages } from '@/features/tools/message-registry';
import {
  DuplicateToolDefinitionError,
  TOOL_DEFINITIONS,
  ToolTaxonomyMismatchError,
  UnknownToolDefinitionError,
  createToolRegistry,
  findToolDefinition,
  getAllToolDefinitions,
  getToolDefinition,
} from '@/features/tools/registry';

const PROJECT_ROOT = new URL('../../../../', import.meta.url);

describe('tool feature registry', () => {
  it('defines json-validator with stable production invariants', () => {
    expect(JSON_VALIDATOR_TOOL_ID).toBe('json-validator');
    expect(jsonValidatorDefinition.id).toBe('json-validator');
    expect(jsonValidatorDefinition.rootCategoryId).toBe('developer');
    expect(jsonValidatorDefinition.taxonomy.primaryCategoryId).toBe('json');
    expect(jsonValidatorDefinition.route.strategy).toBe('flat');
    expect(jsonValidatorDefinition.execution.type).toBe('client');
    expect(jsonValidatorDefinition.status).toBe('published');
    expect(Object.keys(jsonValidatorDefinition.route.localized)).toEqual([
      'en',
      'es',
      'pt',
      'fr',
    ]);
    expect(jsonValidatorDefinition).not.toHaveProperty('canonicalUrl');
    expect(jsonValidatorDefinition).not.toHaveProperty('hreflang');
  });

  it('keeps the first real feature under the expected source namespace', async () => {
    await expect(
      access(
        new URL(
          'src/features/tools/developer/json-validator/tool.config.ts',
          PROJECT_ROOT,
        ),
      ),
    ).resolves.toBeUndefined();
    expect(toolTaxonomy.getRoot('json').id).toBe('developer');
    expect(toolTaxonomy.getNode('developer').localized.en.slug).toBe('developer');
    expect(jsonValidatorDefinition.route.localized.en?.slug).toBe(
      'json-validator',
    );
  });

  it('registers production definitions by stable ID with deterministic lookup', () => {
    expect(Object.keys(TOOL_DEFINITIONS)).toEqual(['json-validator']);
    expect(findToolDefinition('json-validator')).toBe(jsonValidatorDefinition);
    expect(getToolDefinition('json-validator')).toBe(jsonValidatorDefinition);
    expect(findToolDefinition('missing-tool')).toBeNull();
    expect(() => getToolDefinition('missing-tool')).toThrow(
      UnknownToolDefinitionError,
    );
    expect(getAllToolDefinitions().map((definition) => definition.id)).toEqual([
      'json-validator',
    ]);
  });

  it('sorts registry definitions by stable ID instead of input order', () => {
    const jsonFormatterDefinition = {
      ...jsonValidatorDefinition,
      id: 'json-formatter',
      route: {
        ...jsonValidatorDefinition.route,
        localized: {
          en: { slug: 'json-formatter' },
        },
      },
    } as const satisfies ToolDefinition;

    const registry = createToolRegistry([
      jsonValidatorDefinition,
      jsonFormatterDefinition,
    ]);

    expect(registry.getAllToolDefinitions().map((definition) => definition.id))
      .toEqual(['json-formatter', 'json-validator']);
  });

  it('rejects duplicate tool IDs and taxonomy root mismatches', () => {
    expect(() =>
      createToolRegistry([jsonValidatorDefinition, jsonValidatorDefinition]),
    ).toThrow(DuplicateToolDefinitionError);

    expect(() =>
      createToolRegistry([
        {
          ...jsonValidatorDefinition,
          rootCategoryId: 'data-formats',
        },
      ]),
    ).toThrow(ToolTaxonomyMismatchError);
  });

  it('exposes explicit component and message registry boundaries', () => {
    expect(hasToolComponent('json-validator')).toBe(true);
    expect(getToolComponent('json-validator')).toBeTypeOf('function');
    expect(hasToolComponent('missing-tool')).toBe(false);
    expect(() => getToolComponent('missing-tool')).toThrow(
      MissingToolComponentError,
    );
    expect(getToolMessages('json-validator', 'en')).toMatchObject({
      input: {
        label: 'Input JSON',
      },
      actions: {
        validate: 'Validate JSON',
      },
    });
  });
});
