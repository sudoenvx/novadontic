import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import { once } from 'node:events';
import { after, before, describe, it } from 'node:test';
import type {
  AuthenticatedStaffUser,
  AuthServiceContract,
  AuthSessionResponse,
  LoginInput,
} from '../modules/auth/auth.domain.ts';
import type { RequestMetadata } from '../modules/auth/auth.domain.ts';
import type {
  Clinic,
  ClinicInput,
  ClinicListInput,
  ClinicListResult,
  ClinicsServiceContract,
} from '../modules/clinics/clinics.domain.ts';

process.env['AUTH_JWT_SECRET'] = 'http-test-secret-that-is-at-least-32-characters';
process.env['DATABASE_URL'] ??= 'mysql://127.0.0.1:3306/test';

const { createApp } = await import('./app.ts');
const { createApiRoutes } = await import('./routes.ts');

const user = {
  id: '12',
  email: 'admin@example.test',
  fullName: 'Lab Admin',
  roles: ['admin'],
  permissions: ['settings.manage'],
};

class InMemoryAuthService implements AuthServiceContract {
  readonly activeTokens = new Set<string>();
  loginInput: LoginInput | undefined;
  private sequence = 0;

  async login(input: LoginInput, _metadata: RequestMetadata): Promise<AuthSessionResponse> {
    this.loginInput = input;
    const token = `access-${++this.sequence}`;
    this.activeTokens.add(token);
    return {
      accessToken: token,
      refreshToken: 'a'.repeat(64),
      expiresIn: 900,
      user,
    };
  }

  async refresh(): Promise<AuthSessionResponse> {
    return {
      accessToken: 'refreshed-access',
      refreshToken: 'b'.repeat(64),
      expiresIn: 900,
      user,
    };
  }

  async authenticateAccess(token: string): Promise<AuthenticatedStaffUser | null> {
    if (!this.activeTokens.has(token)) return null;
    return { ...user, sessionId: 'session-1' };
  }

  async logout(): Promise<void> {
    this.activeTokens.clear();
  }
}

class InMemoryClinicsService implements ClinicsServiceContract {
  readonly clinics = new Map<string, Clinic>();
  private sequence = 0;

  async list(input: ClinicListInput): Promise<ClinicListResult> {
    const clinics = [...this.clinics.values()]
      .filter((clinic) => input.isActive === undefined || clinic.isActive === input.isActive)
      .filter((clinic) => !input.search || clinic.name.toLowerCase().includes(input.search.toLowerCase()))
      .filter((clinic) => !input.cursor || BigInt(clinic.id) > BigInt(input.cursor))
      .slice(0, input.limit);
    return { data: clinics, nextCursor: null, total: clinics.length };
  }

  async getById(id: string): Promise<Clinic> {
    const clinic = this.clinics.get(id);
    if (!clinic) throw new Error('Clinic not found');
    return clinic;
  }

  async create(input: ClinicInput): Promise<Clinic> {
    const now = new Date();
    const clinic: Clinic = {
      id: String(++this.sequence),
      name: input.name,
      legalName: input.legalName ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      website: input.website ?? null,
      address: input.address ?? null,
      city: input.city ?? null,
      notes: input.notes ?? null,
      isActive: input.isActive ?? true,
      createdAt: now,
      updatedAt: now,
      doctors: [],
    };
    this.clinics.set(clinic.id, clinic);
    return clinic;
  }

  async update(id: string, input: Partial<ClinicInput>): Promise<Clinic> {
    const clinic = await this.getById(id);
    const updated = { ...clinic, ...input, updatedAt: new Date() };
    this.clinics.set(id, updated);
    return updated;
  }

  async deactivate(id: string): Promise<void> {
    await this.update(id, { isActive: false });
  }
}

const auth = new InMemoryAuthService();
const clinics = new InMemoryClinicsService();
let server: Server;
let baseUrl: string;

before(async () => {
  server = createServer(createApp(createApiRoutes(auth, clinics)));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Test server did not bind to a TCP port');
  baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
});

after(async () => {
  server.close();
  await once(server, 'close');
});

async function signIn(credentials: Record<string, string>) {
  const response = await fetch(`${baseUrl}/auth/sessions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return { response, body: await response.json() as { data: AuthSessionResponse } };
}

describe('single-client auth API', () => {
  it('does not expose tenant or platform-operator endpoints', async () => {
    const tenantEndpoint = await fetch(`${baseUrl}/tenants`);
    const platformEndpoint = await fetch(`${baseUrl}/platform/auth/sessions`);

    assert.equal(tenantEndpoint.status, 404);
    assert.equal(platformEndpoint.status, 404);
  });

  describe('clinics API', () => {
    it('requires authentication for clinic access', async () => {
      const response = await fetch(`${baseUrl}/clinics`);
      assert.equal(response.status, 401);
    });

    it('validates clinic input and supports clinic lifecycle operations', async () => {
      const login = await signIn({ email: user.email, password: 'secret-password' });
      const headers = {
        authorization: login.body.data.accessToken,
        'content-type': 'application/json',
      };
      const invalid = await fetch(`${baseUrl}/clinics`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: '' }),
      });
      assert.equal(invalid.status, 422);
      const invalidId = await fetch(`${baseUrl}/clinics/9223372036854775808`, { headers });
      assert.equal(invalidId.status, 422);
      const emptyUpdate = await fetch(`${baseUrl}/clinics/1`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({}),
      });
      assert.equal(emptyUpdate.status, 422);

      const created = await fetch(`${baseUrl}/clinics`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: 'Central Clinic', city: 'Cairo' }),
      });
      assert.equal(created.status, 201);
      const createdBody = await created.json() as { data: Clinic };
      assert.equal(createdBody.data.name, 'Central Clinic');

      const fetched = await fetch(`${baseUrl}/clinics/${createdBody.data.id}`, { headers });
      assert.equal(fetched.status, 200);

      const listed = await fetch(`${baseUrl}/clinics?search=central`, { headers });
      assert.equal(listed.status, 200);
      const listBody = await listed.json() as { data: ClinicListResult };
      assert.equal(listBody.data.total, 1);

      const updated = await fetch(`${baseUrl}/clinics/${createdBody.data.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ phone: '+20 123456789' }),
      });
      assert.equal(updated.status, 200);
      const updatedBody = await updated.json() as { data: Clinic };
      assert.equal(updatedBody.data.phone, '+20 123456789');

      const deleted = await fetch(`${baseUrl}/clinics/${createdBody.data.id}`, {
        method: 'DELETE',
        headers,
      });
      assert.equal(deleted.status, 204);
      assert.equal(clinics.clinics.get(createdBody.data.id)?.isActive, false);
    });
  });

  it('signs in by email and password and returns the staff user', async () => {
    const { response, body } = await signIn({
      email: user.email.toUpperCase(),
      password: 'secret-password',
    });

    assert.equal(response.status, 201);
    assert.equal(auth.loginInput?.email, user.email);
    assert.deepEqual(body.data.user.roles, ['admin']);
  });

  it('returns structured errors for invalid request data', async () => {
    const response = await fetch(`${baseUrl}/auth/sessions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: 'secret-password' }),
    });

    assert.equal(response.status, 422);
    const body = await response.json() as {
      error: { code: string; details: { fieldErrors: Record<string, string[]> } };
    };
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(Object.keys(body.error.details.fieldErrors).length > 0);
  });

  it('uses a raw access token for the current staff user', async () => {
    const anonymous = await fetch(`${baseUrl}/auth/me`);
    assert.equal(anonymous.status, 401);

    const login = await signIn({ email: user.email, password: 'secret-password' });
    const bearerScheme = await fetch(`${baseUrl}/auth/me`, {
      headers: { authorization: `Bearer ${login.body.data.accessToken}` },
    });
    assert.equal(bearerScheme.status, 401);

    const currentUser = await fetch(`${baseUrl}/auth/me`, {
      headers: { authorization: login.body.data.accessToken },
    });
    assert.equal(currentUser.status, 200);
    const body = await currentUser.json() as { data: { email: string } };
    assert.equal(body.data.email, user.email);
  });

  it('rotates refresh credentials and invalidates access after sign-out', async () => {
    const login = await signIn({ email: user.email, password: 'secret-password' });
    const refreshResponse = await fetch(`${baseUrl}/auth/sessions/refresh`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken: login.body.data.refreshToken }),
    });
    assert.equal(refreshResponse.status, 200);
    const refreshed = await refreshResponse.json() as { data: AuthSessionResponse };
    assert.notEqual(refreshed.data.refreshToken, login.body.data.refreshToken);

    const logoutResponse = await fetch(`${baseUrl}/auth/sessions/current`, {
      method: 'DELETE',
      headers: { authorization: login.body.data.accessToken },
    });
    assert.equal(logoutResponse.status, 204);

    const currentUser = await fetch(`${baseUrl}/auth/me`, {
      headers: { authorization: login.body.data.accessToken },
    });
    assert.equal(currentUser.status, 401);
  });
});
