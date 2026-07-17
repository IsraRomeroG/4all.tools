import { assertStableEntityId } from '@/domain/shared/ids';
import type { ToolId } from '@/domain/shared/ids';
import type { ToolDefinition } from '@/domain/tools';
import { SUPPORTED_LOCALES, type Locale } from '@/i18n/types';
import JsonValidatorTool from '@/features/tools/developer/json-validator/Tool.astro';
import { getJsonValidatorMessages } from '@/features/tools/developer/json-validator/messages/registry';
import { jsonValidatorDefinition } from '@/features/tools/developer/json-validator/tool.config';

import {
  createToolRegistry,
  type CreateToolRegistryOptions,
} from './definition-registry';

export type ToolMessageDictionary = Readonly<object>;

export interface ToolMessageProvider<TMessages extends ToolMessageDictionary> {
  getMessages(locale: Locale): TMessages | null;
}

export interface ToolModule<
  TMessages extends ToolMessageDictionary = ToolMessageDictionary,
  TComponent = unknown,
> {
  readonly definition: ToolDefinition;
  readonly component: TComponent;
  readonly getMessages: (locale: Locale) => TMessages;
}

export interface ToolModuleRegistration<
  TModule extends ToolModule = ToolModule,
> {
  readonly toolId: ToolId;
  readonly module: TModule;
}

export interface ToolModuleRegistry {
  readonly modules: Readonly<Record<ToolId, ToolModule>>;
  findToolModule(toolId: ToolId): ToolModule | null;
  getToolModule(toolId: ToolId): ToolModule;
  getAllToolModules(): readonly ToolModule[];
}

export class DuplicateToolModuleError extends Error {
  readonly toolId: ToolId;

  constructor(toolId: ToolId) {
    super(`Duplicate tool module for stable ID ${JSON.stringify(toolId)}.`);
    this.name = 'DuplicateToolModuleError';
    this.toolId = toolId;
  }
}

export class ToolModuleIdentityMismatchError extends Error {
  readonly registryToolId: ToolId;
  readonly definitionToolId: ToolId;

  constructor(params: {
    readonly registryToolId: ToolId;
    readonly definitionToolId: ToolId;
  }) {
    super(
      `Tool module key ${JSON.stringify(
        params.registryToolId,
      )} does not match definition ID ${JSON.stringify(
        params.definitionToolId,
      )}.`,
    );
    this.name = 'ToolModuleIdentityMismatchError';
    this.registryToolId = params.registryToolId;
    this.definitionToolId = params.definitionToolId;
  }
}

export class MissingToolModuleError extends Error {
  readonly toolId: ToolId;

  constructor(toolId: ToolId) {
    super(`Missing tool module for stable ID ${JSON.stringify(toolId)}.`);
    this.name = 'MissingToolModuleError';
    this.toolId = toolId;
  }
}

export class MissingToolModuleMessagesError extends Error {
  readonly toolId: ToolId;
  readonly locale: Locale;

  constructor(toolId: ToolId, locale: Locale) {
    super(
      `Missing tool module messages for stable ID ${JSON.stringify(
        toolId,
      )} and locale ${JSON.stringify(locale)}.`,
    );
    this.name = 'MissingToolModuleMessagesError';
    this.toolId = toolId;
    this.locale = locale;
  }
}

export class MissingToolModuleComponentError extends Error {
  readonly toolId: ToolId;

  constructor(toolId: ToolId) {
    super(`Missing tool module component for stable ID ${JSON.stringify(toolId)}.`);
    this.name = 'MissingToolModuleComponentError';
    this.toolId = toolId;
  }
}

export function defineToolModule<
  TMessages extends ToolMessageDictionary,
  TComponent,
>(module: ToolModule<TMessages, TComponent>): ToolModule<TMessages, TComponent> {
  return module;
}

export const jsonValidatorModule = defineToolModule({
  definition: jsonValidatorDefinition,
  component: JsonValidatorTool,
  getMessages: getJsonValidatorMessages,
});

export const TOOL_MODULES = {
  [jsonValidatorModule.definition.id]: jsonValidatorModule,
} as const satisfies Readonly<Record<ToolId, ToolModule>>;

export type RegisteredToolId = keyof typeof TOOL_MODULES;
export type RegisteredToolModule =
  (typeof TOOL_MODULES)[keyof typeof TOOL_MODULES];

const productionToolModuleRegistry = createToolModuleRegistry(
  Object.entries(TOOL_MODULES).map(([toolId, module]) => ({
    toolId,
    module,
  })),
);

export function findToolModule(toolId: ToolId): RegisteredToolModule | null {
  return productionToolModuleRegistry.findToolModule(
    toolId,
  ) as RegisteredToolModule | null;
}

export function getToolModule(toolId: ToolId): RegisteredToolModule {
  return productionToolModuleRegistry.getToolModule(
    toolId,
  ) as RegisteredToolModule;
}

export function getAllToolModules(): readonly RegisteredToolModule[] {
  return productionToolModuleRegistry.getAllToolModules() as readonly RegisteredToolModule[];
}

export function createToolModuleRegistry(
  registrations: readonly ToolModuleRegistration[],
  options: CreateToolRegistryOptions = {},
): ToolModuleRegistry {
  const modulesById = new Map<ToolId, ToolModule>();

  for (const registration of registrations) {
    validateToolModuleRegistration(registration);

    if (modulesById.has(registration.toolId)) {
      throw new DuplicateToolModuleError(registration.toolId);
    }

    modulesById.set(registration.toolId, registration.module);
  }

  createToolRegistry(
    registrations.map((registration) => registration.module.definition),
    options,
  );

  const orderedModules = Object.freeze(
    [...modulesById.values()].sort(compareToolModules),
  );
  const moduleRecord = Object.freeze(
    Object.fromEntries(
      orderedModules.map((module) => [module.definition.id, module]),
    ) as Record<ToolId, ToolModule>,
  );

  return Object.freeze({
    modules: moduleRecord,
    findToolModule: (toolId: ToolId) => modulesById.get(toolId) ?? null,
    getToolModule: (toolId: ToolId) => {
      const module = modulesById.get(toolId);

      if (!module) {
        throw new MissingToolModuleError(toolId);
      }

      return module;
    },
    getAllToolModules: () => orderedModules,
  });
}

function validateToolModuleRegistration(
  registration: ToolModuleRegistration,
): void {
  assertStableEntityId(registration.toolId);

  if (registration.toolId !== registration.module.definition.id) {
    throw new ToolModuleIdentityMismatchError({
      registryToolId: registration.toolId,
      definitionToolId: registration.module.definition.id,
    });
  }

  if (registration.module.component === null || registration.module.component === undefined) {
    throw new MissingToolModuleComponentError(registration.toolId);
  }

  if (typeof registration.module.getMessages !== 'function') {
    throw new MissingToolModuleMessagesError(registration.toolId, SUPPORTED_LOCALES[0]);
  }

  for (const locale of SUPPORTED_LOCALES) {
    const messages = registration.module.getMessages(locale);

    if (messages === null || typeof messages !== 'object') {
      throw new MissingToolModuleMessagesError(registration.toolId, locale);
    }
  }
}

function compareToolModules(first: ToolModule, second: ToolModule): number {
  return first.definition.id < second.definition.id
    ? -1
    : first.definition.id > second.definition.id
      ? 1
      : 0;
}
