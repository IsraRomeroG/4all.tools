import type { SitePageId } from '@/domain/shared/ids';
import type { SiteFooterModel } from '@/navigation/site-footer';
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
  readonly content: RenderedContentModel;
  readonly siteFooter?: SiteFooterModel | undefined;
}
