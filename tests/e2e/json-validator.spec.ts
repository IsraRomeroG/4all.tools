import { expect, type Page, test } from '@playwright/test';

import {
  startAstroPreview,
  type AstroPreviewServer,
} from './fixtures/astro-preview';

interface JsonValidatorRoute {
  readonly locale: string;
  readonly path: string;
  readonly title: string;
  readonly inputLabel: string;
  readonly validateLabel: string;
  readonly formatLabel: string;
  readonly minifyLabel: string;
  readonly copyLabel: string;
  readonly clearLabel: string;
  readonly validStatus: string;
  readonly invalidStatus: string;
  readonly minifiedStatus: string;
  readonly copiedStatus: string;
  readonly copyEmptyStatus: string;
  readonly copyFailedStatus: string;
  readonly clearedStatus: string;
}

interface ObservedErrors {
  readonly consoleErrors: string[];
  readonly pageErrors: string[];
}

interface RequestObserver {
  start(): void;
  readonly unexpectedRequests: readonly string[];
}

const observedErrors = new WeakMap<Page, ObservedErrors>();
let previewServer: AstroPreviewServer | undefined;

const ROUTES = {
  en: {
    locale: 'en',
    path: '/developer/json-validator/',
    title: 'JSON Validator',
    inputLabel: 'Input JSON',
    validateLabel: 'Validate JSON',
    formatLabel: 'Format JSON',
    minifyLabel: 'Minify JSON',
    copyLabel: 'Copy',
    clearLabel: 'Clear',
    validStatus: 'Valid JSON',
    invalidStatus: 'Invalid JSON syntax.',
    minifiedStatus: 'JSON minified.',
    copiedStatus: 'JSON copied to the clipboard.',
    copyEmptyStatus: 'There is no JSON to copy.',
    copyFailedStatus: 'JSON could not be copied.',
    clearedStatus: 'JSON input cleared.',
  },
  es: {
    locale: 'es',
    path: '/es/desarrollo/validador-json/',
    title: 'Validador JSON',
    inputLabel: 'JSON de entrada',
    validateLabel: 'Validar JSON',
    formatLabel: 'Formatear JSON',
    minifyLabel: 'Minificar JSON',
    copyLabel: 'Copiar',
    clearLabel: 'Limpiar',
    validStatus: 'JSON válido',
    invalidStatus: 'La sintaxis JSON no es válida.',
    minifiedStatus: 'JSON minificado.',
    copiedStatus: 'JSON copiado al portapapeles.',
    copyEmptyStatus: 'No hay JSON para copiar.',
    copyFailedStatus: 'No se pudo copiar el JSON.',
    clearedStatus: 'Entrada JSON limpiada.',
  },
  pt: {
    locale: 'pt',
    path: '/pt/desenvolvedor/validador-json/',
    title: 'Validador JSON',
    inputLabel: 'JSON de entrada',
    validateLabel: 'Validar JSON',
    formatLabel: 'Formatar JSON',
    minifyLabel: 'Minificar JSON',
    copyLabel: 'Copiar',
    clearLabel: 'Limpar',
    validStatus: 'JSON válido',
    invalidStatus: 'A sintaxe JSON não é válida.',
    minifiedStatus: 'JSON minificado.',
    copiedStatus: 'JSON copiado para a área de transferência.',
    copyEmptyStatus: 'Não há JSON para copiar.',
    copyFailedStatus: 'Não foi possível copiar o JSON.',
    clearedStatus: 'Entrada JSON limpa.',
  },
  fr: {
    locale: 'fr',
    path: '/fr/developpement/validateur-json/',
    title: 'Validateur JSON',
    inputLabel: 'JSON d’entrée',
    validateLabel: 'Valider le JSON',
    formatLabel: 'Formater le JSON',
    minifyLabel: 'Minifier le JSON',
    copyLabel: 'Copier',
    clearLabel: 'Effacer',
    validStatus: 'JSON valide',
    invalidStatus: 'La syntaxe JSON n’est pas valide.',
    minifiedStatus: 'JSON minifié.',
    copiedStatus: 'JSON copié dans le presse-papiers.',
    copyEmptyStatus: 'Aucun JSON à copier.',
    copyFailedStatus: 'Impossible de copier le JSON.',
    clearedStatus: 'Entrée JSON effacée.',
  },
} as const satisfies Record<string, JsonValidatorRoute>;

test.beforeEach(({ page }) => {
  const errors: ObservedErrors = {
    consoleErrors: [],
    pageErrors: [],
  };

  observedErrors.set(page, errors);
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => {
    errors.pageErrors.push(error.message);
  });
});

test.beforeAll(async () => {
  previewServer = await startAstroPreview();
});

test.afterAll(async () => {
  await previewServer?.stop();
  previewServer = undefined;
});

test.afterEach(({ page }) => {
  const errors = observedErrors.get(page);

  expect(errors?.pageErrors ?? []).toEqual([]);
  expect(errors?.consoleErrors ?? []).toEqual([]);
});

test.describe('JSON Validator browser behavior', () => {
  for (const route of Object.values(ROUTES)) {
    test(`renders localized route ${route.locale}`, async ({ page }) => {
      await openJsonValidator(page, route);

      await expect(page.locator('html')).toHaveAttribute('lang', route.locale);
      await expect(
        page.getByRole('heading', { level: 1, name: route.title }),
      ).toBeVisible();
      await expect(page.getByLabel(route.inputLabel)).toBeVisible();
      await expect(
        page.getByRole('button', { name: route.validateLabel }),
      ).toBeVisible();
      await expect(page.locator('[data-json-validator]')).toHaveAttribute(
        'data-initialized',
        'true',
      );
    });
  }

  test('switches equivalent pages with static links and browser history', async ({
    page,
  }) => {
    await openJsonValidator(page, ROUTES.en);

    const languageNavigation = page.getByRole('navigation', {
      name: 'Languages',
    });
    await languageNavigation.getByRole('link', { name: 'Español' }).click();
    await expect(page).toHaveURL(/\/es\/desarrollo\/validador-json\/$/);
    await expect(
      page.getByRole('heading', { level: 1, name: ROUTES.es.title }),
    ).toBeVisible();

    const spanishNavigation = page.getByRole('navigation', {
      name: 'Idiomas',
    });
    await spanishNavigation.getByRole('link', { name: 'Français' }).click();
    await expect(page).toHaveURL(/\/fr\/developpement\/validateur-json\/$/);
    await expect(
      page.locator(
        '[data-language-switcher] li[data-locale="fr"] [aria-current="page"]',
      ),
    ).toHaveText(/Français/);
    await expect(
      page.locator('[data-language-switcher] script'),
    ).toHaveCount(0);

    await page.goBack();
    await expect(page).toHaveURL(/\/es\/desarrollo\/validador-json\/$/);
    await page.goForward();
    await expect(page).toHaveURL(/\/fr\/developpement\/validateur-json\/$/);
  });

  test('follows explicit category breadcrumbs and keeps classification nodes as text', async ({
    page,
  }) => {
    await openJsonValidator(page, ROUTES.en);

    const breadcrumbs = page.getByRole('navigation', { name: 'Breadcrumbs' });
    await expect(
      breadcrumbs.getByRole('link', { name: 'Developer Tools' }),
    ).toBeVisible();
    await expect(
      breadcrumbs.getByRole('link', { name: 'Data Formats' }),
    ).toHaveCount(0);
    await expect(breadcrumbs.getByRole('link', { name: 'JSON' })).toHaveCount(
      0,
    );
    await expect(breadcrumbs.getByRole('link')).toHaveCount(2);

    await breadcrumbs.getByRole('link', { name: 'Developer Tools' }).click();
    await expect(page).toHaveURL(/\/developer\/$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Developer Tools' }),
    ).toBeVisible();
  });

  test('validates English JSON and formats/minifies without network requests', async ({
    page,
  }) => {
    const route = ROUTES.en;
    const requests = await openJsonValidator(page, route);
    const input = page.getByLabel(route.inputLabel);
    const status = page.locator('[data-json-status]');

    requests.start();
    await input.fill('{"a":1}');
    await page.getByRole('button', { name: route.validateLabel }).click();
    await expect(status).toHaveText(route.validStatus);
    await expect(input).toHaveValue('{"a":1}');

    await input.fill('{"a":1,"b":[true,null]}');
    await page.getByRole('button', { name: route.formatLabel }).click();
    await expect(input).toHaveValue(`{
  "a": 1,
  "b": [
    true,
    null
  ]
}`);

    await page.getByRole('button', { name: route.minifyLabel }).click();
    await expect(input).toHaveValue('{"a":1,"b":[true,null]}');
    await expect(status).toHaveText(route.minifiedStatus);
    expect(requests.unexpectedRequests).toEqual([]);
  });

  test('preserves Spanish invalid JSON when formatting fails', async ({
    page,
  }) => {
    const route = ROUTES.es;
    const requests = await openJsonValidator(page, route);
    const input = page.getByLabel(route.inputLabel);

    requests.start();
    await input.fill('{"a":1,}');
    await page.getByRole('button', { name: route.formatLabel }).click();

    await expect(page.locator('[data-json-status]')).toContainText(
      route.invalidStatus,
    );
    await expect(input).toHaveValue('{"a":1,}');
    expect(requests.unexpectedRequests).toEqual([]);
  });

  test('validates and minifies Portuguese primitive JSON', async ({ page }) => {
    const route = ROUTES.pt;
    const requests = await openJsonValidator(page, route);
    const input = page.getByLabel(route.inputLabel);
    const status = page.locator('[data-json-status]');

    requests.start();
    await input.fill('true');
    await page.getByRole('button', { name: route.validateLabel }).click();
    await expect(status).toHaveText(route.validStatus);

    await page.getByRole('button', { name: route.minifyLabel }).click();
    await expect(input).toHaveValue('true');
    await expect(status).toHaveText(route.minifiedStatus);
    expect(requests.unexpectedRequests).toEqual([]);
  });

  test('clears French input and returns focus to the editor', async ({
    page,
  }) => {
    const route = ROUTES.fr;
    const requests = await openJsonValidator(page, route);
    const input = page.getByLabel(route.inputLabel);

    requests.start();
    await input.fill('{"a":1}');
    await page.getByRole('button', { name: route.clearLabel }).click();

    await expect(input).toHaveValue('');
    await expect(page.locator('[data-json-status]')).toHaveText(
      route.clearedStatus,
    );
    await expect(input).toBeFocused();
    expect(requests.unexpectedRequests).toEqual([]);
  });

  test('copies JSON with deterministic clipboard success and failure states', async ({
    page,
  }) => {
    const route = ROUTES.en;
    await installClipboardMock(page);
    const requests = await openJsonValidator(page, route);
    const input = page.getByLabel(route.inputLabel);
    const status = page.locator('[data-json-status]');

    requests.start();
    await page.getByRole('button', { name: route.copyLabel }).click();
    await expect(status).toHaveText(route.copyEmptyStatus);
    expect(await readClipboardWrites(page)).toEqual([]);

    await input.fill('{"copy":true}');
    await page.getByRole('button', { name: route.copyLabel }).click();
    await expect(status).toHaveText(route.copiedStatus);
    expect(await readClipboardWrites(page)).toEqual(['{"copy":true}']);

    await setClipboardMode(page, 'reject');
    await page.getByRole('button', { name: route.copyLabel }).click();
    await expect(status).toHaveText(route.copyFailedStatus);
    expect(requests.unexpectedRequests).toEqual([]);
  });
});

async function openJsonValidator(
  page: Page,
  route: JsonValidatorRoute,
): Promise<RequestObserver> {
  const response = await page.goto(route.path);

  expect(response, `Expected ${route.path} to return an HTTP response.`).not.toBeNull();
  expect(response?.ok(), `Expected ${route.path} to load successfully.`).toBe(true);

  const root = page.locator('[data-json-validator]');
  await expect(root).toBeVisible();
  await expect(root).toHaveAttribute('data-initialized', 'true');

  return observeActionRequests(page);
}

function observeActionRequests(page: Page): RequestObserver {
  const unexpectedRequests: string[] = [];
  let actionsStarted = false;

  page.on('request', (request) => {
    if (!actionsStarted || isAllowedLocalAssetRequest(request.url())) {
      return;
    }

    unexpectedRequests.push(request.url());
  });

  return {
    start() {
      actionsStarted = true;
    },
    unexpectedRequests,
  };
}

function isAllowedLocalAssetRequest(url: string): boolean {
  const parsedUrl = new URL(url);

  return (
    parsedUrl.origin === 'http://127.0.0.1:4321' &&
    (parsedUrl.pathname.startsWith('/_astro/') ||
      parsedUrl.pathname === '/favicon.ico' ||
      parsedUrl.pathname === '/favicon.svg')
  );
}

async function installClipboardMock(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const clipboardState = window as unknown as {
      __jsonValidatorClipboardMode: 'resolve' | 'reject';
      __jsonValidatorClipboardWrites: string[];
    };

    clipboardState.__jsonValidatorClipboardMode = 'resolve';
    clipboardState.__jsonValidatorClipboardWrites = [];

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText(text: string) {
          clipboardState.__jsonValidatorClipboardWrites.push(text);

          if (clipboardState.__jsonValidatorClipboardMode === 'reject') {
            return Promise.reject(new Error('Mock clipboard rejection'));
          }

          return Promise.resolve();
        },
      },
    });
  });
}

async function readClipboardWrites(page: Page): Promise<readonly string[]> {
  return page.evaluate(() => {
    const clipboardState = window as unknown as {
      __jsonValidatorClipboardWrites: string[];
    };

    return clipboardState.__jsonValidatorClipboardWrites;
  });
}

async function setClipboardMode(
  page: Page,
  mode: 'resolve' | 'reject',
): Promise<void> {
  await page.evaluate((nextMode) => {
    const clipboardState = window as unknown as {
      __jsonValidatorClipboardMode: 'resolve' | 'reject';
    };

    clipboardState.__jsonValidatorClipboardMode = nextMode;
  }, mode);
}
