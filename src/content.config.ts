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

export const collections = {
  tools,
  toolCategories,
  blog,
  blogCategories,
};
