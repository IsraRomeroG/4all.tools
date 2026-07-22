import type { GlobalMessages } from './types';

export const pt = {
  nav: {
    home: 'Início',
    categories: 'Categorias',
    blog: 'Blog',
  },
  navigation: {
    home: 'Início',
    breadcrumbsLabel: 'Caminho de navegação',
  },
  blog: {
    label: 'Blog',
    articles: 'Artigos',
    categories: 'Categorias',
    published: 'Publicado',
    updated: 'Atualizado',
  },
  common: {
    copy: 'Copiar',
    copied: 'Copiado',
    download: 'Baixar',
    reset: 'Redefinir',
    close: 'Fechar',
  },
  search: {
    label: 'Buscar ferramentas',
    placeholder: 'Buscar ferramentas...',
  },
  sections: {
    search: 'Buscar',
    featuredCategories: 'Categorias em destaque',
    popularTools: 'Ferramentas populares',
    recentEditorial: 'Conteúdo editorial recente',
    subcategories: 'Subcategorias',
    tools: 'Ferramentas',
    toolWorkspace: 'Espaço de trabalho da ferramenta',
  },
  language: {
    label: 'Idioma',
    changeLanguage: 'Alterar idioma',
    switcherLabel: 'Idiomas',
    currentLanguage: 'Idioma atual',
    unavailable: 'Indisponível',
  },
  footer: {
    privacy: 'Privacidade',
    terms: 'Termos',
  },
  accessibility: {
    openMenu: 'Abrir menu',
    closeMenu: 'Fechar menu',
  },
} as const satisfies GlobalMessages;
