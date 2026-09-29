import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getSeedAccounts } from './config.ts';

const passwords = {
  SEED_OWNER_PASSWORD: 'owner-password-123',
  SEED_ADMINISTRATOR_PASSWORD: 'admin-password-123',
  SEED_DEVELOPER_PASSWORD: 'developer-password-123',
};

describe('seed account configuration', () => {
  it('uses development email defaults and requires unique strong passwords', () => {
    const accounts = getSeedAccounts(passwords);
    assert.deepEqual(accounts.map(({ email }) => email), [
      'owner@example.test',
      'administrator@example.test',
      'developer@example.test',
    ]);
    assert.deepEqual(accounts.map(({ roleCode }) => roleCode), [
      'owner',
      'administrator',
      'developer',
    ]);
  });

  it('reports missing or invalid environment variable names without values', () => {
    assert.throws(
      () => getSeedAccounts({
        SEED_OWNER_PASSWORD: 'too-short',
        SEED_ADMINISTRATOR_PASSWORD: 'admin-password-123',
        SEED_DEVELOPER_PASSWORD: 'developer-password-123',
      }),
      /SEED_OWNER_PASSWORD/,
    );
  });

  it('rejects duplicate seed account emails', () => {
    assert.throws(
      () => getSeedAccounts({
        ...passwords,
        SEED_ADMINISTRATOR_EMAIL: 'OWNER@example.test',
      }),
      /email addresses must be unique/,
    );
  });

  it('rejects duplicate seed account passwords', () => {
    assert.throws(
      () => getSeedAccounts({
        SEED_OWNER_PASSWORD: 'shared-password-123',
        SEED_ADMINISTRATOR_PASSWORD: 'shared-password-123',
        SEED_DEVELOPER_PASSWORD: 'developer-password-123',
      }),
      /passwords must be unique/,
    );
  });
});
