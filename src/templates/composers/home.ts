import { getGlobalMessages } from '@/i18n/messages/registry';
import type { GlobalMessages } from '@/i18n/messages/types';
import { isLocale } from '@/i18n/guards';
import type { Locale } from '@/i18n/types';
import type { HomePageModel } from '@/templates/models/home';

import { UnsupportedLocaleError } from './errors';

export interface HomePageComposerDependencies {
  readonly getGlobalMessages: (locale: Locale) => GlobalMessages;
}

const defaultHomePageComposerDependencies = {
  getGlobalMessages,
} satisfies HomePageComposerDependencies;

export function composeHomePageModel(
  locale: Locale,
  dependencies: HomePageComposerDependencies = defaultHomePageComposerDependencies,
): HomePageModel {
  if (!isLocale(locale)) {
    throw new UnsupportedLocaleError(locale);
  }

  return Object.freeze({
    kind: 'home',
    locale,
    route: null,
    documentTitle: '4all.tools',
    title: '4all.tools',
    messages: dependencies.getGlobalMessages(locale),
  });
}
