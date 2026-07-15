import { readFile } from 'node:fs/promises';

import { describe, expect, it, vi } from 'vitest';

import {
  runJsonValidatorAction,
  type ClipboardWriter,
  type JsonValidatorClientContext,
} from '@/features/tools/developer/json-validator/client';
import { getJsonValidatorMessages } from '@/features/tools/developer/json-validator/messages/registry';

const PROJECT_ROOT = new URL('../../../../../', import.meta.url);

describe('json validator client adapter', () => {
  it('validates valid and invalid input without replacing editor text', async () => {
    const valid = context('{"a":1}');
    await runJsonValidatorAction('validate', valid);

    expect(valid.input.value).toBe('{"a":1}');
    expect(valid.root.dataset.state).toBe('valid');
    expect(valid.status.textContent).toBe('Valid JSON');

    const invalid = context('{"a":1,}');
    await runJsonValidatorAction('validate', invalid);

    expect(invalid.input.value).toBe('{"a":1,}');
    expect(invalid.root.dataset.state).toBe('invalid');
    expect(invalid.status.textContent).toContain('Invalid JSON syntax.');
  });

  it('formats valid input and preserves invalid input', async () => {
    const valid = context('{"a":1,"b":[true,null]}');
    await runJsonValidatorAction('format', valid);

    expect(valid.input.value).toBe(`{
  "a": 1,
  "b": [
    true,
    null
  ]
}`);
    expect(valid.root.dataset.state).toBe('success');
    expect(valid.status.textContent).toBe(
      'JSON formatted with two-space indentation.',
    );

    const invalid = context('{"a":1,}');
    await runJsonValidatorAction('format', invalid);

    expect(invalid.input.value).toBe('{"a":1,}');
    expect(invalid.root.dataset.state).toBe('invalid');
  });

  it('minifies valid input and preserves invalid input', async () => {
    const valid = context(`{
  "a": 1,
  "b": [
    true,
    null
  ]
}`);
    await runJsonValidatorAction('minify', valid);

    expect(valid.input.value).toBe('{"a":1,"b":[true,null]}');
    expect(valid.status.textContent).toBe('JSON minified.');

    const invalid = context("{'a':1}");
    await runJsonValidatorAction('minify', invalid);

    expect(invalid.input.value).toBe("{'a':1}");
    expect(invalid.status.textContent).toContain('Invalid JSON syntax.');
  });

  it('handles copy success, empty input, unavailable clipboard, and rejected clipboard writes', async () => {
    const clipboard = {
      writeText: vi.fn<ClipboardWriter['writeText']>().mockResolvedValue(),
    };
    const success = context('{"a":1}', clipboard);
    await runJsonValidatorAction('copy', success);

    expect(clipboard.writeText).toHaveBeenCalledWith('{"a":1}');
    expect(success.status.textContent).toBe('JSON copied to the clipboard.');

    const empty = context('');
    await runJsonValidatorAction('copy', empty);
    expect(empty.status.textContent).toBe('There is no JSON to copy.');

    const unavailable = context('{"a":1}');
    await runJsonValidatorAction('copy', unavailable);
    expect(unavailable.status.textContent).toBe('JSON could not be copied.');

    const rejected = context('{"a":1}', {
      writeText: vi.fn<ClipboardWriter['writeText']>().mockRejectedValue(
        new Error('denied'),
      ),
    });
    await runJsonValidatorAction('copy', rejected);
    expect(rejected.status.textContent).toBe('JSON could not be copied.');
  });

  it('clears input, clears diagnostics, and returns focus to the editor', async () => {
    const focus = vi.fn();
    const subject = context('{"a":1}');
    subject.input.focus = focus;
    subject.diagnostic.textContent = 'previous diagnostic';
    subject.diagnostic.hidden = false;

    await runJsonValidatorAction('clear', subject);

    expect(subject.input.value).toBe('');
    expect(subject.status.textContent).toBe('JSON input cleared.');
    expect(subject.diagnostic.textContent).toBe('');
    expect(subject.diagnostic.hidden).toBe(true);
    expect(focus).toHaveBeenCalledOnce();
  });

  it('keeps the client adapter free of network, submission, logging, and unsafe HTML APIs', async () => {
    const source = await readFile(
      new URL(
        'src/features/tools/developer/json-validator/client.ts',
        PROJECT_ROOT,
      ),
      'utf8',
    );

    expect(source).not.toContain('fetch');
    expect(source).not.toContain('XMLHttpRequest');
    expect(source).not.toContain('sendBeacon');
    expect(source).not.toContain('submit(');
    expect(source).not.toContain('console.');
    expect(source).not.toContain('innerHTML');
    expect(source).not.toContain('insertAdjacentHTML');
  });
});

function context(
  inputValue: string,
  clipboard?: ClipboardWriter,
): JsonValidatorClientContext & {
  input: { value: string; focus?: () => void };
  status: { textContent: string | null };
  diagnostic: { textContent: string | null; hidden?: boolean };
} {
  return {
    root: {
      dataset: {},
    },
    input: {
      value: inputValue,
    },
    status: {
      textContent: null,
    },
    diagnostic: {
      textContent: null,
      hidden: true,
    },
    messages: getJsonValidatorMessages('en'),
    ...(clipboard === undefined ? {} : { clipboard }),
  };
}
