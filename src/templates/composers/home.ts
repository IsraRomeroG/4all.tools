import { getGlobalMessages } from '@/i18n/messages/registry';
import type { GlobalMessages } from '@/i18n/messages/types';
import { isLocale } from '@/i18n/guards';
import type { Locale } from '@/i18n/types';
import type { HomePageModel } from '@/templates/models/home';

import { UnsupportedLocaleError } from './errors';
import { composeHomeSeoPageModel } from './seo';

export interface HomePageComposerDependencies {
  readonly getGlobalMessages: (locale: Locale) => GlobalMessages;
}

const defaultHomePageComposerDependencies = {
  getGlobalMessages,
} satisfies HomePageComposerDependencies;

const HOME_SEO = {
  en: {
    title: '4all.tools',
    description: 'Useful online tools for everyday work.',
  },
  es: {
    title: '4all.tools',
    description: 'Herramientas en linea utiles para el trabajo diario.',
  },
  pt: {
    title: '4all.tools',
    description: 'Ferramentas online uteis para o trabalho diario.',
  },
  fr: {
    title: '4all.tools',
    description: 'Outils en ligne utiles pour le travail quotidien.',
  },
} as const satisfies Record<Locale, { readonly title: string; readonly description: string }>;

export async function composeHomePageModel(
  locale: Locale,
  dependencies: HomePageComposerDependencies = defaultHomePageComposerDependencies,
): Promise<HomePageModel> {
  if (!isLocale(locale)) {
    throw new UnsupportedLocaleError(locale);
  }

  const homeSeo = HOME_SEO[locale];
  const seoComposition = await composeHomeSeoPageModel({
    locale,
    title: homeSeo.title,
    description: homeSeo.description,
  });

  return Object.freeze({
    kind: 'home',
    locale,
    route: null,
    seo: seoComposition.seo,
    localizedRouteCluster: seoComposition.localizedRouteCluster,
    title: homeSeo.title,
    description: homeSeo.description,
    messages: dependencies.getGlobalMessages(locale),
  });
}
