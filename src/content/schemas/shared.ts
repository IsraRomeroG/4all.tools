import { z } from 'astro/zod';

import { STABLE_ENTITY_ID_PATTERN } from '@/domain/shared/ids';
import { PUBLICATION_STATUSES } from '@/domain/shared/publication';
import { SUPPORTED_LOCALES } from '@/i18n/types';

export const localeSchema = z.enum(SUPPORTED_LOCALES);

export const publicationStatusSchema = z.enum(PUBLICATION_STATUSES);

export const entityIdSchema = z
  .string()
  .min(1)
  .regex(
    STABLE_ENTITY_ID_PATTERN,
    'Expected a lowercase kebab-case stable entity ID',
  );

export const seoSchema = z
  .object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    noindex: z.boolean().default(false),
  })
  .strict();

export const contentDateSchema = z.coerce.date();

export const optionalDateMetaSchema = z
  .object({
    publishedAt: contentDateSchema.optional(),
    updatedAt: contentDateSchema.optional(),
  })
  .strict();

export const uniqueEntityIdListSchema = z
  .array(entityIdSchema)
  .default([])
  .refine((ids) => new Set(ids).size === ids.length, {
    message: 'Expected unique entity IDs',
  });

export type SeoContentData = z.infer<typeof seoSchema>;
export type ContentDateData = z.infer<typeof contentDateSchema>;
export type OptionalDateMetaContentData = z.infer<
  typeof optionalDateMetaSchema
>;
