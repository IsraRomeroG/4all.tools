import type { GlobalMessages } from './types';

export const fr = {
  nav: {
    home: 'Accueil',
    categories: 'Cat\u00e9gories',
    blog: 'Blog',
  },
  common: {
    copy: 'Copier',
    copied: 'Copi\u00e9',
    download: 'T\u00e9l\u00e9charger',
    reset: 'R\u00e9initialiser',
    close: 'Fermer',
  },
  search: {
    label: 'Rechercher des outils',
    placeholder: 'Rechercher des outils...',
  },
  language: {
    label: 'Langue',
    changeLanguage: 'Changer de langue',
  },
  footer: {
    privacy: 'Confidentialit\u00e9',
    terms: 'Conditions',
  },
  accessibility: {
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
  },
} as const satisfies GlobalMessages;
