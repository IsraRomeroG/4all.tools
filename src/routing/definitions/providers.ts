import type { RouteDefinition } from './types';

export type MaybePromise<T> = T | Promise<T>;

export interface RouteDefinitionSource {
  readonly sourceId: string;
  readonly description?: string;
}

export interface RouteDefinitionProvider extends RouteDefinitionSource {
  getRouteDefinitions(): MaybePromise<readonly RouteDefinition[]>;
}
