import type { Locale } from '@/i18n/types';

import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { pt } from './pt';
import type { JsonValidatorMessages } from './types';

const messages = {
  en,
  es,
  pt,
  fr,
} as const satisfies Record<Locale, JsonValidatorMessages>;

export function getJsonValidatorMessages(
  locale: Locale,
): JsonValidatorMessages {
  return messages[locale];
}
