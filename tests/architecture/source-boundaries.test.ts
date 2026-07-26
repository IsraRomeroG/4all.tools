import { describe, expect, it } from 'vitest';

import {
  validateSourceBoundaries,
} from '@/validation/architecture';

describe('architecture source namespace validation', () => {
  it('keeps src/views forbidden without inspecting source imports', () => {
    expect(validateSourceBoundaries({ forbiddenNamespaceExists: true })).toEqual([
      expect.objectContaining({
        code: 'FORBIDDEN_SOURCE_NAMESPACE',
        scope: 'source-boundary',
        entityKey: 'src/views',
      }),
    ]);
  });

  it('passes when the forbidden namespace is absent', () => {
    expect(validateSourceBoundaries({ forbiddenNamespaceExists: false })).toEqual([]);
  });
});
