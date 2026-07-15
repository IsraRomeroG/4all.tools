import { describe, expect, it, vi } from 'vitest';

import { formatJson } from '@/features/tools/developer/json-validator/engine';

import {
  ARRAY_JSON_FORMATTED,
  NESTED_JSON_FORMATTED,
  NESTED_JSON_INPUT,
} from './fixtures';

describe('json validator engine formatting', () => {
  it('formats compact objects with two-space indentation', () => {
    expect(formatJson('{"a":1,"b":[true,null]}')).toEqual({
      ok: true,
      value: {
        a: 1,
        b: [true, null],
      },
      output: `{
  "a": 1,
  "b": [
    true,
    null
  ]
}`,
    });
  });

  it('formats nested content deterministically', () => {
    expect(formatJson(NESTED_JSON_INPUT)).toEqual({
      ok: true,
      value: {
        name: '4all.tools',
        active: true,
        items: [
          {
            kind: 'tool',
            count: 2,
          },
          null,
        ],
      },
      output: NESTED_JSON_FORMATTED,
    });
  });

  it('formats arrays and primitives as valid JSON output', () => {
    expect(formatJson('[1,"two",false,null]')).toEqual({
      ok: true,
      value: [1, 'two', false, null],
      output: ARRAY_JSON_FORMATTED,
    });
    expect(formatJson('"hello"')).toEqual({
      ok: true,
      value: 'hello',
      output: '"hello"',
    });
    expect(formatJson('42')).toEqual({
      ok: true,
      value: 42,
      output: '42',
    });
  });

  it('returns failure without output for invalid and empty input', () => {
    const invalid = formatJson('{"a":1,}');
    const empty = formatJson(' ');

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

  it('parses only once during formatting', () => {
    const parseSpy = vi.spyOn(JSON, 'parse');

    try {
      formatJson('{"a":1}');

      expect(parseSpy).toHaveBeenCalledTimes(1);
    } finally {
      parseSpy.mockRestore();
    }
  });
});
