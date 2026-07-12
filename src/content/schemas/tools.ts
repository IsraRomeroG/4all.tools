import { z } from 'astro/zod';

import {
  contentDateSchema,
  entityIdSchema,
  localeSchema,
  publicationStatusSchema,
  seoSchema,
  uniqueEntityIdListSchema,
} from './shared';

interface OptionalDateMeta {
  publishedAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

function validateDateOrder(data: OptionalDateMeta, ctx: z.RefinementCtx): void {
  if (
    data.publishedAt !== undefined &&
    data.updatedAt !== undefined &&
    data.updatedAt < data.publishedAt
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['updatedAt'],
      message: 'Expected updatedAt to be on or after publishedAt',
    });
  }
}

export const toolContentSchema = z
  .object({
    toolId: entityIdSchema,
    locale: localeSchema,
    status: publicationStatusSchema,
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    seo: seoSchema,
    intro: z.string().trim().min(1).optional(),
    publishedAt: contentDateSchema.optional(),
    updatedAt: contentDateSchema.optional(),
    relatedToolIds: uniqueEntityIdListSchema,
  })
  .strict()
  .superRefine(validateDateOrder);

export const toolCategoryContentSchema = z
  .object({
    categoryId: entityIdSchema,
    locale: localeSchema,
    status: publicationStatusSchema,
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    seo: seoSchema,
    publishedAt: contentDateSchema.optional(),
    updatedAt: contentDateSchema.optional(),
  })
  .strict()
  .superRefine(validateDateOrder);

export type ToolContentData = z.infer<typeof toolContentSchema>;
export type ToolCategoryContentData = z.infer<
  typeof toolCategoryContentSchema
>;
