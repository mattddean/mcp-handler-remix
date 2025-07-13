# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

- `pnpm dev` - Start development server on port 3000
- `pnpm build` - Build the Next.js application for production
- `pnpm start` - Start the production server

### Testing OAuth Flow

- `./scripts/test-oauth-flow.sh` - Manual step-by-step OAuth testing guide
- `node scripts/oauth-client-example.mjs` - Complete OAuth flow example (requires `npm install open`)
- `node scripts/test-client.mjs <server-url>` - Test MCP client invocations

### Redis Setup (Required for SSE Transport)

The SSE transport requires Redis running on `redis://localhost:6380`. Ensure Redis is installed and running before using SSE transport.

## Architecture Overview

This is a Next.js-based Model Context Protocol (MCP) server with OAuth 2.0 authentication. The project uses Next.js App Router with the following key components:

### MCP Implementation

- **Main Handler**: `/app/[transport]/route.ts` - Handles MCP requests via different transport protocols (SSE, HTTP)
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

- **Storage**: In-memory storage for development (see `/app/oauth/lib/storage.ts`)
- **JWT Implementation**: Simple JWT parsing in `/app/oauth/lib/jwt.ts`
- **Validation**: Uses Zod for schema validation throughout
- **TypeScript**: Strict mode enabled with path alias `@/*` → `./*`

### Development Notes

- The project uses `mcp-handler` (not `@vercel/mcp-adapter` as mentioned in README)
- No linting or formatting configuration exists yet
- No test framework is configured
- Package manager: pnpm v8.15.7

### Route Organization

The project separates OAuth flows into distinct paths:

- `/oauth/*` - Internal OAuth 2.0 server implementation (authorization, token exchange, registration)
- `/auth/auth0/*` - Auth0 integration endpoints (external OAuth provider callbacks)

This separation allows the server to act as both an OAuth authorization server for MCP clients and integrate with external OAuth providers like Auth0.

When implementing new MCP tools or modifying OAuth flows, follow the existing patterns in the codebase and ensure proper token verification for protected endpoints.
