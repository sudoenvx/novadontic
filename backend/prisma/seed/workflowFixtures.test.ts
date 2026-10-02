import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { workflowTemplateFixtures } from './fixtures.ts';

describe('workflow template seed fixtures', () => {
  it('seeds the same ordered production stages for aligners and retainers', () => {
    const expectedStages = [
      'STL DESIGN',
      'PRINTING',
      'ASSEMBLING',
      'FINISHING',
      'PACKAGING',
      'DELIVERED',
    ];

    assert.deepEqual(
      workflowTemplateFixtures.map(({ applianceTypeCode }) => applianceTypeCode),
      ['aligner', 'retainer'],
    );
    assert.deepEqual(
      workflowTemplateFixtures.map(({ stages }) => stages),
      [expectedStages, expectedStages],
    );
  });
});
