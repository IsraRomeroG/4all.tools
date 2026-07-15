import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import type { Locale } from '@/i18n/types';

const PROJECT_ROOT = new URL('../../../', import.meta.url);
const LOCALES = ['en', 'es', 'pt', 'fr'] as const satisfies readonly Locale[];

const EXPECTED_TITLES = {
  en: 'JSON Validator',
  es: 'Validador JSON',
  pt: 'Validador JSON',
  fr: 'Validateur JSON',
} as const satisfies Record<Locale, string>;

describe('json-validator localized editorial content', () => {
  it('publishes one physical content file for each supported locale', async () => {
    for (const locale of LOCALES) {
      const content = await readToolContent(locale);
      const { frontmatter } = splitMarkdown(content);

      expect(frontmatter).toContain('toolId: json-validator');
      expect(frontmatter).toContain(`locale: ${locale}`);
      expect(frontmatter).toContain('status: published');
      expect(frontmatter).toContain(`title: ${EXPECTED_TITLES[locale]}`);
      expect(frontmatter).toContain('publishedAt: 2026-07-10');
      expect(frontmatter).toContain('relatedToolIds: []');
    }
  });

  it('keeps public route ownership out of tool content frontmatter', async () => {
    for (const locale of LOCALES) {
      const { frontmatter } = splitMarkdown(await readToolContent(locale));

      expect(frontmatter).not.toMatch(/^slug:/m);
      expect(frontmatter).not.toMatch(/^path:/m);
      expect(frontmatter).not.toContain('canonicalUrl');
      expect(frontmatter).not.toContain('hreflang');
      expect(frontmatter).not.toContain('routeStrategy');
      expect(frontmatter).not.toContain('rootCategorySlug');
      expect(frontmatter).not.toContain('/developer/json-validator/');
      expect(frontmatter).not.toContain('/desarrollo/validador-json/');
      expect(frontmatter).not.toContain('/developpement/validateur-json/');
    }
  });

  it('covers how-to, valid JSON semantics, errors, formatting, privacy, and limitations in every locale', async () => {
    for (const locale of LOCALES) {
      const { body } = splitMarkdown(await readToolContent(locale));

      expect(body).toContain('## ');
      expect(body).toContain('```json');
      expect(body).toMatch(/Format|Formatear|Formatar|Formater/);
      expect(body).toMatch(/Minify|Minificar|minificar|minifier|minification|Minificar/);
      expect(body).toContain('JSON');
      expect(body).toContain('`null`');
      expect(body).toContain('`true`');
      expect(body).toContain('`false`');
      expect(body).toContain('42');
      expect(body).toMatch(/browser|navegador|navigateur/);
      expect(body).toMatch(/not sent|no se envía|não é enviado|n’est pas envoyé/);
      expect(body).toMatch(/trailing commas|comas finales|vírgulas finais|virgules finales/);
      expect(body).toMatch(/single-quoted|comillas simples|aspas simples|apostrophes/);
      expect(body).toMatch(/JavaScript/);
      expect(body).toMatch(/duplicate|duplicadas|duplicadas|dupliquées/);
    }
  });

  it('does not reuse the English body as localized fallback content', async () => {
    const englishBody = splitMarkdown(await readToolContent('en')).body;

    for (const locale of ['es', 'pt', 'fr'] as const) {
      const body = splitMarkdown(await readToolContent(locale)).body;

      expect(body).not.toBe(englishBody);
      expect(body).not.toContain('Use the JSON Validator to check whether');
    }
  });
});

async function readToolContent(locale: Locale): Promise<string> {
  return readFile(
    new URL(
      `src/content/tools/${locale}/developer/json-validator.md`,
      PROJECT_ROOT,
    ),
    'utf8',
  );
}

function splitMarkdown(content: string): {
  readonly frontmatter: string;
  readonly body: string;
} {
  const match = /^---\r?\n(?<frontmatter>[\s\S]*?)\r?\n---\r?\n(?<body>[\s\S]*)$/u.exec(
    content,
  );

  const frontmatter = match?.groups?.frontmatter;
  const body = match?.groups?.body;

  if (frontmatter === undefined || body === undefined) {
    throw new Error('Expected Markdown file with frontmatter.');
  }

  return {
    frontmatter,
    body,
  };
}
