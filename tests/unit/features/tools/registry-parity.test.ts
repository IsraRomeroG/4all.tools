import { describe, expect, it } from 'vitest';

import { SUPPORTED_LOCALES } from '@/i18n/types';
import {
  findToolModule as findCanonicalToolModule,
  getAllToolModules as getCanonicalToolModules,
  getToolModule as getCanonicalToolModule,
} from '@/features/tools/registry';
import {
  findToolModule as findLegacyToolModule,
  getAllToolModules as getLegacyToolModules,
  getToolModule as getLegacyToolModule,
} from '@/features/tools/module-registry';

describe('P13 tool registry migration parity', () => {
  it('matches the old module authority for every registered tool and locale', () => {
    const canonicalModules = getCanonicalToolModules();
    const legacyModules = getLegacyToolModules();

    expect(legacyModules.map((module) => module.definition.id)).toEqual(
      canonicalModules.map((module) => module.definition.id),
    );

    for (const canonicalModule of canonicalModules) {
      const legacyModule = getLegacyToolModule(canonicalModule.definition.id);

      expect(legacyModule.definition).toEqual(canonicalModule.definition);
      expect(legacyModule.component).toBe(canonicalModule.component);

      for (const locale of SUPPORTED_LOCALES) {
        expect(legacyModule.getMessages(locale)).toEqual(
          canonicalModule.getMessages(locale),
        );
      }
    }
  });

  it('preserves explicit unknown-tool behavior during migration', () => {
    expect(findLegacyToolModule('missing-tool')).toBeNull();
    expect(findCanonicalToolModule('missing-tool')).toBeNull();
    expect(() => getLegacyToolModule('missing-tool')).toThrow();
    expect(() => getCanonicalToolModule('missing-tool')).toThrow();
  });
});
