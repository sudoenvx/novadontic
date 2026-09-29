export interface StaffUser {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  permissions: string[];
}

export interface StaffCredentials extends StaffUser {
  passwordHash: string;
  isActive: boolean;
}

export interface UserSession {
  id: string;
  refreshTokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  user: StaffCredentials;
}

export interface AuthenticatedStaffUser extends StaffUser {
  sessionId: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RefreshSessionInput {
  refreshToken: string;
}

export interface RequestMetadata {
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthSessionResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: StaffUser;
}

export interface AuthServiceContract {
  login(input: LoginInput, metadata: RequestMetadata): Promise<AuthSessionResponse>;
  refresh(input: RefreshSessionInput): Promise<AuthSessionResponse>;
  authenticateAccess(token: string): Promise<AuthenticatedStaffUser | null>;
  logout(sessionId: string, userId: string): Promise<void>;
}

export function isSessionUsable<T extends Pick<UserSession, 'expiresAt' | 'revokedAt' | 'user'>>(
  session: T | null,
  now: Date = new Date(),
): session is T {
  return Boolean(
    session &&
      session.revokedAt === null &&
      session.expiresAt > now &&
      session.user.isActive,
  );
}
