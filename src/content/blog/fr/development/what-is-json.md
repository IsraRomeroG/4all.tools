---
articleId: what-is-json
locale: fr

primaryCategoryId: json-guides
secondaryCategoryIds: []

status: published

title: Qu’est-ce que JSON ? Guide pratique de sa syntaxe
excerpt: Découvrez ce qu’est JSON, comment fonctionne sa syntaxe et pourquoi ce format sert à échanger des données structurées.

seo:
  title: Qu’est-ce que JSON ? Syntaxe, exemples et usages
  description: Découvrez ce qu’est JSON, comprenez sa syntaxe de base et voyez comment les applications échangent des données structurées.
  noindex: false

publishedAt: 2026-07-21T00:00:00.000Z

relatedArticleIds: []
relatedToolIds:
  - json-validator
---

JSON est un format texte utilisé pour échanger des données structurées. Un
objet regroupe des valeurs nommées et un tableau conserve une liste ordonnée.

## Valeurs et structure

JSON accepte les chaînes, les nombres, les booléens, `null`, les objets et les
tableaux. Voici un exemple JSON valide :

```json
{
  "name": "4all.tools",
  "active": true,
  "tags": ["json", "outils"]
}
```

JSON est lié à JavaScript, mais ce n’est pas du code JavaScript. Il s’agit
d’une notation de données à la syntaxe volontairement limitée, lisible par de
nombreux langages.

## Erreurs courantes

Les noms de propriétés et les chaînes doivent utiliser des guillemets doubles.
Le JSON standard n’autorise ni les commentaires ni les virgules finales. Une
virgule manquante, une virgule en trop ou une accolade non fermée suffit à
rendre le document invalide.

Les API utilisent souvent JSON pour leurs requêtes et leurs réponses, tandis
que les fichiers de configuration profitent d’un format lisible et facile à
analyser. Utilisez le Validateur JSON pour repérer les erreurs de syntaxe avant
d’envoyer un document à une API.

## En résumé

JSON fournit une manière portable d’échanger des valeurs structurées. Ses
règles sont peu nombreuses : apprenez-les, puis validez vos exemples au fil du
travail.
