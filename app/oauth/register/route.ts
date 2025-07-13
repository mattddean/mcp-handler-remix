import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { storage } from "../lib/storage";

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_request", error_description: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { redirect_uris, client_name, scope } = body;

  // Validate required fields
  if (
    !redirect_uris ||
    !Array.isArray(redirect_uris) ||
    redirect_uris.length === 0
  ) {
    return NextResponse.json(
      {
        error: "invalid_request",
        error_description: "redirect_uris is required",
      },
      { status: 400 }
    );
  }

  if (!client_name) {
    return NextResponse.json(
      {
        error: "invalid_request",
        error_description: "client_name is required",
      },
      { status: 400 }
    );
  }

  // Generate client ID
  const clientId = randomBytes(16).toString("base64url");

  // Register client
  const client = {
    clientId,
    redirectUris: redirect_uris,
    name: client_name,
    scope: scope || "read:stuff",
  };

  await storage.registerClient(client);

  // Return client information
  return NextResponse.json({
    client_id: clientId,
    client_name: client_name,
    redirect_uris: redirect_uris,
    scope: client.scope,
    token_endpoint_auth_method: "none", // Public clients use PKCE
  });
}
