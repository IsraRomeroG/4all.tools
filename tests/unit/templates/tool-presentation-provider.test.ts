import { describe, expect, it } from 'vitest';

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

  it('returns null explicitly for unknown tools', () => {
    expect(getToolPresentation('missing-tool')).toBeNull();
  });
});
