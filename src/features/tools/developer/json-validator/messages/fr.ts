import type { JsonValidatorMessages } from './types';

export const fr = {
  input: {
    label: 'JSON d’entrée',
    placeholder: 'Collez le JSON ici',
    help: 'Validez, formatez ou minifiez du JSON standard localement dans votre navigateur.',
  },
  actions: {
    label: 'Actions JSON',
    validate: 'Valider le JSON',
    format: 'Formater le JSON',
    minify: 'Minifier le JSON',
    copy: 'Copier',
    clear: 'Effacer',
  },
  status: {
    idle: 'Prêt à valider le JSON.',
    valid: 'JSON valide',
    invalid: 'JSON invalide',
    empty: 'Saisissez du JSON avant de lancer cette action.',
    formatted: 'JSON formaté avec une indentation de deux espaces.',
    minified: 'JSON minifié.',
    copied: 'JSON copié dans le presse-papiers.',
    copyEmpty: 'Aucun JSON à copier.',
    copyFailed: 'Impossible de copier le JSON.',
    cleared: 'Entrée JSON effacée.',
  },
  error: {
    syntax: 'La syntaxe JSON n’est pas valide.',
    atLineColumn: 'Ligne {line}, colonne {column}.',
  },
} as const satisfies JsonValidatorMessages;
