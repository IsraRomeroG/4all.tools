import type { SitePageId } from '@/domain/shared/ids';
import type { LanguageSwitcherModel } from '@/navigation/language-switcher';
import type { Locale } from '@/i18n/types';
import type { RouteRecord } from '@/routing/types';
import type { SeoPageModel } from '@/seo';

import type { PageDocumentModel, RenderedContentModel } from './shared';

export interface SitePageModel extends PageDocumentModel {
  readonly kind: 'site-page';
  readonly locale: Locale;
  readonly route: RouteRecord;
  readonly pageId: SitePageId;
  readonly seo: SeoPageModel;
  readonly languageSwitcher: LanguageSwitcherModel;
  readonly content: RenderedContentModel;
}
