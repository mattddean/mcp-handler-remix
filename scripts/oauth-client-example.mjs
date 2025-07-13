#!/usr/bin/env node

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { stdio } from "@modelcontextprotocol/sdk/transport/stdio.js";
import { createHash, randomBytes } from "crypto";
import { spawn } from "child_process";
import http from "http";
import url from "url";
import open from "open";

const SERVER_URL = "http://localhost:3000";

// Generate PKCE parameters
function generatePKCE() {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

// Start local server to receive OAuth callback
function startCallbackServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const parsedUrl = url.parse(req.url, true);
      if (parsedUrl.pathname === "/callback") {
        const code = parsedUrl.query.code;
        const state = parsedUrl.query.state;

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(
          "<h1>Authorization successful!</h1><p>You can close this window.</p>"
        );

        server.close();
        resolve({ code, state });
      }
    });

    server.listen(3000, () => {
      console.log("Callback server listening on http://localhost:3000");
    });
  });
}

async function performOAuthFlow() {
  console.log("Starting OAuth flow...");

  // Step 1: Register client dynamically
  console.log("Registering client...");
  const registerResponse = await fetch(`${SERVER_URL}/oauth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_name: "MCP Example Client",
      redirect_uris: ["http://localhost:3000/callback"],
      scope: "read:stuff write:stuff",
    }),
  });

  if (!registerResponse.ok) {
    throw new Error(`Registration failed: ${await registerResponse.text()}`);
  }

  const clientInfo = await registerResponse.json();
  console.log("Client registered:", clientInfo.client_id);

  // Step 2: Generate PKCE parameters
  const { verifier, challenge } = generatePKCE();
  const state = randomBytes(16).toString("base64url");

  // Step 3: Start callback server
  const callbackPromise = startCallbackServer();

  // Step 4: Build authorization URL
  const authUrl = new URL(`${SERVER_URL}/oauth/authorize`);
  authUrl.searchParams.set("client_id", clientInfo.client_id);
  authUrl.searchParams.set("redirect_uri", "http://localhost:3000/callback");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "read:stuff");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", challenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  // Step 5: Open browser for authorization
  console.log("Opening browser for authorization...");
  await open(authUrl.toString());

  // Step 6: Wait for callback
  const { code, state: returnedState } = await callbackPromise;

  if (state !== returnedState) {
    throw new Error("State mismatch - possible CSRF attack");
  }

  console.log("Authorization code received");

  // Step 7: Exchange code for token
  console.log("Exchanging code for token...");
  const tokenResponse = await fetch(`${SERVER_URL}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: clientInfo.client_id,
      redirect_uri: "http://localhost:3000/callback",
      code_verifier: verifier,
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error(`Token exchange failed: ${await tokenResponse.text()}`);
  }

  const tokenData = await tokenResponse.json();
  console.log(
    "Access token received:",
    tokenData.access_token.substring(0, 20) + "..."
  );

  return tokenData.access_token;
}

async function testMCPWithOAuth() {
  try {
    // Perform OAuth flow
    const accessToken = await performOAuthFlow();

    // Test MCP connection with the access token
    console.log("\nTesting MCP connection with OAuth token...");

    const transport = stdio({
      command: "npx",
      args: ["mcp-client-cli", `${SERVER_URL}/sse`],
      env: {
        ...process.env,
        AUTHORIZATION: `Bearer ${accessToken}`,
      },
    });

    const client = new Client(
      { name: "oauth-test-client" },
      { capabilities: {} }
    );
    await client.connect(transport);

    // List available tools
    const tools = await client.listTools();
    console.log(
      "Available tools:",
      tools.tools.map((t) => t.name)
    );

    // Test echo tool
    const result = await client.callTool("echo", {
      message: "Hello from OAuth client!",
    });
    console.log("Tool result:", result.content);

    await client.close();
    console.log("\nOAuth flow completed successfully!");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

// Check if open module is available
try {
  await import("open");
} catch {
  console.error("Please install the 'open' package: npm install open");
  process.exit(1);
}

testMCPWithOAuth();
