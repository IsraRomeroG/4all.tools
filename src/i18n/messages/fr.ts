import type { GlobalMessages } from './types';

export const fr = {
  nav: {
    home: 'Accueil',
    categories: 'Catégories',
    blog: 'Blog',
  },
  navigation: {
    home: 'Accueil',
    breadcrumbsLabel: 'Fil d’Ariane',
  },
  blog: {
    label: 'Blog',
    articles: 'Articles',
    categories: 'Catégories',
    published: 'Publié',
    updated: 'Mis à jour',
  },
  common: {
    copy: 'Copier',
    copied: 'Copié',
    download: 'Télécharger',
    reset: 'Réinitialiser',
    close: 'Fermer',
  },
  search: {
    label: 'Rechercher des outils',
    placeholder: 'Rechercher des outils...',
  },
  sections: {
    search: 'Recherche',
    featuredCategories: 'Catégories en vedette',
    popularTools: 'Outils populaires',
    recentEditorial: 'Contenu éditorial récent',
    subcategories: 'Sous-catégories',
    tools: 'Outils',
    toolWorkspace: 'Espace de travail de l’outil',
  },
  language: {
    label: 'Langue',
    changeLanguage: 'Changer de langue',
    switcherLabel: 'Langues',
    currentLanguage: 'Langue actuelle',
    unavailable: 'Indisponible',
  },
  footer: {
    privacy: 'Confidentialité',
    terms: 'Conditions',
  },
  accessibility: {
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
  },
} as const satisfies GlobalMessages;
