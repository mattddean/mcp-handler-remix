import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

// In a Remix environment, we need to replicate the functionality of the mcp-handler
// Since we can't directly use the mcp-handler exports, we'll implement the equivalent
export async function loader({ request }: LoaderFunctionArgs) {
  // This implements the same functionality as protectedResourceHandler from mcp-handler
  const metadata = {
    resource: "MCP Server",
    authorization_servers: ["http://localhost:3000"],
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
    // This implements the same functionality as metadataCorsOptionsRequestHandler from mcp-handler
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