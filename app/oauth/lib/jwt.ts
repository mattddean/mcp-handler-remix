import { randomBytes } from "crypto";

// Simple JWT implementation for demo
// In production, use a proper JWT library with RS256 signing

interface JWTPayload {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  scope: string;
  client_id: string;
}

// For demo purposes, we'll use a simple base64 encoding
// In production, use proper JWT signing with private/public keys
export function createAccessToken(payload: JWTPayload): string {
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
    "base64url"
  );
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url"
  );

  // In production, create a proper signature with private key
  const signature = randomBytes(32).toString("base64url");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function parseAccessToken(token: string): JWTPayload | null {
  try {
    const [, payloadPart] = token.split(".");
    if (!payloadPart) return null;

    const payload = JSON.parse(
      Buffer.from(payloadPart, "base64url").toString()
    );

    return payload;
  } catch {
    return null;
  }
}
