import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

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

export const collections = {
  tools,
  toolCategories,
};
