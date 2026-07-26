import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

// JWT_SECRET must be set as a strong random value in your environment variables.
// NEVER fall back to a known/public value — doing so would allow anyone to forge tokens.
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set. Set a strong random secret.');
  }
  return new TextEncoder().encode(secret);
}

type TokenPayload = {
  userId: string;
  username: string;
  [key: string]: string | number | boolean;
};

export function getAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL !== 'http://localhost:3000') {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

export async function createToken(payload: TokenPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getJwtSecret());
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}


