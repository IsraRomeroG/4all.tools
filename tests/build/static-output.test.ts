import { access, readdir, readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import type { Locale } from '@/i18n/types';

const DIST_ROOT = new URL('../../dist/', import.meta.url);

interface ExpectedBuiltToolPage {
  readonly locale: Locale;
  readonly relativeFile: string;
  readonly htmlLang: string;
  readonly title: string;
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly canonicalUrl: string;
  readonly inputLabel: string;
  readonly validateLabel: string;
  readonly editorialMarker: string;
  readonly instanceId: string;
  readonly forbiddenMetadataFragments: readonly string[];
}

interface ExpectedBuiltHomePage {
  readonly locale: Locale;
  readonly relativeFile: string;
  readonly htmlLang: string;
  readonly description: string;
  readonly canonicalUrl: string;
}

interface ExpectedBuiltBlogPage {
  readonly locale: Locale;
  readonly relativeFile: string;
  readonly htmlLang: string;
  readonly title: string;
  readonly description?: string;
  readonly canonicalUrl: string;
  readonly expectedLink: string;
}

interface ExpectedBuiltArticlePage extends ExpectedBuiltBlogPage {
  readonly articleTitle: string;
  readonly articleExcerpt: string;
  readonly section: string;
  readonly publishedAt: string;
  readonly publishedDate: string;
}

const EXPECTED_HOME_PAGES = [
  {
    locale: 'en',
    relativeFile: 'index.html',
    htmlLang: 'en',
    description: 'Useful online tools for everyday work.',
    canonicalUrl: 'https://4all.tools/',
  },
  {
    locale: 'es',
    relativeFile: 'es/index.html',
    htmlLang: 'es',
    description: 'Herramientas en línea útiles para el trabajo diario.',
    canonicalUrl: 'https://4all.tools/es/',
  },
  {
    locale: 'pt',
    relativeFile: 'pt/index.html',
    htmlLang: 'pt',
    description: 'Ferramentas online úteis para o trabalho diário.',
    canonicalUrl: 'https://4all.tools/pt/',
  },
  {
    locale: 'fr',
    relativeFile: 'fr/index.html',
    htmlLang: 'fr',
    description: 'Outils en ligne utiles pour le travail quotidien.',
    canonicalUrl: 'https://4all.tools/fr/',
  },
] as const satisfies readonly ExpectedBuiltHomePage[];

const EXPECTED_JSON_VALIDATOR_PAGES = [
  {
    locale: 'en',
    relativeFile: 'developer/json-validator/index.html',
    htmlLang: 'en',
    title: 'JSON Validator',
    seoTitle: 'JSON Validator - Validate JSON Online',
    seoDescription: 'Validate JSON syntax, find parsing errors, format JSON, and minify JSON directly in your browser.',
    canonicalUrl: 'https://4all.tools/developer/json-validator/',
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
    seoTitle: 'Validador JSON - Validar JSON online',
    seoDescription: 'Valida la sintaxis JSON, encuentra errores de análisis, formatea JSON y minifica JSON directamente en tu navegador.',
    canonicalUrl: 'https://4all.tools/es/desarrollo/validador-json/',
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
    seoTitle: 'Validador JSON - Validar JSON online',
    seoDescription: 'Valide a sintaxe JSON, encontre erros de análise, formate JSON e minifique JSON diretamente no navegador.',
    canonicalUrl: 'https://4all.tools/pt/desenvolvedor/validador-json/',
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
    seoTitle: 'Validateur JSON - Valider du JSON en ligne',
    seoDescription: 'Validez la syntaxe JSON, trouvez les erreurs d’analyse, formatez JSON et minifiez JSON directement dans votre navigateur.',
    canonicalUrl: 'https://4all.tools/fr/developpement/validateur-json/',
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

const EXPECTED_JSON_VALIDATOR_ALTERNATES = [
  {
    hrefLang: 'en',
    url: 'https://4all.tools/developer/json-validator/',
  },
  {
    hrefLang: 'es',
    url: 'https://4all.tools/es/desarrollo/validador-json/',
  },
  {
    hrefLang: 'pt',
    url: 'https://4all.tools/pt/desenvolvedor/validador-json/',
  },
  {
    hrefLang: 'fr',
    url: 'https://4all.tools/fr/developpement/validateur-json/',
  },
] as const;

const EXPECTED_BREADCRUMB_LABELS = {
  en: ['Home', 'Developer Tools', 'Data Formats', 'JSON', 'JSON Validator'],
  es: ['Inicio', 'Herramientas para desarrolladores', 'Formatos de datos', 'JSON', 'Validador JSON'],
  pt: ['Início', 'Ferramentas para desenvolvedores', 'Formatos de dados', 'JSON', 'Validador JSON'],
  fr: ['Accueil', 'Outils pour développeurs', 'Formats de données', 'JSON', 'Validateur JSON'],
} as const;

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
  it('matches the exact frozen blog HTML inventory', async () => {
    const htmlFiles = await listHtmlFiles(DIST_ROOT);
    const actualBlogHtmlFiles = htmlFiles.filter(isBlogHtmlArtifact);

    expect(actualBlogHtmlFiles).toEqual([...EXPECTED_BLOG_HTML_FILES]);

    for (const pattern of BLOG_FORBIDDEN_OUTPUT_PATTERNS) {
      expect(htmlFiles.some((file) => pattern.test(file))).toBe(false);
    }
  });

  for (const expected of EXPECTED_HOME_PAGES) {
    it(`verifies localized home output for ${expected.locale}`, async () => {
      const html = await readDistFile(expected.relativeFile);
      const escapedDescription = escapeExpectedHtml(expected.description);

      expect(html).toContain(`<html lang="${expected.htmlLang}"`);
      expect(html).toContain('<title>4all.tools</title>');
      expect(html).toContain(
        `<meta name="description" content="${escapedDescription}">`,
      );
      expect(countMatches(html, /<title>/g)).toBe(1);
      expect(countMatches(html, /name="description"/g)).toBe(1);
      expect(html).toContain('<meta name="robots" content="index,follow">');
      expect(countMatches(html, /name="robots"/g)).toBe(1);
      expect(html).toContain(
        `<link rel="canonical" href="${expected.canonicalUrl}">`,
      );
      expect(countMatches(html, /rel="canonical"/g)).toBe(1);
      expect(html).toContain(
        `<meta property="og:url" content="${expected.canonicalUrl}">`,
      );
      expect(html).toContain(
        `<meta property="og:description" content="${escapedDescription}">`,
      );
      expect(countMatches(html, /rel="alternate"/g)).toBe(5);
      for (const alternate of EXPECTED_HOME_ALTERNATES) {
        expect(html).toContain(
          `<link rel="alternate" hreflang="${alternate.hrefLang}" href="${alternate.url}">`,
        );
      }
      expect(html).toContain(
        '<link rel="alternate" hreflang="x-default" href="https://4all.tools/">',
      );
      expect(html).toContain(
        `<li data-locale="${expected.locale}" data-state="current">`,
      );
      expect(html).not.toContain('/en/');
    });
  }

  it('generates the root page through the home template', async () => {
    const html = await readDistFile('index.html');

    expect(html).toContain('data-template="home"');
  });

  for (const expected of EXPECTED_JSON_VALIDATOR_PAGES) {
    it(`generates localized JSON Validator output for ${expected.locale}`, async () => {
      const html = await readDistFile(expected.relativeFile);

      expect(html).toContain(`<html lang="${expected.htmlLang}"`);
      expect(html).toContain(`<title>${expected.seoTitle}</title>`);
      expect(countMatches(html, /<title>/g)).toBe(1);
      const escapedDescription = escapeExpectedHtml(expected.seoDescription);
      expect(html).toContain(
        `<meta name="description" content="${escapedDescription}">`,
      );
      expect(countMatches(html, /name="description"/g)).toBe(1);
      expect(html).toContain('<meta name="robots" content="index,follow">');
      expect(countMatches(html, /name="robots"/g)).toBe(1);
      expect(html).toContain(
        `<link rel="canonical" href="${expected.canonicalUrl}">`,
      );
      expect(countMatches(html, /rel="canonical"/g)).toBe(1);
      expect(html).toContain(
        `<meta property="og:url" content="${expected.canonicalUrl}">`,
      );
      expect(html).toContain(
        `<meta property="og:description" content="${escapedDescription}">`,
      );
      expect(countMatches(html, /rel="alternate"/g)).toBe(5);
      for (const alternate of EXPECTED_JSON_VALIDATOR_ALTERNATES) {
        expect(html).toContain(
          `<link rel="alternate" hreflang="${alternate.hrefLang}" href="${alternate.url}">`,
        );
      }
      expect(html).toContain(
        '<link rel="alternate" hreflang="x-default" href="https://4all.tools/developer/json-validator/">',
      );
      expect(html).toContain(expected.title);
      expect(countMatches(html, /data-language-switcher/g)).toBe(1);
      expect(countMatches(html, /data-breadcrumbs/g)).toBe(1);
      expect(countMatches(html, /aria-current="page"/g)).toBe(2);
      for (const label of EXPECTED_BREADCRUMB_LABELS[expected.locale]) {
        expect(html).toContain(label);
      }
      expect(html).toContain(
        `<li data-locale="${expected.locale}" data-state="current">`,
      );
      expect(html).toContain('aria-current="page"');
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

  for (const expected of EXPECTED_BLOG_ROOT_PAGES) {
    it(`generates localized blog root output for ${expected.locale}`, async () => {
      const html = await readDistFile(expected.relativeFile);

      expect(html).toContain(`<html lang="${expected.htmlLang}"`);
      expect(html).toContain(`<title>${expected.title}</title>`);
      expect(html).toContain(
        `<meta name="description" content="${escapeExpectedHtml(expected.description ?? '')}">`,
      );
      expect(countMatches(html, /<title>/g)).toBe(1);
      expect(countMatches(html, /name="description"/g)).toBe(1);
      expect(html).toContain('<meta name="robots" content="index,follow">');
      expect(html).toContain(
        `<link rel="canonical" href="${expected.canonicalUrl}">`,
      );
      expect(html).toContain('<meta property="og:type" content="website">');
      expect(html).toContain(expected.expectedLink);
      expect(html).toContain('data-template="blog-index"');
      expect(countMatches(html, /data-language-switcher/g)).toBe(1);
      expect(countMatches(html, /data-breadcrumbs/g)).toBe(1);
      expect(countMatches(html, /rel="alternate"/g)).toBe(5);
      for (const alternate of EXPECTED_BLOG_ALTERNATES) {
        expect(html).toContain(
          `<link rel="alternate" hreflang="${alternate.hrefLang}" href="${alternate.url}">`,
        );
      }
      expect(html).toContain(
        '<link rel="alternate" hreflang="x-default" href="https://4all.tools/blog/">',
      );
      expect(html).not.toContain('/en/');
      expect(html).not.toContain('blog/blog');
    });
  }

  for (const [index, expected] of EXPECTED_BLOG_CATEGORY_PAGES.entries()) {
    it(`generates localized blog category output for ${expected.locale} ${expected.relativeFile}`, async () => {
      const html = await readDistFile(expected.relativeFile);
      const alternateUrls = EXPECTED_BLOG_CATEGORY_ALTERNATES[index % 2]!;

      expect(html).toContain(`<html lang="${expected.htmlLang}"`);
      expect(html).toContain(`<title>${expected.title}</title>`);
      expect(html).toContain('<meta name="robots" content="index,follow">');
      expect(html).toContain(
        `<link rel="canonical" href="${expected.canonicalUrl}">`,
      );
      expect(html).toContain('<meta property="og:type" content="website">');
      expect(html).toContain(expected.expectedLink);
      expect(html).toContain('data-template="blog-category"');
      expect(countMatches(html, /data-language-switcher/g)).toBe(1);
      expect(countMatches(html, /data-breadcrumbs/g)).toBe(1);
      expect(countMatches(html, /rel="alternate"/g)).toBe(5);
      for (const alternateUrl of alternateUrls) {
        expect(html).toContain(alternateUrl);
      }
      expect(html).not.toContain('/en/');
      expect(html).not.toContain('blog/blog');
    });
  }

  for (const expected of EXPECTED_BLOG_ARTICLE_PAGES) {
    it(`generates localized blog article output for ${expected.locale}`, async () => {
      const html = await readDistFile(expected.relativeFile);

      expect(html).toContain(`<html lang="${expected.htmlLang}"`);
      expect(html).toContain(`<title>${expected.title}</title>`);
      expect(html).toContain('<h1');
      expect(html).toContain(expected.articleTitle);
      expect(html).toContain(expected.articleExcerpt);
      expect(html).toContain('<meta name="robots" content="index,follow">');
      expect(html).toContain(
        `<link rel="canonical" href="${expected.canonicalUrl}">`,
      );
      expect(html).toContain('<meta property="og:type" content="article">');
      expect(html).toContain(
        `<meta property="og:url" content="${expected.canonicalUrl}">`,
      );
      expect(html).toContain(
        `<meta property="article:published_time" content="${expected.publishedAt}">`,
      );
      expect(html).toContain(
        `<meta property="article:section" content="${expected.section}">`,
      );
      expect(html).not.toContain('article:modified_time');
      expect(html).not.toContain('name="author"');
      expect(html).not.toContain('application/ld+json');
      expect(html).toContain(expected.expectedLink);
      expect(html).toContain(
        `<time datetime="${expected.publishedAt}">${expected.publishedDate}</time>`,
      );
      expect(html).toContain('data-language-switcher');
      expect(html).toContain('data-breadcrumbs');
      expect(countMatches(html, /rel="alternate"/g)).toBe(5);
      for (const alternateUrl of EXPECTED_BLOG_ARTICLE_ALTERNATES) {
        expect(html).toContain(alternateUrl);
      }
      expect(html).not.toContain('>what-is-json<');
      expect(html).not.toContain('/en/');
      expect(html).not.toContain('blog/blog');
    });
  }

  for (const relativeFile of FORBIDDEN_OUTPUTS) {
    it(`does not emit forbidden output ${relativeFile}`, async () => {
      await expectDistFileMissing(relativeFile);
    });
  }

  for (const relativeFile of BLOG_FORBIDDEN_OUTPUTS) {
    it(`does not emit forbidden blog output ${relativeFile}`, async () => {
      await expectDistFileMissing(relativeFile);
    });
  }

  it('does not synthesize a missing localized translation output', async () => {
    await expectDistFileMissing('es/desarrollo/missing-json-validator/index.html');
  });

  it('does not include the server-side content index in client bundles', async () => {
    const clientBundle = await readClientJavaScriptBundle();

    expect(clientBundle).not.toContain('createPublishedContentIndexes');
    expect(clientBundle).not.toContain('PublishedContentIndexes');
    expect(clientBundle).not.toContain('indexed-content-source');
    expect(clientBundle).not.toContain('matchedEntryIds');
  });

  it('contains no common mojibake markers in generated HTML or this fixture', async () => {
    const htmlFiles = [
      ...EXPECTED_HOME_PAGES.map((expected) => expected.relativeFile),
      ...EXPECTED_JSON_VALIDATOR_PAGES.map((expected) => expected.relativeFile),
      ...EXPECTED_BLOG_ROOT_PAGES.map((expected) => expected.relativeFile),
      ...EXPECTED_BLOG_CATEGORY_PAGES.map((expected) => expected.relativeFile),
      ...EXPECTED_BLOG_ARTICLE_PAGES.map((expected) => expected.relativeFile),
    ];
    const generatedHtml = await Promise.all(
      htmlFiles.map((relativeFile) => readDistFile(relativeFile)),
    );
    const fixtureSource = await readFile(new URL('static-output.test.ts', import.meta.url), 'utf8');

    for (const marker of MOJIBAKE_MARKERS) {
      expect(generatedHtml.join('\n')).not.toContain(marker);
      expect(fixtureSource).not.toContain(marker);
    }
  });
});

const EXPECTED_HOME_ALTERNATES = [
  { hrefLang: 'en', url: 'https://4all.tools/' },
  { hrefLang: 'es', url: 'https://4all.tools/es/' },
  { hrefLang: 'pt', url: 'https://4all.tools/pt/' },
  { hrefLang: 'fr', url: 'https://4all.tools/fr/' },
] as const;

const EXPECTED_BLOG_ALTERNATES = [
  { hrefLang: 'en', url: 'https://4all.tools/blog/' },
  { hrefLang: 'es', url: 'https://4all.tools/es/blog/' },
  { hrefLang: 'pt', url: 'https://4all.tools/pt/blog/' },
  { hrefLang: 'fr', url: 'https://4all.tools/fr/blog/' },
] as const;

const EXPECTED_BLOG_ROOT_PAGES = [
  {
    locale: 'en',
    relativeFile: 'blog/index.html',
    htmlLang: 'en',
    title: 'Blog',
    description: 'Guides, explanations and practical ideas for everyday work.',
    canonicalUrl: 'https://4all.tools/blog/',
    expectedLink: '/blog/development/json-guides/what-is-json/',
  },
  {
    locale: 'es',
    relativeFile: 'es/blog/index.html',
    htmlLang: 'es',
    title: 'Blog',
    description: 'Guías, explicaciones e ideas prácticas para el trabajo diario.',
    canonicalUrl: 'https://4all.tools/es/blog/',
    expectedLink: '/es/blog/desarrollo/guias-json/que-es-json/',
  },
  {
    locale: 'pt',
    relativeFile: 'pt/blog/index.html',
    htmlLang: 'pt',
    title: 'Blog',
    description: 'Guias, explicações e ideias práticas para o trabalho diário.',
    canonicalUrl: 'https://4all.tools/pt/blog/',
    expectedLink: '/pt/blog/desenvolvimento/guias-json/o-que-e-json/',
  },
  {
    locale: 'fr',
    relativeFile: 'fr/blog/index.html',
    htmlLang: 'fr',
    title: 'Blog',
    description: 'Guides, explications et idées pratiques pour le travail quotidien.',
    canonicalUrl: 'https://4all.tools/fr/blog/',
    expectedLink: '/fr/blog/developpement/guides-json/qu-est-ce-que-json/',
  },
] as const satisfies readonly ExpectedBuiltBlogPage[];

const EXPECTED_BLOG_CATEGORY_PAGES = [
  {
    locale: 'en',
    relativeFile: 'blog/development/index.html',
    htmlLang: 'en',
    title: 'Development Guides',
    canonicalUrl: 'https://4all.tools/blog/development/',
    expectedLink: '/blog/development/json-guides/',
  },
  {
    locale: 'en',
    relativeFile: 'blog/development/json-guides/index.html',
    htmlLang: 'en',
    title: 'JSON Guides and Tutorials',
    canonicalUrl: 'https://4all.tools/blog/development/json-guides/',
    expectedLink: '/blog/development/json-guides/what-is-json/',
  },
  {
    locale: 'es',
    relativeFile: 'es/blog/desarrollo/index.html',
    htmlLang: 'es',
    title: 'Guías de desarrollo',
    canonicalUrl: 'https://4all.tools/es/blog/desarrollo/',
    expectedLink: '/es/blog/desarrollo/guias-json/',
  },
  {
    locale: 'es',
    relativeFile: 'es/blog/desarrollo/guias-json/index.html',
    htmlLang: 'es',
    title: 'Guías y tutoriales de JSON',
    canonicalUrl: 'https://4all.tools/es/blog/desarrollo/guias-json/',
    expectedLink: '/es/blog/desarrollo/guias-json/que-es-json/',
  },
  {
    locale: 'pt',
    relativeFile: 'pt/blog/desenvolvimento/index.html',
    htmlLang: 'pt',
    title: 'Guias de desenvolvimento',
    canonicalUrl: 'https://4all.tools/pt/blog/desenvolvimento/',
    expectedLink: '/pt/blog/desenvolvimento/guias-json/',
  },
  {
    locale: 'pt',
    relativeFile: 'pt/blog/desenvolvimento/guias-json/index.html',
    htmlLang: 'pt',
    title: 'Guias e tutoriais de JSON',
    canonicalUrl: 'https://4all.tools/pt/blog/desenvolvimento/guias-json/',
    expectedLink: '/pt/blog/desenvolvimento/guias-json/o-que-e-json/',
  },
  {
    locale: 'fr',
    relativeFile: 'fr/blog/developpement/index.html',
    htmlLang: 'fr',
    title: 'Guides de développement',
    canonicalUrl: 'https://4all.tools/fr/blog/developpement/',
    expectedLink: '/fr/blog/developpement/guides-json/',
  },
  {
    locale: 'fr',
    relativeFile: 'fr/blog/developpement/guides-json/index.html',
    htmlLang: 'fr',
    title: 'Guides et tutoriels JSON',
    canonicalUrl: 'https://4all.tools/fr/blog/developpement/guides-json/',
    expectedLink: '/fr/blog/developpement/guides-json/qu-est-ce-que-json/',
  },
] as const satisfies readonly ExpectedBuiltBlogPage[];

const EXPECTED_BLOG_ARTICLE_PAGES = [
  {
    locale: 'en',
    relativeFile: 'blog/development/json-guides/what-is-json/index.html',
    htmlLang: 'en',
    title: 'What Is JSON? Syntax, Examples, and Uses',
    canonicalUrl: 'https://4all.tools/blog/development/json-guides/what-is-json/',
    expectedLink: '/blog/development/json-guides/',
    articleTitle: 'What Is JSON?',
    articleExcerpt: 'Learn what JSON is, how its syntax works, and why developers use it to exchange structured data.',
    section: 'JSON Guides',
    publishedAt: '2026-07-21T00:00:00.000Z',
    publishedDate: 'July 21, 2026',
  },
  {
    locale: 'es',
    relativeFile: 'es/blog/desarrollo/guias-json/que-es-json/index.html',
    htmlLang: 'es',
    title: '¿Qué es JSON? Sintaxis, ejemplos y usos',
    canonicalUrl: 'https://4all.tools/es/blog/desarrollo/guias-json/que-es-json/',
    expectedLink: '/es/blog/desarrollo/guias-json/',
    articleTitle: '¿Qué es JSON? Guía práctica de su sintaxis',
    articleExcerpt: 'Aprende qué es JSON, cómo funciona su sintaxis y por qué se utiliza para intercambiar datos estructurados.',
    section: 'Guías de JSON',
    publishedAt: '2026-07-21T00:00:00.000Z',
    publishedDate: '21 de julio de 2026',
  },
  {
    locale: 'pt',
    relativeFile: 'pt/blog/desenvolvimento/guias-json/o-que-e-json/index.html',
    htmlLang: 'pt',
    title: 'O que é JSON? Sintaxe, exemplos e usos',
    canonicalUrl: 'https://4all.tools/pt/blog/desenvolvimento/guias-json/o-que-e-json/',
    expectedLink: '/pt/blog/desenvolvimento/guias-json/',
    articleTitle: 'O que é JSON? Guia prático da sintaxe JSON',
    articleExcerpt: 'Entenda o que é JSON, como sua sintaxe funciona e por que ele é usado para trocar dados estruturados.',
    section: 'Guias de JSON',
    publishedAt: '2026-07-21T00:00:00.000Z',
    publishedDate: '21 de julho de 2026',
  },
  {
    locale: 'fr',
    relativeFile: 'fr/blog/developpement/guides-json/qu-est-ce-que-json/index.html',
    htmlLang: 'fr',
    title: 'Qu’est-ce que JSON ? Syntaxe, exemples et usages',
    canonicalUrl: 'https://4all.tools/fr/blog/developpement/guides-json/qu-est-ce-que-json/',
    expectedLink: '/fr/blog/developpement/guides-json/',
    articleTitle: 'Qu’est-ce que JSON ? Guide pratique de sa syntaxe',
    articleExcerpt: 'Découvrez ce qu’est JSON, comment fonctionne sa syntaxe et pourquoi ce format sert à échanger des données structurées.',
    section: 'Guides JSON',
    publishedAt: '2026-07-21T00:00:00.000Z',
    publishedDate: '21 juillet 2026',
  },
] as const satisfies readonly ExpectedBuiltArticlePage[];

const BLOG_FORBIDDEN_OUTPUTS = [
  'en/blog/index.html',
  'blog/development/json-guides/what-is-json.html',
  'es/blog/desarrollo/guias-json/que-es-json.html',
  'pt/blog/desenvolvimento/guias-json/o-que-e-json.html',
  'fr/blog/developpement/guides-json/qu-est-ce-que-json.html',
] as const;

const EXPECTED_BLOG_HTML_FILES = [
  'blog/index.html',
  'blog/development/index.html',
  'blog/development/json-guides/index.html',
  'blog/development/json-guides/what-is-json/index.html',
  'es/blog/index.html',
  'es/blog/desarrollo/index.html',
  'es/blog/desarrollo/guias-json/index.html',
  'es/blog/desarrollo/guias-json/que-es-json/index.html',
  'pt/blog/index.html',
  'pt/blog/desenvolvimento/index.html',
  'pt/blog/desenvolvimento/guias-json/index.html',
  'pt/blog/desenvolvimento/guias-json/o-que-e-json/index.html',
  'fr/blog/index.html',
  'fr/blog/developpement/index.html',
  'fr/blog/developpement/guides-json/index.html',
  'fr/blog/developpement/guides-json/qu-est-ce-que-json/index.html',
].sort(compareCodePointOrder);

const BLOG_FORBIDDEN_OUTPUT_PATTERNS = [
  /^en\/blog\//,
  /(^|\/)blog\/blog\//,
  /(^|\/)blog\/what-is-json\//,
  /(^|\/)blog\/json-guides\/what-is-json\//,
  /what-is-json\.html$/,
  /que-es-json\.html$/,
  /o-que-e-json\.html$/,
  /qu-est-ce-que-json\.html$/,
] as const;

const EXPECTED_BLOG_CATEGORY_ALTERNATES = [
  [
    'https://4all.tools/blog/development/',
    'https://4all.tools/es/blog/desarrollo/',
    'https://4all.tools/pt/blog/desenvolvimento/',
    'https://4all.tools/fr/blog/developpement/',
  ],
  [
    'https://4all.tools/blog/development/json-guides/',
    'https://4all.tools/es/blog/desarrollo/guias-json/',
    'https://4all.tools/pt/blog/desenvolvimento/guias-json/',
    'https://4all.tools/fr/blog/developpement/guides-json/',
  ],
] as const;

const EXPECTED_BLOG_ARTICLE_ALTERNATES = [
  'https://4all.tools/blog/development/json-guides/what-is-json/',
  'https://4all.tools/es/blog/desarrollo/guias-json/que-es-json/',
  'https://4all.tools/pt/blog/desenvolvimento/guias-json/o-que-e-json/',
  'https://4all.tools/fr/blog/developpement/guides-json/qu-est-ce-que-json/',
] as const;

const MOJIBAKE_MARKERS = [
  ['Ã', 'ƒ'].join(''),
  ['Ã', '‚'].join(''),
  ['Ã', '¢', 'â', '‚', '¬', '„', '¢'].join(''),
  ['Ã', '¢', 'â', '‚', '¬', 'Å', '“'].join(''),
  ['Ã', '¢', 'â', '‚', '¬'].join(''),
] as const;

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

async function listHtmlFiles(root: URL): Promise<readonly string[]> {
  const files: string[] = [];

  async function visit(directory: URL, prefix: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });

    await Promise.all(
      entries.map(async (entry) => {
        const relativePath = `${prefix}${entry.name}`.replaceAll('\\', '/');
        const entryUrl = new URL(
          `${entry.name}${entry.isDirectory() ? '/' : ''}`,
          directory,
        );

        if (entry.isDirectory()) {
          await visit(entryUrl, `${relativePath}/`);
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
          files.push(relativePath);
        }
      }),
    );
  }

  await visit(root, '');
  return files.sort(compareCodePointOrder);
}

function isBlogHtmlArtifact(relativeFile: string): boolean {
  return (
    relativeFile.startsWith('blog/') ||
    ['en/', 'es/', 'pt/', 'fr/'].some((prefix) =>
      relativeFile.startsWith(`${prefix}blog/`),
    ) ||
    BLOG_FORBIDDEN_OUTPUT_PATTERNS.some((pattern) => pattern.test(relativeFile))
  );
}

function compareCodePointOrder(first: string, second: string): number {
  return first < second ? -1 : first > second ? 1 : 0;
}

function countMatches(value: string, pattern: RegExp): number {
  return value.match(pattern)?.length ?? 0;
}

function escapeExpectedHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

async function readClientJavaScriptBundle(): Promise<string> {
  const assetRoot = new URL('_astro/', DIST_ROOT);
  const assetFiles = await readdir(assetRoot);
  const scripts = await Promise.all(
    assetFiles
      .filter((file) => file.endsWith('.js'))
      .map((file) => readFile(new URL(file, assetRoot), 'utf8')),
  );

  return scripts.join('\n');
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'ENOENT'
  );
}
