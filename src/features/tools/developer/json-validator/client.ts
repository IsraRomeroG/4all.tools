import type { JsonValidationError } from './types';
import { formatJson, minifyJson, validateJson } from './engine';
import type { JsonValidatorMessages } from './messages/types';

export type JsonValidatorAction =
  | 'validate'
  | 'format'
  | 'minify'
  | 'copy'
  | 'clear';

export interface ClipboardWriter {
  writeText(text: string): Promise<void>;
}

export interface JsonValidatorClientContext {
  readonly root: {
    readonly dataset: Record<string, string | undefined>;
  };
  readonly input: {
    value: string;
    focus?: () => void;
  };
  readonly status: {
    textContent: string | null;
  };
  readonly diagnostic?: {
    textContent: string | null;
    hidden?: boolean | string;
  };
  readonly messages: JsonValidatorMessages;
  readonly clipboard?: ClipboardWriter;
}

type RequiredJsonValidatorElement =
  | HTMLTextAreaElement
  | HTMLButtonElement
  | HTMLElement;

export function initializeAllJsonValidators(): void {
  document
    .querySelectorAll<HTMLElement>('[data-json-validator]')
    .forEach(initializeJsonValidator);
}

export function initializeJsonValidator(root: HTMLElement): void {
  if (root.dataset.initialized === 'true') {
    return;
  }

  const input = getRequiredElement(
    root,
    '[data-json-input]',
    HTMLTextAreaElement,
    'JSON Validator input element is missing.',
  );
  const status = getRequiredElement(
    root,
    '[data-json-status]',
    HTMLElement,
    'JSON Validator status element is missing.',
  );
  const diagnostic = root.querySelector<HTMLElement>('[data-json-diagnostic]');
  const messages = getMessagesFromRoot(root);
  const buttons = root.querySelectorAll<HTMLButtonElement>('[data-action]');

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const action = parseAction(button.dataset.action);

      if (!action) {
        return;
      }

      void runJsonValidatorAction(action, {
        root,
        input,
        status,
        ...(diagnostic === null ? {} : { diagnostic }),
        messages,
        ...createClipboardContext(),
      });
    });
  }

  root.dataset.initialized = 'true';
}

export async function runJsonValidatorAction(
  action: JsonValidatorAction,
  context: JsonValidatorClientContext,
): Promise<void> {
  switch (action) {
    case 'validate':
      validateCurrentInput(context);
      return;

    case 'format':
      formatCurrentInput(context);
      return;

    case 'minify':
      minifyCurrentInput(context);
      return;

    case 'copy':
      await copyCurrentInput(context);
      return;

    case 'clear':
      clearCurrentInput(context);
      return;
  }
}

function validateCurrentInput(context: JsonValidatorClientContext): void {
  const result = validateJson(context.input.value);

  if (result.valid) {
    setStatus(context, 'valid', context.messages.status.valid);
    return;
  }

  setValidationError(context, result.error);
}

function formatCurrentInput(context: JsonValidatorClientContext): void {
  const result = formatJson(context.input.value);

  if (result.ok) {
    context.input.value = result.output;
    setStatus(context, 'success', context.messages.status.formatted);
    return;
  }

  setValidationError(context, result.error);
}

function minifyCurrentInput(context: JsonValidatorClientContext): void {
  const result = minifyJson(context.input.value);

  if (result.ok) {
    context.input.value = result.output;
    setStatus(context, 'success', context.messages.status.minified);
    return;
  }

  setValidationError(context, result.error);
}

async function copyCurrentInput(
  context: JsonValidatorClientContext,
): Promise<void> {
  if (context.input.value.length === 0) {
    setStatus(context, 'idle', context.messages.status.copyEmpty);
    return;
  }

  if (!context.clipboard) {
    setStatus(context, 'invalid', context.messages.status.copyFailed);
    return;
  }

  try {
    await context.clipboard.writeText(context.input.value);
    setStatus(context, 'success', context.messages.status.copied);
  } catch {
    setStatus(context, 'invalid', context.messages.status.copyFailed);
  }
}

function clearCurrentInput(context: JsonValidatorClientContext): void {
  context.input.value = '';
  setStatus(context, 'idle', context.messages.status.cleared);
  context.input.focus?.();
}

function setValidationError(
  context: JsonValidatorClientContext,
  error: JsonValidationError,
): void {
  if (error.code === 'EMPTY_INPUT') {
    setStatus(context, 'invalid', context.messages.status.empty);
    return;
  }

  setStatus(context, 'invalid', describeSyntaxError(context.messages, error));
}

function describeSyntaxError(
  messages: JsonValidatorMessages,
  error: JsonValidationError,
): string {
  if (error.line === undefined || error.column === undefined) {
    return messages.error.syntax;
  }

  return `${messages.error.syntax} ${messages.error.atLineColumn
    .replace('{line}', String(error.line))
    .replace('{column}', String(error.column))}`;
}

function setStatus(
  context: JsonValidatorClientContext,
  state: string,
  message: string,
): void {
  context.root.dataset.state = state;
  context.status.textContent = message;
  clearDiagnostic(context);
}

function clearDiagnostic(context: JsonValidatorClientContext): void {
  if (!context.diagnostic) {
    return;
  }

  context.diagnostic.textContent = '';
  context.diagnostic.hidden = true;
}

function getClipboardWriter(): ClipboardWriter | undefined {
  return navigator.clipboard;
}

function createClipboardContext(): { readonly clipboard?: ClipboardWriter } {
  const clipboard = getClipboardWriter();

  return clipboard === undefined ? {} : { clipboard };
}

function parseAction(value: string | undefined): JsonValidatorAction | null {
  switch (value) {
    case 'validate':
    case 'format':
    case 'minify':
    case 'copy':
    case 'clear':
      return value;

    default:
      return null;
  }
}

function getMessagesFromRoot(root: HTMLElement): JsonValidatorMessages {
  return {
    input: {
      label: getRequiredData(root, 'messageInputLabel'),
      placeholder: getRequiredData(root, 'messageInputPlaceholder'),
      help: getRequiredData(root, 'messageInputHelp'),
    },
    actions: {
      label: getRequiredData(root, 'messageActionsLabel'),
      validate: getRequiredData(root, 'messageActionValidate'),
      format: getRequiredData(root, 'messageActionFormat'),
      minify: getRequiredData(root, 'messageActionMinify'),
      copy: getRequiredData(root, 'messageActionCopy'),
      clear: getRequiredData(root, 'messageActionClear'),
    },
    status: {
      idle: getRequiredData(root, 'messageStatusIdle'),
      valid: getRequiredData(root, 'messageStatusValid'),
      invalid: getRequiredData(root, 'messageStatusInvalid'),
      empty: getRequiredData(root, 'messageStatusEmpty'),
      formatted: getRequiredData(root, 'messageStatusFormatted'),
      minified: getRequiredData(root, 'messageStatusMinified'),
      copied: getRequiredData(root, 'messageStatusCopied'),
      copyEmpty: getRequiredData(root, 'messageStatusCopyEmpty'),
      copyFailed: getRequiredData(root, 'messageStatusCopyFailed'),
      cleared: getRequiredData(root, 'messageStatusCleared'),
    },
    error: {
      syntax: getRequiredData(root, 'messageErrorSyntax'),
      atLineColumn: getRequiredData(root, 'messageErrorAtLineColumn'),
    },
  };
}

function getRequiredData(root: HTMLElement, key: string): string {
  const value = root.dataset[key];

  if (value === undefined || value.length === 0) {
    throw new Error(`JSON Validator data message ${key} is missing.`);
  }

  return value;
}

function getRequiredElement<TElement extends RequiredJsonValidatorElement>(
  root: HTMLElement,
  selector: string,
  constructor: { new (...args: never[]): TElement },
  message: string,
): TElement {
  const element = root.querySelector(selector);

  if (!(element instanceof constructor)) {
    throw new Error(message);
  }

  return element;
}
