export const PUBLICATION_STATUSES = [
  'draft',
  'published',
  'archived',
] as const;

export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];

export interface PublicationMeta {
  status: PublicationStatus;
  publishedAt?: Date;
  updatedAt?: Date;
}

export function isPublicationStatus(
  value: string,
): value is PublicationStatus {
  return (PUBLICATION_STATUSES as readonly string[]).includes(value);
}

export function isDraft(status: PublicationStatus): boolean {
  return status === 'draft';
}

export function isPublished(status: PublicationStatus): boolean {
  return status === 'published';
}

export function isArchived(status: PublicationStatus): boolean {
  return status === 'archived';
}
