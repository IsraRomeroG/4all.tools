import { describe, expect, it } from 'vitest';

import { getToolMessages } from '@/features/tools/message-registry';
import { getJsonValidatorMessages } from '@/features/tools/developer/json-validator/messages/registry';

describe('json validator messages', () => {
  it('returns exact feature dictionaries for all supported locales without fallback', () => {
    expect(getJsonValidatorMessages('en').actions.validate).toBe('Validate JSON');
    expect(getJsonValidatorMessages('es').actions.validate).toBe('Validar JSON');
    expect(getJsonValidatorMessages('pt').actions.validate).toBe('Validar JSON');
    expect(getJsonValidatorMessages('fr').actions.validate).toBe('Valider le JSON');
  });

  it('registers json-validator messages through the feature message registry', () => {
    expect(getToolMessages('json-validator', 'es')).toBe(
      getJsonValidatorMessages('es'),
    );
    expect(getToolMessages('missing-tool', 'es')).toBeNull();
  });

  it('keeps all locale dictionaries on the same structural contract', () => {
    const expectedShape = JSON.stringify(Object.keys(getJsonValidatorMessages('en')));

    for (const locale of ['es', 'pt', 'fr'] as const) {
      expect(JSON.stringify(Object.keys(getJsonValidatorMessages(locale)))).toBe(
        expectedShape,
      );
      expect(Object.keys(getJsonValidatorMessages(locale).input)).toEqual([
        'label',
        'placeholder',
        'help',
      ]);
      expect(Object.keys(getJsonValidatorMessages(locale).actions)).toEqual([
        'label',
        'validate',
        'format',
        'minify',
        'copy',
        'clear',
      ]);
      expect(Object.keys(getJsonValidatorMessages(locale).status)).toEqual([
        'idle',
        'valid',
        'invalid',
        'empty',
        'formatted',
        'minified',
        'copied',
        'copyEmpty',
        'copyFailed',
        'cleared',
      ]);
      expect(Object.keys(getJsonValidatorMessages(locale).error)).toEqual([
        'syntax',
        'atLineColumn',
      ]);
    }
  });
});
