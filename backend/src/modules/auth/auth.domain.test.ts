import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isSessionUsable, type UserSession } from './auth.domain.ts';

const validSession: UserSession = {
  id: 'session-id',
  refreshTokenHash: 'refresh-hash',
  expiresAt: new Date('2026-10-01T00:00:00.000Z'),
  revokedAt: null,
  user: {
    id: 'user-id',
    email: 'admin@example.test',
    fullName: 'Lab Admin',
    roles: ['admin'],
    permissions: ['settings.manage'],
    passwordHash: 'hashed-password',
    isActive: true,
  },
};

describe('authentication session policy', () => {
  it('accepts an active and unexpired user session', () => {
    assert.equal(isSessionUsable(validSession, new Date('2026-09-30T00:00:00.000Z')), true);
  });

  it('rejects expired, revoked, and inactive-user sessions', () => {
    assert.equal(isSessionUsable({ ...validSession, expiresAt: new Date('2026-09-29T00:00:00.000Z') }), false);
    assert.equal(isSessionUsable({ ...validSession, revokedAt: new Date() }), false);
    assert.equal(
      isSessionUsable({ ...validSession, user: { ...validSession.user, isActive: false } }),
      false,
    );
  });

  it('rejects missing sessions', () => {
    assert.equal(isSessionUsable(null), false);
  });
});
