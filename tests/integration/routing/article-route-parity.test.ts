import { describe, expect, it } from 'vitest';

import { getPublishedArticleContent } from '@/content/queries';
import { ARTICLE_ROUTE_DEFINITIONS } from '@/routing/definitions/blog';

const LOCALES = ['en', 'es', 'pt', 'fr'] as const;

describe('P14 article route migration parity', () => {
  it('matches every legacy article route leaf/category/target with content-owned values', async () => {
    const legacy = ARTICLE_ROUTE_DEFINITIONS[0];

    expect(legacy).toBeDefined();

    for (const locale of LOCALES) {
      const article = await getPublishedArticleContent('what-is-json', locale);
      const legacyLeaf = legacy?.localized[locale];

      expect(article).not.toBeNull();
      expect(legacyLeaf).toBeDefined();
      expect({
        articleId: article?.data.articleId,
        locale: article?.data.locale,
        routeSlug: article?.data.routeSlug,
        primaryCategoryId: article?.data.primaryCategoryId,
        status: article?.data.status,
        target: { kind: 'article', articleId: article?.data.articleId },
      }).toEqual({
        articleId: legacy?.articleId,
        locale,
        routeSlug: legacyLeaf?.slug,
        primaryCategoryId: legacy?.primaryCategoryId,
        status: legacy?.status,
        target: { kind: 'article', articleId: legacy?.articleId },
      });
    }
  });
});
