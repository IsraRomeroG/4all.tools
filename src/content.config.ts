import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { BLOG_CATEGORY_IDS, SUPPORTED_LOCALES } from "./lib/blog/config";

const relatedToolSchema = z.object({
  label: z.string(),
  href: z.string(),
});

const blog = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/blog",
  }),
  schema: z.object({
    locale: z.enum(SUPPORTED_LOCALES),
    slug: z.string().min(1),
    categoryId: z.enum(BLOG_CATEGORY_IDS),
    title: z.string().min(1),
    description: z.string().min(1),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    status: z.enum(["draft", "published"]).default("published"),
    cover: z.string().optional(),
    tags: z.array(z.string()).default([]),
    relatedTools: z.array(relatedToolSchema).default([]),
    relatedPosts: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
