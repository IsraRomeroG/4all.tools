import type { JsonValidatorMessages } from './types';

export const en = {
  input: {
    label: 'Input JSON',
    placeholder: 'Paste JSON here',
    help: 'Validate, format, or minify standard JSON locally in your browser.',
  },
  actions: {
    label: 'JSON actions',
    validate: 'Validate JSON',
    format: 'Format JSON',
    minify: 'Minify JSON',
    copy: 'Copy',
    clear: 'Clear',
  },
  status: {
    idle: 'Ready to validate JSON.',
    valid: 'Valid JSON',
    invalid: 'Invalid JSON',
    empty: 'Enter JSON before running this action.',
    formatted: 'JSON formatted with two-space indentation.',
    minified: 'JSON minified.',
    copied: 'JSON copied to the clipboard.',
    copyEmpty: 'There is no JSON to copy.',
    copyFailed: 'JSON could not be copied.',
    cleared: 'JSON input cleared.',
  },
  error: {
    syntax: 'Invalid JSON syntax.',
    atLineColumn: 'Line {line}, column {column}.',
  },
} as const satisfies JsonValidatorMessages;
