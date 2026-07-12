import { en } from './en';

export type WidenMessageLeaves<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends Record<string, unknown>
      ? WidenMessageLeaves<T[K]>
      : never;
};

export type GlobalMessages = WidenMessageLeaves<typeof en>;
