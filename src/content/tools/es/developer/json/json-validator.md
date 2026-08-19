---
toolId: json-validator
locale: es
status: published

title: Validador JSON
description: Valida, formatea y minifica JSON directamente en tu navegador.

seo:
  title: Validador JSON - Validar JSON online
  description: Valida la sintaxis JSON, encuentra errores de análisis, formatea JSON y minifica JSON directamente en tu navegador.
  noindex: false

publishedAt: 2026-07-10
relatedToolIds: []
---

Usa el Validador JSON para comprobar si un documento JSON cumple la sintaxis estándar antes de pegarlo en una aplicación, un cliente de API, un archivo de configuración o documentación.

## Cómo usar el Validador JSON

Pega JSON en el editor y selecciona **Validar JSON** para comprobar la sintaxis. Selecciona **Formatear JSON** para añadir sangría y saltos de línea que faciliten la lectura, o **Minificar JSON** para quitar espacios innecesarios y obtener una versión compacta.

## Qué cuenta como JSON válido

El JSON estándar puede ser un objeto, un arreglo, una cadena, un número, un booleano o `null`. Los objetos y arreglos son frecuentes, pero valores como `"hola"`, `42`, `true`, `false` y `null` también son JSON válido en el nivel superior.

```json
{
  "name": "4all.tools",
  "active": true,
  "tags": ["json", "herramientas-desarrollo"]
}
```

## Errores comunes en JSON

Los errores de sintaxis comunes incluyen comas finales, cadenas con comillas simples, comas faltantes, comentarios, nombres de propiedades sin comillas y llaves o corchetes sin cerrar. El JSON estándar requiere comillas dobles en cadenas y nombres de propiedades.

## Formatear frente a minificar

Formatear conserva los mismos datos JSON, pero añade sangría de dos espacios y saltos de línea. Minificar conserva los mismos datos JSON, pero elimina espacios innecesarios. Minificar reduce el texto para copiarlo o enviarlo, pero no equivale a una compresión de archivo.

## Procesamiento privado en el navegador

El JSON introducido en esta herramienta se procesa en tu navegador y no se envía a un servidor de validación.

## Notas y limitaciones

Esta herramienta usa el análisis JSON estándar del navegador. Los comentarios, las comas finales, `NaN`, `Infinity` y `undefined` no son JSON válido. Los enteros muy grandes pueden verse afectados por la precisión numérica de JavaScript, y las claves duplicadas de un objeto no se informan como un error de validación separado.
