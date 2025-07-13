import { createMcpHandler, withMcpAuth } from "mcp-handler";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { z } from "zod";

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
  console.log("bearerToken", bearerToken);

  if (!bearerToken) return undefined;

  // Replace this example with actual token verification logic
  // Return an AuthInfo object if verification succeeds
  // Otherwise, return undefined
  const isValid = bearerToken.startsWith("__TEST_VALUE__");

  if (!isValid) return undefined;

  return {
    token: bearerToken,
    scopes: ["read:stuff"], // Add relevant scopes
    clientId: "user123", // Add user/client identifier
    extra: {
      // Optional extra information
      userId: "123",
    },
  };
};

// Make authorization required
const authHandler = withMcpAuth(handler, verifyToken, {
  required: true, // Make auth required for all requests
  requiredScopes: ["read:stuff"], // Optional: Require specific scopes
  resourceMetadataPath: "/.well-known/oauth-protected-resource", // Optional: Custom metadata path
});

export { authHandler as GET, authHandler as POST, authHandler as DELETE };
