import { getGlobalMessages } from '@/i18n/messages/registry';
import { isLocale } from '@/i18n/guards';
import type { Locale } from '@/i18n/types';
import { buildLanguageSwitcherModel } from '@/navigation/language-switcher';
import { buildSiteFooterModel } from '@/navigation/site-footer';
import type { RouteRegistry } from '@/routing/registry';
import type { HomePageModel } from '@/templates/models/home';

import { UnsupportedLocaleError } from './errors';
import { composeHomeSeoPageModel } from './seo';

const HOME_SEO = {
  en: {
    title: '4all.tools',
    description: 'Useful online tools for everyday work.',
  },
  es: {
    title: '4all.tools',
    description: 'Herramientas en línea útiles para el trabajo diario.',
  },
  pt: {
    title: '4all.tools',
    description: 'Ferramentas online úteis para o trabalho diário.',
  },
  fr: {
    title: '4all.tools',
    description: 'Outils en ligne utiles pour le travail quotidien.',
  },
} as const satisfies Record<Locale, { readonly title: string; readonly description: string }>;

export async function composeHomePageModel(
  locale: Locale,
  dependencies?: {
    readonly routeRegistry: Pick<RouteRegistry, 'getCanonical'>;
  },
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
  const messages = getGlobalMessages(locale);

  return {
    kind: 'home',
    locale,
    route: null,
    seo: seoComposition.seo,
    localizedRouteCluster: seoComposition.localizedRouteCluster,
    languageSwitcher: buildLanguageSwitcherModel({
      cluster: seoComposition.localizedRouteCluster,
      messages: messages.language,
    }),
    title: homeSeo.title,
    description: homeSeo.description,
    messages,
    ...(dependencies === undefined
      ? {}
      : {
          siteFooter: buildSiteFooterModel({
            locale,
            routeRegistry: dependencies.routeRegistry,
            messages: messages.footer,
          }),
        }),
  };
}
