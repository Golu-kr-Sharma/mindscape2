import { NextRequest } from 'next/server';
import { sign, verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'replace-this-secret';
const EXPIRATION = '7d';

type AuthTokenPayload = {
  sub: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
};

export function signAuthToken(payload: { sub: string; email: string; name: string }) {
  return sign(payload, JWT_SECRET, {
    expiresIn: EXPIRATION,
  });
}

export function verifyAuthToken(token: string) {
  return verify(token, JWT_SECRET) as AuthTokenPayload;
}

export function getAuthToken(request: NextRequest | Request) {
  const authorization = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authorization) {
    return null;
  }

  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}
