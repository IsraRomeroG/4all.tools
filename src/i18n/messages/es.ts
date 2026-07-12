import type { GlobalMessages } from './types';

export const es = {
  nav: {
    home: 'Inicio',
    categories: 'Categor\u00edas',
    blog: 'Blog',
  },
  common: {
    copy: 'Copiar',
    copied: 'Copiado',
    download: 'Descargar',
    reset: 'Restablecer',
    close: 'Cerrar',
  },
  search: {
    label: 'Buscar herramientas',
    placeholder: 'Buscar herramientas...',
  },
  language: {
    label: 'Idioma',
    changeLanguage: 'Cambiar idioma',
  },
  footer: {
    privacy: 'Privacidad',
    terms: 'T\u00e9rminos',
  },
  accessibility: {
    openMenu: 'Abrir men\u00fa',
    closeMenu: 'Cerrar men\u00fa',
  },
} as const satisfies GlobalMessages;
