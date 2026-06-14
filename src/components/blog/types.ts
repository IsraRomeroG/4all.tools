export interface BlogLink {
  label: string;
  href: string;
}

export interface BlogTopic extends BlogLink {
  symbol: string;
  count: string;
}

export interface BlogArticle {
  category: string;
  symbol: string;
  title: string;
  href: string;
  description: string;
  readTime: string;
  updated: string;
  toolLabel: string;
  toolHref: string;
}

export interface BlogGuide {
  title: string;
  symbol: string;
  description: string;
  links: BlogLink[];
  moreLabel: string;
  moreHref: string;
}

export interface ConnectedGuide {
  category: string;
  title: string;
  tool: string;
  toolHref: string;
}

export interface RankedGuide extends BlogLink {
  meta: string;
}

export interface TopicCluster {
  title: string;
  description: string;
  links: BlogLink[];
}

export interface ToolResult {
  symbol: string;
  title: string;
  description: string;
}

export interface FooterGroup {
  title: string;
  links: BlogLink[];
}
