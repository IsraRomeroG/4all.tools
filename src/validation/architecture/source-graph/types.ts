export interface SourceFileSnapshot {
  readonly sourcePath: string;
  readonly source: string;
}

export interface SourceImportEdge {
  readonly sourcePath: string;
  readonly specifier: string;
  readonly resolvedTargetPath?: string;
}

export interface SourceGraph {
  readonly files: readonly SourceFileSnapshot[];
  readonly edges: readonly SourceImportEdge[];
}
