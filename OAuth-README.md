# MCP OAuth Implementation

This project now includes a complete OAuth 2.0 authorization flow for MCP (Model Context Protocol) servers.

## OAuth Flow Overview

1. **Discovery**: Clients discover OAuth endpoints via well-known metadata
2. **Registration**: Dynamic client registration support
3. **Authorization**: PKCE-required authorization flow
4. **Token Exchange**: Exchange authorization codes for access tokens
5. **Protected Access**: Use bearer tokens to access MCP resources

## Endpoints

### Metadata Endpoints
- `/.well-known/oauth-protected-resource` - Protected resource metadata
- `/.well-known/oauth-authorization-server` - Authorization server metadata

### OAuth Endpoints
- `/oauth/register` - Dynamic client registration
- `/oauth/authorize` - Authorization endpoint (PKCE required)
- `/oauth/token` - Token exchange endpoint
- `/oauth/jwks` - JSON Web Key Set (placeholder)

## Testing the OAuth Flow

### Option 1: Manual Testing
Run the test script to see step-by-step instructions:
```bash
./scripts/test-oauth-flow.sh
```

### Option 2: Using the Legacy Test Token
For backwards compatibility, the server still accepts test tokens:
```bash
curl -X POST http://localhost:3001/sse \
  -H "Authorization: Bearer __TEST_VALUE__123" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

### Option 3: Complete OAuth Flow Example
The `scripts/oauth-client-example.mjs` demonstrates a complete OAuth flow (requires `npm install open`).

## Implementation Details

- **PKCE**: Required for all authorization requests (S256 method)
- **Token Storage**: In-memory storage (use Redis/database in production)
- **JWT Tokens**: Simple JWT implementation (use proper signing in production)
- **Token Expiry**: Access tokens expire after 1 hour
- **Scopes**: Supports `read:stuff` and `write:stuff` scopes

## Security Considerations

This is a demonstration implementation. For production use:
1. Implement proper JWT signing with RS256
2. Use persistent storage for tokens and clients
3. Add rate limiting on OAuth endpoints
4. Implement refresh token rotation
5. Add proper consent screens
6. Validate redirect URIs more strictly
7. Add CSRF protection beyond state parameter