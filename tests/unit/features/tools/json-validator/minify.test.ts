import { describe, expect, it, vi } from 'vitest';

import { minifyJson } from '@/features/tools/developer/json-validator/engine';

import { FORMATTED_FOR_MINIFY } from './fixtures';

describe('json validator engine minification', () => {
  it('removes unnecessary whitespace from formatted JSON', () => {
    expect(minifyJson(FORMATTED_FOR_MINIFY)).toEqual({
      ok: true,
      value: {
        a: 1,
        b: [true, null],
      },
      output: '{"a":1,"b":[true,null]}',
    });
  });

  it('minifies primitives deterministically', () => {
    expect(minifyJson('"hello"')).toEqual({
      ok: true,
      value: 'hello',
      output: '"hello"',
    });
    expect(minifyJson('true')).toEqual({
      ok: true,
      value: true,
      output: 'true',
    });
    expect(minifyJson('null')).toEqual({
      ok: true,
      value: null,
      output: 'null',
    });
  });

  it('returns failure without output for invalid and empty input', () => {
    const invalid = minifyJson("{'a':1}");
    const empty = minifyJson('\n\t');

    expect(invalid.ok).toBe(false);
    expect(empty).toEqual({
      ok: false,
      error: {
        code: 'EMPTY_INPUT',
      },
    });

    if (!invalid.ok) {
      expect(invalid.error.code).toBe('SYNTAX_ERROR');
      expect('output' in invalid).toBe(false);
    }

    if (!empty.ok) {
      expect('output' in empty).toBe(false);
    }
  });

  it('parses only once during minification', () => {
    const parseSpy = vi.spyOn(JSON, 'parse');

    try {
      minifyJson(FORMATTED_FOR_MINIFY);

      expect(parseSpy).toHaveBeenCalledTimes(1);
    } finally {
      parseSpy.mockRestore();
    }
  });
});
