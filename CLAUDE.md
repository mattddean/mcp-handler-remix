# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

- `pnpm dev` - Start Remix development server on port 3000
- `pnpm build` - Build the Remix application for production
- `pnpm start` - Start the production server

### Testing OAuth Flow

- `./scripts/test-oauth-flow.sh` - Manual step-by-step OAuth testing guide
- `node scripts/oauth-client-example.mjs` - Complete OAuth flow example (requires `npm install open`)
- `node scripts/test-client.mjs <server-url>` - Test MCP client invocations

### Redis Setup (Required for SSE Transport)

The SSE transport requires Redis running on `redis://localhost:6380`. Ensure Redis is installed and running before using SSE transport.

## Architecture Overview

This is a Remix v2-based Model Context Protocol (MCP) server with OAuth 2.0 authentication. The project uses Remix with Vite and the following key components:

### MCP Implementation

- **Main Handler**: `/app/routes/$transport.tsx` - Handles MCP requests via different transport protocols (SSE, HTTP)
- **Auth Wrapper**: Uses `withMcpAuth` for bearer token verification
- **Example Tool**: Includes a simple "echo" tool that demonstrates MCP tool implementation
- **Transport Support**: Dynamic routing supports both SSE (Server-Sent Events) and HTTP transports

### OAuth 2.0 Flow

The server implements a complete OAuth authorization flow:

1. **Discovery Endpoints**:

   - `/.well-known/oauth-protected-resource` - MCP resource metadata
   - `/.well-known/oauth-authorization-server` - OAuth server metadata

2. **OAuth Endpoints**:

   - `/oauth/register` - Dynamic client registration
   - `/oauth/authorize` - Authorization endpoint (PKCE mandatory)
   - `/oauth/token` - Token exchange endpoint
   - `/oauth/jwks` - JSON Web Key Set (placeholder)

3. **Auth0 Integration**:

   - `/auth/auth0/callback` - Auth0 OAuth callback handler (separate from internal OAuth flow)

4. **Security Features**:
   - PKCE (S256) required for all authorization requests
   - JWT-based access tokens (1-hour expiry)
   - Scope-based access control: `read:stuff`, `write:stuff`
   - Backward compatibility with test tokens (`__TEST_VALUE__*`)

### Key Technical Details

- **Storage**: In-memory storage for development (see `/app/lib/oauth/storage.ts`)
- **JWT Implementation**: Simple JWT parsing in `/app/lib/oauth/jwt.ts`
- **Validation**: Uses Zod for schema validation throughout
- **TypeScript**: Strict mode enabled with path alias `~/*` → `./app/*`
- **Build Tool**: Vite with Remix plugin for fast development and building

### Development Notes

- The project uses `mcp-handler` for MCP protocol implementation
- Express.js middleware for request handling and compression
- Remix v2 with file-based routing and resource routes
- No linting or formatting configuration exists yet
- No test framework is configured
- Package manager: pnpm v8.15.7

### Route Organization

Remix file-based routing structure:

- `/app/routes/$transport.tsx` - MCP transport handler (dynamic route)
- `/app/routes/oauth.*.tsx` - Internal OAuth 2.0 server implementation
- `/app/routes/auth.auth0.callback.tsx` - Auth0 integration endpoint
- `/app/routes/[.]well-known.*.tsx` - Discovery endpoints (escaped dot notation)

This separation allows the server to act as both an OAuth authorization server for MCP clients and integrate with external OAuth providers like Auth0.

When implementing new MCP tools or modifying OAuth flows, follow the existing patterns in the codebase and ensure proper token verification for protected endpoints.
