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
export type { ArchitectureValidationContext } from './context';
export {
  validateContentIdentities,
  validateTaxonomyReferences,
  validateToolRegistryIntegrity,
} from './validators/identity';
export { validateContentRelations } from './validators/relations';
export type {
  ArchitectureValidationCounts,
  ArchitectureValidationIssue,
  ArchitectureValidationIssueCode,
  ArchitectureValidationReport,
  ArchitectureValidationScope,
} from './types';
