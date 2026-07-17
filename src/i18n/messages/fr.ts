import type { GlobalMessages } from './types';

export const fr = {
  nav: {
    home: 'Accueil',
    categories: 'Catégories',
    blog: 'Blog',
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
