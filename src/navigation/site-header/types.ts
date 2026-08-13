import type { GlobalMessages } from '@/i18n/messages/types';
import type { LanguageSwitcherModel } from '@/navigation/language-switcher';

export type SiteHeaderPageContext =
  | 'home'
  | 'blog-index'
  | 'blog-descendant'
  | 'other';

export interface SiteHeaderBrandModel {
  readonly label: string;
  readonly ariaLabel: string;
  readonly url: string;
  readonly active: boolean;
  readonly ariaCurrent?: 'page';
}

export interface SiteHeaderLinkModel {
  readonly id: 'blog';
  readonly label: string;
  readonly url: string;
  readonly active: boolean;
  readonly ariaCurrent?: 'page';
}

export interface SiteHeaderModel {
  readonly brand: SiteHeaderBrandModel;
  readonly primaryNavigationLabel: GlobalMessages['navigation']['primaryNavigationLabel'];
  readonly primaryLinks: readonly SiteHeaderLinkModel[];
  readonly languageSwitcher: LanguageSwitcherModel;
}
