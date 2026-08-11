import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

import {
  articleContentSchema,
  blogCategoryContentSchema,
} from './content/schemas/blog';
import {
  toolCategoryContentSchema,
  toolContentSchema,
} from './content/schemas/tools';
import { staticPageContentSchema } from './content/schemas/static-pages';

const tools = defineCollection({
  loader: glob({
    base: './src/content/tools',
    pattern: '**/*.md',
  }),
  schema: toolContentSchema,
});

const toolCategories = defineCollection({
  loader: glob({
    base: './src/content/tool-categories',
    pattern: '**/*.md',
  }),
  schema: toolCategoryContentSchema,
});

const blog = defineCollection({
  loader: glob({
    base: './src/content/blog',
    pattern: '**/*.md',
  }),
  schema: articleContentSchema,
});

const blogCategories = defineCollection({
  loader: glob({
    base: './src/content/blog-categories',
    pattern: '**/*.md',
  }),
  schema: blogCategoryContentSchema,
});

const staticPages = defineCollection({
  loader: glob({
    base: './src/content/static-pages',
    pattern: '**/*.md',
  }),
  schema: staticPageContentSchema,
});

export const collections = {
  tools,
  toolCategories,
  blog,
  blogCategories,
  staticPages,
};
