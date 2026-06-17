import type { IconName } from "@components/icons/iconNames";

export interface ArticleLink {
  label: string;
  href: string;
}

export interface ArticleBreadcrumbItem extends ArticleLink {
  current?: boolean;
}

export interface ArticleMetaItem {
  icon: IconName;
  label: string;
}

export interface ArticleTool {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  icon?: IconName;
  trustNote?: string;
}

export interface ArticleAction extends ArticleLink {
  variant?: "primary" | "secondary";
}

export interface ArticleTocItem extends ArticleLink {}

export interface ArticleDefinitionItem {
  term: string;
  description: string;
}

export interface ArticleStepItem {
  title: string;
  description: string;
}

export interface ArticleCalculationRow {
  label: string;
  value: string;
}

export interface ArticleFaqItem {
  question: string;
  answer: string;
}

export interface ArticleAuthor {
  initials: string;
  name: string;
  description: string;
  reviewedLabel?: string;
}

export interface ArticleToolCard {
  href: string;
  title: string;
  description: string;
  icon: IconName;
  ctaLabel?: string;
}

export interface ArticleGuideCard {
  href: string;
  category: string;
  title: string;
  description: string;
  meta: string;
}

export interface ArticleShareLink extends ArticleLink {
  icon: IconName;
  ariaLabel: string;
}

export interface ArticleFooterGroup {
  title: string;
  links: ArticleLink[];
}
