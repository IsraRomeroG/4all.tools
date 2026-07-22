---
articleId: what-is-json
locale: pt

primaryCategoryId: json-guides
secondaryCategoryIds: []

status: published

title: O que é JSON? Guia prático da sintaxe JSON
excerpt: Entenda o que é JSON, como sua sintaxe funciona e por que ele é usado para trocar dados estruturados.

seo:
  title: O que é JSON? Sintaxe, exemplos e usos
  description: Entenda o que é JSON, conheça sua sintaxe básica e veja exemplos comuns de troca de dados entre aplicações.
  noindex: false

publishedAt: 2026-07-21T00:00:00.000Z

relatedArticleIds: []
relatedToolIds:
  - json-validator
---

JSON é um formato de texto usado para trocar dados estruturados. Um objeto
reúne valores nomeados, enquanto um array mantém uma lista em ordem.

## Valores e estrutura

JSON aceita strings, números, valores booleanos, `null`, objetos e arrays. Este
é um exemplo válido:

```json
{
  "name": "4all.tools",
  "active": true,
  "tags": ["json", "ferramentas"]
}
```

JSON tem relação com JavaScript, mas não é código JavaScript. Ele é uma
notação de dados com uma sintaxe limitada que pode ser lida por muitas
linguagens.

## Erros comuns

Nomes de propriedades e textos precisam de aspas duplas. O JSON padrão não
permite comentários nem vírgulas finais. Uma vírgula ausente, uma vírgula
extra ou uma chave sem fechamento torna o documento inválido.

APIs usam JSON com frequência em requisições e respostas, e arquivos de
configuração também se beneficiam de um formato legível por pessoas e fácil de
analisar por programas. Use o Validador JSON para encontrar erros de sintaxe
antes de enviar um documento para uma API.

## Resumo

JSON oferece uma forma portátil de trocar valores estruturados. Aprenda suas
regras simples e valide os exemplos enquanto trabalha.
