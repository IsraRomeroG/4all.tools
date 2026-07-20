import type { Locale } from '@/i18n/types';

export interface SeoLocaleAlternate {
  readonly locale: Locale;
  readonly hrefLang: string;
  readonly url: string;
}

export interface SeoRobotsModel {
  readonly index: boolean;
  readonly follow: true;
}

export interface SeoOpenGraphImage {
  readonly url: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
}

export interface SeoOpenGraphModel {
  readonly type: 'website' | 'article';
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly siteName: '4all.tools';
  readonly image?: SeoOpenGraphImage;
}

export interface SeoPageModel {
  readonly title: string;
  readonly description: string;
  readonly canonicalUrl: string;
  readonly robots: SeoRobotsModel;
  readonly alternates: readonly SeoLocaleAlternate[];
  readonly xDefaultUrl?: string;
  readonly openGraph: SeoOpenGraphModel;
}
