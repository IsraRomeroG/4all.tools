import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import JsonValidatorTool from '@/features/tools/developer/json-validator/Tool.astro';
import { getJsonValidatorMessages } from '@/features/tools/developer/json-validator/messages/registry';
import { jsonValidatorModule } from '@/features/tools/registry';

describe('json validator tool UI', () => {
  it('renders semantic localized markup with accessible controls', async () => {
    const html = await renderTool('es', 'json-validator-es-test');

    expect(html).toContain('data-json-validator');
    expect(html).toContain('data-locale="es"');
    expect(html).toContain('JSON de entrada');
    expect(html).toContain('Pega el JSON aquí');
    expect(html).toContain('Validar JSON');
    expect(html).toContain('Formatear JSON');
    expect(html).toContain('Minificar JSON');
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('data-json-input');
    expect(html).toContain('data-json-status');
    expect(html).toContain('data-json-diagnostic');
    expect(html).toContain('id="json-validator-es-test-help"');
    expect(html).toContain('id="json-validator-es-test-status"');
    expect(html).toContain('<fieldset');
    expect(html).toContain('data-json-actions');
    expect(html).toContain('<legend class="sr-only">Acciones de JSON</legend>');
  });

  it('renders native non-submitting buttons for every tool action', async () => {
    const html = await renderTool('en', 'json-validator-en-test');

    for (const action of ['validate', 'format', 'minify', 'copy', 'clear']) {
      expect(html).toContain(`type="button" data-action="${action}"`);
    }
  });

  it('supports multiple instances through passed instance IDs', async () => {
    const first = await renderTool('en', 'json-validator-first');
    const second = await renderTool('en', 'json-validator-second');
    const combined = `${first}\n${second}`;

    expect(combined.match(/id="json-validator-first-help"/g)).toHaveLength(1);
    expect(combined.match(/id="json-validator-second-help"/g)).toHaveLength(1);
    expect(combined).not.toContain('id="json-input"');
  });

  it('is resolved by stable tool ID through the canonical tool module', () => {
    expect(jsonValidatorModule.component).toBe(JsonValidatorTool);
  });

});

async function renderTool(
  locale: Parameters<typeof getJsonValidatorMessages>[0],
  instanceId: string,
): Promise<string> {
  const container = await AstroContainer.create();

  return container.renderToString(JsonValidatorTool, {
      partial: true,
      props: {
        locale,
        messages: jsonValidatorModule.getMessages(locale),
        instanceId,
      },
  });
}
