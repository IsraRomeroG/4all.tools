import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

import { assertStableEntityId } from '@/domain/shared/ids';
import type { ToolCategoryId, ToolId } from '@/domain/shared/ids';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import type { TaxonomyTree } from '@/domain/taxonomy/shared/types';
import type { ToolDefinition } from '@/domain/tools';
import { SUPPORTED_LOCALES, type Locale } from '@/i18n/types';

import JsonValidatorTool from './developer/json/json-validator/Tool.astro';
import { getJsonValidatorMessages } from './developer/json/json-validator/messages/registry';
import type { JsonValidatorMessages } from './developer/json/json-validator/messages/types';
import { jsonValidatorDefinition } from './developer/json/json-validator/tool.config';

export type ToolMessageDictionary = Readonly<object>;

export interface ToolComponentProps<TMessages extends ToolMessageDictionary> {
  readonly locale: Locale;
  readonly messages: TMessages;
  readonly instanceId: string;
}

/**
 * Astro's runtime factory is intersected with the public props contract so a
 * registered component remains renderable by ToolTemplate without a cast.
 */
export type ToolComponent<TMessages extends ToolMessageDictionary> =
  AstroComponentFactory &
    ((props: ToolComponentProps<TMessages>) => unknown);

export interface ToolModule<
  TMessages extends ToolMessageDictionary = ToolMessageDictionary,
  TComponent = AstroComponentFactory,
> {
  readonly definition: ToolDefinition;
  readonly component: TComponent;
  readonly getMessages: (locale: Locale) => TMessages;
}

export interface ToolRegistry<TModule extends ToolModule = ToolModule> {
  find(toolId: ToolId): TModule | null;
  get(toolId: ToolId): TModule;
  getAll(): readonly TModule[];
}

export interface CreateToolRegistryOptions {
  readonly taxonomy?: TaxonomyTree<ToolCategoryId>;
}

export class UnknownToolError extends Error {
  readonly toolId: ToolId;

  constructor(toolId: ToolId) {
    super(`Unknown tool ${JSON.stringify(toolId)}.`);
    this.name = 'UnknownToolError';
    this.toolId = toolId;
  }
}

export class DuplicateToolError extends Error {
  readonly toolId: ToolId;

  constructor(toolId: ToolId) {
    super(`Duplicate tool module for stable ID ${JSON.stringify(toolId)}.`);
    this.name = 'DuplicateToolError';
    this.toolId = toolId;
  }
}

export class ToolTaxonomyMismatchError extends Error {
  readonly toolId: ToolId;
  readonly rootCategoryId: ToolCategoryId;
  readonly primaryCategoryId: ToolCategoryId;
  readonly actualRootCategoryId: ToolCategoryId;

  constructor(params: {
    readonly toolId: ToolId;
    readonly rootCategoryId: ToolCategoryId;
    readonly primaryCategoryId: ToolCategoryId;
    readonly actualRootCategoryId: ToolCategoryId;
  }) {
    super(
      `Tool ${JSON.stringify(params.toolId)} declares root category ` +
        `${JSON.stringify(params.rootCategoryId)}, but primary category ` +
        `${JSON.stringify(params.primaryCategoryId)} belongs to root ` +
        `${JSON.stringify(params.actualRootCategoryId)}.`,
    );
    this.name = 'ToolTaxonomyMismatchError';
    this.toolId = params.toolId;
    this.rootCategoryId = params.rootCategoryId;
    this.primaryCategoryId = params.primaryCategoryId;
    this.actualRootCategoryId = params.actualRootCategoryId;
  }
}

export class MissingToolComponentError extends Error {
  readonly toolId: ToolId;

  constructor(toolId: ToolId) {
    super(`Tool ${JSON.stringify(toolId)} has no component.`);
    this.name = 'MissingToolComponentError';
    this.toolId = toolId;
  }
}

export class MissingToolMessagesError extends Error {
  readonly toolId: ToolId;
  readonly locale: Locale;

  constructor(toolId: ToolId, locale: Locale) {
    super(
      `Tool ${JSON.stringify(toolId)} has no messages for locale ${JSON.stringify(locale)}.`,
    );
    this.name = 'MissingToolMessagesError';
    this.toolId = toolId;
    this.locale = locale;
  }
}

export function defineToolModule<
  TMessages extends ToolMessageDictionary,
  TComponent extends ToolComponent<TMessages>,
>(module: ToolModule<TMessages, TComponent>): ToolModule<TMessages, TComponent> {
  return module;
}

export const jsonValidatorModule = defineToolModule({
  definition: jsonValidatorDefinition,
  component: JsonValidatorTool,
  getMessages: getJsonValidatorMessages,
});

/** The only production registration point. The registry below owns the index. */
export const TOOL_MODULES = [jsonValidatorModule] as const;

export type RegisteredToolModule = (typeof TOOL_MODULES)[number];

const productionToolRegistry = createToolRegistry(TOOL_MODULES);

export const toolRegistry: ToolRegistry<RegisteredToolModule> = productionToolRegistry;

export function findToolModule(toolId: ToolId): RegisteredToolModule | null {
  return toolRegistry.find(toolId);
}

export function getToolModule(toolId: ToolId): RegisteredToolModule {
  return toolRegistry.get(toolId);
}

export function getAllToolModules(): readonly RegisteredToolModule[] {
  return toolRegistry.getAll();
}

export function findToolDefinition(toolId: ToolId): ToolDefinition | null {
  return toolRegistry.find(toolId)?.definition ?? null;
}

export function getToolDefinition(toolId: ToolId): ToolDefinition {
  return toolRegistry.get(toolId).definition;
}

export function getAllToolDefinitions(): readonly ToolDefinition[] {
  return toolRegistry.getAll().map((module) => module.definition);
}

export function createToolRegistry<TModules extends readonly ToolModule[]>(
  modules: TModules,
  options: CreateToolRegistryOptions = {},
): ToolRegistry<TModules[number]> {
  const taxonomy = options.taxonomy ?? toolTaxonomy;
  const modulesById = new Map<ToolId, TModules[number]>();

  for (const module of modules) {
    validateToolModule(module, taxonomy);

    if (modulesById.has(module.definition.id)) {
      throw new DuplicateToolError(module.definition.id);
    }

    modulesById.set(module.definition.id, module);
  }

  const orderedModules = Object.freeze(
    [...modulesById.values()].sort(compareToolModules),
  );

  return Object.freeze({
    find: (toolId: ToolId) => modulesById.get(toolId) ?? null,
    get: (toolId: ToolId) => {
      const module = modulesById.get(toolId);

      if (module === undefined) {
        throw new UnknownToolError(toolId);
      }

      return module;
    },
    getAll: () => orderedModules,
  });
}

function validateToolModule(
  module: ToolModule,
  taxonomy: TaxonomyTree<ToolCategoryId>,
): void {
  const definition = module.definition;

  assertStableEntityId(definition.id);
  assertStableEntityId(definition.rootCategoryId);
  assertStableEntityId(definition.taxonomy.primaryCategoryId);

  const actualRootCategoryId = taxonomy.getRoot(
    definition.taxonomy.primaryCategoryId,
  ).id;

  if (actualRootCategoryId !== definition.rootCategoryId) {
    throw new ToolTaxonomyMismatchError({
      toolId: definition.id,
      rootCategoryId: definition.rootCategoryId,
      primaryCategoryId: definition.taxonomy.primaryCategoryId,
      actualRootCategoryId,
    });
  }

  if (module.component === null || module.component === undefined) {
    throw new MissingToolComponentError(definition.id);
  }

  if (typeof module.getMessages !== 'function') {
    throw new MissingToolMessagesError(definition.id, SUPPORTED_LOCALES[0]);
  }

  for (const locale of SUPPORTED_LOCALES) {
    const messages = module.getMessages(locale);

    if (messages === null || typeof messages !== 'object') {
      throw new MissingToolMessagesError(definition.id, locale);
    }
  }
}

function compareToolModules(
  first: ToolModule,
  second: ToolModule,
): number {
  return first.definition.id < second.definition.id
    ? -1
    : first.definition.id > second.definition.id
      ? 1
      : 0;
}

export type { JsonValidatorMessages };
