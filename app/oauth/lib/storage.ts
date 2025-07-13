import { AuthorizationCode, AccessToken, Client } from "./types";

// In-memory storage for demo purposes
// In production, use Redis or a database
const authorizationCodes = new Map<string, AuthorizationCode>();
const accessTokens = new Map<string, AccessToken>();
const clients = new Map<string, Client>();

// Initialize with a demo client
clients.set("demo-client", {
  clientId: "demo-client",
  redirectUris: ["http://localhost:3000/callback"],
  name: "Demo MCP Client",
  scope: "read:stuff write:stuff",
});

export const storage = {
  // Authorization codes
  saveAuthorizationCode: async (code: AuthorizationCode) => {
    authorizationCodes.set(code.code, code);
  },

  getAuthorizationCode: async (
    code: string
  ): Promise<AuthorizationCode | null> => {
    const authCode = authorizationCodes.get(code);
    if (!authCode) return null;

    // Check if expired (codes expire after 10 minutes)
    if (Date.now() > authCode.expiresAt) {
      authorizationCodes.delete(code);
      return null;
    }

    return authCode;
  },

  deleteAuthorizationCode: async (code: string) => {
    authorizationCodes.delete(code);
  },

  // Access tokens
  saveAccessToken: async (token: AccessToken) => {
    accessTokens.set(token.token, token);
  },

  getAccessToken: async (token: string): Promise<AccessToken | null> => {
    const accessToken = accessTokens.get(token);
    if (!accessToken) return null;

    // Check if expired
    if (Date.now() > accessToken.expiresAt) {
      accessTokens.delete(token);
      return null;
    }

    return accessToken;
  },

  // Clients
  getClient: async (clientId: string): Promise<Client | null> => {
    return clients.get(clientId) || null;
  },

  registerClient: async (client: Client) => {
    clients.set(client.clientId, client);
    console.log("clients", clients);
  },
};
