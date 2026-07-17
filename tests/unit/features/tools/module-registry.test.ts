import { readdir, readFile } from 'node:fs/promises';
import type { Dirent } from 'node:fs';

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import type { ToolDefinition } from '@/domain/tools';
import { SUPPORTED_LOCALES } from '@/i18n/types';
import {
  DuplicateToolModuleError,
  MissingToolModuleError,
  MissingToolModuleComponentError,
  MissingToolModuleMessagesError,
  TOOL_MODULES,
  ToolModuleIdentityMismatchError,
  createToolModuleRegistry,
  getAllToolModules,
  getToolModule,
  jsonValidatorModule,
} from '@/features/tools/module-registry';

const PROJECT_ROOT = new URL('../../../../', import.meta.url);

describe('tool module registry', () => {
  it('registers JSON Validator as one definition/component/messages module', () => {
    expect(Object.keys(TOOL_MODULES)).toEqual(['json-validator']);
    expect(TOOL_MODULES['json-validator']).toBe(jsonValidatorModule);

    const module = getToolModule('json-validator');

    expect(module.definition.id).toBe('json-validator');
    expect(module.component).toBeTypeOf('function');
    expect(module.getMessages('en')).toMatchObject({
      input: {
        label: 'Input JSON',
      },
      actions: {
        validate: 'Validate JSON',
      },
    });
    expect(getAllToolModules().map((registered) => registered.definition.id))
      .toEqual(['json-validator']);
  });

  it('resolves messages for every supported locale without fallback', () => {
    const module = getToolModule('json-validator');
    const messagesByLocale = Object.fromEntries(
      SUPPORTED_LOCALES.map((locale) => [
        locale,
        module.getMessages(locale).actions.validate,
      ]),
    );

    expect(messagesByLocale).toEqual({
      en: 'Validate JSON',
      es: 'Validar JSON',
      pt: 'Validar JSON',
      fr: 'Valider le JSON',
    });
  });

  it('fails explicitly for unknown, duplicate, mismatched, and missing-message modules', () => {
    expect(() => getToolModule('missing-tool')).toThrow(MissingToolModuleError);

    expect(() =>
      createToolModuleRegistry([
        { toolId: 'json-validator', module: jsonValidatorModule },
        { toolId: 'json-validator', module: jsonValidatorModule },
      ]),
    ).toThrow(DuplicateToolModuleError);

    expect(() =>
      createToolModuleRegistry([
        { toolId: 'other-tool', module: jsonValidatorModule },
      ]),
    ).toThrow(ToolModuleIdentityMismatchError);

    expect(() =>
      createToolModuleRegistry([
        {
          toolId: 'json-validator',
          module: {
            ...jsonValidatorModule,
            getMessages: () => null as never,
          },
        },
      ]),
    ).toThrow(MissingToolModuleMessagesError);

    expect(() =>
      createToolModuleRegistry([
        {
          toolId: 'json-validator',
          module: {
            ...jsonValidatorModule,
            component: undefined as never,
          },
        },
      ]),
    ).toThrow(MissingToolModuleComponentError);
  });

  it('preserves existing taxonomy validation for module definitions', () => {
    const mismatchedDefinition = {
      ...jsonValidatorModule.definition,
      rootCategoryId: 'data-formats',
    } as const satisfies ToolDefinition;

    expect(() =>
      createToolModuleRegistry([
        {
          toolId: 'json-validator',
          module: {
            ...jsonValidatorModule,
            definition: mismatchedDefinition,
          },
        },
      ]),
    ).toThrow();
  });

  it('renders every registered component with messages for every supported locale', async () => {
    const container = await AstroContainer.create();

    for (const module of getAllToolModules()) {
      for (const locale of SUPPORTED_LOCALES) {
        const html = await container.renderToString(module.component, {
          partial: true,
          props: {
            locale,
            messages: module.getMessages(locale),
            instanceId: `${module.definition.id}-${locale}-registry-test`,
          },
        });

        expect(html).toContain(`data-locale="${locale}"`);
        expect(html.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('keeps framework imports out of domain and keeps compatibility helpers delegated', async () => {
    const domainSources = await readSourcesUnder('src/domain');
    const componentRegistry = await readProjectFile(
      'src/features/tools/component-registry.ts',
    );
    const messageRegistry = await readProjectFile(
      'src/features/tools/message-registry.ts',
    );
    const moduleRegistry = await readProjectFile(
      'src/features/tools/module-registry.ts',
    );

    expect(moduleRegistry).toContain('jsonValidatorModule');
    expect(componentRegistry).toContain('getToolModule');
    expect(componentRegistry).not.toContain('JsonValidatorTool');
    expect(componentRegistry).not.toContain('astro/runtime/server');
    expect(messageRegistry).toContain('findToolModule');
    expect(messageRegistry).not.toContain('getJsonValidatorMessages');

    for (const source of domainSources) {
      expect(source).not.toContain('.astro');
      expect(source).not.toContain('astro/runtime/server');
    }
  });
});

async function readProjectFile(path: string): Promise<string> {
  return readFile(new URL(path, PROJECT_ROOT), 'utf8');
}

async function readSourcesUnder(path: string): Promise<readonly string[]> {
  const files = await collectFiles(new URL(`${path}/`, PROJECT_ROOT));

  return Promise.all(files.map((file) => readFile(file, 'utf8')));
}

async function collectFiles(directory: URL): Promise<readonly URL[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => collectEntry(directory, entry)));

  return files.flat();
}

async function collectEntry(directory: URL, entry: Dirent): Promise<readonly URL[]> {
  const child = new URL(entry.name, directory);

  if (entry.isDirectory()) {
    return collectFiles(new URL(`${entry.name}/`, directory));
  }

  return entry.isFile() ? [child] : [];
}
