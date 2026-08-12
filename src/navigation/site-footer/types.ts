import type { SitePageId } from '@/domain/shared/ids';

export interface SiteFooterLinkModel {
  readonly pageId: SitePageId;
  readonly label: string;
  readonly url: string;
}

export interface SiteFooterModel {
  readonly ariaLabel: string;
  readonly links: readonly SiteFooterLinkModel[];
}
