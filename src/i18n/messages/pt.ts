import type { GlobalMessages } from './types';

export const pt = {
  nav: {
    home: 'In\u00edcio',
    categories: 'Categorias',
    blog: 'Blog',
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
  language: {
    label: 'Idioma',
    changeLanguage: 'Alterar idioma',
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
