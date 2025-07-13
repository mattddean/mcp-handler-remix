import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { randomBytes } from "crypto";
import { storage } from "lib/oauth/storage";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    throw new Response("Method not allowed", { status: 405 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json(
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
    return json(
      {
        error: "invalid_request",
        error_description: "redirect_uris is required",
      },
      { status: 400 }
    );
  }

  if (!client_name) {
    return json(
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
  return json({
    client_id: clientId,
    client_name: client_name,
    redirect_uris: redirect_uris,
    scope: client.scope,
    token_endpoint_auth_method: "none", // Public clients use PKCE
  });
}
