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
    return new NextResponse("Only S256 code challenge method supported", { status: 400 });
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
  
  // In a real implementation, you would show a consent screen here
  // For demo purposes, we'll auto-approve
  
  // Generate authorization code
  const code = randomBytes(32).toString("base64url");
  
  // Store authorization code
  await storage.saveAuthorizationCode({
    code,
    clientId,
    redirectUri,
    codeChallenge,
    codeChallengeMethod,
    scope,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    userId: "demo-user", // In real app, get from session
  });
  
  // Redirect back to client
  const redirectUrl = new URL(redirectUri);
  redirectUrl.searchParams.set("code", code);
  if (state) {
    redirectUrl.searchParams.set("state", state);
  }
  
  return NextResponse.redirect(redirectUrl);
}

export async function POST(request: NextRequest) {
  // Handle consent form submission in a real implementation
  return GET(request);
}