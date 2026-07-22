export {
  createContentSourceSnapshot,
  getContentSourceSnapshot,
  resetContentSourceSnapshotForTesting,
  resetPublishedContentIndexesForTesting,
  type ContentSourceSnapshot,
} from '@/content/queries/indexed-content-source';
export {
  ArchitectureValidationError,
  assertArchitectureValid,
  compareArchitectureValidationIssues,
  createArchitectureValidationIssue,
  createArchitectureValidationReport,
  formatArchitectureValidationReport,
} from './report';
export { createArchitectureValidationContext } from './context';
export type {
  ArchitectureComposedPageModel,
  ArchitectureCompositionPorts,
  ArchitectureValidationContext,
} from './context';
export {
  validateContentIdentities,
  validateTaxonomyReferences,
  validateToolRegistryIntegrity,
} from './validators/identity';
export { validateContentRelations } from './validators/relations';
export { validatePublicationAndSeo } from './validators/publication';
export { validateSourceBoundaries } from './validators/source-boundaries';
export {
  assertProductionArchitectureValid,
  createProductionArchitectureContext,
  validateArchitecture,
  validateProductionArchitecture,
  TOOL_MODULE_SOURCE_DIRECTORIES,
} from './production';
export { extractSourceImports } from './source-graph/extract-imports';
export { createSourceGraph, scanSourceGraph } from './source-graph/scan-source-files';
export { resolveProjectImport } from './source-graph/resolve-project-import';
export {
  SOURCE_DEPENDENCY_RULES,
  matchesPolicyPattern,
} from './source-graph/policy';
export type {
  SourceDependencyException,
  SourceDependencyRule,
} from './source-graph/policy';
export type {
  SourceFileSnapshot,
  SourceGraph,
  SourceImportEdge,
} from './source-graph/types';
export type {
  ArchitectureValidationCounts,
  ArchitectureValidationIssue,
  ArchitectureValidationIssueCode,
  ArchitectureValidationReport,
  ArchitectureValidationScope,
} from './types';
