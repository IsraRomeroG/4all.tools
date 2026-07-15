import type { JsonValidatorMessages } from './types';

export const pt = {
  input: {
    label: 'JSON de entrada',
    placeholder: 'Cole o JSON aqui',
    help: 'Valide, formate ou minifique JSON padrão localmente no seu navegador.',
  },
  actions: {
    label: 'Ações de JSON',
    validate: 'Validar JSON',
    format: 'Formatar JSON',
    minify: 'Minificar JSON',
    copy: 'Copiar',
    clear: 'Limpar',
  },
  status: {
    idle: 'Pronto para validar JSON.',
    valid: 'JSON válido',
    invalid: 'JSON inválido',
    empty: 'Insira JSON antes de executar esta ação.',
    formatted: 'JSON formatado com recuo de dois espaços.',
    minified: 'JSON minificado.',
    copied: 'JSON copiado para a área de transferência.',
    copyEmpty: 'Não há JSON para copiar.',
    copyFailed: 'Não foi possível copiar o JSON.',
    cleared: 'Entrada JSON limpa.',
  },
  error: {
    syntax: 'A sintaxe JSON não é válida.',
    atLineColumn: 'Linha {line}, coluna {column}.',
  },
} as const satisfies JsonValidatorMessages;
