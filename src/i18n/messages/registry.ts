import type { Locale } from '@/i18n/types';

import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { pt } from './pt';
import type { GlobalMessages } from './types';

export const GLOBAL_MESSAGES = {
  en,
  es,
  pt,
  fr,
} as const satisfies Record<Locale, GlobalMessages>;

export function getGlobalMessages(locale: Locale): GlobalMessages {
  return GLOBAL_MESSAGES[locale];
}
