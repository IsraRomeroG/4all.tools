---
articleId: what-is-json
locale: es

primaryCategoryId: json-guides
secondaryCategoryIds: []

status: published

title: ¿Qué es JSON? Guía práctica de su sintaxis
excerpt: Aprende qué es JSON, cómo funciona su sintaxis y por qué se utiliza para intercambiar datos estructurados.

seo:
  title: ¿Qué es JSON? Sintaxis, ejemplos y usos
  description: Aprende qué es JSON, comprende su sintaxis básica y revisa ejemplos habituales de intercambio de datos estructurados.
  noindex: false

publishedAt: 2026-07-21T00:00:00.000Z

relatedArticleIds: []
relatedToolIds:
  - json-validator
---

JSON es un formato de texto para intercambiar datos estructurados. Un objeto
agrupa valores con nombres y un arreglo conserva una lista ordenada.

## Valores y estructura

JSON admite cadenas, números, valores booleanos, `null`, objetos y arreglos.
Este ejemplo es JSON válido:

```json
{
  "name": "4all.tools",
  "active": true,
  "tags": ["json", "herramientas"]
}
```

JSON está relacionado con JavaScript, pero no es código JavaScript. Es una
notación de datos con una sintaxis limitada que pueden leer muchos lenguajes.

## Errores frecuentes

Los nombres de propiedades y los textos deben usar comillas dobles. El JSON
estándar no permite comentarios ni comas finales. Una coma faltante, una coma
adicional o una llave sin cerrar puede invalidar el documento.

Las API suelen intercambiar solicitudes y respuestas en JSON, y muchos
archivos de configuración lo usan porque es legible para las personas y fácil
de analizar para los programas. Usa el Validador JSON para localizar errores
de sintaxis antes de enviar un documento a una API.

## Resumen

JSON ofrece una forma portable de intercambiar valores estructurados. Conocer
sus reglas básicas y validar los ejemplos ayuda a evitar errores pequeños pero
costosos.
