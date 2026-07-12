import { z } from 'astro/zod';

import {
  contentDateSchema,
  entityIdSchema,
  localeSchema,
  publicationStatusSchema,
  seoSchema,
  uniqueEntityIdListSchema,
} from './shared';

interface ArticleDateMeta {
  publishedAt: Date;
  updatedAt?: Date | undefined;
}

function validateArticleDateOrder(
  data: ArticleDateMeta,
  ctx: z.RefinementCtx,
): void {
  if (data.updatedAt !== undefined && data.updatedAt < data.publishedAt) {
    ctx.addIssue({
      code: 'custom',
      path: ['updatedAt'],
      message: 'Expected updatedAt to be on or after publishedAt',
    });
  }
}

export const articleContentSchema = z
  .object({
    articleId: entityIdSchema,
    locale: localeSchema,
    primaryCategoryId: entityIdSchema,
    secondaryCategoryIds: uniqueEntityIdListSchema,
    status: publicationStatusSchema,
    title: z.string().trim().min(1),
    excerpt: z.string().trim().min(1),
    seo: seoSchema,
    publishedAt: contentDateSchema,
    updatedAt: contentDateSchema.optional(),
    relatedArticleIds: uniqueEntityIdListSchema,
    relatedToolIds: uniqueEntityIdListSchema,
  })
  .strict()
  .superRefine(validateArticleDateOrder)
  .refine(
    (data) => !data.secondaryCategoryIds.includes(data.primaryCategoryId),
    {
      path: ['secondaryCategoryIds'],
      message: 'Expected secondaryCategoryIds to exclude primaryCategoryId',
    },
  );

export const blogCategoryContentSchema = z
  .object({
    categoryId: entityIdSchema,
    locale: localeSchema,
    status: publicationStatusSchema,
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    seo: seoSchema,
  })
  .strict();

export type ArticleContentData = z.infer<typeof articleContentSchema>;
export type BlogCategoryContentData = z.infer<
  typeof blogCategoryContentSchema
>;
