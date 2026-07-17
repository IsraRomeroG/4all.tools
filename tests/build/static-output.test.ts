import { access, readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import type { Locale } from '@/i18n/types';

const DIST_ROOT = new URL('../../dist/', import.meta.url);

interface ExpectedBuiltToolPage {
  readonly locale: Locale;
  readonly relativeFile: string;
  readonly htmlLang: string;
  readonly title: string;
  readonly inputLabel: string;
  readonly validateLabel: string;
  readonly editorialMarker: string;
  readonly instanceId: string;
  readonly forbiddenMetadataFragments: readonly string[];
}

const EXPECTED_JSON_VALIDATOR_PAGES = [
  {
    locale: 'en',
    relativeFile: 'developer/json-validator/index.html',
    htmlLang: 'en',
    title: 'JSON Validator',
    inputLabel: 'Input JSON',
    validateLabel: 'Validate JSON',
    editorialMarker: 'How to use the JSON Validator',
    instanceId: 'tool-json-validator-en',
    forbiddenMetadataFragments: [
      '/en/developer/json-validator/',
      'developer/data-formats/json/json-validator',
    ],
  },
  {
    locale: 'es',
    relativeFile: 'es/desarrollo/validador-json/index.html',
    htmlLang: 'es',
    title: 'Validador JSON',
    inputLabel: 'JSON de entrada',
    validateLabel: 'Validar JSON',
    editorialMarker: 'Cómo usar el Validador JSON',
    instanceId: 'tool-json-validator-es',
    forbiddenMetadataFragments: [
      '/en/developer/json-validator/',
      'desarrollo/formatos-de-datos/json/validador-json',
    ],
  },
  {
    locale: 'pt',
    relativeFile: 'pt/desenvolvedor/validador-json/index.html',
    htmlLang: 'pt',
    title: 'Validador JSON',
    inputLabel: 'JSON de entrada',
    validateLabel: 'Validar JSON',
    editorialMarker: 'Como usar o Validador JSON',
    instanceId: 'tool-json-validator-pt',
    forbiddenMetadataFragments: [
      '/en/developer/json-validator/',
      'desenvolvedor/formatos-de-dados/json/validador-json',
    ],
  },
  {
    locale: 'fr',
    relativeFile: 'fr/developpement/validateur-json/index.html',
    htmlLang: 'fr',
    title: 'Validateur JSON',
    inputLabel: 'JSON d’entrée',
    validateLabel: 'Valider le JSON',
    editorialMarker: 'Comment utiliser le Validateur JSON',
    instanceId: 'tool-json-validator-fr',
    forbiddenMetadataFragments: [
      '/en/developer/json-validator/',
      'developpement/formats-de-donnees/json/validateur-json',
    ],
  },
] as const satisfies readonly ExpectedBuiltToolPage[];

const FORBIDDEN_OUTPUTS = [
  'en/developer/json-validator/index.html',
  'developer/data-formats/json/json-validator/index.html',
  'es/desarrollo/formatos-de-datos/json/validador-json/index.html',
  'pt/desenvolvedor/formatos-de-dados/json/validador-json/index.html',
  'fr/developpement/formats-de-donnees/json/validateur-json/index.html',
  'developer/json-validator.html',
  'es/desarrollo/validador-json.html',
  'pt/desenvolvedor/validador-json.html',
  'fr/developpement/validateur-json.html',
] as const;

describe('static build output', () => {
  it('generates the root page through the home template', async () => {
    const html = await readDistFile('index.html');

    expect(html).toContain('data-template="home"');
  });

  for (const expected of EXPECTED_JSON_VALIDATOR_PAGES) {
    it(`generates localized JSON Validator output for ${expected.locale}`, async () => {
      const html = await readDistFile(expected.relativeFile);

      expect(html).toContain(`<html lang="${expected.htmlLang}"`);
      expect(html).toContain(`<title>${expected.title}</title>`);
      expect(html).toContain(expected.title);
      expect(html).toContain(expected.inputLabel);
      expect(html).toContain(expected.validateLabel);
      expect(html).toContain(expected.editorialMarker);
      expect(html).toContain('data-json-validator');
      expect(html).toContain(`data-locale="${expected.locale}"`);
      expect(html).toContain('data-template-identity="json-validator"');
      expect(html).toContain(`id="${expected.instanceId}-help"`);
      expect(html).toContain(`id="${expected.instanceId}-status"`);

      for (const forbiddenFragment of expected.forbiddenMetadataFragments) {
        expect(html).not.toContain(forbiddenFragment);
      }
    });
  }

  for (const relativeFile of FORBIDDEN_OUTPUTS) {
    it(`does not emit forbidden output ${relativeFile}`, async () => {
      await expectDistFileMissing(relativeFile);
    });
  }
});

async function readDistFile(relativeFile: string): Promise<string> {
  try {
    return await readFile(toDistUrl(relativeFile), 'utf8');
  } catch (error) {
    throw new Error(
      `Expected build output "${relativeFile}" to exist and be readable as UTF-8 HTML.`,
      { cause: error },
    );
  }
}

async function expectDistFileMissing(relativeFile: string): Promise<void> {
  try {
    await access(toDistUrl(relativeFile));
  } catch (error) {
    if (isMissingFileError(error)) {
      return;
    }

    throw new Error(`Could not verify forbidden build output "${relativeFile}".`, {
      cause: error,
    });
  }

  throw new Error(`Forbidden build output "${relativeFile}" exists.`);
}

function toDistUrl(relativeFile: string): URL {
  return new URL(relativeFile, DIST_ROOT);
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'ENOENT'
  );
}
