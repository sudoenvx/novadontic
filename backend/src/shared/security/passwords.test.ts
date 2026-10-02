import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BcryptPasswordHasher } from './passwords.ts';

describe('bcrypt password hasher', () => {
  const hasher = new BcryptPasswordHasher();

  it('hashes passwords and verifies matching credentials', async () => {
    const password = 'correct-horse-battery-staple';
    const hash = await hasher.hash(password);

    assert.notEqual(hash, password);
    assert.equal(await hasher.verify(hash, password), true);
    assert.equal(await hasher.verify(hash, 'different-password'), false);
  });

  it('rejects malformed hashes', async () => {
    assert.equal(await hasher.verify('not-a-bcrypt-hash', 'password'), false);
  });
});