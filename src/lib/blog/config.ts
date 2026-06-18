export const SITE_URL = "https://4all.tools";
export const BLOG_BASE_SEGMENT = "blog";
export const DEFAULT_LOCALE = "en";
export const SUPPORTED_LOCALES = ["en", "es", "pt"] as const;
export const NON_DEFAULT_LOCALES = ["es", "pt"] as const;
export const POSTS_PER_PAGE = 12;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const BLOG_CATEGORY_IDS = [
  "calculators",
  "developer-tools",
  "seo",
  "pdf",
  "image-tools",
] as const;

export type BlogCategoryId = (typeof BLOG_CATEGORY_IDS)[number];

export interface BlogCategoryDefinition {
  id: BlogCategoryId;
  symbol: string;
  labels: Record<Locale, string>;
  slugs: Record<Locale, string>;
  descriptions: Record<Locale, string>;
}

export const BLOG_CATEGORIES = {
  calculators: {
    id: "calculators",
    symbol: "%",
    labels: {
      en: "Calculators",
      es: "Calculadoras",
      pt: "Calculadoras",
    },
    slugs: {
      en: "calculators",
      es: "calculadoras",
      pt: "calculadoras",
    },
    descriptions: {
      en: "Plain-English guides for percentages, finance, dates, and everyday calculations.",
      es: "Guias claras para porcentajes, finanzas, fechas y calculos cotidianos.",
      pt: "Guias claras para porcentagens, financas, datas e calculos do dia a dia.",
    },
  },
  "developer-tools": {
    id: "developer-tools",
    symbol: "{ }",
    labels: {
      en: "Developer Tools",
      es: "Herramientas para desarrolladores",
      pt: "Ferramentas para desenvolvedores",
    },
    slugs: {
      en: "developer-tools",
      es: "herramientas-desarrolladores",
      pt: "ferramentas-desenvolvedores",
    },
    descriptions: {
      en: "Practical tutorials for formatting, validating, and transforming structured data.",
      es: "Tutoriales practicos para formatear, validar y transformar datos estructurados.",
      pt: "Tutoriais praticos para formatar, validar e transformar dados estruturados.",
    },
  },
  seo: {
    id: "seo",
    symbol: "SEO",
    labels: {
      en: "SEO",
      es: "SEO",
      pt: "SEO",
    },
    slugs: {
      en: "seo",
      es: "seo",
      pt: "seo",
    },
    descriptions: {
      en: "Simple SEO explainers for metadata, keywords, crawlers, and technical checks.",
      es: "Explicaciones sencillas sobre metadatos, keywords, rastreo y SEO tecnico.",
      pt: "Explicacoes simples sobre metadados, palavras-chave, rastreamento e SEO tecnico.",
    },
  },
  pdf: {
    id: "pdf",
    symbol: "PDF",
    labels: {
      en: "PDF",
      es: "PDF",
      pt: "PDF",
    },
    slugs: {
      en: "pdf",
      es: "pdf",
      pt: "pdf",
    },
    descriptions: {
      en: "Workflow guides for compressing, converting, merging, and preparing documents.",
      es: "Guias de trabajo para comprimir, convertir, unir y preparar documentos.",
      pt: "Guias de fluxo para comprimir, converter, juntar e preparar documentos.",
    },
  },
  "image-tools": {
    id: "image-tools",
    symbol: "IMG",
    labels: {
      en: "Image Tools",
      es: "Herramientas de imagen",
      pt: "Ferramentas de imagem",
    },
    slugs: {
      en: "image-tools",
      es: "herramientas-imagen",
      pt: "ferramentas-imagem",
    },
    descriptions: {
      en: "Guides for resizing, compressing, converting, and preparing images.",
      es: "Guias para redimensionar, comprimir, convertir y preparar imagenes.",
      pt: "Guias para redimensionar, comprimir, converter e preparar imagens.",
    },
  },
} satisfies Record<BlogCategoryId, BlogCategoryDefinition>;

export const BLOG_UI = {
  en: {
    blogLabel: "Blog",
    allArticles: "All articles",
    browseTopics: "Browse topics",
    latestArticles: "Latest articles",
    readMore: "Read guide",
    updated: "Updated",
    minuteRead: "min read",
    page: "Page",
    rss: "RSS feed",
    empty: "No published articles yet.",
    categoryEyebrow: "Topic guide",
    indexTitle: "Practical guides for useful online tools",
    indexDescription:
      "Learn how common calculators, converters, SEO checks, developer utilities, and document tools work.",
  },
  es: {
    blogLabel: "Blog",
    allArticles: "Todos los articulos",
    browseTopics: "Explorar temas",
    latestArticles: "Articulos recientes",
    readMore: "Leer guia",
    updated: "Actualizado",
    minuteRead: "min de lectura",
    page: "Pagina",
    rss: "RSS",
    empty: "Todavia no hay articulos publicados.",
    categoryEyebrow: "Guia por tema",
    indexTitle: "Guias practicas para herramientas online utiles",
    indexDescription:
      "Aprende como funcionan calculadoras, conversores, herramientas SEO, utilidades para desarrolladores y documentos.",
  },
  pt: {
    blogLabel: "Blog",
    allArticles: "Todos os artigos",
    browseTopics: "Explorar temas",
    latestArticles: "Artigos recentes",
    readMore: "Ler guia",
    updated: "Atualizado",
    minuteRead: "min de leitura",
    page: "Pagina",
    rss: "RSS",
    empty: "Ainda nao ha artigos publicados.",
    categoryEyebrow: "Guia por tema",
    indexTitle: "Guias praticos para ferramentas online uteis",
    indexDescription:
      "Aprenda como funcionam calculadoras, conversores, verificacoes de SEO, utilitarios para desenvolvedores e documentos.",
  },
} satisfies Record<Locale, Record<string, string>>;

export function isLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function isBlogCategoryId(value: string): value is BlogCategoryId {
  return BLOG_CATEGORY_IDS.includes(value as BlogCategoryId);
}
