import type { Locale } from '@/i18n/types';

export interface SeoLocaleAlternate {
  readonly locale: Locale;
  readonly hrefLang: string;
  readonly url: string;
}

export interface IndexableSeoRobotsModel {
  readonly index: true;
  readonly follow: true;
}

export interface NoindexSeoRobotsModel {
  readonly index: false;
  readonly follow: true;
}

export type SeoRobotsModel =
  | IndexableSeoRobotsModel
  | NoindexSeoRobotsModel;

export interface SeoOpenGraphImage {
  readonly url: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
}

export interface SeoOpenGraphArticleMetadata {
  readonly publishedTime: string;
  readonly modifiedTime?: string;
  readonly section: string;
}

export interface SeoOpenGraphWebsiteModel {
  readonly type: 'website';
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly siteName: '4all.tools';
  readonly image?: SeoOpenGraphImage;
}

export interface SeoOpenGraphArticleModel {
  readonly type: 'article';
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly siteName: '4all.tools';
  readonly image?: SeoOpenGraphImage;
  readonly article: SeoOpenGraphArticleMetadata;
}

export type SeoOpenGraphModel =
  | SeoOpenGraphWebsiteModel
  | SeoOpenGraphArticleModel;

export interface IndexableSeoPageModel {
  readonly title: string;
  readonly description: string;
  readonly canonicalUrl: string;
  readonly robots: IndexableSeoRobotsModel;
  readonly alternates: readonly SeoLocaleAlternate[];
  readonly xDefaultUrl?: string;
  readonly openGraph: SeoOpenGraphModel;
}

export interface NoindexSeoPageModel {
  readonly title: string;
  readonly description: string;
  readonly canonicalUrl: string;
  readonly robots: NoindexSeoRobotsModel;
  readonly alternates: readonly [];
  readonly xDefaultUrl?: never;
  readonly openGraph: SeoOpenGraphModel;
}

export type SeoPageModel = IndexableSeoPageModel | NoindexSeoPageModel;
