import { SITE_NAME } from '@/config/site';
import type { GlobalMessages } from '@/i18n/messages/types';
import type { Locale } from '@/i18n/types';
import { buildLanguageSwitcherModel } from '@/navigation/language-switcher';
import { BLOG_ROUTE_ROOT_SEGMENT, buildLocalizedPath } from '@/routing/builders';
import type { LocalizedRouteCluster } from '@/seo';

import type {
  SiteHeaderModel,
  SiteHeaderPageContext,
} from './types';

export interface BuildSiteHeaderModelInput {
  readonly locale: Locale;
  readonly pageContext: SiteHeaderPageContext;
  readonly localizedRouteCluster: LocalizedRouteCluster;
  readonly messages: GlobalMessages;
}

export function buildSiteHeaderModel(
  input: BuildSiteHeaderModelInput,
): SiteHeaderModel {
  const isHome = input.pageContext === 'home';
  const isBlogIndex = input.pageContext === 'blog-index';
  const isBlogSection = isBlogIndex || input.pageContext === 'blog-descendant';

  return {
    brand: {
      label: SITE_NAME,
      ariaLabel: `${SITE_NAME} — ${input.messages.nav.home}`,
      url: buildLocalizedPath({ locale: input.locale, segments: [] }),
      active: isHome,
      ...(isHome ? { ariaCurrent: 'page' as const } : {}),
    },
    primaryNavigationLabel: input.messages.navigation.primaryNavigationLabel,
    primaryLinks: [
      {
        id: 'blog',
        label: input.messages.nav.blog,
        url: buildLocalizedPath({
          locale: input.locale,
          segments: [BLOG_ROUTE_ROOT_SEGMENT],
        }),
        active: isBlogSection,
        ...(isBlogIndex ? { ariaCurrent: 'page' as const } : {}),
      },
    ],
    languageSwitcher: buildLanguageSwitcherModel({
      cluster: input.localizedRouteCluster,
      messages: input.messages.language,
    }),
  };
}
