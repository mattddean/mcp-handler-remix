import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { storage } from "../lib/storage";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Extract OAuth parameters
  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const responseType = searchParams.get("response_type");
  const scope = searchParams.get("scope") || "";
  const state = searchParams.get("state");
  const codeChallenge = searchParams.get("code_challenge");
  const codeChallengeMethod = searchParams.get("code_challenge_method");

  // Validate required parameters
  if (!clientId || !redirectUri || !responseType) {
    return new NextResponse("Missing required parameters", { status: 400 });
  }

  if (responseType !== "code") {
    return new NextResponse("Unsupported response_type", { status: 400 });
  }

  // PKCE is required
  if (!codeChallenge || !codeChallengeMethod) {
    return new NextResponse("PKCE parameters required", { status: 400 });
  }

  if (codeChallengeMethod !== "S256") {
    return new NextResponse("Only S256 code challenge method supported", {
      status: 400,
    });
  }

  // Validate client
  const client = await storage.getClient(clientId);
  if (!client) {
    return new NextResponse("Invalid client_id", { status: 400 });
  }

  // Validate redirect URI
  if (!client.redirectUris.includes(redirectUri)) {
    return new NextResponse("Invalid redirect_uri", { status: 400 });
  }

  // Generate session ID for Auth0 flow
  const sessionId = randomBytes(32).toString("base64url");

  // Store OAuth request details for retrieval after Auth0 callback
  await storage.saveAuth0Session({
    sessionId,
    clientId,
    redirectUri,
    codeChallenge,
    codeChallengeMethod,
    scope,
    state: state || "",
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  });

  // Redirect to Auth0 for authentication
  const auth0Domain = process.env.AUTH0_DOMAIN;
  const auth0ClientId = process.env.AUTH0_CLIENT_ID;
  const auth0RedirectUri = process.env.AUTH0_REDIRECT_URI;

  if (!auth0Domain || !auth0ClientId || !auth0RedirectUri) {
    return new NextResponse("Auth0 configuration missing", { status: 500 });
  }

  const auth0Url = new URL(`https://${auth0Domain}/authorize`);
  auth0Url.searchParams.set("client_id", auth0ClientId);
  auth0Url.searchParams.set("redirect_uri", auth0RedirectUri);
  auth0Url.searchParams.set("response_type", "code");
  // TODO: necessary?
  // auth0Url.searchParams.set("scope", "openid profile email offline_access");
  auth0Url.searchParams.set("state", sessionId);

  return NextResponse.redirect(auth0Url);
}

export async function POST(request: NextRequest) {
  // Handle consent form submission in a real implementation
  return GET(request);
}
