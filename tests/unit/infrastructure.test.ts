import { describe, expect, it } from 'vitest';

describe('unit test infrastructure', () => {
  it('executes TypeScript assertions', () => {
    const projectName = '4all.tools';

    expect(projectName.split('.')).toEqual(['4all', 'tools']);
  });
});
