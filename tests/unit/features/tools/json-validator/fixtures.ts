import type { JsonValue } from '@/features/tools/developer/json-validator/types';

export const VALID_JSON_FIXTURES = [
  {
    name: 'empty object',
    input: '{}',
    value: {},
  },
  {
    name: 'object',
    input: '{"name":"4all.tools","active":true}',
    value: {
      name: '4all.tools',
      active: true,
    },
  },
  {
    name: 'empty array',
    input: '[]',
    value: [],
  },
  {
    name: 'array',
    input: '[1,"two",false,null]',
    value: [1, 'two', false, null],
  },
  {
    name: 'string primitive',
    input: '"hello"',
    value: 'hello',
  },
  {
    name: 'number primitive',
    input: '42',
    value: 42,
  },
  {
    name: 'boolean primitive',
    input: 'true',
    value: true,
  },
  {
    name: 'null primitive',
    input: 'null',
    value: null,
  },
] as const satisfies readonly {
  readonly name: string;
  readonly input: string;
  readonly value: JsonValue;
}[];

export const INVALID_JSON_FIXTURES = [
  {
    name: 'trailing comma',
    input: '{"name":"4all.tools",}',
  },
  {
    name: 'single quotes',
    input: "{'name':'4all.tools'}",
  },
  {
    name: 'undefined',
    input: 'undefined',
  },
] as const;

export const NESTED_JSON_INPUT =
  '{"name":"4all.tools","active":true,"items":[{"kind":"tool","count":2},null]}';

export const NESTED_JSON_FORMATTED = `{
  "name": "4all.tools",
  "active": true,
  "items": [
    {
      "kind": "tool",
      "count": 2
    },
    null
  ]
}`;

export const ARRAY_JSON_FORMATTED = `[
  1,
  "two",
  false,
  null
]`;

export const FORMATTED_FOR_MINIFY = `{
  "a": 1,
  "b": [
    true,
    null
  ]
}`;
