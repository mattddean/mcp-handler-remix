import { createMcpHandler, withMcpAuth } from "mcp-handler";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { z } from "zod";
import { storage } from "../oauth/lib/storage";
import { parseAccessToken } from "../oauth/lib/jwt";

const handler = createMcpHandler(
  async (server) => {
    server.tool(
      "echo",
      "description",
      {
        message: z.string(),
      },
      async ({ message }) => ({
        content: [{ type: "text", text: `Tool echo: ${message}` }],
      })
    );
  },
  {
    capabilities: {
      tools: {
        echo: {
          description: "Echo a message",
        },
      },
    },
  },
  {
    redisUrl: "redis://localhost:6380",
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
  }
);

// Wrap your handler with authorization
const verifyToken = async (
  req: Request,
  bearerToken?: string
): Promise<AuthInfo | undefined> => {
  if (!bearerToken) {
    console.error("No bearer token provided");
    return undefined;
  }

  // Verify JWT token
  const tokenData = await storage.getAccessToken(bearerToken);
  if (!tokenData) return undefined;

  // Parse JWT to get claims
  const payload = parseAccessToken(bearerToken);
  if (!payload) return undefined;

  // Check token expiration
  if (payload.exp * 1000 < Date.now()) return undefined;

  return {
    token: bearerToken,
    scopes: tokenData.scope.split(" "),
    clientId: tokenData.clientId,
    extra: {
      userId: tokenData.userId,
    },
  };
};

// Make authorization required
const authHandler = withMcpAuth(handler, verifyToken, {
  required: true, // Make auth required for all requests
  // TODO: require certain scopes to use our MCP server?
  // requiredScopes: ["read:stuff"], // Optional: Require specific scopes
  resourceMetadataPath: "/.well-known/oauth-protected-resource", // Optional: Custom metadata path
});

export { authHandler as GET, authHandler as POST, authHandler as DELETE };
