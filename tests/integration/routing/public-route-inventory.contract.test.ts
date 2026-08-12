import { describe, expect, it } from 'vitest';

import { getPublishedContentIndexes } from '@/content/queries';
import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import { toolRegistry } from '@/features/tools/registry';
import { createRouteRegistry } from '@/routing/registry';
import type { RouteRecord } from '@/routing/types';

import {
  PUBLIC_ROUTE_INVENTORY,
  type PublicRouteContractRecord,
} from '../../contracts/public-route-inventory';

describe('public route inventory contract', () => {
  it('preserves the explicitly approved production RouteRegistry inventory', async () => {
    const contentIndexes = await getPublishedContentIndexes();
    const registry = await createRouteRegistry({
      contentIndexes,
      toolRegistry,
      toolTaxonomy,
      blogTaxonomy,
    });

    const actual = registry.getAll().map(normalizeRouteRecord);

    expect(actual).toHaveLength(34);
    expect(actual.filter((record) => record.area === 'site')).toHaveLength(16);
    expect(actual).toEqual(PUBLIC_ROUTE_INVENTORY);
  });
});

function normalizeRouteRecord(
  record: RouteRecord,
): PublicRouteContractRecord {
  return {
    area: record.area,
    locale: record.locale,
    segments: [...record.segments],
    target: { ...record.target },
  };
}
