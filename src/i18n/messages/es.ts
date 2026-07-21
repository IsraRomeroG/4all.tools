import type { GlobalMessages } from './types';

export const es = {
  nav: {
    home: 'Inicio',
    categories: 'Categorías',
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
  sections: {
    search: 'Buscar',
    featuredCategories: 'Categorías destacadas',
    popularTools: 'Herramientas populares',
    recentEditorial: 'Contenido editorial reciente',
    subcategories: 'Subcategorías',
    tools: 'Herramientas',
    toolWorkspace: 'Espacio de trabajo de la herramienta',
  },
  language: {
    label: 'Idioma',
    changeLanguage: 'Cambiar idioma',
    switcherLabel: 'Idiomas',
    currentLanguage: 'Idioma actual',
    unavailable: 'No disponible',
  },
  footer: {
    privacy: 'Privacidad',
    terms: 'Términos',
  },
  accessibility: {
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
  },
} as const satisfies GlobalMessages;
