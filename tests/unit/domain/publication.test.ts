import { describe, expect, it } from 'vitest';

import {
  PUBLICATION_STATUSES,
  isArchived,
  isDraft,
  isPublicationStatus,
  isPublished,
  type PublicationMeta,
} from '@/domain/shared/publication';

describe('publication contracts', () => {
  it('declares the publication statuses in deterministic order', () => {
    expect(PUBLICATION_STATUSES).toEqual(['draft', 'published', 'archived']);
  });

  it('accepts only exact publication status strings', () => {
    expect(isPublicationStatus('draft')).toBe(true);
    expect(isPublicationStatus('published')).toBe(true);
    expect(isPublicationStatus('archived')).toBe(true);
    expect(isPublicationStatus('PUBLISHED')).toBe(false);
    expect(isPublicationStatus('removed')).toBe(false);
    expect(isPublicationStatus('')).toBe(false);
  });

  it('keeps helper predicates mutually consistent', () => {
    for (const status of PUBLICATION_STATUSES) {
      const results = [isDraft(status), isPublished(status), isArchived(status)];

      expect(results.filter(Boolean)).toHaveLength(1);
    }
  });

  it('represents draft metadata without publication dates', () => {
    const meta: PublicationMeta = {
      status: 'draft',
    };

    expect(meta).toEqual({ status: 'draft' });
  });

  it('represents published metadata with explicit publication date', () => {
    const publishedAt = new Date('2026-07-09T00:00:00.000Z');
    const meta: PublicationMeta = {
      status: 'published',
      publishedAt,
    };

    expect(meta.publishedAt).toBe(publishedAt);
  });

  it('represents archived metadata while retaining historical dates', () => {
    const publishedAt = new Date('2026-07-09T00:00:00.000Z');
    const updatedAt = new Date('2026-07-10T00:00:00.000Z');
    const meta: PublicationMeta = {
      status: 'archived',
      publishedAt,
      updatedAt,
    };

    expect(meta).toEqual({
      status: 'archived',
      publishedAt,
      updatedAt,
    });
  });
});
