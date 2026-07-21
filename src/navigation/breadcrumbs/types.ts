import type { Locale } from '@/i18n/types';

export type BreadcrumbItemKind = 'home' | 'taxonomy' | 'entity';

export type BreadcrumbItem =
  | {
      readonly kind: 'home' | 'taxonomy';
      readonly state: 'link';
      readonly label: string;
      readonly url: string;
    }
  | {
      readonly kind: 'taxonomy';
      readonly state: 'text';
      readonly label: string;
    }
  | {
      readonly kind: 'taxonomy' | 'entity';
      readonly state: 'current';
      readonly label: string;
    };

export interface BreadcrumbModel {
  readonly ariaLabel: string;
  readonly items: readonly BreadcrumbItem[];
}

export interface BreadcrumbMessages {
  readonly home: string;
  readonly breadcrumbsLabel: string;
}

export interface BreadcrumbLocaleInput {
  readonly locale: Locale;
  readonly messages: BreadcrumbMessages;
}
