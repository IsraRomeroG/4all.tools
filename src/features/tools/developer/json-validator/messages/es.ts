import type { JsonValidatorMessages } from './types';

export const es = {
  input: {
    label: 'JSON de entrada',
    placeholder: 'Pega el JSON aquí',
    help: 'Valida, formatea o minifica JSON estándar localmente en tu navegador.',
  },
  actions: {
    label: 'Acciones de JSON',
    validate: 'Validar JSON',
    format: 'Formatear JSON',
    minify: 'Minificar JSON',
    copy: 'Copiar',
    clear: 'Limpiar',
  },
  status: {
    idle: 'Listo para validar JSON.',
    valid: 'JSON válido',
    invalid: 'JSON inválido',
    empty: 'Introduce JSON antes de ejecutar esta acción.',
    formatted: 'JSON formateado con sangría de dos espacios.',
    minified: 'JSON minificado.',
    copied: 'JSON copiado al portapapeles.',
    copyEmpty: 'No hay JSON para copiar.',
    copyFailed: 'No se pudo copiar el JSON.',
    cleared: 'Entrada JSON limpiada.',
  },
  error: {
    syntax: 'La sintaxis JSON no es válida.',
    atLineColumn: 'Línea {line}, columna {column}.',
  },
} as const satisfies JsonValidatorMessages;
