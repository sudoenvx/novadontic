import jwt, { type JwtPayload } from 'jsonwebtoken';

export interface AccessTokenClaims {
  subjectId: string;
  sessionId: string;
}

export class AccessTokenService {
  constructor(
    private readonly secret: string,
    private readonly accessTokenTtlSeconds: number,
  ) {}

  issue(claims: AccessTokenClaims): string {
    const { subjectId, ...payload } = claims;
    return jwt.sign(payload, this.secret, {
      subject: subjectId,
      expiresIn: this.accessTokenTtlSeconds,
      issuer: 'novadontic-api',
      audience: 'novadontic-api',
    });
  }

  verify(token: string): AccessTokenClaims | null {
    try {
      const payload = jwt.verify(token, this.secret, {
        issuer: 'novadontic-api',
        audience: 'novadontic-api',
      }) as JwtPayload;
      const sessionId = payload['sessionId'];

      if (typeof payload.sub !== 'string' || typeof sessionId !== 'string') {
        return null;
      }

      return { subjectId: payload.sub, sessionId };
    } catch {
      return null;
    }
  }
}