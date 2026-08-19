export interface JsonValidatorMessages {
  readonly input: {
    readonly label: string;
    readonly placeholder: string;
    readonly help: string;
  };
  readonly actions: {
    readonly label: string;
    readonly validate: string;
    readonly format: string;
    readonly minify: string;
    readonly copy: string;
    readonly clear: string;
  };
  readonly status: {
    readonly idle: string;
    readonly valid: string;
    readonly invalid: string;
    readonly empty: string;
    readonly formatted: string;
    readonly minified: string;
    readonly copied: string;
    readonly copyEmpty: string;
    readonly copyFailed: string;
    readonly cleared: string;
  };
  readonly error: {
    readonly syntax: string;
    readonly atLineColumn: string;
  };
}
