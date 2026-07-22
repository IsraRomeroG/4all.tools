import type { Locale } from '@/i18n/types';

export interface BlogIndexContent {
  readonly title: string;
  readonly description: string;
}

export const BLOG_INDEX_CONTENT = {
  en: {
    title: 'Blog',
    description: 'Guides, explanations and practical ideas for everyday work.',
  },
  es: {
    title: 'Blog',
    description: 'Guías, explicaciones e ideas prácticas para el trabajo diario.',
  },
  pt: {
    title: 'Blog',
    description: 'Guias, explicações e ideias práticas para o trabalho diário.',
  },
  fr: {
    title: 'Blog',
    description: 'Guides, explications et idées pratiques pour le travail quotidien.',
  },
} as const satisfies Record<Locale, BlogIndexContent>;
