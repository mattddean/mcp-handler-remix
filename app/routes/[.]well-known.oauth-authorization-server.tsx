import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export async function loader({ request }: LoaderFunctionArgs) {
  const metadata = {
    issuer: SERVER_URL,
    authorization_endpoint: `${SERVER_URL}/oauth/authorize`,
    token_endpoint: `${SERVER_URL}/oauth/token`,
    registration_endpoint: `${SERVER_URL}/oauth/register`,
    jwks_uri: `${SERVER_URL}/oauth/jwks`,
    response_types_supported: ["code"],
    response_modes_supported: ["query"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
    scopes_supported: ["read:stuff", "write:stuff", "openid", "profile"],
    token_endpoint_auth_methods_supported: ["none"],
    claims_supported: ["sub", "iss", "aud", "exp", "iat"],
    code_challenge_methods_supported: ["S256"],
    introspection_endpoint: `${SERVER_URL}/oauth/introspect`,
    revocation_endpoint: `${SERVER_URL}/oauth/revoke`,
  };

  return json(metadata, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  throw new Response("Method not allowed", { status: 405 });
}
