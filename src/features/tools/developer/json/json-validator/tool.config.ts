import type { ToolDefinition } from '@/domain/tools';

import { JSON_VALIDATOR_TOOL_ID } from './types';

export const jsonValidatorDefinition = {
  id: JSON_VALIDATOR_TOOL_ID,
  rootCategoryId: 'developer',
  taxonomy: {
    primaryCategoryId: 'json',
  },
  route: {
    strategy: 'flat',
    localized: {
      en: {
        slug: 'json-validator',
      },
      es: {
        slug: 'validador-json',
      },
      pt: {
        slug: 'validador-json',
      },
      fr: {
        slug: 'validateur-json',
      },
    },
  },
  execution: {
    type: 'client',
  },
  status: 'published',
} as const satisfies ToolDefinition;
