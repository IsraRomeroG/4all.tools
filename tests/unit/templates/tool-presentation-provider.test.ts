import { describe, expect, it } from 'vitest';

import { getToolDefinition as getCanonicalToolDefinition } from '@/features/tools/registry';
import {
  getToolPresentation,
  toolPresentationProvider,
} from '@/templates/page-models/providers/tool-presentation-provider';

describe('tool presentation provider', () => {
  it('projects production tool config into the P05 presentation boundary', () => {
    expect(getToolPresentation('json-validator')).toEqual({
      toolId: 'json-validator',
      primaryCategoryId: 'json',
      executionType: 'client',
    });
    expect(toolPresentationProvider.getToolPresentation('json-validator'))
      .toEqual({
        toolId: 'json-validator',
        primaryCategoryId: 'json',
        executionType: 'client',
      });
  });

  it('derives JSON Validator presentation from the canonical tool definition', () => {
    const definition = getCanonicalToolDefinition('json-validator');
    const presentation = getToolPresentation('json-validator');

    expect(presentation).toEqual({
      toolId: definition.id,
      primaryCategoryId: definition.taxonomy.primaryCategoryId,
      executionType: definition.execution.type,
    });
    expect(presentation?.toolId).toBe('json-validator');
  });

  it('returns null explicitly for unknown tools', () => {
    expect(getToolPresentation('missing-tool')).toBeNull();
  });
});
