import { createHash, randomBytes } from 'node:crypto';
import { AppError } from '../../shared/errors/app-error.ts';
import type { Prisma, PrismaClient } from '../../generated/prisma/client.ts';
import type { AccessTokenService } from '../../shared/security/access-tokens.ts';
import type { PasswordHasher } from '../../shared/security/passwords.ts';
import {
  isSessionUsable,
  type StaffUser,
  type AuthServiceContract,
  type AuthSessionResponse,
  type LoginInput,
  type RequestMetadata,
  type RefreshSessionInput,
} from './auth.domain.ts';

const refreshTokenLifetimeMs = 30 * 24 * 60 * 60 * 1000;

const staffUserInclude = {
  roles: {
    include: {
      role: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
    },
  },
} satisfies Prisma.UserInclude;

const sessionInclude = {
  user: { include: staffUserInclude },
} satisfies Prisma.AuthSessionInclude;

type StaffUserRow = Prisma.UserGetPayload<{ include: typeof staffUserInclude }>;
type SessionRow = Prisma.AuthSessionGetPayload<{ include: typeof sessionInclude }>;

function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function toStaffUser(user: StaffUserRow): StaffUser {
  const roles = user.roles.map(({ role }) => role);
  const permissions = new Set(
    roles.flatMap((role) => role.permissions.map(({ permission }) => permission.code)),
  );

  return {
    id: user.id.toString(),
    email: user.email,
    fullName: user.fullName,
    roles: roles.map((role) => role.code),
    permissions: [...permissions],
  };
}

function toCredentials(user: StaffUserRow) {
  return {
    ...toStaffUser(user),
    passwordHash: user.passwordHash,
    isActive: user.isActive,
  };
}

function toUserSession(session: SessionRow) {
  return {
    id: session.id,
    refreshTokenHash: session.refreshTokenHash,
    expiresAt: session.expiresAt,
    revokedAt: session.revokedAt,
    user: toCredentials(session.user),
  };
}

export class AuthService implements AuthServiceContract {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly passwordHasher: PasswordHasher,
    private readonly accessTokens: AccessTokenService,
    private readonly accessTokenTtlSeconds: number,
  ) {}

  async login(input: LoginInput, metadata: RequestMetadata): Promise<AuthSessionResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
      include: staffUserInclude,
    });
    const isPasswordValid = user
      ? await this.passwordHasher.verify(user.passwordHash, input.password)
      : false;

    await this.prisma.loginAttempt.create({
      data: {
        email: input.email,
        success: Boolean(user?.isActive && isPasswordValid),
        reason: isPasswordValid ? null : 'invalid_credentials',
        ipAddress: metadata.ipAddress ?? null,
      },
    });

    if (!user || !user.isActive || !isPasswordValid) {
      throw new AppError('Email or password is incorrect', 401, 'INVALID_CREDENTIALS');
    }

    const refreshToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + refreshTokenLifetimeMs);
    const session = await this.prisma.authSession.create({
      data: {
        userId: user.id,
        refreshTokenHash: hashRefreshToken(refreshToken),
        expiresAt,
        ipAddress: metadata.ipAddress ?? null,
        userAgent: metadata.userAgent ?? null,
      },
    });

    return {
      accessToken: this.accessTokens.issue({
        subjectId: user.id.toString(),
        sessionId: session.id,
      }),
      refreshToken,
      expiresIn: this.accessTokenTtlSeconds,
      user: toStaffUser(user),
    };
  }

  async refresh(input: RefreshSessionInput): Promise<AuthSessionResponse> {
    const currentHash = hashRefreshToken(input.refreshToken);
    const row = await this.prisma.authSession.findUnique({
      where: { refreshTokenHash: currentHash },
      include: sessionInclude,
    });
    const session = row ? toUserSession(row) : null;

    if (!isSessionUsable(session)) throw this.invalidSessionError();

    const nextRefreshToken = randomBytes(32).toString('hex');
    const nextExpiresAt = new Date(Date.now() + refreshTokenLifetimeMs);
    const rotation = await this.prisma.authSession.updateMany({
      where: {
        id: session.id,
        refreshTokenHash: currentHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: {
        refreshTokenHash: hashRefreshToken(nextRefreshToken),
        expiresAt: nextExpiresAt,
      },
    });
    if (rotation.count !== 1) throw this.invalidSessionError();

    return {
      accessToken: this.accessTokens.issue({
        subjectId: session.user.id,
        sessionId: session.id,
      }),
      refreshToken: nextRefreshToken,
      expiresIn: this.accessTokenTtlSeconds,
      user: toStaffUserFromCredentials(session.user),
    };
  }

  async authenticateAccess(token: string) {
    const claims = this.accessTokens.verify(token);
    if (!claims) return null;

    const row = await this.prisma.authSession.findUnique({
      where: { id: claims.sessionId },
      include: sessionInclude,
    });
    if (!row) return null;

    const session = toUserSession(row);
    if (!isSessionUsable(session) || session.user.id !== claims.subjectId) return null;

    return {
      ...toStaffUserFromCredentials(session.user),
      sessionId: session.id,
    };
  }

  async logout(sessionId: string, userId: string): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: { id: sessionId, userId: BigInt(userId), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private invalidSessionError(): AppError {
    return new AppError('Session is invalid or expired', 401, 'INVALID_SESSION');
  }
}

function toStaffUserFromCredentials(
  user: ReturnType<typeof toCredentials>,
): StaffUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    roles: user.roles,
    permissions: user.permissions,
  };
}
