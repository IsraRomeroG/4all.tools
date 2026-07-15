import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import {
  deriveJsonErrorDetails,
  getLocationFromPosition,
  validateJson,
} from '@/features/tools/developer/json-validator/engine';
import { JSON_ENGINE_SEMANTIC_LIMITATIONS } from '@/features/tools/developer/json-validator/types';

import {
  INVALID_JSON_FIXTURES,
  VALID_JSON_FIXTURES,
} from './fixtures';

const PROJECT_ROOT = new URL('../../../../../', import.meta.url);

describe('json validator engine validation', () => {
  for (const fixture of VALID_JSON_FIXTURES) {
    it(`accepts valid ${fixture.name} JSON`, () => {
      expect(validateJson(fixture.input)).toEqual({
        valid: true,
        value: fixture.value,
      });
    });
  }

  it('returns a stable empty-input error for whitespace-only input', () => {
    expect(validateJson(' \n\t ')).toEqual({
      valid: false,
      error: {
        code: 'EMPTY_INPUT',
      },
    });
  });

  for (const fixture of INVALID_JSON_FIXTURES) {
    it(`returns a stable syntax error for ${fixture.name}`, () => {
      const result = validateJson(fixture.input);

      expect(result.valid).toBe(false);

      if (!result.valid) {
        expect(result.error.code).toBe('SYNTAX_ERROR');
        expect(result.error).not.toHaveProperty('localizedMessage');
      }
    });
  }

  it('does not throw for ordinary invalid input', () => {
    expect(() => validateJson('{"name":"4all.tools",}')).not.toThrow();
    expect(() => validateJson("{'name':'4all.tools'}")).not.toThrow();
    expect(() => validateJson('undefined')).not.toThrow();
  });

  it('does not mutate the input string', () => {
    const input = '{"name":"4all.tools"}';
    const snapshot = input.slice();

    validateJson(input);

    expect(input).toBe(snapshot);
  });

  it('derives optional parser diagnostics from controlled messages', () => {
    expect(
      deriveJsonErrorDetails('{\n  "a": 1,\n  "b":\n}', new Error('Unexpected token } at position 19')),
    ).toEqual({
      code: 'SYNTAX_ERROR',
      rawMessage: 'Unexpected token } at position 19',
      position: 19,
      line: 4,
      column: 1,
    });
  });

  it('omits optional parser diagnostics when they are not confidently known', () => {
    expect(deriveJsonErrorDetails('{"a":}', new Error('Bad JSON'))).toEqual({
      code: 'SYNTAX_ERROR',
      rawMessage: 'Bad JSON',
    });
    expect(getLocationFromPosition('{"a":}', 99)).toBeUndefined();
  });

  it('documents JavaScript JSON semantic limitations without claiming extras', () => {
    expect(JSON_ENGINE_SEMANTIC_LIMITATIONS.join(' ')).toContain(
      'JavaScript JSON.parse',
    );
    expect(JSON_ENGINE_SEMANTIC_LIMITATIONS.join(' ')).toContain(
      'Large integers may lose precision',
    );
    expect(JSON_ENGINE_SEMANTIC_LIMITATIONS.join(' ')).toContain(
      'Duplicate object keys are accepted',
    );
  });

  it('keeps engine modules free of DOM, Astro, locale, network, and eval dependencies', async () => {
    const engineFiles = [
      'src/features/tools/developer/json-validator/engine/validate.ts',
      'src/features/tools/developer/json-validator/engine/format.ts',
      'src/features/tools/developer/json-validator/engine/minify.ts',
      'src/features/tools/developer/json-validator/engine/error-details.ts',
    ] as const;
    const sources = await Promise.all(
      engineFiles.map((path) => readFile(new URL(path, PROJECT_ROOT), 'utf8')),
    );
    const combinedSource = sources.join('\n');

    expect(combinedSource).not.toContain('window');
    expect(combinedSource).not.toContain('document');
    expect(combinedSource).not.toContain('HTMLElement');
    expect(combinedSource).not.toContain('Astro');
    expect(combinedSource).not.toContain('@/i18n');
    expect(combinedSource).not.toContain('fetch');
    expect(combinedSource).not.toContain('XMLHttpRequest');
    expect(combinedSource).not.toContain('eval(');
    expect(combinedSource).not.toContain('Function(');
  });
});
