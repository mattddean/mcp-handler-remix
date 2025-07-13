import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { storage } from "../lib/storage";
import { verifyCodeChallenge } from "../lib/pkce";
import { createAccessToken } from "../lib/jwt";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type");
  let params: URLSearchParams;
  if (contentType?.includes("application/x-www-form-urlencoded")) {
    const body = await request.text();
    params = new URLSearchParams(body);
  } else if (contentType?.includes("application/json")) {
    const body = await request.json();
    params = new URLSearchParams(body);
  } else {
    console.error("Unsupported content type", contentType);
    return NextResponse.json(
      {
        error: "invalid_request",
        error_description: "Unsupported content type",
      },
      { status: 400 }
    );
  }
  const grantType = params.get("grant_type");
  if (grantType === "authorization_code") {
    return handleAuthorizationCodeGrant(params);
  } else if (grantType === "refresh_token") {
    return handleRefreshTokenGrant(params);
  } else {
    console.error("Unsupported grant type");
    return NextResponse.json(
      { error: "unsupported_grant_type" },
      { status: 400 }
    );
  }
}

async function handleAuthorizationCodeGrant(params: URLSearchParams) {
  const code = params.get("code");
  const clientId = params.get("client_id");
  const redirectUri = params.get("redirect_uri");
  const codeVerifier = params.get("code_verifier");
  if (!code || !clientId || !redirectUri || !codeVerifier) {
    console.error("Missing required parameters");
    return NextResponse.json(
      {
        error: "invalid_request",
        error_description: "Missing required parameters",
      },
      { status: 400 }
    );
  }

  // Get and validate authorization code
  const authCode = await storage.getAuthorizationCode(code);
  if (!authCode) {
    console.error("Invalid authorization code");
    return NextResponse.json(
      {
        error: "invalid_grant",
        error_description: "Invalid authorization code",
      },
      { status: 400 }
    );
  }

  // Validate client
  if (authCode.clientId !== clientId) {
    console.error("Code was issued to different client");
    return NextResponse.json(
      {
        error: "invalid_grant",
        error_description: "Code was issued to different client",
      },
      { status: 400 }
    );
  }

  // Validate redirect URI
  if (authCode.redirectUri !== redirectUri) {
    console.error("Redirect URI mismatch");
    return NextResponse.json(
      { error: "invalid_grant", error_description: "Redirect URI mismatch" },
      { status: 400 }
    );
  }

  // Verify PKCE
  if (
    !verifyCodeChallenge(
      codeVerifier,
      authCode.codeChallenge,
      authCode.codeChallengeMethod
    )
  ) {
    console.error("Invalid code verifier");
    return NextResponse.json(
      { error: "invalid_grant", error_description: "Invalid code verifier" },
      { status: 400 }
    );
  }
  // Delete used authorization code
  await storage.deleteAuthorizationCode(code);
  // Create access token with Auth0 context
  const accessToken = createAccessToken({
    iss: SERVER_URL,
    sub: authCode.auth0Sub || authCode.userId || "unknown-user",
    aud: SERVER_URL,
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    iat: Math.floor(Date.now() / 1000),
    scope: authCode.scope,
    client_id: clientId,
    auth0_sub: authCode.auth0Sub,
    org_id: authCode.auth0OrgId,
  });
  const refreshToken = randomBytes(32).toString("base64url");
  // Store access token with Auth0 context
  await storage.saveAccessToken({
    token: accessToken,
    clientId,
    scope: authCode.scope,
    expiresAt: Date.now() + 3600 * 1000, // 1 hour
    userId: authCode.userId,
    refreshToken,
    auth0Sub: authCode.auth0Sub,
    auth0OrgId: authCode.auth0OrgId,
    // TODO: Store encrypted Auth0 refresh token here when implementing refresh flow
  });
  return NextResponse.json({
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 3600,
    refresh_token: refreshToken,
    scope: authCode.scope,
  });
}

async function handleRefreshTokenGrant(params: URLSearchParams) {
  // Implement refresh token logic
  console.error("Refresh token grant not implemented");
  return NextResponse.json(
    {
      error: "unsupported_grant_type",
      error_description: "Refresh tokens not yet implemented",
    },
    { status: 400 }
  );
}
