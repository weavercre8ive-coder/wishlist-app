// lib/auth-helpers.ts
import { NextRequest } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import { corsHeaders } from './cors';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-min-32-chars-long!!'
);

// ── Token Generate ────────────────────────
export async function generateToken(payload: {
  customerId: number;
  email: string;
  isGuest: boolean;
  shopifyCustomerId?: string;
}) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

// ── Token Verify ──────────────────────────
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as {
      customerId: number;
      email: string;
      isGuest: boolean;
      shopifyCustomerId?: string;
    };
  } catch {
    return null;
  }
}

// ── Get Session from Request ──────────────
export async function getSessionFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '').trim();
  return await verifyToken(token);
}

// ── Create Token Cookie ───────────────────
export function createTokenCookie(token: string): string {
  const maxAge = 30 * 24 * 60 * 60; // 30 days
  return `wishlist_token=${token}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Strict`;
}

// ── Response Helpers (with CORS) ──────────
export function successResponse(data: any, status = 200) {
  return Response.json(data, {
    status,
    headers: corsHeaders(),
  });
}

export function errorResponse(message: string, status = 400) {
  return Response.json(
    { error: message },
    {
      status,
      headers: corsHeaders(),
    }
  );
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return Response.json(
    { error: message },
    {
      status: 401,
      headers: corsHeaders(),
    }
  );
}