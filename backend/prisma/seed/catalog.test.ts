import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { permissionDefinitions, roleDefinitions } from './catalog.ts';

describe('seed access-control catalog', () => {
  it('defines unique permission codes and roles', () => {
    assert.equal(
      new Set(permissionDefinitions.map(([code]) => code)).size,
      permissionDefinitions.length,
    );
    assert.equal(
      new Set(roleDefinitions.map(({ code }) => code)).size,
      roleDefinitions.length,
    );
  });

  it('seeds the requested operational roles alongside the protected owner', () => {
    assert.deepEqual(
      roleDefinitions.map(({ code }) => code),
      ['owner', 'administrator', 'technician', 'quality_controller'],
    );
  });

  it('includes permissions required to protect the new feature routes', () => {
    const codes = new Set<string>(permissionDefinitions.map(([code]) => code));
    for (const code of [
      'roles:view',
      'roles:create',
      'roles:update',
      'roles:delete',
      'roles:manage_permissions',
      'case_files:view',
      'case_files:upload',
      'case_files:update',
      'case_files:download',
      'case_files:delete',
      'case_activity:view',
      'case_activity:add_note',
      'doctors:view',
      'doctors:create',
      'doctors:update',
      'doctors:delete',
      'staff:view',
      'staff:create',
      'staff:update',
      'staff:delete',
      'staff:suspend',
      'appliances:view',
      'appliances:create',
      'appliances:update',
      'appliances:delete',
      'appliances:activate',
      'appliance_fields:view',
      'appliance_fields:create',
      'appliance_fields:update',
      'appliance_fields:delete',
    ]) {
      assert.ok(codes.has(code), `Missing ${code}`);
    }
  });
});
