import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { storage } from "../../../oauth/lib/storage";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Extract Auth0 callback parameters
  const auth0Code = searchParams.get("code");
  const sessionId = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    console.error("Auth0 error:", error);
    return new NextResponse(`Auth0 error: ${error}`, { status: 400 });
  }

  if (!auth0Code || !sessionId) {
    return new NextResponse("Missing code or state parameter", { status: 400 });
  }

  // Retrieve the original OAuth request
  const auth0Session = await storage.getAuth0Session(sessionId);
  if (!auth0Session) {
    return new NextResponse("Invalid or expired session", { status: 400 });
  }

  // Delete the session as it's one-time use
  await storage.deleteAuth0Session(sessionId);

  // Exchange Auth0 code for tokens
  const auth0Domain = process.env.AUTH0_DOMAIN;
  const auth0ClientId = process.env.AUTH0_CLIENT_ID;
  const auth0ClientSecret = process.env.AUTH0_CLIENT_SECRET;
  const auth0RedirectUri = process.env.AUTH0_REDIRECT_URI;

  if (
    !auth0Domain ||
    !auth0ClientId ||
    !auth0ClientSecret ||
    !auth0RedirectUri
  ) {
    return new NextResponse("Auth0 configuration missing", { status: 500 });
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(`https://${auth0Domain}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: auth0ClientId,
        client_secret: auth0ClientSecret,
        code: auth0Code,
        redirect_uri: auth0RedirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Auth0 token exchange failed:", errorText);
      return new NextResponse("Auth0 token exchange failed", { status: 400 });
    }

    const tokenData = await tokenResponse.json();

    // Get user info from Auth0
    const userResponse = await fetch(`https://${auth0Domain}/userinfo`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.error("Failed to get user info from Auth0");
      return new NextResponse("Failed to get user info", { status: 400 });
    }

    const userData = await userResponse.json();

    // Generate MCP authorization code
    const mcpCode = randomBytes(32).toString("base64url");

    // Store authorization code with Auth0 context
    await storage.saveAuthorizationCode({
      code: mcpCode,
      clientId: auth0Session.clientId,
      redirectUri: auth0Session.redirectUri,
      codeChallenge: auth0Session.codeChallenge,
      codeChallengeMethod: auth0Session.codeChallengeMethod,
      scope: auth0Session.scope,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      userId: userData.sub,
      auth0Sub: userData.sub,
      auth0OrgId:
        userData.org_id ||
        userData[`https://${process.env.BASE_DOMAIN}/org_id`], // Auth0 custom claim
    });

    // Redirect back to original client
    const redirectUrl = new URL(auth0Session.redirectUri);
    redirectUrl.searchParams.set("code", mcpCode);
    if (auth0Session.state) {
      redirectUrl.searchParams.set("state", auth0Session.state);
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Error in Auth0 callback:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
