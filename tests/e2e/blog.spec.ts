import { expect, type Page, test } from '@playwright/test';

import {
  startAstroPreview,
  type AstroPreviewServer,
} from './fixtures/astro-preview';

interface ObservedErrors {
  readonly consoleErrors: string[];
  readonly pageErrors: string[];
}

const observedErrors = new WeakMap<Page, ObservedErrors>();
let previewServer: AstroPreviewServer | undefined;

test.beforeAll(async () => {
  previewServer = await startAstroPreview();
});

test.afterAll(async () => {
  await previewServer?.stop();
  previewServer = undefined;
});

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

test.afterEach(({ page }) => {
  const errors = observedErrors.get(page);

  expect(errors?.pageErrors ?? []).toEqual([]);
  expect(errors?.consoleErrors ?? []).toEqual([]);
});

test('navigates from the blog index to a localized article and category', async ({
  page,
}) => {
  const rootResponse = await page.goto('/blog/');

  expect(rootResponse?.ok()).toBe(true);
  await expect(page.getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'What Is JSON?' }),
  ).toHaveAttribute('href', '/blog/development/json-guides/what-is-json/');

  await page.getByRole('link', { name: 'What Is JSON?' }).click();
  await expect(page).toHaveURL(/\/blog\/development\/json-guides\/what-is-json\/$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'What Is JSON?' }),
  ).toBeVisible();
  await expect(page.locator('time[datetime="2026-07-21T00:00:00.000Z"]')).toHaveCount(1);

  await page
    .locator('[data-language-switcher] a[href="/es/blog/desarrollo/guias-json/que-es-json/"]')
    .click();
  await expect(page).toHaveURL(/\/es\/blog\/desarrollo\/guias-json\/que-es-json\/$/);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: '¿Qué es JSON? Guía práctica de su sintaxis',
    }),
  ).toBeVisible();

  await page
    .locator('[data-breadcrumbs] a[href="/es/blog/desarrollo/guias-json/"]')
    .click();
  await expect(page).toHaveURL(/\/es\/blog\/desarrollo\/guias-json\/$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Guías de JSON' }),
  ).toBeVisible();
});
