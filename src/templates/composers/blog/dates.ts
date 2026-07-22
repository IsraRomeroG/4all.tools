import { LOCALES } from '@/i18n/config';
import type { Locale } from '@/i18n/types';
import type { ArticleDateModel } from '@/templates/models/blog';

export function formatArticleDate(
  date: Date,
  locale: Locale,
): ArticleDateModel {
  const iso = date.toISOString();
  const display = new Intl.DateTimeFormat(LOCALES[locale].htmlLang, {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(date);

  return Object.freeze({ iso, display });
}
