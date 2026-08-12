import { z } from 'astro/zod';

import { ROUTE_SEGMENT_PATTERN } from '@/routing/builders/segment-validation';

import {
  entityIdSchema,
  localeSchema,
  publicationStatusSchema,
  seoSchema,
} from './shared';

export const sitePageContentSchema = z
  .object({
    pageId: entityIdSchema,
    locale: localeSchema,
    routeSlug: z
      .string()
      .regex(
        ROUTE_SEGMENT_PATTERN,
        'Expected routeSlug to be a lowercase kebab-case route segment',
      ),
    status: publicationStatusSchema,
    title: z.string().trim().min(1),
    seo: seoSchema,
  })
  .strict();

export type SitePageContentData = z.infer<typeof sitePageContentSchema>;
